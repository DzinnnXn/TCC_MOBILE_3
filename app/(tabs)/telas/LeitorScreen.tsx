import axios from 'axios';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, View, Modal, Alert, Image, TouchableOpacity, ScrollView, useColorScheme, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Footer from '@/components/footer';
import IconButton from '@/components/IconButton';
import * as Clipboard from 'expo-clipboard'; // Importando Clipboard

interface Patrimonio {
  id: number;
  num_inventario: string;
  denominacao: string;
  localizacao: string;
  sala: string;
  link_imagem: string;
}

interface ScannerScreenProps {
  onNavigate: (screen: string) => void;
}

const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate }) => {
  const colorScheme = useColorScheme();  // Detecta o tema atual (claro ou escuro)
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [selectedPatrimonio, setSelectedPatrimonio] = useState<Patrimonio | null>(null);
  const qrCodeLock = useRef(false);

  useEffect(() => {
    async function fetchPatrimonios() {
      try {
        const response = await axios.get<Patrimonio[]>('http://192.168.0.97:8000/api/inventarios/');
        setPatrimonios(response.data);
      } catch (error) {
        console.error("Erro ao carregar patrimônios:", error);
      }
    }
    fetchPatrimonios();
  }, []);

  async function handleOpenCamera() {
    const { granted } = await requestPermission();
    if (!granted) {
      Alert.alert("Camera", "Você precisa habilitar o uso da câmera");
      return;
    }
    setModalIsVisible(true);
    qrCodeLock.current = false;
  }

  function handleQRCodeRead(data: string) {
    setModalIsVisible(false);
    const match = data.match(/\b\d{6}\b/);

    if (match) {
      const inventoryNumber = match[0];
      const patrimonio = patrimonios.find(p => p.num_inventario === inventoryNumber);

      if (patrimonio) {
        atualizarStatusLocalizacao(inventoryNumber); // Atualiza o status no backend
        setSelectedPatrimonio(patrimonio);
        setInfoModalVisible(true);
      } else {
        Alert.alert("Patrimônio não encontrado", `Nenhum patrimônio corresponde ao inventário: ${inventoryNumber}`);
      }
    } else {
      Alert.alert("Formato inválido", "O QR Code não contém um número de inventário válido.");
    }
  }

  async function atualizarStatusLocalizacao(num_inventario: string) {
    try {
      const response = await axios.post('http://192.168.0.97:8000/api/atualizar_status/', {
        num_inventario: num_inventario,
      });

      if (response.status === 200) {
        Alert.alert("Sucesso", "Status do patrimônio atualizado para 'localizado'.");
      } else {
        Alert.alert("Erro", "Não foi possível atualizar o status do patrimônio.");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      Alert.alert("Erro", "Ocorreu um erro ao tentar atualizar o status.");
    }
  }

  const handleCopyToClipboard = (num_inventario: string) => {
    Clipboard.setString(num_inventario);  // Copia o valor para a área de transferência
    Alert.alert("Copiado", "O número de inventário foi copiado para a área de transferência!");
  };

  const themeStyles = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, themeStyles.container]}>
      <StatusBar
        backgroundColor={themeStyles.container.backgroundColor}
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={styles.header}>
        <IconButton iconName="arrow-back" onPress={() => onNavigate('ServiceHome')} />
        <IconButton iconName="menu" onPress={() => onNavigate('Menu')} />
      </View>

      <Image source={require('@/assets/images/Logo.png')} style={styles.logo} />
      <Text style={[styles.subtitle, themeStyles.subtitle]}>Acesse o QR Code aqui</Text>

      <TouchableOpacity style={[styles.qrButton, themeStyles.qrButton]} onPress={handleOpenCamera}>
        <View style={styles.qrButtonContent}>
          <Text style={[styles.qrButtonText, themeStyles.qrButtonText]}>Ler QrCode</Text>
          <Ionicons name="qr-code" size={20} color="#fff" style={styles.qrIcon} />
        </View>
      </TouchableOpacity>

      <Image source={require('@/assets/images/Ellipse 9.png')} style={styles.ellipse} />

      <Modal visible={modalIsVisible} animationType="slide">
  <View style={[styles.modalHeader, { backgroundColor: '#8B0000' }]}>
    <TouchableOpacity onPress={() => setModalIsVisible(false)}>
      <Ionicons name="arrow-back" size={24} color="white" />
    </TouchableOpacity>
    <Text style={styles.modalTitle}>Leitura de QR Code</Text>
  </View>
  <CameraView
    style={{ flex: 1 }}
    facing="back"
    onBarcodeScanned={({ data }) => {
      if (data && !qrCodeLock.current) {
        qrCodeLock.current = true;
        setTimeout(() => handleQRCodeRead(data), 500);
      }
    }}
  />
</Modal>


      <Modal visible={infoModalVisible} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Patrimônio</Text>
              <TouchableOpacity onPress={() => setInfoModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {selectedPatrimonio ? (
              <ScrollView contentContainerStyle={styles.modalContent}>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Número de Inventário: </Text>
                  {selectedPatrimonio.num_inventario}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Denominação: </Text>
                  {selectedPatrimonio.denominacao}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Localização: </Text>
                  {selectedPatrimonio.localizacao}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Sala: </Text>
                  {selectedPatrimonio.sala}
                </Text>
                {selectedPatrimonio.link_imagem && (
                  <Image source={{ uri: selectedPatrimonio.link_imagem }} style={styles.modalImage} />
                )}
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => handleCopyToClipboard(selectedPatrimonio.num_inventario)}
                >
                  <Text style={styles.copyButtonText}>Copiar Número de Inventário</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <Text style={styles.infoText}>Carregando informações...</Text>
            )}
          </View>
        </View>
      </Modal>


      <Footer onNavigate={onNavigate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  logo: {
    width: 170,
    height: 70,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  qrButton: {
    backgroundColor: '#8B0000',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  qrButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 6,
  },
  qrIcon: {
    marginLeft: 8,
  },
  ellipse: {
    position: 'absolute',
    bottom: 100,
    left: -110,
    width: 400,
    height: 400,
    resizeMode: 'contain',
    zIndex: -1,
  },
  infoModalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  infoModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 30,
    borderRadius: 10,
    maxHeight: '80%',
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  infoTextValue: {
    fontWeight: 'bold',
    color: '#8B0000',
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 15,
  },
  infoModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo semitransparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fundo semitransparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#8B0000', // Vermelho
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    paddingBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#444',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  modalImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginTop: 15,
    resizeMode: 'cover',
  },
  copyButton: {
    backgroundColor: '#8B0000',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

// Estilos para temas claro e escuro
const lightTheme = {
  container: {
    backgroundColor: '#fff',
  },
  subtitle: {
    color: '#333',
  },
  qrButton: {
    backgroundColor: '#8B0000',
  },
  qrButtonText: {
    color: '#fff',
  },
  infoText: {
    color: '#333',
  },
  infoTextValue: {
    color: '#8B0000',
  },
  copyButton: {
    backgroundColor: '#8B0000',
  },
  copyButtonText: {
    color: '#fff',
  },
};

const darkTheme = {
  container: {
    backgroundColor: '#000',
  },
  subtitle: {
    color: '#fff',
  },
  qrButton: {
    backgroundColor: '#8B0000',
  },
  qrButtonText: {
    color: '#fff',
  },
  infoText: {
    color: '#fff',
  },
  infoTextValue: {
    color: '#8B0000',
  },
  copyButton: {
    backgroundColor: '#8B0000',
  },
  copyButtonText: {
    color: '#fff',
  },
};

export default ScannerScreen;
