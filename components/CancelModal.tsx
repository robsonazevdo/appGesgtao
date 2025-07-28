// components/CancelModal.tsx
import React from 'react';
import { Modal } from 'react-native';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components/native';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function CancelModal({ visible, onCancel, onConfirm }: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Overlay>
        <ModalBox>
          <Title>Cancelar Agendamento</Title>
          <Message>Deseja realmente cancelar este agendamento?</Message>
          <ButtonRow>
            <CancelButton onPress={onCancel}>
              <ButtonText>Não</ButtonText>
            </CancelButton>
            <ConfirmButton onPress={onConfirm}>
              <ButtonText style={{ color: '#fff' }}>Sim</ButtonText>
            </ConfirmButton>
          </ButtonRow>
        </ModalBox>
      </Overlay>
    </Modal>
  );
}

const Overlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const ModalBox = styled.View`
  width: 80%;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Message = styled.Text`
  font-size: 16px;
  margin-bottom: 20px;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
`;

const CancelButton = styled.TouchableOpacity`
  padding: 10px 15px;
  margin-right: 10px;
`;

const ConfirmButton = styled.TouchableOpacity`
  padding: 10px 15px;
  background-color: #c68d95;
  border-radius: 5px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
`;
