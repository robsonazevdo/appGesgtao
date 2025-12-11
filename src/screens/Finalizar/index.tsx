// src/screens/Finalizar/index.tsx
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Alert, Modal, ActivityIndicator, TextInput, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Print from "expo-print";


import Api from "../../../Api";
import BackIcon from "../../../assets/images/back.svg";

import { 
  Container,
  TotalArea,
  TotalText,
  PaymentButton,
  PaymentText,
  FinishButton,
  FinishText,
  Logo,
  Header,
  TitleH,
  ModalOverlay,
  ModalBox,
  ModalTitle,
  ModalInput,
  ModalButton,
  ModalButtonText
} from "./styles";

import { BackButton } from "../agendamento/styles";

type RootStackParamList = {
  Venda: undefined;
  Finalizar: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function FinalizarComandaScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const params = route.params || {};

  const [orderNumber, setOrderNumber] = useState(params.order_number || "");
  const [status, setStatus] = useState(params.status || "");
  const [items, setItems] = useState<any[]>(params.items || []);
  const [total, setTotal] = useState<number>(params.total || 0);

  const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
  const [codigoBusca, setCodigoBusca] = useState("");

  const [formaPagamento, setFormaPagamento] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [desconto, setDesconto] = useState<string>("0");

 const descontoNum = Number((desconto || "0").replace(",", ".")) || 0;
  const totalComDesconto = Math.max(0, total - descontoNum);


  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  useEffect(() => {
    if (!params.order_number) setModalBuscaVisible(true);

    // se vier total e items, calcule total formatado
    if (params.items && !params.total) {
      let soma = 0;
      (params.items as any[]).forEach((i) => {
        soma += Number(i.item_price) * Number(i.qtd);
      });
      setTotal(soma);
    }
  }, []);

  useEffect(() => {
    if (status === "finalizada") {
      Alert.alert("Aviso", "Esta comanda já foi finalizada.", [
        { text: "OK", onPress: () => navigation.navigate("Venda") }
      ]);
    }
  }, [status]);

  const buscarComanda = async () => {
    if (!codigoBusca.trim()) {
      Alert.alert("Erro", "Digite o número da comanda.");
      return;
    }
    setLoading(true);
    const res = await Api.getOrderByNumber(codigoBusca);
    setLoading(false);

    if (!res || !res.items) {
      Alert.alert("Erro", "Comanda não encontrada.");
      return;
    }

    setOrderNumber((res.order_number ?? codigoBusca) || codigoBusca);

    setItems(res.items || []);
    setStatus(res.status || "");
    // recalcula total
    let soma = 0;
    (res.items || []).forEach((i: any) => soma += Number(i.item_price) * Number(i.qtd));
    setTotal(soma);

    setModalBuscaVisible(false);
  };

  // Gera HTML simples para preview/impressão
  const buildReceiptHtml = () => {
    const descontoNum = Number((desconto || "0").replace(",", "."));
    const totalNum = Number(total) || 0;
    const totalComDesconto = Math.max(0, totalNum - (isNaN(descontoNum) ? 0 : descontoNum));

    const itensHtml = items.map((it: any) => `
      <tr>
        <td style="padding:6px 0;">${it.service_name}</td>
        <td style="padding:6px 0;text-align:center;">${it.qtd}</td>
        <td style="padding:6px 0;text-align:right;">R$ ${(Number(it.item_price)||0).toFixed(2)}</td>
        <td style="padding:6px 0;text-align:right;">R$ ${((Number(it.item_price)||0)*Number(it.qtd)).toFixed(2)}</td>
        <td style="text-align:right;font-weight:bold;"> R$ ${totalComDesconto.toFixed(2)}</td>
      </tr>
    `).join("");

    return `
      <html>
        <body style="font-family: sans-serif; padding:20px; color:#333;">
          <h2>Recibo - Comanda ${orderNumber}</h2>
          <table width="100%" style="border-collapse: collapse; margin-top:12px;">
            ${itensHtml}
          </table>

          <hr style="margin:12px 0;" />

          <p>Subtotal: R$ ${totalNum.toFixed(2)}</p>
          <p>Desconto: R$ ${isNaN(descontoNum) ? "0.00" : descontoNum.toFixed(2)}</p>
          <p><strong>Total: R$ ${totalComDesconto.toFixed(2)}</strong></p>
          <p>Pagamento: ${formaPagamento || "-"}</p>
          <p style="margin-top:18px;">Obrigado pela preferência!</p>
        </body>
      </html>
    `;
  };

  // Abre preview modal com HTML e permite imprimir
  const openPreview = () => {
    if (!orderNumber) {
      Alert.alert("Erro", "Nenhuma comanda carregada.");
      return;
    }
    setPreviewHtml(buildReceiptHtml());
    setPreviewVisible(true);
  };

  // usa expo-print para imprimir/gerar PDF
  const handlePrint = async () => {
    try {
      const html = buildReceiptHtml();
      await Print.printAsync({ html }); // abre diálogo de impressão / gerar PDF
    } catch (e) {
      console.error("Erro print:", e);
      Alert.alert("Erro", "Falha ao gerar impressão/PDF.");
    }
  };

  // Finaliza com backend (envia order_number, formaPagamento e desconto)
const finalizar = async () => {
  if (!formaPagamento) {
    Alert.alert("Erro", "Selecione a forma de pagamento.");
    return;
  }

  const descontoNum = Number((desconto || "0").replace(",", ".")) || 0;

  setLoading(true);

  const res = await Api.finalizarComanda(orderNumber, formaPagamento, descontoNum);

  setLoading(false);

  if (res.error) {
    Alert.alert("Erro", res.error);
    return;
  }

  Alert.alert("Sucesso", "Comanda finalizada!");
  navigation.navigate("Venda");
};


  return (
    <Container>
      {loading && (
        <View style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", zIndex: 20
        }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* Modal busca comanda */}
      <Modal transparent visible={modalBuscaVisible} animationType="fade">
        <ModalOverlay>
          <ModalBox>
            <ModalTitle>Buscar Comanda</ModalTitle>

            <ModalInput
              placeholder="Número da comanda"
              keyboardType="numeric"
              value={codigoBusca}
              onChangeText={setCodigoBusca}
            />

            <ModalButton onPress={buscarComanda}><ModalButtonText>Buscar</ModalButtonText></ModalButton>
            <ModalButton style={{ backgroundColor: "#777", marginTop: 10 }} onPress={() => navigation.goBack()}>
              <ModalButtonText>Cancelar</ModalButtonText>
            </ModalButton>
          </ModalBox>
        </ModalOverlay>
      </Modal>

      {/* Modal Preview do recibo */}
      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
        <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>Preview do Recibo</Text>

          <View style={{ flex: 1 }}>
            {/* Render básico do HTML como texto — para visual rápida */}
            <Text>{previewHtml.replace(/<[^>]+>/g, "").slice(0, 4000)}</Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
            <TouchableOpacity onPress={() => setPreviewVisible(false)} style={{ padding: 12, backgroundColor: "#777", borderRadius: 8 }}>
              <Text style={{ color: "#fff" }}>Fechar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePrint} style={{ padding: 12, backgroundColor: "#b4918f", borderRadius: 8 }}>
              <Text style={{ color: "#fff" }}>Imprimir / PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Header>
        <TitleH>Finalizar Comanda {orderNumber}</TitleH>
      </Header>

      <BackButton onPress={() => navigation.goBack()}>
        <BackIcon width="45" height="45" fill="#fff" />
      </BackButton>

      <Logo source={require("../../../assets/images/Logo-branco.png")} resizeMode="contain" />

      {/* LISTA */}
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.item_id || Math.random())}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, color:"#fff" }}>{item.service_name}</Text>
            <Text style={{ color:"#fff" }}>Qtd: {item.qtd} | Preço: R$ {(Number(item.item_price)||0).toFixed(2)}</Text>
            <Text style={{ fontWeight: "bold", color:"#fff" }}>
              Subtotal: R$ {((Number(item.item_price)||0) * Number(item.qtd)).toFixed(2)}
            </Text>
          </View>
        )}
      />

      {/* TOTAL e DESCONTO */}
      <TotalArea>
        <TotalText>Total: R$ {Number(total).toFixed(2)}</TotalText>
        <View style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}>
          <Text style={{ color: "#fff", marginRight: 8 }}>Desconto (R$):</Text>
          <TextInput
            value={desconto}
            onChangeText={(t) => setDesconto(t.replace(/[^0-9,\.]/g, ""))}
            keyboardType="numeric"
            style={{ backgroundColor: "#fff", padding: 8, borderRadius: 8, flex: 1 }}
          />
        </View>
      </TotalArea>

      {/* PAGAMENTO */}
      <Text style={{ marginTop: 20, fontWeight: "bold", color:"#fff" }}>Forma de Pagamento</Text>
      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <PaymentButton style={{ opacity: formaPagamento === "dinheiro" ? 1 : 0.6 }} onPress={() => setFormaPagamento("dinheiro")}>
          <PaymentText>Dinheiro</PaymentText>
        </PaymentButton>

        <PaymentButton style={{ opacity: formaPagamento === "pix" ? 1 : 0.6 }} onPress={() => setFormaPagamento("pix")}>
          <PaymentText>PIX</PaymentText>
        </PaymentButton>

        <PaymentButton style={{ opacity: formaPagamento === "cartao" ? 1 : 0.6 }} onPress={() => setFormaPagamento("cartao")}>
          <PaymentText>Cartão</PaymentText>
        </PaymentButton>
      </View>

      {/* botões: preview, finalizar */}
      <View style={{ marginTop: 14, flexDirection: "row", justifyContent: "space-between" }}>
        <FinishButton onPress={openPreview} style={{ backgroundColor: "#777", flex: 1, marginRight: 8 }}>
          <FinishText>Preview Recibo</FinishText>
        </FinishButton>

        <FinishButton onPress={finalizar} style={{ flex: 1 }}>
          <FinishText>Confirmar e Finalizar</FinishText>
        </FinishButton>
      </View>
    </Container>
  );
}
