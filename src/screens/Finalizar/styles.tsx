import styled from "styled-components/native";
import { LinearGradient } from "expo-linear-gradient";

export const Container = styled(LinearGradient).attrs({
  colors: ["#b4918f", "#956f6d"],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 }
})`
  flex: 1;
  padding: 20px;
`;

/* TÍTULO */
export const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20px;
`;

/* LISTA DE ITENS */
export const ItemCard = styled.View`
  background-color: #1a1a1a;
  padding: 16px 20px;
  margin-bottom: 12px;
  border-radius: 12px;
`;

export const ItemName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #fff;
`;

export const ItemInfo = styled.Text`
  font-size: 15px;
  color: #ccc;
  margin-top: 4px;
`;

/* TOTAL */
export const TotalArea = styled.View`
  background-color: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 12px;
  margin-top: 10px;
  margin-bottom: 20px;
`;

export const TotalText = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  text-align: center;
`;

/* PAGAMENTO */
export const PayRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
`;

export const PaymentButton = styled.TouchableOpacity`
  flex: 1;
  border: 2px solid #b4918f;
  margin-right: 8px;
  padding: 10px 0;
  border-radius: 10px;
  align-items: center;
  background-color: rgba(0,0,0,0.15);
`;

export const PaymentText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

/* BOTÃO FINALIZAR */
export const FinishButton = styled.TouchableOpacity`
 background-color: #b4918f;
  padding: 14px;
  margin-top: 20px;
  border-radius: 8px;
    margin-bottom: 2px;
`;

export const FinishText = styled.Text`
  color: #fff;
  font-size: 18px;
  text-align: center;

`;

export const Logo = styled.Image`
    width: 100%;
    height:110px;
   margin-top: 90px;
`;

export const Header = styled.View`
   position: absolute;
    right: 0;
    top: 0;
    z-index: 9;
    margin-top: 70px;
    margin-right: 20px;
`;

export const TitleH = styled.Text`
  flex: 1;
  text-align: center;
  font-size: 26px;
  font-weight: bold;
`;


export const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0,0,0,0.6);
  justify-content: center;
  align-items: center;
`;

export const ModalBox = styled.View`
  width: 85%;
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
`;

export const ModalTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
`;

export const ModalInput = styled.TextInput`
  width: 100%;
  background-color: #eee;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 18px;
`;

export const ModalButton = styled.TouchableOpacity`
  background-color: #b4918f;
  padding: 12px;
  border-radius: 10px;
  margin-top: 10px;
  align-items: center;
`;

export const ModalButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;
