import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import Api from "../../../Api";

import BackIcon from "../../../assets/images/back.svg";

import {
  SearchInput,
  SuggestionList,
  SuggestionItem,
  SuggestionText,
  BackButton,
  Logo,
  Container
} from "../agendamento/styles";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Title } from "./styles";

type RootStackParamList = {
  Venda: undefined;
  Finalizar: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function HistoryScreen() {
  const navigation = useNavigation<NavProp>();
  const [data, setData] = useState<any[]>([]);
  const [clientId, setClientId] = useState<number | null>(null);
  
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [clients, setClients] = useState<any[]>([]);
const [clientQuery, setClientQuery] = useState("");
const [filteredClients, setFilteredClients] = useState<any[]>([]);

const [barbers, setBarbers] = useState<any[]>([]);
const [barberQuery, setBarberQuery] = useState("");
const [filteredBarbers, setFilteredBarbers] = useState<any[]>([]);

const [barberId, setBarberId] = useState<number | null>(null);
const [barberName, setBarberName] = useState("");


  const loadHistory = async () => {
    const params = [];

    if (clientId) params.push(`client_id=${clientId}`);
    if (barberId) params.push(`barber_id=${barberId}`);
    if (start) params.push(`start=${start}`);
    if (end) params.push(`end=${end}`);

    const res = await Api.getHistorySales(clientId, barberId, start, end);


    setData(res.data || []);
  };


  useEffect(() => {
  loadClients();
  loadBarbers();
}, []);

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

const loadBarbers = async () => {
  try {
    const json = await Api.getAllBarbers();

    if (json&& Array.isArray(json)) {
      setBarbers(json);
      
    } else {
      setBarbers([]);
    }
  } catch (e) {
    console.error("Erro loadBarber:", e);
    Alert.alert("Erro", "Erro ao carregar colaboradores");
  }
};


useEffect(() => {
  if (!clientQuery) {
    setFilteredClients([]);
    return;
  }

  setFilteredClients(
    clients.filter(c =>
      c.name.toLowerCase().includes(clientQuery.toLowerCase())
    )
  );
}, [clientQuery, clients]);

useEffect(() => {
  if (!barberQuery) {
    setFilteredBarbers([]);
    return;
  }

  setFilteredBarbers(
    barbers.filter(b =>
      b.name.toLowerCase().includes(barberQuery.toLowerCase())
    )
  );
}, [barberQuery, barbers]);


  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <Container>
    <View style={{ flex: 1, padding: 15 }}>
      

      

            <BackButton onPress={() => navigation.goBack()}>
              <BackIcon width="45" height="45" fill="#333" />
            </BackButton>

      <Logo source={require("../../../assets/images/Logo-branco.png")} resizeMode="contain" />

      <Title>Histórico de Vendas</Title>

      <Text style={{ marginTop: 10, fontWeight: "bold" }}>Cliente</Text>

<SearchInput
  placeholder="Buscar cliente"
  value={clientQuery}
  onChangeText={setClientQuery}
/>

{filteredClients.length > 0 && (
  <SuggestionList>
    {filteredClients.map(c => (
      <SuggestionItem
        key={c.id}
        onPress={() => {
          setClientId(c.id);
          setClientQuery(c.name);
          setFilteredClients([]);
        }}
      >
        <SuggestionText>{c.name}</SuggestionText>
      </SuggestionItem>
    ))}
  </SuggestionList>
)}

<Text style={{ marginTop: 10, fontWeight: "bold" }}>Barbeiro</Text>

<SearchInput
  placeholder="Buscar barbeiro"
  value={barberQuery}
  onChangeText={setBarberQuery}
/>

{filteredBarbers.length > 0 && (
  <SuggestionList>
    {filteredBarbers.map(b => (
      <SuggestionItem
        key={b.id}
        onPress={() => {
          setBarberId(b.id);
          setBarberQuery(b.name);
          setFilteredBarbers([]);
        }}
      >
        <SuggestionText>{b.name}</SuggestionText>
      </SuggestionItem>
    ))}
  </SuggestionList>
)}




<TouchableOpacity
  onPress={loadHistory}
  style={{
    backgroundColor: "#b4918f",
    padding: 12,
    borderRadius: 8,
    marginVertical: 12
  }}
>
  <Text style={{ color: "#fff", textAlign: "center" }}>
    Aplicar Filtros
  </Text>
</TouchableOpacity>


      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#fff",
              padding: 12,
              borderRadius: 8,
              marginBottom: 10
            }}
          >
            <Text style={{ fontWeight: "bold" }}>
              Comanda #{item.order_number}
            </Text>
            <Text>Cliente: {item.client_name}</Text>
            <Text>Barbeiro: {item.barber_name}</Text>
            <Text>Data: {new Date(item.opened_at).toLocaleString("pt-BR")}</Text>
            <Text style={{ fontWeight: "bold" }}>
              Total: R$ {Number(item.total_final).toFixed(2)}
            </Text>
          </View>
        )}
      />
    </View>
    </Container>
  );
}
