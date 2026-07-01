import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';

import {
  BackButton,
  CancelButton,
  CancelButtonText,
  ConfirmButton,
  ConfirmButtonText,
  Container,
  HourButton,
  HourScroll,
  HourText,
  Label,
  Logo,
  ModalBackground,
  ModalButtons,
  ModalContent,
  ModalTitle,
  OkButton,
  OkButtonText,
  PickerInput,
  SearchInput,
  SuggestionItem,
  SuggestionList,
  SuggestionText,
} from './styles';

import Api from '@/Api';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import BackIcon from '../../../assets/images/back.svg';
import { LoadingIcon } from '../home/styles';

type RootStackParamList = {
  CalendarScreen: { client?: any };
};

type CalendarScreenRouteProp = RouteProp<RootStackParamList, 'CalendarScreen'>;

// =================== LOCALE CALENDAR ===================
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt-br';

const monthNamesPt = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// =================== HELPERS ===================
const getToday = () => new Date().toISOString().split('T')[0];

const formatDateForDisplay = (dateStr: string) => {
  const date = new Date(dateStr + 'T12:00:00');
  const day = String(date.getDate()).padStart(2, '0');
  const month = monthNamesPt[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
};

// =================== COMPONENT ===================
export default function CalendarScreen() {
  const navigation = useNavigation();
  const route = useRoute<CalendarScreenRouteProp>();
  const clientParam = route.params?.client;

  // =================== STATES ===================
  const [clientQuery, setClientQuery] = useState('');
  const [colabQuery, setColabQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<any[]>([]);

  const [serviceQuery, setServiceQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [clients, setClients] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  
  const [services, setServices] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | number>('');

  const [selectedBarber, setSelectedBarber] = useState<string | number>('');
  const [filteredBarbers, setFilteredBarbers] = useState<any[]>([]);

  const [selectedService, setSelectedService] = useState<string | number>('');
  const [selectedHour, setSelectedHour] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [availabilityHours, setAvailabilityHours] = useState<any[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);

  // =================== LOAD HOURS ===================
  useEffect(() => {
    const fetchHours = async () => {
      setLoadingHours(true);
      try {
        const res = await Api.getBarberSchedule(1, selectedDate);
        
        setAvailabilityHours(res?.hours ?? []);
      } catch {
        setAvailabilityHours([]);
        Alert.alert('Erro', 'Não foi possível carregar horários');
      } finally {
        setLoadingHours(false);
      }
    };

    fetchHours();
  }, [selectedDate]);

  // =================== LOAD CLIENTS & SERVICES ===================
  const loadClients = async () => {
    try {
      const json = await Api.getClients();
  
      if (Array.isArray(json)) {
        setClients(json);
        if (json[0].length > 0) setSelectedClient(json[0].id);
      }
    } catch {
      Alert.alert('Erro', 'Erro ao carregar clientes');
    }
  };

  const loadServices = async () => {
    try {
      const json = await Api.getServices();
      if (Array.isArray(json.data)) {
        setServices(json.data);
        if (!selectedService && json.data.length > 0) {
          setSelectedService(json.data[0].id);
        }
      }
    } catch {
      Alert.alert('Erro', 'Erro ao carregar serviços');
    }
  };

    const loadBarbers = async () => {
    try {
      const json = await Api.getAllBarbers();
  
      if (Array.isArray(json)) {
        setBarbers(json);
        if (json[0].length > 0) setSelectedBarber(json[0].id);
      }
    } catch {
      Alert.alert('Erro', 'Erro ao carregar barbeiros');
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([loadClients(), loadServices(), loadBarbers()]);
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

  // Preenche cliente vindo via params
  useEffect(() => {
    if (clientParam?.name) {
      setClientQuery(clientParam.name);
    }
  }, [clientParam]);

  // =================== FILTERS ===================
  useEffect(() => {
    setFilteredClients(
      clients.filter(c =>
        c.name.toLowerCase().includes(clientQuery.toLowerCase())
      )
    );
  }, [clientQuery, clients]);

  useEffect(() => {
    setFilteredServices(
      services.filter(s =>
        s.name.toLowerCase().includes(serviceQuery.toLowerCase())
      )
    );
  }, [serviceQuery, services]);


  useEffect(() => {
    setFilteredBarbers(
      barbers.filter(s =>
        s.name.toLowerCase().includes(colabQuery.toLowerCase())
      )
    );
  }, [colabQuery, barbers]);

  // =================== FINALIZE ===================
  const handleFinalize = () => {
    if (!selectedHour) {
      Alert.alert('Selecione um horário');
      return;
    }
    setModalVisible(true);
  };

 const confirmAppointment = async () => {
  // Validações
  if (!selectedClient) {
    Alert.alert('Erro', 'Selecione um cliente');
    return;
  }
  if (!selectedBarber) {
    Alert.alert('Erro', 'Selecione um barbeiro');
    return;
  }
  if (!selectedService) {
    Alert.alert('Erro', 'Selecione um serviço');
    return;
  }
  if (!selectedDate) {
    Alert.alert('Erro', 'Selecione uma data');
    return;
  }
  if (!selectedHour) {
    Alert.alert('Erro', 'Selecione um horário');
    return;
  }

  setModalVisible(false);
  setLoading(true);

  try {
    // Construir a data e hora completa
    const datetime = `${selectedDate} ${selectedHour}:00`;
    
    // Obter o email do usuário logado
    const userEmail = await AsyncStorage.getItem('userEmail');
    if (!userEmail) {
      Alert.alert('Erro', 'Usuário não está logado');
      return;
    }
    
    // Buscar a duração do serviço (opcional, a API pode buscar automaticamente)
    const serviceInfo = await Api.getBarberServiceById(selectedBarber.id, selectedService.id);
    const duration = serviceInfo?.data?.duration || 30;
    
    const appointmentData = {
      client_id: Number(selectedClient.id || selectedClient),
      barber_id: Number(selectedBarber.id || selectedBarber),
      service_id: Number(selectedService.id || selectedService),
      datetime: datetime,
      user_email: userEmail,
      duration: duration
    };
    
    console.log('Enviando agendamento:', appointmentData);
    
    const result = await Api.createAppointment(appointmentData);
    
    if (result.success) {
      Alert.alert('Sucesso', 'Agendamento confirmado com sucesso!');
      // Limpar formulário
      setSelectedClient(null);
      setSelectedBarber(null);
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedHour(null);
      // Navegar de volta
      navigation.goBack();
    } else {
      Alert.alert('Erro', result.error || 'Não foi possível realizar o agendamento.');
    }
  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error);
    Alert.alert('Erro', 'Falha ao comunicar com o servidor.');
  } finally {
    setLoading(false);
  }
};

  // =================== RENDER ===================
  const closeSuggestions = () => {
    Keyboard.dismiss();
    setFilteredClients([]);
    setFilteredServices([]);
  };

  

  return (
    <TouchableWithoutFeedback onPress={closeSuggestions}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Container>
          <BackButton onPress={() => navigation.goBack()}>
            <BackIcon width="45px" height="45px" fill="#333" />
          </BackButton>

          <Logo source={require('../../../assets/images/Logo-branco.png')} resizeMode="contain" />

          <Calendar
            onDayPress={day => setSelectedDate(day.dateString)}
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

          {loading && <LoadingIcon size="large" color="#FFFFFF" />}

                    
          <Label>Colaborador</Label>
          <PickerInput>
            <SearchInput
              placeholder="Digite o nome do colaborador"
              value={colabQuery}
              onChangeText={setColabQuery}
            />
          </PickerInput>

          {filteredBarbers.length > 0 && colabQuery.length > 0 && (
            <SuggestionList>
              {filteredBarbers.map(c => (
                <SuggestionItem
                  key={c.id}
                  onPress={() => {
                    setSelectedBarber(c.id);
                    setColabQuery(c.name);
                    setFilteredBarbers([]);
                    Keyboard.dismiss();
                  }}
                >
                  <SuggestionText>{c.name}</SuggestionText>
                </SuggestionItem>
              ))}
            </SuggestionList>
          )}

          {/* CLIENTE */}
          <Label>Cliente</Label>
          <PickerInput>
            <SearchInput
              placeholder="Digite o nome do cliente"
              value={clientQuery}
              onChangeText={setClientQuery}
            />
          </PickerInput>

          {filteredClients.length > 0 && clientQuery.length > 0 && (
            <SuggestionList>
              {filteredClients.map(c => (
                <SuggestionItem
                  key={c.id}
                  onPress={() => {
                    setSelectedClient(c.id);
                    setClientQuery(c.name);
                    setFilteredClients([]);
                    Keyboard.dismiss();
                  }}
                >
                  <SuggestionText>{c.name}</SuggestionText>
                </SuggestionItem>
              ))}
            </SuggestionList>
          )}

          {/* SERVIÇO */}
          <Label>Serviço</Label>
          <PickerInput>
            <SearchInput
              placeholder="Digite o serviço"
              value={serviceQuery}
              onChangeText={setServiceQuery}
            />
          </PickerInput>

          {filteredServices.length > 0 && serviceQuery.length > 0 && (
            <SuggestionList>
              {filteredServices.map(s => (
                <SuggestionItem
                  key={s.id}
                  onPress={() => {
                    setSelectedService(s.id);
                    setServiceQuery(s.name);
                    setFilteredServices([]);
                    Keyboard.dismiss();
                  }}
                >
                  <SuggestionText>{s.name}</SuggestionText>
                </SuggestionItem>
              ))}
            </SuggestionList>
          )}

          {/* HORÁRIOS */}
          <Label>Horários disponíveis</Label>

          <HourScroll horizontal showsHorizontalScrollIndicator={false}>
            {availabilityHours.length === 0 && !loadingHours ? (
              <HourText>Nenhum horário disponível</HourText>
            ) : (
              availabilityHours.map(h => {
                const active = h.active?.toString().trim().toLowerCase() === "true";
                const booked = h.booked?.toString().trim().toLowerCase() === "true";

                const isDisabled = active || booked;
                const isSelected = selectedHour === h.time;

                return (
                  <HourButton
                    key={h.time}
                    selected={isSelected}
                    disabled={isDisabled}
                    onPress={() => {
                      if (isDisabled) {
                        Alert.alert('Horário indisponível');
                        return;
                      }
                      setSelectedHour(h.time);
                    }}
                    style={{ opacity: isDisabled ? 0.3 : 1 }}
                  >
                    <HourText selected={isSelected}>
                      {h.time}
                      {active ? " (ocupado)" : ""}
                      {booked ? " (ocupado)" : ""}
                    </HourText>
                  </HourButton>
                );
              })
            )}
          </HourScroll>





          {loadingHours && <LoadingIcon size="small" color="#FFF" />}

          {/* FINALIZAR */}
          <ConfirmButton onPress={handleFinalize}>
            <ConfirmButtonText>Finalizar Agendamento</ConfirmButtonText>
          </ConfirmButton>

          {/* MODAL */}
          <Modal transparent animationType="slide" visible={modalVisible}>
            <ModalBackground>
              <ModalContent>
                <ModalTitle>Confirmar Agendamento?</ModalTitle>

                <Text>Cliente: {clients.find(c => c.id === selectedClient)?.name}</Text>
                <Text>Serviço: {services.find(s => s.id === selectedService)?.name}</Text>
                <Text>Data: {formatDateForDisplay(selectedDate)}</Text>
                <Text>Horário: {selectedHour}</Text>

                <ModalButtons>
                  <CancelButton onPress={() => setModalVisible(false)}>
                    <CancelButtonText>Cancelar</CancelButtonText>
                  </CancelButton>

                  <OkButton onPress={confirmAppointment}>
                    <OkButtonText>Confirmar</OkButtonText>
                  </OkButton>
                </ModalButtons>
              </ModalContent>
            </ModalBackground>
          </Modal>
        </Container>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
