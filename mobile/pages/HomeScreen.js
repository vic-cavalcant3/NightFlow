import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { Menu, MenuItem } from 'react-native-material-menu';x

export default function HomePage({ navigation }) {
  const [nome, setNome] = useState('Usuário');
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [userImage, setUserImage] = useState(null);

  useEffect(() => {
    // Simulando busca dos dados do usuário
    setTimeout(() => {
      setNome('Maria Silva');
      setLoading(false);
    }, 1000);
  }, []);

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#0F072C", "#1E0B4E", "#2D1B69"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F072C" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bem-vindo de volta,</Text>
          <Text style={styles.userName}>{nome.split(' ')[0]}</Text>
        </View>
        
        <Menu
          visible={visible}
          anchor={
            <TouchableOpacity onPress={showMenu}>
              {userImage ? (
                <Image source={{ uri: userImage }} style={styles.userAvatar} />
              ) : (
                <View style={styles.userAvatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#6D28D9" />
                </View>
              )}
            </TouchableOpacity>
          }
          onRequestClose={hideMenu}
          style={styles.menu}
        >
          <MenuItem onPress={() => { hideMenu(); navigation.navigate('Profile'); }}>
            <View style={styles.menuItem}>
              <Ionicons name="person-outline" size={20} color="#6D28D9" />
              <Text style={styles.menuText}>Meu Perfil</Text>
            </View>
          </MenuItem>
          <MenuItem onPress={() => { hideMenu(); navigation.navigate('Calendar'); }}>
            <View style={styles.menuItem}>
              <MaterialIcons name="calendar-today" size={20} color="#6D28D9" />
              <Text style={styles.menuText}>Calendário</Text>
            </View>
          </MenuItem>
          <MenuItem onPress={() => { hideMenu(); navigation.navigate('Goals'); }}>
            <View style={styles.menuItem}>
              <Feather name="target" size={20} color="#6D28D9" />
              <Text style={styles.menuText}>Minhas Metas</Text>
            </View>
          </MenuItem>
          <MenuItem onPress={hideMenu}>
            <View style={styles.menuItem}>
              <Ionicons name="log-out-outline" size={20} color="#6D28D9" />
              <Text style={styles.menuText}>Sair</Text>
            </View>
          </MenuItem>
        </Menu>
      </View>

      {/* Conteúdo principal */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Cards de estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Metas totais</Text>
            <View style={[styles.statIndicator, { backgroundColor: '#6D28D9' }]} />
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>3</Text>
            <Text style={styles.statLabel}>Concluídas</Text>
            <View style={[styles.statIndicator, { backgroundColor: '#10B981' }]} />
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>2</Text>
            <Text style={styles.statLabel}>Em progresso</Text>
            <View style={[styles.statIndicator, { backgroundColor: '#F59E0B' }]} />
          </View>
        </View>

        {/* Seção de metas recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Metas Recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.goalCard}>
            <View style={styles.goalInfo}>
              <View style={[styles.goalStatus, { backgroundColor: '#10B981' }]} />
              <Text style={styles.goalTitle}>Aprender React Native</Text>
            </View>
            <Text style={styles.goalDate}>Concluído em: 15/06/2023</Text>
          </View>
          
          <View style={styles.goalCard}>
            <View style={styles.goalInfo}>
              <View style={[styles.goalStatus, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.goalTitle}>Fazer 30 dias de exercícios</Text>
            </View>
            <Text style={styles.goalDate}>Prazo: 30/06/2023</Text>
          </View>
        </View>

        {/* Seção de calendário */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximos Eventos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.seeAll}>Ver calendário</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.eventCard}>
            <View style={styles.eventDate}>
              <Text style={styles.eventDay}>25</Text>
              <Text style={styles.eventMonth}>JUN</Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>Consulta Médica</Text>
              <Text style={styles.eventTime}>14:00 - 15:00</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botão de adicionar nova meta */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddGoal')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F072C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeText: {
    color: '#E0E0E0',
    fontSize: 16,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  menu: {
    marginTop: 40,
    borderRadius: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuText: {
    marginLeft: 12,
    color: '#4B5563',
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#1E0B4E',
    borderRadius: 16,
    padding: 20,
    width: '30%',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  statLabel: {
    color: '#D1D5DB',
    fontSize: 12,
    textAlign: 'center',
  },
  statIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#8B5CF6',
    fontSize: 14,
  },
  goalCard: {
    backgroundColor: '#1E0B4E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  goalTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  goalDate: {
    color: '#9CA3AF',
    fontSize: 12,
    marginLeft: 24,
  },
  eventCard: {
    backgroundColor: '#1E0B4E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    backgroundColor: '#6D28D9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  eventDay: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventMonth: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventTime: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});