import styled from 'styled-components/native';

export const ModalBackground = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.View`
  width: 90%;
  background-color: #fff;
  border-radius: 20px;
  padding: 10px;

`;

export const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #fff;
  text-align: center;
`;

export const PickerContainer = styled.View`
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
`;

export const Input = styled.TextInput`
  height: 45px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 15px;
`;

export const SaveButton = styled.TouchableOpacity`
  background-color: #C68D95;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  margin-top: 10px;
`;

export const SaveButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;


export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #b4918f;
  padding: 12px 16px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

export const HeaderButton = styled.TouchableOpacity`
  width: 32px;
  align-items: center;
  justify-content: center;
`;