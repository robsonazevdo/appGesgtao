import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import styled from "styled-components/native";

import Api from "@/Api";
import { BackButton, Container, Logo } from "@/components/GradientHeader";

import BackIcon from "@/assets/images/back.svg";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

// ----------------- ESTILOS -----------------

const Title = styled.Text`
  font-size: 22px;
  color: white;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

const Card = styled.View`
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  border-left-width: 6px;
  border-left-color: #956f6d;
  elevation: 3;
`;

const Label = styled.Text`
  font-size: 18px;
  color: #333;
`;

const Value = styled.Text<{ color?: string }>`
  font-size: 22px;
  margin-top: 5px;
  color: ${(p: { color: any; }) => p.color || "#333"};
  font-weight: ${(p: { color: any; }) => (p.color ? "bold" : "normal")};
`;

type RootStackParamList = {
  Venda: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function RelatorioScreen() {
  const navigation = useNavigation<NavProp>(); // <-- AQUI

  const [loading, setLoading] = useState(true);
  const [relatorio, setRelatorio] = useState({
    entradas: 0,
    saídas: 0,
    saldo: 0,
  });

  useEffect(() => {
    carregarRelatorio();
  }, []);

  const carregarRelatorio = async () => {
    try {
      const json = await Api.getCashflowReport();
      setRelatorio(json);
    } catch (e) {
      console.log("Erro ao carregar relatório", e);
    }
    setLoading(false);
  };

  const { entradas, saídas, saldo } = relatorio;

  return (
    <Container>
      <View style={{ flex: 1, padding: 25 }}>

        <BackButton onPress={() => navigation.goBack()}>
          <BackIcon width={40} height={40} fill="#333" />
        </BackButton>

        <Logo
          source={require("@/assets/images/Logo-branco.png")}
          resizeMode="contain"
        />

        <Title>Relatório Financeiro</Title>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <>
            <Card>
              <Label>Entradas</Label>
              <Value color="green">R$ {entradas.toFixed(2)}</Value>
            </Card>

            <Card>
              <Label>Saídas</Label>
              <Value color="red">R$ {saídas.toFixed(2)}</Value>
            </Card>

            <Card style={{ borderLeftColor: saldo >= 0 ? "green" : "red" }}>
              <Label>Saldo Final</Label>
              <Value color={saldo >= 0 ? "green" : "red"}>
                R$ {saldo.toFixed(2)}
              </Value>
            </Card>
          </>
        )}
      </View>
    </Container>
  );
}
