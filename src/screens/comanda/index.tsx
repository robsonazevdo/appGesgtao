import React, { useEffect, useState } from 'react';
import { FlatList, Keyboard } from 'react-native';
import BackIcon from '../../../assets/images/back.svg';
import PersonIcon from '../../../assets/images/person.svg';
import { Alert, TextInput, Text } from 'react-native';
import Api from '../../../Api';


import {
    BackButton,
    Container,
    FormArea,
    Logo,
    InfoAndButtonRow,
    InfoColumn,
    InfoRow,
    Label,
    AgendarButton,
    AgendarButtonText,
    PickerInput,
    TextplaceholderInput
} from './styles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import ComandaOptionCard from '@/components/ComandaOption';
import {  SearchInput, SuggestionItem, SuggestionList, SuggestionText } from '../agendamento/styles';

type RootStackParamList = {
  Venda: undefined;
  Agendamento: { client: any };
  onClose: () => void;
  
};

export default function ComandasScreen() {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [numeroComanda, setNumeroComanda] = useState("");
  const [error, setError] = useState("");

  const [clientQuery, setClientQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | number>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [comandas, setComandas] = useState([]);
  



const createComandaManual = () => {
  const num = numeroComanda.trim();

  // 🔥 valida número
  if (!num) {
    setError("Digite o número da comanda.");
    return;
  }

  if (isNaN(Number(num))) {
    setError("A comanda deve ser apenas números.");
    return;
  }

  if (Number(num) <= 0) {
    setError("O número da comanda deve ser maior que 0.");
    return;
  }

  // 🔥 valida cliente selecionado
  if (!selectedClient) {
    setError("Selecione um cliente da lista.");
    return;
  }

  const clienteObj = clients.find(c => c.id === selectedClient);
  if (!clienteObj) {
    setError("Cliente selecionado não existe.");
    return;
  }

  // 🔥 validar duplicidade
  const idFormatado = num.padStart(3, "0");
  const existe = comandas.some(c => c.id === idFormatado);
  if (existe) {
    setError("Essa comanda já existe!");
    return;
  }

  // limpar erro
  setError("");

  Alert.alert(
    "Criar Comanda",
    `Criar comanda nº ${idFormatado} para ${clienteObj.name}?`,
    [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Criar",
        onPress: () => {
          setComandas([
            ...comandas,
            {
              id: idFormatado,
              cliente: clienteObj.name
            }
          ]);

          // limpar campos
          setNumeroComanda("");
          setClientQuery("");
          setSelectedClient("");
        }
      }
    ]
  );
};




const loadClients = async () => {
    try {
      const json = await Api.getClients();
      if (Array.isArray(json.client)) {
        setClients(json.client);
        //if (json.client.length > 0) setSelectedClient(json.client[0].id);
      }
    } catch {
      Alert.alert('Erro', 'Erro ao carregar clientes');
    }
  };


const loadOrders = async () => {
  try {
    const json = await Api.getOrdersSeach();

    if (Array.isArray(json.orders)) {
      setComandas(json.orders);
    } 

  } catch (e) {
    console.log("ERRO AO CARREGAR:", e);
    Alert.alert('Erro', 'Erro ao carregar comanda');
  }
};


  const comandasOptions = comandas.map(comanda => ({
    key: comanda.id,
    cliente: comanda.cliente,
    Icon: PersonIcon,
  }));



  const handleBackButton = () => {
    navigation.goBack();
  };



  const CancelarComanda = (key: string) => {
    console.log(key, 'cancelar');
  };

  const FinaliarComanda = (key: string) => {
    console.log(key);
  };


  const initData = async () => {
      setLoading(true);
      await Promise.all([loadClients(), loadOrders()]);
      setLoading(false);
    };
  
    useEffect(() => {
      initData();
    }, []);

  return (
    <Container>
      <Logo source={require('../../../assets/images/Logo-branco.png')} resizeMode="contain" />

      <BackButton onPress={handleBackButton}>
        <BackIcon width="45px" height="45px" fill="#333" />
      </BackButton>

      {/* CLIENTE */}
        <Label>Cliente</Label>

        <PickerInput>
          <SearchInput
            placeholder="Digite o nome do cliente"
            value={clientQuery}
            onChangeText={(text) => {
              setClientQuery(text);

              // sempre limpar cliente selecionado se digitou
              setSelectedClient("");

              // filtrar
              setFilteredClients(
                clients.filter(c =>
                  c.name.toLowerCase().includes(text.toLowerCase())
                )
              );
            }}

          />
        </PickerInput>

      {filteredClients.length > 0 && clientQuery.length > 0 && (
        <SuggestionList>
          {filteredClients.map((c) => (
            <SuggestionItem
              key={c.id}
              onPress={() => {
                setSelectedClient(c.id);
                setClientQuery(c.name);
                setFilteredClients([]);
                Keyboard.dismiss();
              }}
            >
              <SuggestionText>{c.name}</SuggestionText>
            </SuggestionItem>
          ))}
        </SuggestionList>
      )}



      <FormArea>
        <Label>Comanda</Label>
        <TextplaceholderInput
          placeholder="Número da comanda"
          value={numeroComanda}
          onChangeText={setNumeroComanda}
          keyboardType="numeric"
          style={{
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 10,
            marginBottom: 5,
            borderWidth: 1,
            borderColor: "#ccc"
          }}
        />

        {error ? (
          <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
        ) : null}

        <AgendarButton onPress={createComandaManual}>
          <AgendarButtonText>Criar comanda</AgendarButtonText>
        </AgendarButton>

        <FlatList
          data={comandasOptions}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <ComandaOptionCard
            label={item.cliente}
            numero={item.key}
            Icon={item.Icon}
            onCancel={() => CancelarComanda(item.key)}
            onFinish={() => FinaliarComanda(item.key)}
          />

          )}
        />
      </FormArea>
    </Container>
  );
}
