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
  total_clients: number;
  total_revenue: string; // ou number, dependendo da sua API
};



const Home = () => {

  
  const [loading, setLoading] = useState<boolean>(false); 
  const [list, setList] = useState<any[]>([]); 
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
    const res = await Api.cancelAppointment(appointmentToCancel);
    if (res.success) {
      Toast.show({
        type: 'success',
        text1: 'Cancelado com sucesso!',
      });

      setModalVisible(false);
      setAppointmentToCancel(null);
      await getAppointmentsInfo(); 
    } else {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: res.error || 'Tente novamente.',
      });
    }
  }
};








const getAppointmentsInfo = async () => {
  setLoading(true);
  const json = await Api.getAppointments(); 
  if (json && Array.isArray(json.appointments)) {
    if (json.appointments.length === 0) {
      setList([]);
    } else {
      setList(json.appointments);
    }
  } else {
    setList([]);
    Alert.alert('Erro', json?.error || 'Erro ao carregar agendamentos');
  }

  setLoading(false);
};

const getAppointmentsSumary = async () => {
  setLoading(true);
  const json = await  Api.getSumaryToday(); 
 
  if (json && Array.isArray(json.summary)) {
    if (json.summary.length === 0) {
      setListBox([]);
    } else {
      setListBox(json.summary);
    }
  } else {
    setListBox([]);
    Alert.alert('Erro', json?.error || 'Erro ao carregar agendamentos');
  }

  setLoading(false);
};


useFocusEffect(
  useCallback(() => {
   getAppointmentsInfo();
  getAppointmentsSumary(); 
  }, [])
);
 

const onRefresh = async () => {
  setRefreshing(true);
  await getAppointmentsInfo();
  await getAppointmentsSumary();
  setRefreshing(false);
};




const formatTime = (datetime: string) => {
  const date = new Date(datetime);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};






  return (
    <Container>
      <CancelModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onConfirm={confirmCancel}
      />

      <Logo source={require('../../../assets/images/Logo-branco.png')}  resizeMode="contain" />
        
          {listBox.map((item, index) => ( 
          <HeaderContainer   key = {index}>
            <HeaderBoxSmall>
            <HeaderNumber>{item.total_clients}</HeaderNumber>
            <HeaderLabel>Clientes Hoje</HeaderLabel>
          </HeaderBoxSmall>

          <HeaderBoxLarge>
            <HeaderNumber>R$ {parseFloat(item.total_revenue).toFixed(2)}</HeaderNumber>
            <HeaderLabel>Previsão Hoje</HeaderLabel>
          </HeaderBoxLarge>
            </HeaderContainer>
          ))}
          
           
        

       <SectionTitle >Próximo agendamento</SectionTitle>

      <Scroller refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      

        {loading && <LoadingIcon size="large" color="#FFFFFF" />}

        <ListArea>
        {list
            .filter(item => new Date(item.datetime) >= new Date())
            .map((item, index) => (
              <ReservationItem
                key={index}
                service={item.service_id}
                barberName={item.barber_name}
                clientName={item.client_name}
                time={formatTime(item.datetime)}
                price={item.price}
                onCancel={() => handleCancelPress(item.id)}
              />
          ))}


        </ListArea>
      </Scroller>
    </Container>
  );
};


export default Home;




