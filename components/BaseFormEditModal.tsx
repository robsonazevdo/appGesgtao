import React, { useEffect, useState } from 'react';
import { Modal, Alert } from 'react-native';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components/native';
import SignInput from './SignInput';
import BackIcon from '../assets/images/back.svg';
import SaveIcon from '../assets/images/check.svg';
import DateTimeInput from './DateTimeInput'

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
  width: 90%;
`;


interface FormModalProps<T> {
  visible: boolean;
  onClose: () => void;
  initialData: T | null;
  fields: {
    name: keyof T;
    placeholder: string;
    icon: React.FC;
    type?: 'text' | 'date' | 'select';
    options?: { label: string; value: any }[];
  }[];
  onSave: (data: T) => Promise<void>;
}


export function FormEditModal<T extends Record<string, any>>({
  visible, onClose, initialData, fields, onSave
}: FormModalProps<T>) {
  const [form, setForm] = useState<Partial<T>>({});

 useEffect(() => {
  if (visible && initialData) {
    setForm(initialData);
  }
}, [visible, initialData]);


  const handleSave = async () => {
  try {
    await onSave(form as T);

    onClose();
  } catch (e) {
    Alert.alert('Erro', String(e));
  }
};

const getInputValue = (val: any) =>
  typeof val === 'number' ? String(val) : val ?? '';



  return (
    <Modal visible={visible} transparent animationType="slide" onShow={() => {
     
    if (initialData) {
          setForm(initialData);
        }
        
      }}
      onRequestClose={onClose}>
      <Overlay>
        <ModalContent>
          <Header>
            <HeaderButton onPress={onClose}><BackIcon width={24} height={24} fill="#fff" /></HeaderButton>
            <Title>Formulário</Title>
            <HeaderButton onPress={handleSave}><SaveIcon width={24} height={24} fill="#fff" /></HeaderButton>
          </Header>
          <InputsContainer>
          
           {fields.map(({ name, placeholder, icon: Icon, type }) => {
            if (type === 'date') {
              const rawValue = form[name];
              const date = rawValue ? new Date(rawValue as string) : new Date();

              return (
                <DateTimeInput
                  key={String(name)}
                  value={date}
                  onChange={(date: Date) => {
                    if (date instanceof Date && !isNaN(date.getTime())) {
                      setForm(prev => ({ ...prev, [name]: date.toISOString() }));
                    }
                  }}
                  placeholder={placeholder}
                  IconSvg={Icon}
                  error={undefined}
                />
              );
            }

  return (
    <SignInput
      key={String(name)}
      placeholder={placeholder}
      value={getInputValue(form[name])}
      onChangeText={(txt) => setForm(prev => ({ ...prev, [name]: txt }))}
      IconSvg={Icon}
    />
  );
})}


          </InputsContainer>
        </ModalContent>
      </Overlay>
    </Modal>
  );
}
