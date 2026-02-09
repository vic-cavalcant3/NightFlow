import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import {ScrollView} from 'react-native';


const API_URL = "http://192.168.0.114:4000";

export default function EventosPage({ navigation }) {
  const [eventos, setEventos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [userId, setUserId] = useState(null);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaTermino, setHoraTermino] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHoraInicioPicker, setShowHoraInicioPicker] = useState(false);
  const [showHoraTerminoPicker, setShowHoraTerminoPicker] = useState(false);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) carregarEventos();
  }, [userId]);

  const getUserId = async () => {
    try {
      const usuario = await AsyncStorage.getItem("usuarioLogado");
      if (usuario) {
        const dados = JSON.parse(usuario);
        setUserId(dados.id);
      }
    } catch (error) {
      console.log("Erro ao buscar usuarioLogado:", error);
    }
  };

  const safeDate = (value) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
};


  const carregarEventos = async () => {
    try {
      const res = await fetch(`${API_URL}/eventos/${userId}`);
      const data = await res.json();
      if (data.success) {
        setEventos(data.eventos);
      }
    } catch (e) {
      console.log("Erro ao carregar eventos:", e);
    }
  };

  const limparFormulario = () => {
    setTitulo("");
    setDescricao("");
    setData(new Date());
    setHoraInicio(new Date());
    setHoraTermino(new Date());
  };

  const adicionarEvento = async () => {
    if (!titulo.trim())
      return Alert.alert("Erro", "Digite o título do evento.");
    if (horaTermino <= horaInicio)
      return Alert.alert(
        "Erro",
        "O horário de término deve ser maior que o de início."
      );

    try {
      const res = await fetch(`${API_URL}/eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: userId,
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          data: data.toISOString(),
         horaInicio: horaInicio.toISOString(),
  horaFim: horaTermino.toISOString(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        carregarEventos();
        limparFormulario();
        setModalVisible(false);
      } else {
        Alert.alert("Erro", "Não foi possível criar o evento.");
      }
    } catch (e) {
      console.log("Erro ao adicionar evento:", e);
    }
  };

  const editarEvento = async () => {
    if (!titulo.trim())
      return Alert.alert("Erro", "Digite o título do evento.");
    if (horaTermino <= horaInicio)
      return Alert.alert(
        "Erro",
        "O horário de término deve ser maior que o de início."
      );

    try {
      const res = await fetch(`${API_URL}/eventos/${editingEvento.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          data: data.toISOString(),
         horaInicio: horaInicio.toISOString(),
  horaFim: horaTermino.toISOString(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        carregarEventos();
        limparFormulario();
        setModalVisible(false);
        setEditingEvento(null);
      } else {
        Alert.alert("Erro", "Não foi possível editar o evento.");
      }
    } catch (e) {
      console.log("Erro ao editar evento:", e);
    }
  };

  const excluirEvento = (id, titulo) => {
    Alert.alert("Excluir evento", `Deseja excluir "${titulo}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/eventos/${id}`, {
              method: "DELETE",
            });
            const json = await res.json();
            if (json.success) carregarEventos();
            else Alert.alert("Erro", "Não foi possível excluir.");
          } catch (e) {
            console.log("Erro ao excluir evento:", e);
          }
        },
      },
    ]);
  };

const abrirModalEdicao = (evento) => {
  setEditingEvento(evento);
  setTitulo(evento.titulo);
  setDescricao(evento.descricao);
  setData(safeDate(evento.data));
  setHoraInicio(safeDate(evento.horaInicio)); 
  setHoraTermino(safeDate(evento.horaFim));   
  setModalVisible(true);
};



  const formatarData = (dataString) => {
    const d = new Date(dataString);
    return d.toLocaleDateString("pt-BR");
  };

  const formatarHora = (dataString) => {
    const d = new Date(dataString);
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderEvento = ({ item }) => (
    <View style={styles.eventoCard}>
      <View style={styles.eventoHeader}>
        <Text style={styles.eventoTitulo}>{item.titulo}</Text>
        <View style={styles.eventoActions}>
          <TouchableOpacity
            onPress={() => abrirModalEdicao(item)}
            style={styles.actionButton}
          >
            <Feather name="edit-2" size={18} color="#8B5CF6" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => excluirEvento(item.id, item.titulo)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      {item.descricao ? (
        <Text style={styles.eventoDescricao}>{item.descricao}</Text>
      ) : null}
      <Text style={styles.eventoData}>Data: {formatarData(item.data)}</Text>
      <Text style={styles.eventoHora}>
        Horário: {formatarHora(item.horaInicio)} -{" "}
        {formatarHora(item.horaTermino)}
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={["#0F072C", "#1E0B4E", "#2D1B69"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F072C" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Eventos</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        renderItem={renderEvento}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={64} color="#6B7280" />
            <Text style={styles.emptyText}>Nenhum evento encontrado</Text>
            <Text style={styles.emptySubtext}>
              Toque no + para criar um evento
            </Text>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingEvento(null);
          limparFormulario();
        }}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingEvento ? "Editar Evento" : "Novo Evento"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setEditingEvento(null);
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
                  placeholder="Título do evento"
                  placeholderTextColor="#6B7280"
                  value={titulo}
                  onChangeText={setTitulo}
                />

                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descrição (opcional)"
                  placeholderTextColor="#6B7280"
                  value={descricao}
                  onChangeText={setDescricao}
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.label}>Data</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formatarData(data.toISOString())}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={data}
                    mode="date"
                    display="default"
                    onChange={(e, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) setData(selectedDate);
                    }}
                  />
                )}

                <Text style={styles.label}>Hora Início</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowHoraInicioPicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formatarHora(horaInicio.toISOString())}
                  </Text>
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
                {showHoraInicioPicker && (
                  <DateTimePicker
                    value={horaInicio}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(e, selectedTime) => {
                      setShowHoraInicioPicker(false);
                      if (selectedTime) setHoraInicio(selectedTime);
                    }}
                  />
                )}

                <Text style={styles.label}>Hora Término</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowHoraTerminoPicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formatarHora(horaTermino.toISOString())}
                  </Text>
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
                {showHoraTerminoPicker && (
                  <DateTimePicker
                    value={horaTermino}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(e, selectedTime) => {
                      setShowHoraTerminoPicker(false);
                      if (selectedTime) setHoraTermino(selectedTime);
                    }}
                  />
                )}

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={editingEvento ? editarEvento : adicionarEvento}
                >
                  <Text style={styles.submitButtonText}>
                    {editingEvento ? "Salvar Alterações" : "Criar Evento"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: { padding: 8 },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },
  addButton: { padding: 8 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  eventoCard: {
    backgroundColor: "#1E0B4E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  eventoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventoTitulo: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  eventoActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  eventoDescricao: {
    color: "#D1D5DB",
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  eventoData: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 4,
  },
  eventoHora: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1F2937",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: { color: "white", fontSize: 20, fontWeight: "bold" },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  label: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#374151",
    color: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dateButton: {
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  dateText: {
    color: "white",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#6D28D9",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
