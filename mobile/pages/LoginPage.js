import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function LoginPage() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;

  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(titleScale, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://192.168.15.7:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem(
          "usuarioLogado",
          JSON.stringify(data.usuario)
        ); // Supondo que vem como "usuario"
        Alert.alert(
          "Sucesso",
          `Bem-vindo(a), ${data.usuario.nome.split(" ")[0]}!`
        );
        navigation.navigate("HomeScreen");
      } else {
        Alert.alert("Erro", data.message || "Credenciais inválidas");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao conectar. Verifique a conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0D0D0D", "#1A0B2E", "#2D1B69", "#1A0B2E", "#0D0D0D"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <View style={styles.content}>
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleOpacity,
              transform: [{ scale: titleScale }],
            },
          ]}
        >
          Faça o Login
        </Animated.Text>

        <TextInput
          placeholder="E-mail"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#aaa"
            secureTextEntry={!showSenha}
            value={senha}
            onChangeText={setSenha}
            style={[styles.inputwrapp, { flex: 1 }]}
          />
          <TouchableOpacity
            onPress={() => setShowSenha(!showSenha)}
            style={styles.eyeButton}
          >
            <Feather
              name={showSenha ? "eye-off" : "eye"}
              size={20}
              color="#9333EA"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          style={[styles.button, isLoading && { opacity: 0.8 }]}
        >
          <LinearGradient
            colors={["#9333EA", "#7C3AED"]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("PageRegister")}
          style={styles.linkContainer}
        >
          <Text style={styles.link}>Não tem conta? </Text>
          <Text style={[styles.link, { color: "#9333EA", fontWeight: "bold" }]}>
            Criar conta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    zIndex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  circle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(147, 51, 234, 0.1)",
    top: -60,
    right: -100,
  },
  circle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(147, 51, 234, 0.05)",
    bottom: -75,
    left: -75,
  },
  circle3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(147, 51, 234, 0.08)",
    top: "30%",
    right: -50,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "rgba(30, 19, 53, 0.8)",
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(68, 22, 104, 0.6)",
    fontSize: 16,
  },
  inputwrapp: {
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(30, 19, 53, 0.8)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(68, 22, 104, 0.6)",
    paddingRight: 10,
  },
  eyeButton: {
    padding: 8,
  },
  button: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 5,
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  gradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  link: {
    color: "#aaa",
    fontSize: 16,
  },
});
