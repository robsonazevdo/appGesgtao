import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import styled from "styled-components/native";

import { BackButton, Container, Logo } from "@/components/GradientHeader";
import BackIcon from "@/assets/images/back.svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Picker } from "@react-native-picker/picker";
import Api from "../../../Api";

// ---------------- STYLES ----------------

const Title = styled.Text`
  font-size: 22px;
  color: white;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
`;

const Card = styled.View`
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  border-left-width: 6px;
  border-left-color: #956f6d;
`;

const Label = styled.Text`
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const RowLabel = styled.Text`
  font-size: 15px;
  color: #333;
`;

const RowValue = styled.Text<{ color?: string }>`
  font-size: 15px;
  color: ${(p: { color: any; }) => p.color || "#333"};
  font-weight: bold;
`;

const Value = styled.Text<{ color?: string }>`
  font-size: 22px;
  color: ${(p: { color: any; }) => p.color || "#333"};
  font-weight: bold;
`;

const PickerRow = styled.View`
  flex-direction: row;
  background: white;
  margin: 0 20px 20px 20px;
  border-radius: 12px;
  overflow: hidden;
`;

const PickerBox = styled.View`
  flex: 1;
`;

// ---------------- TYPES ----------------

type RootStackParamList = {
  Venda: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

type CashflowItem = {
  categoria: string;
  valor: number;
};

type CashflowReport = {
  entradas: CashflowItem[];
  saidas: CashflowItem[];
  saldo: number;
};

// ---------------- DATA ----------------

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// ---------------- SCREEN ----------------

export default function RelatorioScreen() {
  const navigation = useNavigation<NavProp>();

  const [loading, setLoading] = useState(true);
  const [relatorio, setRelatorio] = useState<CashflowReport | null>(null);

  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const data = await Api.getCashflowReport(month, year);
       
        setRelatorio(data);
      } catch (error) {
        console.error("Erro ao carregar relatório", error);
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [month, year]);

  const totalEntradas =
    relatorio?.entradas.reduce((a, b) => a + b.valor, 0) ?? 0;

  const totalSaidas =
    relatorio?.saidas.reduce((a, b) => a + b.valor, 0) ?? 0;

  const saldoHoje = relatorio?.saldo ?? 0;

  return (
    <Container>
      {/* HEADER */}
      <View style={{ padding: 25 }}>
        <BackButton onPress={() => navigation.goBack()}>
          <BackIcon width={40} height={40} />
        </BackButton>

        <Logo
          source={require("@/assets/images/Logo-branco.png")}
          resizeMode="contain"
        />

        <Title>Relatório Financeiro</Title>
      </View>

      {/* SELETOR DE MÊS / ANO */}
      <PickerRow>
        <PickerBox>
          <Picker selectedValue={month} onValueChange={setMonth}>
            {months.map((m, i) => (
              <Picker.Item key={i} label={m} value={i + 1} />
            ))}
          </Picker>
        </PickerBox>

        <PickerBox>
          <Picker selectedValue={year} onValueChange={setYear}>
            {[2024, 2025, 2026].map((y) => (
              <Picker.Item key={y} label={String(y)} value={y} />
            ))}
          </Picker>
        </PickerBox>
      </PickerRow>

      {/* CONTEÚDO */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#956f6d" />
        ) : (
          <>
            {/* RESUMO */}
            <Card>
              <Label>Resumo</Label>

              <Row>
                <RowLabel>Total de entradas</RowLabel>
                <RowValue color="green">
                  R$ {totalEntradas.toFixed(2)}
                </RowValue>
              </Row>

              <Row>
                <RowLabel>Total de saídas</RowLabel>
                <RowValue color="red">
                  R$ {totalSaidas.toFixed(2)}
                </RowValue>
              </Row>
            </Card>

            {/* ENTRADAS */}
            <Card>
              <Label>Entradas</Label>
              {relatorio?.entradas.map((item, i) => (
                <Row key={i}>
                  <RowLabel>{item.categoria}</RowLabel>
                  <RowValue color="green">
                    R$ {item.valor.toFixed(2)}
                  </RowValue>
                </Row>
              ))}
            </Card>

            {/* SAÍDAS */}
            <Card>
              <Label>Saídas</Label>
              {relatorio?.saidas.map((item, i) => (
                <Row key={i}>
                  <RowLabel>{item.categoria}</RowLabel>
                  <RowValue color="red">
                    R$ {item.valor.toFixed(2)}
                  </RowValue>
                </Row>
              ))}
            </Card>

            {/* SALDO FINAL */}
            <Card
              style={{
                borderLeftColor: saldoHoje >= 0 ? "green" : "red",
              }}
            >
              <Label>Saldo do Período</Label>
              <Value color={saldoHoje >= 0 ? "green" : "red"}>
                R$ {saldoHoje.toFixed(2)}
              </Value>
            </Card>
          </>
        )}
      </ScrollView>
    </Container>
  );
}
