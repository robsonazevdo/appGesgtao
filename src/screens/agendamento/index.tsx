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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

// =================== HELPERS ===================
const getToday = () => format(new Date(), 'yyyy-MM-dd');

const formatDateForDisplay = (dateStr: string) => {
  const date = new Date(dateStr + 'T12:00:00');
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

// =================== COMPONENT ===================
export default function CalendarScreen() {
  const navigation = useNavigation();
  const route = useRoute<CalendarScreenRouteProp>();
  const clientParam = route.params?.client;

  // =================== STATES ===================
  const [clientQuery, setClientQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<any[]>([]);

  const [serviceQuery, setServiceQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | number>('');
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
      if (Array.isArray(json.client)) {
        setClients(json.client);
        if (json.client.length > 0) setSelectedClient(json.client[0].id);
      }
    } catch {
      Alert.alert('Erro', 'Erro ao carregar clientes');
    }
  };

  const loadServices = async () => {
    try {
      const json = await Api.getServices();
      if (Array.isArray(json.service)) {
        setServices(json.service);
        if (!selectedService && json.service.length > 0) {
          setSelectedService(json.service[0].id);
        }
      }
    } catch {
      Alert.alert('Erro', 'Erro ao carregar serviços');
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([loadClients(), loadServices()]);
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

  // =================== FINALIZE ===================
  const handleFinalize = () => {
    if (!selectedHour) {
      Alert.alert('Selecione um horário');
      return;
    }
    setModalVisible(true);
  };

  const confirmAppointment = async () => {
    setModalVisible(false);

    if (!selectedClient || !selectedHour || !selectedService || !selectedDate) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    const datetime = `${selectedDate} ${selectedHour}:00`;

    try {
      const result = await Api.createAppointment({
        client_id: Number(selectedClient),
        barber_id: 1,
        service_id: Number(selectedService),
        datetime,
        service: 0
      });

      if (result.success) {
        Alert.alert('Agendamento confirmado!');
        navigation.goBack();
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível agendar.');
      }
    } catch {
      Alert.alert('Erro', 'Falha ao comunicar com servidor.');
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
