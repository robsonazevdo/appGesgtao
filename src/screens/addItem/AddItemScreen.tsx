import React, { useEffect, useState, useCallback } from "react";
import { Alert, FlatList, Modal, Text } from "react-native";
import Api from "../../../Api";
import BackIcon from "../../../assets/images/back.svg";

import {
  Container,
  Header,
  Title,
  Row,
  Label,
  ValueBox,
  ClientInput,
  TableHeader,
  TableRow,
  TableText,
  AddButton,
  AddButtonText,
  BackButton,
  Logo,
  ModalBackground,
  ModalContent,
  ModalTitle,
  ModalButtons,
  CancelButton,
  CancelButtonText,
  OkButton,
  OkButtonText,
  FinishButton,
  FinishText,
  QtdInput
} from "./styles";

import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Comandas: undefined;
  AddItem: {
    comanda_id: number;
    numero_comanda: string;
    client_id: number;
    barber_id: number;
  };
};

export default function AddItemScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();

  const routeParams = route.params as Partial<RootStackParamList["AddItem"]> | undefined;
  const comanda_id = routeParams?.comanda_id ?? null;
  const numero_comanda = routeParams?.numero_comanda ?? "";
  const client_id = routeParams?.client_id ?? null;
  const barber_id = routeParams?.barber_id ?? null;

  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);

  const [subTotal, setSubTotal] = useState(0);
  const [itens, setItens] = useState<any[]>([]);
  const [comandaId, setComandaId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [servicos, setServicos] = useState<any[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<number | null>(null);

  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);  
  const [quantidade, setQuantidade] = useState("1");
  


  // utilitário para converter dinheiro (suporta "30", "30.50", "30,50")
  const parseMoney = useCallback((v: any) => {
    if (v === null || v === undefined) return 0;
    const s = String(v).replace(",", ".").trim();
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }, []);

  // CARREGAR ITENS (passa a comandaId real)
  const loadItems = useCallback(async (id: number | null) => {
    try {
      if (!id) {
        setItens([]);
        setSubTotal(0);
        return;
      }

      const json = await Api.getOrder(id);

      const itemsArr = Array.isArray(json?.items) ? json.items : [];
      setItens(itemsArr);

      let total = 0;
      itemsArr.forEach((i: any) => {
        const price = parseMoney(i.item_price ?? i.price ?? i.itemPrice ?? 0);
        const qtd = Number(i.qtd ?? i.quantity ?? 1) || 0;
        total += price * qtd;
      });
      setSubTotal(total);
    } catch (e) {
      console.error("Erro loadItems:", e);
      Alert.alert("Erro", "Falha ao carregar itens da comanda");
      setItens([]);
      setSubTotal(0);
    }
  }, [parseMoney]);

  useEffect(() => {
    // setar comandaId quando a rota estiver disponível
    if (comanda_id) setComandaId(comanda_id);
  }, [comanda_id]);

  useEffect(() => {
    // só carrega quando comandaId estiver setado
    if (comandaId) {
      loadItems(comandaId);
      loadClients();
      loadServices();
    }
  }, [comandaId, loadItems]);

  // CARREGAR CLIENTES
  const loadClients = async () => {
    try {
      const json = await Api.getClients();
     
      if (Array.isArray(json.client)) {
        setClientes(json.client);
        const existe = json.client.find((c: any) => c.id == client_id);
        if (existe) setClienteSelecionado(existe.id);
      }
    } catch (e) {
      console.error("Erro loadClients:", e);
      Alert.alert("Erro", "Erro ao carregar clientes");
    }
  };

  // CARREGAR SERVIÇOS DO BARBEIRO
  const loadServices = async () => {
    try {
      const json = await Api.getServicesByBarberSearch({ barber_id });
      
      if (Array.isArray(json.data)) setServicos(json.data);
    } catch (e) {
      console.error("Erro loadServices:", e);
      Alert.alert("Erro", "Erro ao carregar serviços");
    }
  };

  const criarItem = async () => {
    if (!servicoSelecionado) {
      Alert.alert("Erro", "Selecione um serviço.");
      return;
    }

    try {
      const res = await Api.createOrderItem({
        comanda_id: comandaId,
        service_id: servicoSelecionado,
        client_id: clienteSelecionado,
        barber_id: barber_id,
        qtd: Number(quantidade) > 0 ? Number(quantidade) : 1

      });


     

      if (res.success) {
        setModalVisible(false);
        await loadItems(comandaId);
      } else {
        Alert.alert("Erro", res.error || "Erro ao salvar item.");
      }
    } catch (e) {
      console.error("Erro criarItem:", e);
      Alert.alert("Erro", "Falha ao incluir serviço");
    }
  };

  const removerItem = async () => {
  if (!itemSelecionado) return;
 
  try {
    const res =  await Api.deleteOrderItem(itemSelecionado.order_id, itemSelecionado.item_id);


    if (res.success) {
        setModalDeleteVisible(false);
        await loadItems(comandaId);
      }
      else {
      Alert.alert("Erro", res.error ?? "Não foi possível remover o item");
    }
  } catch (e) {
    console.error("Erro removerItem:", e);
    Alert.alert("Erro", "Falha ao remover item");
  }
};

const finalizarComanda = () => {
  
  navigation.navigate("Finalizar", {

    order_number: numero_comanda,
    items: itens,   
    total: subTotal,
    nome:  clientes
  });
};


  return (
    <Container>
      {/* MODAL */}
      <Modal transparent animationType="slide" visible={modalVisible}>
        <ModalBackground>
          <ModalContent>
            <ModalTitle>Selecionar Serviço</ModalTitle>

            {servicos.length === 0 ? (
              <Text>Nenhum serviço encontrado</Text>
            ) : (
              servicos.map((s: any) => {
                const sid = s.service_id ?? s.id;

                return (
                  <Row
                    key={String(sid)}
                    style={{
                      padding: 10,
                      backgroundColor: servicoSelecionado === sid ? "#3333" : "transparent",
                      marginBottom: 5,
                      borderRadius: 8
                    }}
                    onTouchEnd={() => setServicoSelecionado(Number(sid))}
                  >
                    <Text style={{ color: "#333", fontSize: 18 }}>
                      {String(s.service_name ?? s.name ?? "-")}
                    </Text>
                    <Text style={{ color: "#333" }}>     R$ {String(s.price ?? s.barber_price ?? "0")}</Text>
                  </Row>
                );
              })
            )}

            {/* QUANTIDADE */}
            <Text style={{ marginTop: 10, fontSize: 12 }}>Quantidade:</Text>

            <QtdInput
              keyboardType="numeric"
              value={quantidade}
              placeholder="1"
              onChangeText={(v: string) => {
                const onlyNumbers = v.replace(/[^0-9]/g, "");
                setQuantidade(onlyNumbers);
              }}
            />




            <ModalButtons>
              <CancelButton onPress={() => setModalVisible(false)}>
                <CancelButtonText>Cancelar</CancelButtonText>
              </CancelButton>

              <OkButton onPress={criarItem}>
                <OkButtonText>Confirmar</OkButtonText>
              </OkButton>
            </ModalButtons>
          </ModalContent>
        </ModalBackground>
      </Modal>

      


      {/* MODAL REMOVER ITEM */}
        <Modal transparent animationType="fade" visible={modalDeleteVisible}>
          <ModalBackground>
            <ModalContent>
              <ModalTitle>Remover Item</ModalTitle>
              <Text style={{ fontSize: 18, textAlign: "center", marginVertical: 20 }}>
                Deseja remover este item?
              </Text>

              <ModalButtons>
                <CancelButton onPress={() => setModalDeleteVisible(false)}>
                  <CancelButtonText>Cancelar</CancelButtonText>
                </CancelButton>

                <OkButton onPress={removerItem}>
                  <OkButtonText>Remover</OkButtonText>
                </OkButton>
              </ModalButtons>
            </ModalContent>
          </ModalBackground>
        </Modal>


      <Logo source={require("../../../assets/images/Logo-branco.png")} resizeMode="contain" />

      <BackButton onPress={() => navigation.goBack()}>
        <BackIcon width="45" height="45" fill="#333" />
      </BackButton>

      <Header>
        <Title>Comanda {numero_comanda}</Title>
      </Header>

      {/* CLIENTE + SUBTOTAL */}
      <Row>
        
        <ClientInput
          placeholder="Cliente"
          value={clientes.find(c => c.id == clienteSelecionado)?.name || ""}
          onChangeText={() => {}}
        />

        <Label style={{ marginLeft: 10 }}>Subtotal: </Label>
        <ValueBox>R$ {(Number(subTotal) || 0).toFixed(2)}</ValueBox>
      </Row>

      {/* TABELA */}
      <TableHeader>
        <TableText style={{ flex: 2 }}>Desc.</TableText>
        <TableText style={{ flex: 2 }}>Qtd</TableText>
        <TableText style={{ flex: 2 }}>Valor</TableText>
        <TableText style={{ flex: 2 }}>Profis.</TableText>
        <TableText style={{ flex: 2 }}>SubTotal</TableText>
      </TableHeader>

      <FlatList
        data={itens ?? []}
        keyExtractor={(item) => String(item.item_id ?? item._id ?? Math.random())}
        renderItem={({ item }) => {
        const price = parseMoney(item.item_price ?? item.price ?? item.barber_price ?? 0);
        const qtd = Number(item.qtd ?? item.quantity ?? 1) || 0;
        const subtotal = price * qtd;

        return (
          <TableRow
            onTouchEnd={() => {
              setItemSelecionado(item);
              setModalDeleteVisible(true);
            }}
           
          >
            <TableText style={{ flex: 2 }}>{String(item.service_name ?? item.name ?? "-")}</TableText>
            <TableText style={{ flex: 1 }}>{qtd}</TableText>
            <TableText style={{ flex: 2 }}>R$ {price.toFixed(2)}</TableText>
            <TableText style={{ flex: 1 }}>{String(item.barber_name ?? item.professional ?? "-")}</TableText>
            <TableText style={{ flex: 2 }}>R$ {subtotal.toFixed(2)}</TableText>
          </TableRow>
        );
      }}

      />

      <AddButton onPress={() => setModalVisible(true)}>
        <AddButtonText>Incluir Serviço</AddButtonText>
      </AddButton>

      <FinishButton onPress={finalizarComanda}>
        <FinishText>Finalizar Comanda</FinishText>
      </FinishButton>



    </Container>
  );
}
