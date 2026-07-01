import Api from '@/Api'; // adapte ao seu caminho
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Text } from 'react-native';
import BackIcon from '../../../assets/images/back.svg';
import SaveIcon from '../../../assets/images/check.svg';
import {
  Header,
  HeaderButton,
  Input,
  ModalBackground,
  ModalContent,
  ModalTitle,
  PickerContainer
} from './styles'; // estilos personalizados

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function BarberServiceConfigModal({ visible, onClose }: Props) {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const barberData = await Api.getAllBarbers(); // Assuma que retorna { barbers: [...] }
      const serviceData = await Api.getServices(); // Assuma que retorna { service: [...] }

      setBarbers(barberData || []);
      setServices(serviceData.data || []);
    };

    if (visible) {
      loadData();
    }
  }, [visible]);

  const handleSave = async () => {
    if (!selectedBarber || !selectedService || !price || !duration) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    const res = await Api.setBarberService({
      barber_id: Number(selectedBarber),
      //name: selectedService,
      price: Number(price),
      duration: Number(duration),
      service_id: Number(selectedService),
    });

    if (res.success) {
      Alert.alert('Sucesso', 'Configuração salva com sucesso.');
      onClose();
    } else {
      Alert.alert('Erro', res.error || 'Erro ao salvar configuração.');
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <ModalBackground>
        <ModalContent>
          
          <Header>
            <HeaderButton onPress={onClose}><BackIcon width={24} height={24} fill="#fff" /></HeaderButton>
            <ModalTitle>Configurar Serviço</ModalTitle>
            <HeaderButton onPress={handleSave}><SaveIcon width={24} height={24} fill="#fff" /></HeaderButton>
          </Header>

          <Text>Profissional:</Text>
          <PickerContainer>
            <Picker
              selectedValue={selectedBarber}
              onValueChange={setSelectedBarber}
            >
              <Picker.Item label="Selecione" value="" />
              {barbers.map((b) => (
                <Picker.Item key={b.id} label={b.name} value={b.id} />
              ))}
            </Picker>
          </PickerContainer>

          <Text>Serviço:</Text>
          <PickerContainer>
            <Picker
              selectedValue={selectedService}
              onValueChange={setSelectedService}
            >
              <Picker.Item label="Selecione" value="" />
              {services.map((s) => (
                <Picker.Item key={s.id} label={s.name} value={s.id} />
              ))}
            </Picker>
          </PickerContainer>

          <Text>Preço:</Text>
          <Input value={price} onChangeText={setPrice} keyboardType="numeric" />

          <Text>Duração (min):</Text>
          <Input value={duration} onChangeText={setDuration} keyboardType="numeric" />

          
        </ModalContent>
      </ModalBackground>
    </Modal>
  );
}
