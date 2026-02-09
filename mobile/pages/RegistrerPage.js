import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function PageRegister() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
  });
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Animação sutil para o título
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;

  // Animações para os círculos (usando translateY)
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;
  const circle3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Título fade + scale
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.timing(titleScale, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true
      })
    ]).start();

    // Loop de animações dos círculos
    const loopAnim = (anim, toValue, duration, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
    };

    loopAnim(circle1Anim, -20, 4000, 0).start();
    loopAnim(circle2Anim, 15, 3500, 500).start();
    loopAnim(circle3Anim, -10, 3000, 1000).start();

  }, []);

  const handleChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async () => {
    if (formData.senha !== formData.confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://192.168.0.114:4000/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          senha: formData.senha,
        }),
      });

      const res = await response.text();
      Alert.alert('Cadastro', res);
      setIsLoading(false);
      navigation.navigate('PageLogin');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao cadastrar. Verifique a conexão.');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fundo com gradiente bonito */}
      <LinearGradient
        colors={['#0D0D0D', '#1A0B2E', '#2D1B69', '#1A0B2E', '#0D0D0D']}
        style={StyleSheet.absoluteFillObject}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      />

      {/* Círculos decorativos animados */}
      <Animated.View 
        style={[
          styles.circle1,
          {
            transform: [{ translateY: circle1Anim }],
          }
        ]}
      />
      <Animated.View 
        style={[
          styles.circle2,
          {
            transform: [{ translateY: circle2Anim }],
          }
        ]}
      />
      <Animated.View 
        style={[
          styles.circle3,
          {
            transform: [{ translateY: circle3Anim }],
          }
        ]}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}>

        {/* Conteúdo principal */}
        <View style={styles.content}>
          <Animated.Text 
            style={[
              styles.title,
              {
                opacity: titleOpacity,
                transform: [{ scale: titleScale }]
              }
            ]}
          >
            Criar Conta
          </Animated.Text>
          
          <TextInput
            placeholder="Nome completo"
            placeholderTextColor="#aaa"
            value={formData.nome}
            onChangeText={text => handleChange('nome', text)}
            style={styles.input}
          />

          <TextInput
            placeholder="E-mail"
            placeholderTextColor="#aaa"
            value={formData.email}
            onChangeText={text => handleChange('email', text)}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Telefone"
            placeholderTextColor="#aaa"
            value={formData.telefone}
            onChangeText={text => handleChange('telefone', text)}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Senha"
              placeholderTextColor="#aaa"
              secureTextEntry={!showSenha}
              value={formData.senha}
              onChangeText={text => handleChange('senha', text)}
              style={[styles.inputwrapp, { flex: 1 }]}
            />
            <TouchableOpacity 
              onPress={() => setShowSenha(!showSenha)} 
              style={styles.eyeButton}
            >
              <Feather 
                name={showSenha ? 'eye-off' : 'eye'} 
                size={20} 
                color="#9333EA" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Confirmar Senha"
              placeholderTextColor="#aaa"
              secureTextEntry={!showConfirmar}
              value={formData.confirmarSenha}
              onChangeText={text => handleChange('confirmarSenha', text)}
              style={[styles.inputwrapp, { flex: 1 }]}
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmar(!showConfirmar)} 
              style={styles.eyeButton}
            >
              <Feather 
                name={showConfirmar ? 'eye-off' : 'eye'} 
                size={20} 
                color="#9333EA" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={[styles.button, isLoading && { opacity: 0.8 }]}
          >
            <LinearGradient
              colors={['#9333EA', '#7C3AED']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.link}>Já possui uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('PageLogin')}>
              <Text style={styles.linkButton}>Entre aqui</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    zIndex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  // Círculos decorativos
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    top: -60,
    right: -100,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
    bottom: -75,
    left: -75,
  },
  circle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    top: '30%',
    right: -50,
  },
  input: {
    marginBottom: 14,
    backgroundColor: 'rgba(30, 19, 53, 0.8)',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(68, 22, 104, 0.6)',
    fontSize: 16,
  },
  inputwrapp: {
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(30, 19, 53, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(68, 22, 104, 0.6)',
    paddingRight: 10,
  },
  eyeButton: {
    padding: 8,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  gradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  link: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: 16,
  },
  linkButton: {
    color: '#9333EA',
    fontSize: 16,
    fontWeight: '600',
  },
});