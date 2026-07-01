import React, { useState, useEffect, useCallback } from 'react';
import { RefreshControl, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CancelModal from '@/components/CancelModal';
import Toast from 'react-native-toast-message';

import Api from '../../../Api';

import {
  Container,
  Scroller,
  HeaderContainer,
  HeaderNumber,
  HeaderLabel,
  HeaderBoxSmall,
  HeaderBoxLarge,
  Logo,
  LoadingIcon,
  ListArea,
  SectionTitle
} from './styles';

import ReservationItem from '@/components/ReservationItem';

type SummaryItem = {
  date: string;
  total_clients: number;
  total_revenue: number;
};

type Appointment = {
  id: number;
  barber_id: number;
  client_name: string;
  service_name: string;
  datetime: string;
  barber_name: string;
  barber_avatar: string;
  price: number;
  client_id: number;
  status: string;
  duration: number;
};

const Home = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  const [listBox, setListBox] = useState<SummaryItem[]>([]);

  const handleCancelPress = (id: number) => {
    setAppointmentToCancel(id);
    setModalVisible(true);
  };

  const confirmCancel = async () => {
    if (appointmentToCancel !== null) {
      try {
        const res = await Api.cancelAppointment(appointmentToCancel);
        
        if (res.success) {
          Toast.show({
            type: 'success',
            text1: 'Cancelado com sucesso!',
          });

          setModalVisible(false);
          setAppointmentToCancel(null);
          
          // Recarregar as listas após cancelamento
          await getAppointmentsInfo();
          await getAppointmentsSummary();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: res.error || 'Tente novamente.',
          });
        }
      } catch (error) {
        console.error('Erro ao cancelar:', error);
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível cancelar o agendamento',
        });
      }
    }
  };

  const getAppointmentsInfo = async () => {
    setLoading(true);
    try {
      const response = await Api.getAppointments();
      
      if (response.error) {
        Alert.alert('Erro', response.error);
        setList([]);
      } else if (response.appointments && Array.isArray(response.appointments)) {
        setList(response.appointments);
      } else {
        setList([]);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os agendamentos');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentsSummary = async () => {
    try {
      const response = await Api.getSumaryToday();
      
      // Ajuste: a função pode retornar um array diretamente ou um objeto com summary
      if (Array.isArray(response)) {
        setListBox(response);
      } else if (response && Array.isArray(response.summary)) {
        setListBox(response.summary);
      } else if (response && response.length === 0) {
        setListBox([]);
      } else {
        // Se for um único objeto, converte para array
        if (response && response.total_clients !== undefined) {
          setListBox([response]);
        } else {
          setListBox([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
      setListBox([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getAppointmentsInfo();
      getAppointmentsSummary();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      getAppointmentsInfo(),
      getAppointmentsSummary()
    ]);
    setRefreshing(false);
  };

const formatDateTime = (datetime: string) => {
  if (!datetime) return '--/--/---- --:--';
  const date = new Date(datetime);
  const data = date.toLocaleDateString('pt-BR');
  const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${data} ${hora}`;
};
// Exemplo: "25/12/2024 14:30"

  const formatCurrency = (value: number) => {
    return value.toFixed(2).replace('.', ',');
  };

  return (
    <Container>
      <CancelModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onConfirm={confirmCancel}
      />

      <Logo source={require('../../../assets/images/Logo-branco.png')} resizeMode="contain" />

      {/* Header com resumo */}
      {listBox.map((item, index) => (
        <HeaderContainer key={index}>
          <HeaderBoxSmall>
            <HeaderNumber>{item.total_clients}</HeaderNumber>
            <HeaderLabel>Clientes Hoje</HeaderLabel>
          </HeaderBoxSmall>

          <HeaderBoxLarge>
            <HeaderNumber>R$ {formatCurrency(item.total_revenue)}</HeaderNumber>
            <HeaderLabel>Previsão Hoje</HeaderLabel>
          </HeaderBoxLarge>
        </HeaderContainer>
      ))}

      <SectionTitle>Próximos Agendamentos</SectionTitle>

      <Scroller 
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
          />
        }
      >
        {loading && <LoadingIcon size="large" color="#FFFFFF" />}

        <ListArea>
          {list
            .filter(item => new Date(item.datetime) >= new Date())
            .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
            .map((item, index) => (
              <ReservationItem
                key={item.id || index}
                service={item.service_name || `Serviço #${item.service_id}`}
                barberName={item.barber_name}
                clientName={item.client_name}
                time={formatDateTime(item.datetime)}
                price={formatCurrency(item.price)}
                onCancel={() => handleCancelPress(item.id)}
              />
            ))}
        </ListArea>

        {!loading && list.filter(item => new Date(item.datetime) >= new Date()).length === 0 && (
          <SectionTitle style={{ textAlign: 'center', marginTop: 20 }}>
            Nenhum agendamento futuro encontrado
          </SectionTitle>
        )}
      </Scroller>
    </Container>
  );
};

export default Home;