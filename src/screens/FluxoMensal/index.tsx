import React, { useEffect, useState } from "react";
import { View } from "react-native";
import styled from "styled-components/native";
import { BackButton, Container, Logo } from "../../../components/GradientHeader";
import Api from "@/Api";
import BackIcon from "../../../assets/images/back.svg";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScrollView } from "react-native";


const meses = [
  { label: "Janeiro", value: "01" },
  { label: "Fevereiro", value: "02" },
  { label: "Março", value: "03" },
  { label: "Abril", value: "04" },
  { label: "Maio", value: "05" },
  { label: "Junho", value: "06" },
  { label: "Julho", value: "07" },
  { label: "Agosto", value: "08" },
  { label: "Setembro", value: "09" },
  { label: "Outubro", value: "10" },
  { label: "Novembro", value: "11" },
  { label: "Dezembro", value: "12" },
];

const Title = styled.Text`
  font-size: 22px;
  color: white;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
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

const Entrada = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: green;
`;

const Saida = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: red;
`;

const Liquido = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

type RootStackParamList = {
  Venda: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function FluxoMensal() {
  const navigation = useNavigation<NavProp>();

  const [dias, setDias] = useState<
    { dia: string; entradas: number; saidas: number; liquido: number }[]
  >([]);

  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalSaidas, setTotalSaidas] = useState(0);
  const [totalLiquido, setTotalLiquido] = useState(0);

  const [mesSelecionado, setMesSelecionado] = useState(
    new Date().getMonth() + 1
  );

  useEffect(() => {
    carregarFluxo(mesSelecionado);
  }, [mesSelecionado]);

  const carregarFluxo = async (mes: number) => {
    const ano = new Date().getFullYear();
    const mesStr = String(mes).padStart(2, "0");

    const json = await Api.getFluxoMensal(`${ano}-${mesStr}`);

    const lista = (json?.dias || []).map((d: any) => ({
      dia: d?.dia || "",
      entradas: Number(d?.entradas || 0),
      saidas: Number(d?.saidas || 0),
      liquido: Number(d?.liquido || 0),
    }));

    setDias(lista);
    setTotalEntradas(Number(json?.total_entradas || 0));
    setTotalSaidas(Number(json?.total_saidas || 0));
    setTotalLiquido(Number(json?.total_liquido || 0));
  };

return (
  <Container>
    

    <View style={{ flex: 1, padding: 20 }}>
      

      <BackButton onPress={() => navigation.goBack()}>
      <BackIcon width={40} height={40} fill="#333" />
    </BackButton>

    <Logo
      source={require("../../../assets/images/Logo-branco.png")}
      resizeMode="contain"
    />

    <Title>Fluxo Mensal</Title>

      {/* FILTRO DE MÊS */}
      <Card>
        <Label>Mês:</Label>
        <Picker
          selectedValue={mesSelecionado}
          onValueChange={(value) => setMesSelecionado(value)}
        >
          {meses.map((m, index) => (
            <Picker.Item key={index} label={m.label} value={Number(m.value)} />
          ))}
        </Picker>
      </Card>

      {/* TOTAIS */}
      <Card>
        <Label>Total Entradas:</Label>
        <Entrada>R$ {totalEntradas.toFixed(2)}</Entrada>

        <Label style={{ marginTop: 10 }}>Total Saídas:</Label>
        <Saida>R$ {totalSaidas.toFixed(2)}</Saida>

        <Label style={{ marginTop: 10 }}>Total Líquido:</Label>
        <Liquido>R$ {totalLiquido.toFixed(2)}</Liquido>
      </Card>

      {/* SCROLL APENAS DOS DIAS */}
      <ScrollView style={{ flex: 1 }}>
        {dias.map((d) => (
          <Card key={d.dia}>
            <Label>Dia {d.dia}</Label>

            <Entrada>Entradas: R$ {d.entradas.toFixed(2)}</Entrada>
            <Saida>Saídas: R$ {d.saidas.toFixed(2)}</Saida>
            <Liquido>Líquido: R$ {d.liquido.toFixed(2)}</Liquido>
          </Card>
        ))}
      </ScrollView>

    </View>
  </Container>
);

}
