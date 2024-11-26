import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, useColorScheme, StatusBar } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

interface CadastroProps {
  onNavigate: (screen: string) => void;
}

const Cadastro: React.FC<CadastroProps> = ({ onNavigate }) => {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#FFF' : '#333'; // Define a cor
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    user: '',
    email: '',
    password: '',
    group: '',
    sala: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const onSubmit = async () => {
    // Verificação de campos obrigatórios
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }
  
    // Verificação do formato do e-mail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erro', 'O e-mail deve ser um endereço Gmail válido (ex: usuario@gmail.com).');
      return;
    }
  
    try {
      const response = await axios.post('http://192.168.0.97:8000/api/cadastro/', formData);
      if (response.status === 200) {
        Alert.alert('Cadastro', 'Cadastro realizado com sucesso!');
        onNavigate('Login');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Tratamento de erros específicos com base no código de status
        if (error.response) {
          switch (error.response.status) {
            case 400: // Erros de validação, como campos duplicados ou inválidos
              Alert.alert('Erro', error.response.data.detail || 'Dados inválidos. Verifique as informações e tente novamente.');
              break;
            case 409: // Conflito, como e-mail ou usuário duplicado
              Alert.alert('Erro', 'Usuário ou e-mail já cadastrado.');
              break;
            default:
              Alert.alert('Erro', 'Não foi possível realizar o cadastro. Verifique os dados e tente novamente.');
              break;
          }
        } else {
          console.error('Erro na requisição:', error.message);
          Alert.alert('Erro', 'Erro inesperado. Tente novamente mais tarde.');
        }
      } else {
        console.error('Erro inesperado:', error);
        Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente mais tarde.');
      }
    }
  };
  
  const themeStyles = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <KeyboardAvoidingView style={[styles.container, themeStyles.container]} behavior="padding">
      <StatusBar 
        backgroundColor={themeStyles.container.backgroundColor} 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Botão de Voltar */}
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('ServiceHome')}>
          <Icon name="arrow-left" size={20} color={iconColor} />
        </TouchableOpacity>

        <Text style={[styles.title, themeStyles.title]}>Cadastro de Usuário</Text>

        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Nome"
          placeholderTextColor={themeStyles.placeholder.color}
          value={formData.first_name}
          onChangeText={(text) => handleInputChange('first_name', text)}
        />
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Sobrenome"
          placeholderTextColor={themeStyles.placeholder.color}
          value={formData.last_name}
          onChangeText={(text) => handleInputChange('last_name', text)}
        />
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Usuário"
          placeholderTextColor={themeStyles.placeholder.color}
          value={formData.user}
          onChangeText={(text) => handleInputChange('user', text)}
        />
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Email"
          placeholderTextColor={themeStyles.placeholder.color}
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
        />
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Sala"
          placeholderTextColor={themeStyles.placeholder.color}
          value={formData.sala}
          onChangeText={(text) => handleInputChange('sala', text)}
        />

        <View style={styles.groupContainer}>
          <TouchableOpacity
            style={[
              styles.groupButton,
              themeStyles.groupButton,
              formData.group === 'Coordenador' && styles.groupButtonSelected,
            ]}
            onPress={() => handleInputChange('group', 'Coordenador')}
          >
            <Text style={styles.groupText}>Coordenador</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.groupButton,
              themeStyles.groupButton,
              formData.group === 'Professor' && styles.groupButtonSelected,
            ]}
            onPress={() => handleInputChange('group', 'Professor')}
          >
            <Text style={styles.groupText}>Professor</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.passwordContainer, themeStyles.passwordContainer]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Senha"
            placeholderTextColor={themeStyles.placeholder.color}
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color={iconColor} />

          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start', 
    paddingHorizontal: 20,
    paddingTop: 60, 
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15, // Ajustando a margem inferior
    color: '#333333',
  },
  input: {
    height: 45,
    borderColor: '#CCC',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  groupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  groupButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  groupButtonSelected: {
    backgroundColor: '#B22222',
    borderColor: '#B22222',
  },
  groupText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  passwordContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  
  },
  passwordInput: {
    flex: 1,
  },
  button: {
    backgroundColor: '#B22222',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
});

// Estilos de tema claro
const lightTheme = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    color: '#000',
  },
  input: {
    backgroundColor: '#f0f0f0',
    color: '#000000',
    borderColor: '#cccccc'
  },
  placeholder: {
    color: '#666666'
  },
  passwordContainer: {
    backgroundColor: '#f0f0f0',
    color: '#000000',
    borderColor: '#cccccc'
  },
  groupButton: {
    backgroundColor: '#f0f0f0',
  },
});

// Estilos de tema escuro
const darkTheme = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  title: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    borderColor: '#555555'
  },
  placeholder: {
    color: '#aaaaaa'
  },
  passwordContainer: {
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    borderColor: '#555555'
  },
  groupButton: {
    backgroundColor: '#2a2a2a',
  },
});

export default Cadastro;
