// src/components/BaseFormModal.tsx
import React from 'react';
import { Modal } from 'react-native';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components/native';

import BackIcon from '../assets/images/back.svg';
import SaveIcon from '../assets/images/check.svg';

interface BaseFormModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

export default function BaseFormModal({ visible, title, onClose, onSave, children }: BaseFormModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Overlay>
        <ModalContent>
          <Header>
            <HeaderButton onPress={onClose}>
              <BackIcon width={24} height={24} fill="#fff" />
            </HeaderButton>

            <Title>{title}</Title>

            <HeaderButton onPress={onSave}>
              <SaveIcon width={24} height={24} fill="#fff" />
            </HeaderButton>
          </Header>

          <InputsContainer>
            {children}
          </InputsContainer>
        </ModalContent>
      </Overlay>
    </Modal>
  );
}

const Overlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  background-color: #fff;
  border-radius: 12px;
  width: 90%;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #b4918f;
  padding: 12px 16px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  text-align: center;
  flex: 1;
`;

const HeaderButton = styled.TouchableOpacity`
  width: 32px;
  align-items: center;
  justify-content: center;
`;

const InputsContainer = styled.View`
  gap: 16px;
  margin: 20px auto;
  width: 95%;
`;
