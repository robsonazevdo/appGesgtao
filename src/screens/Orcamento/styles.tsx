import React from 'react';
import styled from 'styled-components/native';

import { LinearGradient } from 'expo-linear-gradient';

export const Container = styled(LinearGradient).attrs({
  colors: ['#b4918f', '#956f6d'], 
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
})`
  flex: 1;
 padding:20px;
`;

export const PickerContainer = styled.View`
  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
`;

export const Logo = styled.Image`
    width: 100%;
    height:110px;
   margin-top: 73px;
`;

export const TitleH = styled.Text`
  flex: 1;
  text-align: center;
  font-size: 26px;
  font-weight: bold;
`;

        
export const BackButton = styled.TouchableOpacity`
    position: absolute;
    left: 0;
    top: 0;
    z-index: 9;
    margin-top: 70px;
    margin-left: 20px;
`;


export const FormArea = styled.View`
  flex: 1;
  width: 100%;
  padding: 20px;
`;


export const InfoAndButtonRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const InfoColumn = styled.View`
  flex-direction: column;
`;

export const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 5px;
`;

export const Label = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-left: 5px;
  max-width: 200px;
  margin-top:10px;
  margin-bottom:12px;
`;

export const AgendarButton = styled.TouchableOpacity`
  border: 2px solid #b4918f;
  padding: 8px 12px;
  border-radius: 10px;
  background-color: transparent;
  margin-bottom: 16px;
  margin-top: 16px;
  justify-content: center;
  align-items: center;
  
`;

export const AgendarButtonText = styled.Text`

  font-size: 16px;
  color: #fff;
  
`;

export const PickerInput = styled.View`
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-top: 4px;
`;

export const TextplaceholderInput = styled.TextInput`
  background-color: #fff;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 5px;
  font-size: 16px;
`;



export const Header = styled.View`
   position: absolute;
    right: 0;
    top: 0;
    z-index: 9;
    margin-top: 70px;
    margin-right: 20px;
`;

export const Title = styled.Text`
  flex: 1;
  text-align: center;
  font-size: 26px;
  font-weight: bold;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;



export const ValueBox = styled.Text`
  padding: 8px 12px;
  background-color: #eee;
  border-radius: 5px;
`;

export const QtdInput = styled.TextInput`
  
  padding: 8px;
  border-width: 1px;
  border-color: #ccc;
  border-radius: 6px;
`;

export const ClientInput = styled.TextInput`
  flex: 1;
  padding: 8px;
  font-size: 20px;
`;

export const QuickSelectRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 15px 0;
`;

export const QuickSelectButton = styled.TouchableOpacity`
  margin-left: 10px;
`;

export const TableHeader = styled.View`
  flex-direction: row;
  padding: 10px 0;
  border-bottom-width: 1px;
  border-color: #ccc;
  
`;

export const TableRow = styled.View`
  flex-direction: row;
  padding: 10px 0;
  border-bottom-width: 1px;
  border-color: #eee;
  
`;

export const TableText = styled.Text`
  font-size: 15px;
  
`;

export const AddButton = styled.TouchableOpacity`
  background-color: #b4918f;
  padding: 14px;
  margin-top: 20px;
  border-radius: 8px;
    margin-bottom: 2px;
`;

export const FinishButton = styled.TouchableOpacity`
  background-color: #b4918f;
  padding: 14px;
  margin-top: 20px;
  border-radius: 8px;
    margin-bottom: 2px;
`


export const AddButtonText = styled.Text`
  color: #fff;
  font-size: 18px;
  text-align: center;
`;

export const FinishText = styled.Text`
  color: #fff;
  font-size: 18px;
  text-align: center;
`;


export const ActionButton = styled.TouchableOpacity`
  flex: 1;
  background-color: #ddd;
  padding: 12px;
  margin-right: 5px;
  border-radius: 8px;
`;

export const ActionButtonText = styled.Text`
  text-align: center;
  font-size: 14px;
  font-weight: bold;
`;

export const ModalBackground = styled.View`
  flex: 1;
  background-color: rgba(0,0,0,0.5);
  justify-content: center;     
  align-items: center;         
`;



export const ModalContent = styled.View`
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
`;

export const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
`;

export const ModalButtons = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

export const CancelButton = styled.TouchableOpacity`
  background-color: #ccc;
  padding: 12px;
  border-radius: 8px;
  flex: 1;
  margin-right: 8px;
`;

export const CancelButtonText = styled.Text`
  text-align: center;
`;

export const OkButton = styled.TouchableOpacity`
  background-color: #C68D95;
  padding: 12px;
  border-radius: 8px;
  flex: 1;
`;

export const OkButtonText = styled.Text`
  text-align: center;
  color: #fff;
`;
