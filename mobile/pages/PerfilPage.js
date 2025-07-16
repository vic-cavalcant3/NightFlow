import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const API_URL = "http://192.168.15.7:4000";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [sobre, setSobre] = useState("");
  const [fotoUri, setFotoUri] = useState(null); // URI local da imagem escolhida
  const [fotoServidor, setFotoServidor] = useState(null); // URL da foto que vem do backend

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    setLoading(true);
    try {
      const json = await AsyncStorage.getItem("usuarioLogado");
      if (json) {
        const data = JSON.parse(json);
        const id = data.id;
        // Buscar dados atualizados do backend
        const res = await fetch(`${API_URL}/usuarios/${id}`);
        const jsonData = await res.json();
        if (jsonData.success) {
          const usuarioData = jsonData.usuario;
          console.log("Dados do usuário carregados:", usuarioData);
          setUsuario(usuarioData);
          setNome(usuarioData.nome || "");
          setEmail(usuarioData.email || "");
          setTelefone(usuarioData.telefone || "");
          setSobre(usuarioData.sobre || "");
          setFotoServidor(usuarioData.fotoUrl ? usuarioData.fotoUrl.replace('localhost', '192.168.15.7') : null); // Corrige localhost
          setFotoUri(null); // limpa URI local
          console.log("Foto do servidor definida como:", usuarioData.fotoUrl);
        } else {
          Alert.alert("Erro", "Não foi possível carregar os dados do usuário.");
        }
      }
    } catch (e) {
      console.log("Erro ao carregar usuário:", e);
      Alert.alert("Erro", "Erro ao carregar dados do usuário.");
    }
    setLoading(false);
  };

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Permissão para acessar fotos é necessária."
      );
      return;
    }

    try {
      // CORREÇÃO: Removendo mediaTypes que está causando erro
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.7,
        aspect: [1, 1],
      });

      // Compatibilidade com versões diferentes do expo-image-picker
      if (!result.canceled && !result.cancelled) {
        const uri = result.assets ? result.assets[0].uri : result.uri;
        setFotoUri(uri);
        console.log("Foto selecionada:", uri);
      }
    } catch (error) {
      console.log("Erro ao escolher foto:", error);
      Alert.alert("Erro", "Não foi possível escolher a foto.");
    }
  };

  const salvarPerfil = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "O nome não pode estar vazio.");
      return;
    }

    setLoading(true);
    try {
      // Atualizar dados básicos (sem foto)
      const res = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          email,
          telefone,
          sobre,
        }),
      });

      const text = await res.text(); // Pega a resposta como texto bruto
      let json;
      try {
        json = JSON.parse(text); // Tenta converter em JSON
        if (!json.success) {
          Alert.alert("Erro", json.message || "Erro ao salvar.");
          setLoading(false);
          return;
        }
      } catch (e) {
        console.log("❌ Resposta do servidor (não é JSON):", text);
        Alert.alert("Erro", "Resposta inválida do servidor.");
        setLoading(false);
        return;
      }

      // Se mudou a foto, faz upload da foto separadamente
      if (fotoUri) {
        console.log("Fazendo upload da foto:", fotoUri);
        const formData = new FormData();
        // Ajusta isso conforme o nome do campo que o backend espera para o arquivo da foto:
        formData.append("foto", {
          uri: fotoUri,
          name: "perfil.jpg",
          type: "image/jpeg", // esse type ajuda a evitar erros em Android
        });

        const resUpload = await fetch(
          `${API_URL}/usuarios/${usuario.id}/foto`,
          {
            method: "POST", // ou PUT dependendo do backend
            headers: {
              "Content-Type": "multipart/form-data",
            },
            body: formData,
          }
        );

        const textUpload = await resUpload.text();
        console.log("Resposta do upload:", textUpload);
        
        let jsonUpload;
        try {
          jsonUpload = JSON.parse(textUpload);
        } catch (e) {
          console.log("Erro ao parsear resposta do upload:", e);
          Alert.alert("Erro", "Resposta inválida do servidor para upload da foto.");
          setLoading(false);
          return;
        }

        if (!jsonUpload.success) {
          Alert.alert("Erro", jsonUpload.message || "Não foi possível enviar a foto.");
          setLoading(false);
          return;
        }
        
        // Atualiza a foto do servidor com a nova URL
        const novaFotoUrl = jsonUpload.fotoUrl || jsonUpload.url || jsonUpload.imageUrl;
        console.log("Nova URL da foto:", novaFotoUrl);
        if (novaFotoUrl) {
          // Corrige localhost para funcionar no dispositivo
          const urlCorrigida = novaFotoUrl.replace('localhost', '192.168.15.7');
          setFotoServidor(urlCorrigida);
          console.log("URL corrigida:", urlCorrigida);
        }
        setFotoUri(null); // limpa URI local
      }

      // Atualizar localStorage para manter sincronizado
      const fotoUrlFinal = fotoServidor || usuario.fotoUrl;
      const fotoUrlCorrigida = fotoUrlFinal ? fotoUrlFinal.replace('localhost', '192.168.15.7') : null;
      
      const novoUsuario = {
        ...usuario,
        nome,
        email,
        telefone,
        sobre,
        fotoUrl: fotoUrlCorrigida, // URL corrigida
      };
      
      console.log("Atualizando usuário no AsyncStorage:", novoUsuario);
      await AsyncStorage.setItem("usuarioLogado", JSON.stringify(novoUsuario));
      setUsuario(novoUsuario);
      
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (e) {
      console.log("Erro ao salvar perfil:", e);
      Alert.alert("Erro", "Falha ao salvar o perfil.");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1E0B4E",
        }}
      >
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      <TouchableOpacity style={styles.fotoContainer} onPress={escolherFoto}>
        {fotoUri ? (
          <Image 
            source={{ uri: fotoUri }} 
            style={styles.foto}
            onError={() => {
              console.log("Erro ao carregar foto local");
              setFotoUri(null);
            }}
          />
        ) : fotoServidor ? (
          <Image 
            source={{ uri: fotoServidor }} 
            style={styles.foto}
            onError={() => {
              console.log("Erro ao carregar foto do servidor");
              setFotoServidor(null);
            }}
          />
        ) : (
          <View style={styles.placeholderFoto}>
            <Text style={styles.placeholderText}>Escolher Foto</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome completo"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#666"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={telefone}
        onChangeText={setTelefone}
        placeholder="Telefone"
        placeholderTextColor="#666"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Sobre mim</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={sobre}
        onChangeText={setSobre}
        placeholder="Conte um pouco sobre você"
        placeholderTextColor="#666"
        multiline
      />

      <TouchableOpacity style={styles.buttonSalvar} onPress={salvarPerfil}>
        <Text style={styles.textSalvar}>Salvar Perfil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#1E0B4E",
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
  },
  fotoContainer: {
    alignSelf: "center",
    marginBottom: 20,
  },
  foto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderFoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6D28D9",
    borderStyle: "dashed",
  },
  placeholderText: {
    color: "#D1D5DB",
    fontSize: 14,
    fontWeight: "500",
  },
  label: {
    color: "#D1D5DB",
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "white",
    marginBottom: 16,
  },
  buttonSalvar: {
    backgroundColor: "#6D28D9",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  textSalvar: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});