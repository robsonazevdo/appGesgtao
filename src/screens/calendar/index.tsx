import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect , useNavigation } from '@react-navigation/native';

import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format } from 'date-fns';
import {ptBR} from 'date-fns/locale/pt-BR';


import ReservationItem from '@/components/ReservationItem';
import { 
  
        Container, 
        ReservasText,
        Scroller,
        AgendaButton,
        AgendaButtonText,
        ButtonArea
      
      } from './styles';
import { LoadingIcon } from '../home/styles';
import { RefreshControl, Alert } from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';


import Api from '@/Api';


type RootStackParamList = {
   Agendamento: undefined;
  Appointments: {
    service: string;
    selectedTime: string;
    barber_id: number;
    Barber: {
      id: number;
      avatar: string;
      name: string;
      stars: number;
      photos?: { url: string }[];
      services: [];
      testimonials: [];
      available: [];
    };
  };
};


// Configurações de idioma
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'],
  dayNames: [
    'Domingo', 'Segunda-feira', 'Terça-feira',
    'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt-br';



const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const formatToDayMonth = (date: string) => {
  const d = new Date(date + 'T12:00:00'); // Força horário seguro
  return format(d, "dd/MM", { locale: ptBR });
};

export default function CalendarScreen() {
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [loading, setLoading] = useState<boolean>(false); 
  const [list, setList] = useState<any[]>([]); 
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const formatTime = (datetime: string) => {
  const date = new Date(datetime);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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


useFocusEffect(
  useCallback(() => {
    getAppointmentsInfo(); 
  }, [])
);


const onRefresh = async () => {
  setRefreshing(true);
  await getAppointmentsInfo();
  setRefreshing(false);
};




const handleCreateAppointment = () => {

  navigation.navigate('Agendamento');
  
  // Aqui você pode chamar a API de criação se desejar
  // await Api.createAppointment({ date: selectedDate, ...data });
  // await getAppointmentsInfo();
};


  

  return (
    <Container>
      <Calendar
        onDayPress={handleDateSelect}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#C68D95' },
        }}
        theme={{
          todayTextColor: '#D5ABB2',
          arrowColor: '#000',
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          calendarBackground: 'transparent',
        }}
      />
        <ButtonArea>
            <ReservasText >
            AGENDA EM {formatToDayMonth(selectedDate)}
          </ReservasText>
          <AgendaButton onPress={handleCreateAppointment}>
            <AgendaButtonText>Novo Agendamento</AgendaButtonText>
          </AgendaButton>


        </ButtonArea>
        

        <Scroller refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      
        {loading && <LoadingIcon size="large" color="#FFFFFF" />}

        {list
          .filter(item => item.datetime.startsWith(selectedDate)) // Compara apenas a parte da data
          .map((item, index) => (
            <ReservationItem
              key={index}
              service={item.service_id}
              barberName={item.barber_name}
              clientName={item.client_name}
              time={formatTime(item.datetime)}
              price={item.price}
              showCancelButton={false}
            />
          ))}

          

        
      </Scroller>

    </Container>
  );
}
