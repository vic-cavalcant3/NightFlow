import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  Modal, 
  TextInput, 
  Alert,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function GoalsPage({ navigation }) {
  const [metas, setMetas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMeta, setEditingMeta] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prazo, setPrazo] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filtro, setFiltro] = useState('todas'); // todas, concluidas, pendentes

  useEffect(() => {
    carregarMetas();
  }, []);

  const carregarMetas = async () => {
    try {
      const metasStorage = await AsyncStorage.getItem('metas');
      if (metasStorage) {
        setMetas(JSON.parse(metasStorage));
      }
    } catch (error) {
      console.log('Erro ao carregar metas:', error);
    }
  };

  const salvarMetas = async (novasMetas) => {
    try {
      await AsyncStorage.setItem('metas', JSON.stringify(novasMetas));
      setMetas(novasMetas);
    } catch (error) {
      console.log('Erro ao salvar metas:', error);
    }
  };

  const adicionarMeta = () => {
    if (!titulo.trim()) {
      Alert.alert('Erro', 'Por favor, digite um título para a meta.');
      return;
    }

    const novaMeta = {
      id: Date.now().toString(),
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      prazo: prazo.toISOString(),
      status: 'pendente',
      criadoEm: new Date().toISOString(),
      concluidoEm: null
    };

    const novasMetas = [...metas, novaMeta];
    salvarMetas(novasMetas);
    limparFormulario();
    setModalVisible(false);
  };

  const editarMeta = () => {
    if (!titulo.trim()) {
      Alert.alert('Erro', 'Por favor, digite um título para a meta.');
      return;
    }

    const metasAtualizadas = metas.map(meta => 
      meta.id === editingMeta.id 
        ? { ...meta, titulo: titulo.trim(), descricao: descricao.trim(), prazo: prazo.toISOString() }
        : meta
    );

    salvarMetas(metasAtualizadas);
    limparFormulario();
    setModalVisible(false);
    setEditingMeta(null);
  };

  const concluirMeta = (id) => {
    const metasAtualizadas = metas.map(meta => 
      meta.id === id 
        ? { ...meta, status: 'concluida', concluidoEm: new Date().toISOString() }
        : meta
    );
    salvarMetas(metasAtualizadas);
  };

  const reabrirMeta = (id) => {
    const metasAtualizadas = metas.map(meta => 
      meta.id === id 
        ? { ...meta, status: 'pendente', concluidoEm: null }
        : meta
    );
    salvarMetas(metasAtualizadas);
  };

  const excluirMeta = (id, titulo) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir a meta "${titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            const metasAtualizadas = metas.filter(meta => meta.id !== id);
            salvarMetas(metasAtualizadas);
          }
        }
      ]
    );
  };

  const limparFormulario = () => {
    setTitulo('');
    setDescricao('');
    setPrazo(new Date());
  };

  const abrirModalEdicao = (meta) => {
    setEditingMeta(meta);
    setTitulo(meta.titulo);
    setDescricao(meta.descricao);
    setPrazo(new Date(meta.prazo));
    setModalVisible(true);
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const isMetaVencida = (prazoString) => {
    const prazo = new Date(prazoString);
    const hoje = new Date();
    return prazo < hoje;
  };

  const metasFiltradas = metas.filter(meta => {
    if (filtro === 'concluidas') return meta.status === 'concluida';
    if (filtro === 'pendentes') return meta.status === 'pendente';
    return true;
  });

  const estatisticas = {
    total: metas.length,
    concluidas: metas.filter(m => m.status === 'concluida').length,
    pendentes: metas.filter(m => m.status === 'pendente').length,
    vencidas: metas.filter(m => m.status === 'pendente' && isMetaVencida(m.prazo)).length
  };

  const renderMeta = ({ item }) => (
    <View style={styles.metaCard}>
      <View style={styles.metaHeader}>
        <View style={styles.metaInfo}>
          <View style={[
            styles.metaStatus, 
            { backgroundColor: item.status === 'concluida' ? '#10B981' : 
              isMetaVencida(item.prazo) ? '#EF4444' : '#F59E0B' }
          ]} />
          <Text style={styles.metaTitulo}>{item.titulo}</Text>
        </View>
        <View style={styles.metaActions}>
          <TouchableOpacity 
            onPress={() => abrirModalEdicao(item)}
            style={styles.actionButton}
          >
            <Feather name="edit-2" size={18} color="#8B5CF6" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => excluirMeta(item.id, item.titulo)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.descricao ? (
        <Text style={styles.metaDescricao}>{item.descricao}</Text>
      ) : null}
      
      <View style={styles.metaDatas}>
        <Text style={styles.metaData}>
          Prazo: {formatarData(item.prazo)}
          {isMetaVencida(item.prazo) && item.status === 'pendente' && (
            <Text style={styles.vencidoText}> (Vencida)</Text>
          )}
        </Text>
        
        {item.status === 'concluida' && item.concluidoEm && (
          <Text style={styles.metaData}>
            Concluída em: {formatarData(item.concluidoEm)}
          </Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.statusButton,
          { backgroundColor: item.status === 'concluida' ? '#374151' : '#10B981' }
        ]}
        onPress={() => item.status === 'concluida' ? reabrirMeta(item.id) : concluirMeta(item.id)}
      >
        <Text style={styles.statusButtonText}>
          {item.status === 'concluida' ? 'Reabrir' : 'Concluir'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={["#0F072C", "#1E0B4E", "#2D1B69"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F072C" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Metas</Text>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{estatisticas.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>{estatisticas.concluidas}</Text>
          <Text style={styles.statLabel}>Concluídas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{estatisticas.pendentes}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#EF4444' }]}>{estatisticas.vencidas}</Text>
          <Text style={styles.statLabel}>Vencidas</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <TouchableOpacity 
          style={[styles.filtroButton, filtro === 'todas' && styles.filtroAtivo]}
          onPress={() => setFiltro('todas')}
        >
          <Text style={[styles.filtroText, filtro === 'todas' && styles.filtroTextoAtivo]}>
            Todas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filtroButton, filtro === 'pendentes' && styles.filtroAtivo]}
          onPress={() => setFiltro('pendentes')}
        >
          <Text style={[styles.filtroText, filtro === 'pendentes' && styles.filtroTextoAtivo]}>
            Pendentes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filtroButton, filtro === 'concluidas' && styles.filtroAtivo]}
          onPress={() => setFiltro('concluidas')}
        >
          <Text style={[styles.filtroText, filtro === 'concluidas' && styles.filtroTextoAtivo]}>
            Concluídas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Metas */}
      <FlatList
        data={metasFiltradas}
        renderItem={renderMeta}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Feather name="target" size={64} color="#6B7280" />
            <Text style={styles.emptyText}>Nenhuma meta encontrada</Text>
            <Text style={styles.emptySubtext}>
              Toque no botão + para criar sua primeira meta
            </Text>
          </View>
        )}
      />

      {/* Modal de Criar/Editar Meta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingMeta(null);
          limparFormulario();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMeta ? 'Editar Meta' : 'Nova Meta'}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setModalVisible(false);
                  setEditingMeta(null);
                  limparFormulario();
                }}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.input}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Digite o título da meta"
                placeholderTextColor="#6B7280"
              />

              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Adicione uma descrição (opcional)"
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Prazo</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatarData(prazo)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={prazo}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setPrazo(selectedDate);
                    }
                  }}
                />
              )}

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={editingMeta ? editarMeta : adicionarMeta}
              >
                <Text style={styles.submitButtonText}>
                  {editingMeta ? 'Salvar Alterações' : 'Criar Meta'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#1E0B4E',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  filtrosContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filtroButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#374151',
  },
  filtroAtivo: {
    backgroundColor: '#6D28D9',
  },
  filtroText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  filtroTextoAtivo: {
    color: 'white',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  metaCard: {
    backgroundColor: '#1E0B4E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  metaTitulo: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  metaActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  metaDescricao: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  metaDatas: {
    marginBottom: 12,
  },
  metaData: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  vencidoText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  statusButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#374151',
    color: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateText: {
    color: 'white',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#6D28D9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});