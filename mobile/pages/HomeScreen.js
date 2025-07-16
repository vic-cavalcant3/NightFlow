import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { Menu, MenuItem } from "react-native-material-menu";
import { ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const API_URL = "http://192.168.15.7:4000";

export default function HomePage({ navigation }) {
  const [nome, setNome] = useState("Usuário");
  const [usuarioId, setUsuarioId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const [imageError, setImageError] = useState(false);

  const [metasRecentes, setMetasRecentes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    concluidas: 0,
    pendentes: 0,
  });

  // Função para sair
  const sair = async () => {
    try {
      await AsyncStorage.removeItem("usuarioLogado");
      navigation.reset({
        index: 0,
        routes: [{ name: "PageLogin" }],
      });
    } catch (error) {
      console.log("Erro ao sair:", error);
    }
  };

  // Função para formatar data no padrão dd/mm/aaaa
  const formatarData = (dataString) => {
    if (!dataString) return "";
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR");
  };

  // Função para formatar horário
  const formatarHorario = (timeString) => {
    if (!timeString) return "";
    // Se já está no formato HH:MM, retorna direto
    if (timeString.length === 8) {
      return timeString.substring(0, 5); // Remove os segundos
    }
    // Se é uma data ISO, formata
    const data = new Date(timeString);
    if (isNaN(data)) return timeString;
    return data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Função para buscar dados do usuário
  const buscarDadosUsuario = async () => {
    try {
      const dadosUsuario = await AsyncStorage.getItem("usuarioLogado");
      if (dadosUsuario) {
        const usuario = JSON.parse(dadosUsuario);
        setNome(usuario.nome);
        setUsuarioId(usuario.id);
        
        // Verificar se há uma URL de imagem válida
        if (usuario.fotoUrl && usuario.fotoUrl.trim() !== "") {
          setUserImage(usuario.fotoUrl);
          setImageError(false);
          console.log("Imagem do usuário carregada:", usuario.fotoUrl);
        } else {
          setUserImage(null);
          setImageError(false);
          console.log("Nenhuma imagem de usuário encontrada");
        }

        return usuario.id;
      }
      return null;
    } catch (erro) {
      console.log("Erro ao buscar dados do usuário:", erro);
      return null;
    }
  };

  // Função para lidar com erro de carregamento da imagem
  const handleImageError = () => {
    console.log("Erro ao carregar imagem do usuário");
    setImageError(true);
  };

  // Função para buscar estatísticas
  const buscarEstatisticas = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/estatisticas/${userId}`);
      const data = await response.json();

      if (data.success) {
        setEstatisticas(data.estatisticas);
      }
    } catch (error) {
      console.log("Erro ao buscar estatísticas:", error);
    }
  };

  // Função para buscar metas
  const buscarMetas = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/metas/${userId}`);
      const data = await response.json();

      if (data.success) {
        // Pegar as 2 metas mais recentes
        const metasOrdenadas = data.metas.slice(0, 2);
        setMetasRecentes(metasOrdenadas);
      }
    } catch (error) {
      console.log("Erro ao buscar metas:", error);
    }
  };

  // Função para buscar eventos
  const buscarEventos = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/eventos/${userId}`);
      const data = await response.json();

      if (data.success) {
        // Filtrar eventos futuros e pegar o mais próximo
        const hoje = new Date();
        const eventosFuturos = data.eventos
          .filter((e) => new Date(e.data) >= hoje)
          .slice(0, 1);

        setEventos(eventosFuturos);
      }
    } catch (error) {
      console.log("Erro ao buscar eventos:", error);
    }
  };

  // Função para carregar todos os dados
  const carregarDados = async () => {
    const userId = await buscarDadosUsuario();
    if (userId) {
      await Promise.all([
        buscarEstatisticas(userId),
        buscarMetas(userId),
        buscarEventos(userId),
      ]);
    }
    setLoading(false);
  };

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  // Recarregar dados quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      if (usuarioId) {
        buscarEstatisticas(usuarioId);
        buscarMetas(usuarioId);
        buscarEventos(usuarioId);
      }
    }, [usuarioId])
  );

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  // Função para renderizar o avatar
  const renderAvatar = () => {
    if (userImage && !imageError) {
      return (
        <Image
          source={{ uri: userImage }}
          style={styles.userAvatar}
          onError={handleImageError}
          onLoad={() => console.log("Imagem carregada com sucesso")}
        />
      );
    } else {
      return (
        <View style={styles.userAvatarPlaceholder}>
          <Ionicons name="person" size={24} color="#6D28D9" />
        </View>
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D28D9" />
        <Text style={styles.loadingText}>Carregando seus dados...</Text>
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
          <Text style={styles.userName}>{nome.split(" ")[0]}</Text>
        </View>

        <Menu
          visible={visible}
          anchor={
            <TouchableOpacity onPress={showMenu} style={styles.avatarContainer}>
              {renderAvatar()}
            </TouchableOpacity>
          }
          onRequestClose={hideMenu}
          style={styles.menu}
        >
          <MenuItem
            onPress={() => {
              hideMenu();
              navigation.navigate("Perfil");
            }}
          >
            <View style={styles.menuItem}>
              <Ionicons name="person-outline" size={20} color="#6D28D9" />
              <Text style={styles.menuText}>Meu Perfil</Text>
            </View>
          </MenuItem>
          <MenuItem
            onPress={() => {
              hideMenu();
              navigation.navigate("Calendar");
            }}
          >
            <View style={styles.menuItem}>
              <MaterialIcons name="calendar-today" size={20} color="#6D28D9" />
              <Text style={styles.menuText}>Calendário</Text>
            </View>
          </MenuItem>
          <MenuItem
            onPress={() => {
              hideMenu();
              navigation.navigate("Goals");
            }}
          >
            <View style={styles.menuItem}>
              <Feather name="target" size={20} color="#6D28D9" />
              <Text style={styles.menuText}>Minhas Metas</Text>
            </View>
          </MenuItem>
          <MenuItem
            onPress={() => {
              hideMenu();
              setTimeout(() => {
                sair();
              }, 100);
            }}
          >
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
            <Text style={styles.statNumber}>{estatisticas.total}</Text>
            <Text style={styles.statLabel}>Metas totais</Text>
            <View
              style={[styles.statIndicator, { backgroundColor: "#6D28D9" }]}
            />
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#10B981" }]}>
              {estatisticas.concluidas}
            </Text>
            <Text style={styles.statLabel}>Concluídas</Text>
            <View
              style={[styles.statIndicator, { backgroundColor: "#10B981" }]}
            />
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#F59E0B" }]}>
              {estatisticas.pendentes}
            </Text>
            <Text style={styles.statLabel}>Em progresso</Text>
            <View
              style={[styles.statIndicator, { backgroundColor: "#F59E0B" }]}
            />
          </View>
        </View>

        {/* Seção de metas recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Metas Recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Goals")}>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {metasRecentes.length > 0 ? (
            metasRecentes.map((meta, index) => (
              <View style={styles.goalCard} key={index}>
                <View style={styles.goalInfo}>
                  <View
                    style={[
                      styles.goalStatus,
                      {
                        backgroundColor:
                          meta.status === "concluida" ? "#10B981" : "#F59E0B",
                      },
                    ]}
                  />
                  <Text style={styles.goalTitle}>{meta.titulo}</Text>
                </View>
                <Text style={styles.goalDate}>
                  {meta.status === "concluida"
                    ? `Concluído em: ${formatarData(meta.concluidoEm)}`
                    : `Prazo: ${formatarData(meta.prazo)}`}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhuma meta encontrada</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate("Goals")}
              >
                <Text style={styles.createButtonText}>Criar primeira meta</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Seção de calendário */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximos Eventos</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Calendar")}>
              <Text style={styles.seeAll}>Ver calendário</Text>
            </TouchableOpacity>
          </View>

          {eventos.length > 0 ? (
            eventos.map((evento, index) => {
              const data = new Date(evento.data);
              const dia = String(data.getDate()).padStart(2, "0");
              const mes = data
                .toLocaleString("pt-BR", { month: "short" })
                .toUpperCase();

              return (
                <View style={styles.eventCard} key={index}>
                  <View style={styles.eventDate}>
                    <Text style={styles.eventDay}>{dia}</Text>
                    <Text style={styles.eventMonth}>{mes}</Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{evento.titulo}</Text>
                    <Text style={styles.eventTime}>
                      {formatarHorario(evento.horaInicio)} -{" "}
                      {formatarHorario(evento.horaFim)}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhum evento próximo</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate("Calendar")}
              >
                <Text style={styles.createButtonText}>Criar evento</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F072C",
  },
  loadingText: {
    color: "#E0E0E0",
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeText: {
    color: "#E0E0E0",
    fontSize: 16,
  },
  userName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EDE9FE", // Cor de fundo enquanto carrega
  },
  menu: {
    marginTop: 40,
    borderRadius: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  menuText: {
    marginLeft: 12,
    color: "#4B5563",
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: "#1E0B4E",
    borderRadius: 16,
    padding: 20,
    width: "30%",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B5CF6",
    marginBottom: 8,
  },
  statLabel: {
    color: "#D1D5DB",
    fontSize: 12,
    textAlign: "center",
  },
  statIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAll: {
    color: "#8B5CF6",
    fontSize: 14,
  },
  goalCard: {
    backgroundColor: "#1E0B4E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  goalInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  goalStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  goalTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  goalDate: {
    color: "#9CA3AF",
    fontSize: 12,
    marginLeft: 24,
  },
  eventCard: {
    backgroundColor: "#1E0B4E",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  eventDate: {
    backgroundColor: "#6D28D9",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  eventDay: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  eventMonth: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  eventTime: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  emptyState: {
    backgroundColor: "#1E0B4E",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#6D28D9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});