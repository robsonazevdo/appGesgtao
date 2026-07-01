import React, { useEffect, useState, useCallback } from "react";
import { Alert, FlatList, Keyboard, Modal, Text, View } from "react-native";
import Api from "../../../Api";
import BackIcon from "../../../assets/images/back.svg";
import * as Print from "expo-print";
import { WebView } from "react-native-webview";
import { TouchableOpacity } from "react-native";



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
  QtdInput,
  PickerContainer,
  PickerInput,
  TitleH
} from "./styles";

import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchInput, SuggestionItem, SuggestionList, SuggestionText } from "../agendamento/styles";

type RootStackParamList = {
  Comandas: undefined;
  AddItem: {
    comanda_id: number;
    numero_comanda: string;
    client_id: number;
    barber_id: number;
  };
};

export default function OrçamentoScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();


 

  

 // ===== CLIENTES =====
const [clients, setClients] = useState<any[]>([]);
const [clientQuery, setClientQuery] = useState("");
const [filteredClients, setFilteredClients] = useState<any[]>([]);
const [selectedClient, setSelectedClient] = useState<number | null>(null);


  const [subTotal, setSubTotal] = useState(0);
  const [itens, setItens] = useState<any[]>([]);
  const [comandaId, setComandaId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [servicos, setServicos] = useState<any[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<number | null>(null);

const [barbers, setBarbers] = useState<any[]>([]);
const [barberQuery, setBarberQuery] = useState("");

const [filteredBarbers, setFilteredBarbers] = useState<any[]>([]);
const [selectedBarber, setSelectedBarber] = useState<number | null>(null);

 
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);  
  const [quantidade, setQuantidade] = useState("1");

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");




  const [orderNumber, setOrderNumber] = useState('');
const [orderDate, setOrderDate] = useState('');


  

const buildReceiptHtml = () => {
  const dataAtual = orderDate
    ? new Date(orderDate).toLocaleString("pt-BR")
    : new Date().toLocaleString("pt-BR");

  const itensHtml = itens.map((it) => {
    const price = parseMoney(it.item_price ?? it.price ?? 0);
    const qtd = Number(it.qtd ?? 1);

    return `
      <tr>
        <td style="padding:8px 0;">${it.service_name ?? it.name}</td>
        <td style="padding:8px 0; text-align:center;">${qtd}</td>
        <td style="padding:8px 0; text-align:right;">R$ ${price.toFixed(2)}</td>
        <td style="padding:8px 0; text-align:right;">R$ ${(price * qtd).toFixed(2)}</td>
      </tr>
    `;
  }).join("");

  return `
  <html>
    <body style="font-family: Arial, sans-serif; color:#333; padding:20px;">

      <!-- CABEÇALHO -->
      <div style="
        text-align:center;
        padding:18px 0;
        background: linear-gradient(to bottom, #b4918f, #956f6d);
        color:white;
        font-size:22px;
        font-weight:bold;
        border-radius:8px;
        margin-bottom:15px;
      ">
        ORÇAMENTO
      </div>

      <!-- INFO -->
      <div style="
        background:#f7f7f7;
        border:1px solid #ddd;
        padding:12px;
        border-radius:8px;
        margin-bottom:20px;
        font-size:15px;
      ">
        <div><strong>Orçamento Nº:</strong> ${orderNumber}</div>
        <div><strong>Cliente:</strong> ${clientQuery || "Não informado"}</div>
        <div><strong>Data:</strong> ${dataAtual}</div>
      </div>

      <!-- TABELA -->
      <table width="100%" style="border-collapse: collapse; font-size:14px;">
        <thead>
          <tr style="background: linear-gradient(to bottom, #b4918f, #956f6d); color:white;">
            <th style="padding:10px; text-align:left;">Serviço</th>
            <th style="padding:10px;">Qtd</th>
            <th style="padding:10px; text-align:right;">Preço</th>
            <th style="padding:10px; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itensHtml}
        </tbody>
      </table>

      <hr style="margin:25px 0; border-color:#ddd;" />

      <!-- TOTAL -->
      <table width="100%" style="font-size:16px;">
        <tr style="font-size:18px; font-weight:bold;">
          <td style="padding:10px 0;">Total do Orçamento:</td>
          <td style="text-align:right;">R$ ${(Number(subTotal) || 0).toFixed(2)}</td>
        </tr>
      </table>

      <div style="margin-top:30px; text-align:center; color:#777; font-size:13px;">
        Orçamento válido por 7 dias<br />
        <span style="font-size:12px;">Susana Alves</span>
      </div>

    </body>
  </html>
  `;
};



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
  loadClients();
      loadBarber();
  }, []);



const loadClients = async () => {
  try {
    const json = await Api.getClients();


    // cobre todos os formatos comuns
    const list =
      json ||
      json ||
      json ||
      [];

    if (Array.isArray(list)) {
      setClients(list);
    } else {
      setClients([]);
    }
  } catch (e) {
    console.error("Erro loadClients:", e);
    Alert.alert("Erro", "Erro ao carregar clientes");
  }
};



  // CARREGAR SERVIÇOS DO BARBEIRO
  const loadServices = async (barber_id: any) => {
 
    try {
      const json = await Api.getServicesByBarberSearch({data:{ barber_id }});

      if (Array.isArray(json.data)) setServicos(json.data);
    } catch (e) {
      console.error("Erro loadServices:", e);
      Alert.alert("Erro", "Erro ao carregar serviços");
    }
  };


const loadBarber = async () => {
  try {
    const json = await Api.getAllBarbers();

    if (json && Array.isArray(json)) {
      setBarbers(json);
      
    } else {
      setBarbers([]);
    }
  } catch (e) {
    console.error("Erro loadBarber:", e);
    Alert.alert("Erro", "Erro ao carregar colaboradores");
  }
};




const criarOrcamento = async () => {
  if (!selectedClient || !selectedBarber) {
    Alert.alert("Selecione cliente e colaborador");
    return;
  }

  try {
    const res = await Api.createOrcamento({
      client_id: selectedClient,
      barber_id: selectedBarber
    });

    if (res.success) {
      setComandaId(res.order_id);
      setOrderNumber(res.order_number);
      setOrderDate(res.opened_at);

      Alert.alert("Sucesso", "Orçamento criado com sucesso");
    }
  } catch (e) {
    Alert.alert("Erro", "Falha ao criar orçamento");
  }
};


const adicionarItem = async () => {
  if (!comandaId) {
    Alert.alert("Crie o orçamento primeiro");
    return;
  }

  if (!servicoSelecionado) {
    Alert.alert("Selecione um serviço");
    return;
  }

  try {
    const res = await Api.createOrderItem({
      comanda_id: comandaId,
      service_id: servicoSelecionado,
      barber_id: selectedBarber,
      qtd: Number(quantidade) > 0 ? Number(quantidade) : 1
    });

    if (res.success) {
      setModalVisible(false);
      setServicoSelecionado(null);
      setQuantidade("1");
      await loadItems(comandaId);
    }
  } catch (e) {
    Alert.alert("Erro", "Falha ao adicionar item");
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


useEffect(() => {
  if (barberQuery.length === 0) {
    setFilteredBarbers([]);
    return;
  }

  const filtered = barbers.filter(b =>
    b.name.toLowerCase().includes(barberQuery.toLowerCase())
  );

  setFilteredBarbers(filtered);
}, [barberQuery, barbers]);


useEffect(() => {
  if (!clientQuery) {
    setFilteredClients([]);
    return;
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(clientQuery.toLowerCase())
  );

  setFilteredClients(filtered);
}, [clientQuery, clients]);


const openPreview = () => {
  if (!orderNumber) {
    Alert.alert("Erro", "Nenhum orçamento criado.");
    return;
  }

  setPreviewHtml(buildReceiptHtml());
  setPreviewVisible(true);
};



  
const handlePrint = async () => {
  try {
    await Print.printAsync({
      html: buildReceiptHtml()
    });
  } catch (e) {
    Alert.alert("Erro ao imprimir");
  }
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

              <OkButton onPress={adicionarItem}>

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
        <TitleH>Orçamento {orderNumber} </TitleH>
      </Header>

      <Row>

        <Label style={{ marginLeft: 10 }}>Subtotal: </Label>
        <ValueBox>R$ {(Number(subTotal) || 0).toFixed(2)}</ValueBox>
      </Row>
     
             
            {/* CLIENTE */}
            <Label>Cliente</Label>

            <PickerInput>
            <SearchInput
                placeholder="Digite o nome do cliente"
                value={clientQuery}
                onChangeText={setClientQuery}
            />
            </PickerInput>

            {filteredClients.length > 0 && clientQuery.length > 0 && (
            <SuggestionList>
                {filteredClients.map(c => (
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



                        {/* BARBER */}
            <Label>Colaborador</Label>

            <PickerInput>
            <SearchInput
                placeholder="Digite o nome do colaborador"
                value={barberQuery}
                onChangeText={setBarberQuery}
            />
            </PickerInput>

            {filteredBarbers.length > 0 && barberQuery.length > 0 && (
            <SuggestionList>
                {filteredBarbers.map(b => (
                <SuggestionItem
                    key={b.id}
                    onPress={() => {
                    setSelectedBarber(b.id);
                    loadServices(b.id);   
                    setBarberQuery(b.name);    
                    setFilteredBarbers([]);
                    Keyboard.dismiss();
                    }}
                >
                    <SuggestionText>{b.name}</SuggestionText>
                </SuggestionItem>
                ))}
            </SuggestionList>
            )}


      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
        <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
            Preview Orçamento
          </Text>

          <View style={{ flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, overflow: "hidden" }}>
            <WebView
              originWhitelist={["*"]}
              source={{ html: previewHtml }}
              style={{ flex: 1 }}
              setSupportMultipleWindows={false}
            />
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => setPreviewVisible(false)}
              style={{ padding: 12, backgroundColor: "#777", borderRadius: 8 }}
            >
              <Text style={{ color: "#fff" }}>Fechar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePrint}
              style={{ padding: 12, backgroundColor: "#b4918f", borderRadius: 8 }}
            >
              <Text style={{ color: "#fff" }}>Imprimir / PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


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

      <FinishButton onPress={criarOrcamento}>
        <FinishText>Criar Orçamento</FinishText>
      </FinishButton>

      <AddButton onPress={() => setModalVisible(true)}>
        <AddButtonText>Incluir Serviço</AddButtonText>
      </AddButton>

      


       {/* botões: preview, finalizar */}
            <View style={{ marginTop: 14, marginBottom: 36, flexDirection: "row", justifyContent: "space-between" }}>
              <FinishButton onPress={openPreview} style={{ backgroundColor: "#777", flex: 1, marginRight: 8 }}>
                <FinishText>Preview Recibo</FinishText>
              </FinishButton>

          
            </View>



    </Container>
  );
}



