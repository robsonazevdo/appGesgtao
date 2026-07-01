import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Keyboard, RefreshControl, Text } from 'react-native';
import Api from '../../../Api';
import BackIcon from '../../../assets/images/back.svg';
import PersonIcon from '../../../assets/images/person.svg';

import {
  AgendarButton,
  AgendarButtonText,
  BackButton,
  Container,
  FormArea,
  Label,
  Logo,
  PickerInput,
  TextplaceholderInput,
  TitleH
} from './styles';

import {
  SearchInput,
  SuggestionItem,
  SuggestionList,
  SuggestionText
} from '../agendamento/styles';

import CancelModal from '@/components/CancelModal';
import ComandaOptionCard from '@/components/ComandaOption';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';


type RootStackParamList = {
  Venda: undefined;
  
};

export default function ComandasScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [numeroComanda, setNumeroComanda] = useState("");
  const [error, setError] = useState("");

  const [clientQuery, setClientQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | number>('');
 const [ordersToCancel, setOrdersToCancel] = useState<number | null>(null);
  const [comandas, setComandas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);

  
  const createComanda = async () => {
    const num = numeroComanda.trim();

    if (!num) return setError("Digite o número da comanda.");
    if (isNaN(Number(num))) return setError("A comanda deve ser apenas números.");
    if (Number(num) <= 0) return setError("O número da comanda deve ser maior que 0.");
    if (!selectedClient) return setError("Selecione um cliente da lista.");

    setError("");

    try {
      const response = await Api.createOrder({
        client_id: selectedClient,
        barber_id: 1,
        order_number: num
      });

      if (response.error) {
        Alert.alert("Erro", response.details || response.error);
        return;
      }

      Alert.alert("Sucesso", `Comanda nº ${num} criada!`);

      setNumeroComanda("");
      setSelectedClient("");
      setClientQuery("");

      await loadOrders();

    } catch (e) {
      console.log("ERRO CREATE:", e);
      Alert.alert("Erro", "Falha ao criar comanda");
    }
  };

  // =====================
  // CARREGAR CLIENTES
  // =====================
  const loadClients = async () => {
    try {
      const json = await Api.getClients();
      if (Array.isArray(json)) {
        setClients(json);
      }
    } catch {
      Alert.alert('Erro', 'Erro ao carregar clientes');
    }
  };

  // =====================
  // CARREGAR COMANDAS
  // =====================
  const loadOrders = async () => {
    try {
      const json = await Api.getOrdersSeach();
     
      if (Array.isArray(json.data)) {
        setComandas(json.data);
      }

    } catch (e) {
      console.log("ERRO AO CARREGAR:", e);
      Alert.alert('Erro', 'Erro ao carregar comanda');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  // Criar opções para os cards
  const comandasOptions = comandas.map((c) => ({
    id: c.id,
    key: String(c.order_number),
    cliente: c.cliente,
    Icon: PersonIcon
  }));

  const CancelarComanda = (id: string | number) => {
     setOrdersToCancel(id);
     setModalVisible(true);
  };


  const confirmCancel = async () => {
  if (ordersToCancel !== null) {
    const res = await Api.cancelComanda(ordersToCancel);
    if (res.success) {
      Toast.show({
        type: 'success',
        text1: 'Cancelado com sucesso!',
      });

      setModalVisible(false);
      setOrdersToCancel(null);
      await loadOrders(); 
    } else {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: res.error || 'Tente novamente.',
      });
    }
  }
};




useEffect(() => {
  initData();
}, []);

const initData = async () => {
  setLoading(true);
  await Promise.all([loadClients(), loadOrders()]);
  
  
  setLoading(false);
};


  return (
    <Container>
      <CancelModal
        visible={modalVisible}
        title="Excluir Comanda"
        message="Tem certeza que deseja excluir esta comanda?"
        onCancel={() => setModalVisible(false)}
        onConfirm={confirmCancel}
      />

        <BackButton onPress={() => navigation.goBack()}>
          <BackIcon width="45px" height="45px" fill="#333" />
        </BackButton>
      
      <Logo source={require('../../../assets/images/Logo-branco.png')} resizeMode="contain" />

    
      <TitleH>Comanda</TitleH>
     

      <FormArea>

         {/* CLIENTE */}
      <Label>Cliente</Label>

      <PickerInput>
        <SearchInput
          placeholder="Digite o nome do cliente"
          value={clientQuery}
          onChangeText={(text) => {
            setClientQuery(text);
            setSelectedClient("");

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
        <Label>Comanda</Label>

        <TextplaceholderInput
          placeholder="Número da comanda"
          value={numeroComanda}
          onChangeText={setNumeroComanda}
          keyboardType="numeric"
        />

        {!!error && (
          <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
        )}

        <AgendarButton onPress={createComanda}>
          <AgendarButtonText>Criar comanda</AgendarButtonText>
        </AgendarButton>

        {/* LISTA DE COMANDAS (SEM ScrollView) */}
        <FlatList
          data={comandasOptions}
          keyExtractor={(item) => item.key}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <ComandaOptionCard
              label={item.cliente}
              numero={item.key}
              Icon={item.Icon}
              onCancel={() => CancelarComanda(item.id)}
              onFinish={() => navigation.navigate("AddItem", {
                comanda_id: item.id,
                numero_comanda: item.key,
                client_id: clients[0].id, // ou item.client?.id
                barber_id: 1,
              })}

            />
          )}
        />
      </FormArea>
    </Container>
  );
}
