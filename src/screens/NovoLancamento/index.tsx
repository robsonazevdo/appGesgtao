import React, { useState } from "react";
import { View, Alert, Modal, Platform } from "react-native";
import styled from "styled-components/native";

import { BackButton, Container, Logo } from "../../../components/GradientHeader";
import Api from "@/Api";

import BackIcon from "../../../assets/images/back.svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";


import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

// ----------------- ESTILOS -----------------

const Input = styled.TextInput`
  background: white;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 15px;
  font-size: 16px;
`;

const Card = styled.View`
  background: white;
  padding: 18px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const Btn = styled.TouchableOpacity`
  background: #956f6d;
  padding: 15px;
  border-radius: 10px;
  align-items: center;
  margin-top: 10px;
`;

const BtnText = styled.Text`
  font-size: 17px;
  color: white;
  font-weight: bold;
`;

const Title = styled.Text`
  font-size: 22px;
  color: white;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;



type RootStackParamList = {
  Venda: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;



export default function NovoLancamento() {
  const navigation = useNavigation<NavProp>();

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("entrada");

  const [data, setData] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);

  // Converter "R$ 1.234,56" → 1234.56
const moneyToFloat = (v: string) => {
  if (!v) return 0;

  // Troca vírgula por ponto
  const cleaned = v.replace(",", ".");
  return parseFloat(cleaned);
};


  const validar = () => {
    if (!descricao) return Alert.alert("Erro", "Descrição obrigatória!");
    if (!valor) return Alert.alert("Erro", "Informe o valor!");
    if (!tipo) return Alert.alert("Erro", "Escolha o tipo!");

    setConfirmVisible(true);
  };

  const salvar = async () => {
    const valorFinal = moneyToFloat(valor);

    const json = await Api.createCashflowExit({
      descricao,
      valor: valorFinal,
      tipo,
      date: data.toISOString(),
    });

    if (json?.error) {
      Alert.alert("Erro", json.error);
      return;
    }

    setConfirmVisible(false);
    Alert.alert("Sucesso", "Lançamento salvo com sucesso!");

    setDescricao("");
    setValor("");
    setTipo("entrada");
    setData(new Date());
  };

  return (
    <Container>
      <View style={{ flex: 1, padding: 20 }}>
        {/* HEADER */}
        <BackButton onPress={() => navigation.goBack()}>
          <BackIcon width={40} height={40} fill="#333" />
        </BackButton>

        <Logo
          source={require("../../../assets/images/Logo-branco.png")}
          resizeMode="contain"
        />

        <Title>Novo Lançamento</Title>

        {/* FORM */}
        <Card>
          <Input
            placeholder="Descrição"
            value={descricao}
            onChangeText={setDescricao}
          />

            <Input
            placeholder="Valor (ex: 120.50 ou 120,50)"
            value={valor}
            onChangeText={(text: string) => {
                // Permite somente números e vírgula/ponto
                const cleaned = text.replace(/[^0-9.,]/g, "");
                setValor(cleaned);
            }}
            keyboardType="numeric"
            />


          {/* DATA */}
          <Btn onPress={() => setShowDatePicker(true)}>
            <BtnText>
              Data: {data.toLocaleDateString("pt-BR")}
            </BtnText>
          </Btn>

          {showDatePicker && (
            <DateTimePicker
              value={data}
              mode="date"
              onChange={(e, selected) => {
                setShowDatePicker(false);
                if (selected) setData(selected);
              }}
            />
          )}

          {/* PICKER tipo */}
          <Picker selectedValue={tipo} onValueChange={setTipo}>
            <Picker.Item label="Entrada" value="entrada" />
            <Picker.Item label="Saída" value="saida" />
          </Picker>
        </Card>

        <Btn onPress={validar}>
          <BtnText>Salvar</BtnText>
        </Btn>

        {/* ---------------- MODAL ---------------- */}
        <Modal visible={confirmVisible} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                padding: 25,
                borderRadius: 12,
                width: "100%",
              }}
            >
              <Title style={{ color: "#333", marginBottom: 15 }}>
                Confirmar Lançamento?
              </Title>

              <Input editable={false} value={descricao} />
              <Input editable={false} value={valor} />
              <Input editable={false} value={tipo.toUpperCase()} />
              <Input
                editable={false}
                value={data.toLocaleDateString("pt-BR")}
              />

              <Btn onPress={salvar}>
                <BtnText>Confirmar</BtnText>
              </Btn>

              <Btn
                style={{ backgroundColor: "#666", marginTop: 10 }}
                onPress={() => setConfirmVisible(false)}
              >
                <BtnText>Cancelar</BtnText>
              </Btn>
            </View>
          </View>
        </Modal>
      </View>
    </Container>
  );
}
