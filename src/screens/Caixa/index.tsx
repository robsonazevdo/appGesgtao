import React, { useEffect, useState } from "react";
import { View, FlatList, Alert } from "react-native";
import styled from "styled-components/native";
import Api from "@/Api";
import BackIcon from "../../../assets/images/back.svg";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { BackButton, Logo, Container } from "../../../components/GradientHeader";

const Title = styled.Text`
  font-size: 22px;
  color: white;
  font-weight: bold;
`;

const Card = styled.View`
  background: white;
  padding: 18px;
  border-radius: 12px;
  margin-bottom: 15px;
  elevation: 3;
`;

const Label = styled.Text`
  font-size: 16px;
  color: #555;
`;

const Value = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

type RootStackParamList = {
  Venda: undefined;
  
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function FluxoDiario() {
  const navigation = useNavigation<NavProp>();
  const [entradas, setEntradas] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [transacoes, setTransacoes] = useState([]);

  useEffect(() => {
    loadDiario();
  }, []);

  const loadDiario = async () => {
    try {
      const json = await Api.getFluxoDiario();
      
      setEntradas(json.entradas);
      setSaidas(json.saidas);
      setTransacoes(json.transacoes);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar os dados.");
    }
  };

  return (
    
      <Container>
        <View style={{ flex: 1, padding: 20 }}>
        <Title>Fluxo Diário</Title>
      
          <BackButton onPress={() => navigation.goBack()}>
            <BackIcon width="45" height="45" fill="#333" />
          </BackButton>

          <Logo source={require("../../../assets/images/Logo-branco.png")} resizeMode="contain" />
      <Card>
        <Label>Entradas:</Label>
        <Value>R$ {entradas.toFixed(2)}</Value>
      </Card>

      <Card>
        <Label>Saídas:</Label>
        <Value>R$ {saidas.toFixed(2)}</Value>
      </Card>

      <Card>
        <Label>Lucro do Dia:</Label>
        <Value>R$ {(entradas - saidas).toFixed(2)}</Value>
      </Card>

      <FlatList
        data={transacoes}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card>
            <Label>{item.descricao}</Label>
            <Value style={{ color: item.tipo === "entrada" ? "green" : "red" }}>
              {item.tipo === "entrada" ? "+" : "-"} R$ {item.valor.toFixed(2)}
            </Value>
          </Card>
        )}
        style={{ marginTop: 20 }}
      />
      </View>
      </Container>
    
  );
}
