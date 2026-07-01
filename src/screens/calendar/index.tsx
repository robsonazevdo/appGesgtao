import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect , useNavigation } from '@react-navigation/native';
import { Text } from 'react-native';
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
import { RefreshControl, Alert, Modal, View, FlatList, TouchableOpacity } from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';


import Api from '@/Api';
import { ModalBackground, ModalContent, ModalTitle } from '../barberServiceConfig/styles';
import { CancelButton, CancelButtonText, HourButton, HourScroll, HourText, Label, ModalButtons, OkButton, OkButtonText } from '../agendamento/styles';

type Slot = {
  time: string;
  active: boolean;
};

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
  
 
  const [loading, setLoading] = useState<boolean>(false); 
  const [list, setList] = useState<any[]>([]); 
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentToRemacar, setAppointmentToRemacar] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  



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


const handleRemacarPress = (appointmentId: number, clientId: number) => {
  setAppointmentToRemacar(appointmentId);
  setSelectedClientId(clientId.toString());
  setModalVisible(true);
};



const loadSlots = async (date: string) => {
  try {
    const res = await Api.getBarberSchedule(1, date);
    setSlots(res?.hours ?? []);
  } catch {
    setSlots([]);
  }
};



const confirmReschedule = async () => {
  if (!appointmentToRemacar || !selectedTime) return;

  try {
    await Api.rescheduleAppointment(appointmentToRemacar, {
      date: selectedDate,
      time: selectedTime,
    });

    Alert.alert('Sucesso', 'Agendamento remarcado!');
    setModalVisible(false);
    setSelectedTime(null);
    setAppointmentToRemacar(null);
    getAppointmentsInfo();
  } catch {
    Alert.alert('Erro', 'Horário indisponível');
  }
};





  return (
    <Container>

    <Modal transparent animationType="slide" visible={modalVisible}>
      <ModalBackground>
        <ModalContent>

          <ModalTitle>Remarcar Agendamento</ModalTitle>

          {/* CALENDÁRIO */}
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              loadSlots(day.dateString);
              setSelectedTime(null);
            }}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#C68D95' },
            }}
            theme={{
              todayTextColor: '#D5ABB2',
              arrowColor: '#000',
              calendarBackground: 'transparent',
            }}
          />

          {/* HORÁRIOS */}
          <Label>Horários disponíveis</Label>

          <HourScroll horizontal showsHorizontalScrollIndicator={false}>
            {slots.length === 0 ? (
              <HourText>Nenhum horário disponível</HourText>
            ) : (
              slots.map((slot) => {
                const isDisabled = slot.active; // ocupado
                const isSelected = selectedTime === slot.time;

                return (
                  <HourButton
                    key={slot.time}
                    selected={isSelected}
                    disabled={isDisabled}
                    onPress={() => {
                      if (isDisabled) {
                        Alert.alert('Horário indisponível');
                        return;
                      }
                      setSelectedTime(slot.time);
                    }}
                    style={{ opacity: isDisabled ? 0.3 : 1 }}
                  >
                    <HourText selected={isSelected}>
                      {slot.time}
                      {isDisabled ? ' (ocupado)' : ''}
                    </HourText>
                  </HourButton>
                );
              })
            )}
          </HourScroll>


          {/* BOTÕES */}
          <ModalButtons>
            <CancelButton
              onPress={() => {
                setModalVisible(false);
                setSelectedTime(null);
                setAppointmentToRemacar(null);
              }}
            >
              <CancelButtonText>Cancelar</CancelButtonText>
            </CancelButton>

            <OkButton
              disabled={!selectedTime}
              style={{ opacity: selectedTime ? 1 : 0.5 }}
              onPress={confirmReschedule}
            >
              <OkButtonText>Confirmar</OkButtonText>
            </OkButton>
          </ModalButtons>

        </ModalContent>
      </ModalBackground>
    </Modal>




      



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
          .filter(item => item.datetime.startsWith(selectedDate)) 
          .map((item, index) => (
            <ReservationItem
              key={index}
              serviceName={item.service_name}
              service={item.service_id}
              barberName={item.barber_name}
              clientName={item.client_name}
              time={formatTime(item.datetime)}
              price={item.price}
              onRemacar={() => handleRemacarPress(item.id, item.client_id)}
             

            />
          ))}

          

        
      </Scroller>

    </Container>
  );
}
