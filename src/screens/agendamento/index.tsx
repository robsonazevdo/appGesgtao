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
  CalendarScreen: { client?: any; services?: any };
};

type CalendarScreenRouteProp = RouteProp<RootStackParamList, 'CalendarScreen'>;

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

const getToday = () => format(new Date(), 'yyyy-MM-dd');

const formatDateForDisplay = (dateStr: string) => {
  const date = new Date(dateStr + 'T12:00:00');
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

const mockHours = ['09:00', '10:00', '11:30', '14:00', '15:30'];

export default function CalendarScreen() {
  const navigation = useNavigation();
  const route = useRoute<CalendarScreenRouteProp>();
  const client = route.params?.client;

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

  const handleFinalize = () => {
    if (!selectedHour) {
      Alert.alert('Selecione um horário');
      return;
    }
    setModalVisible(true);
  };

  const loadClients = async () => {
    try {
      const json = await Api.getClients();
      if (json && Array.isArray(json.client)) {
        setClients(json.client);
        if (json.client.length > 0) {
          setSelectedClient(json.client[0].id);
        }
      } else {
        Alert.alert('Erro', json?.error || 'Erro ao carregar clientes');
      }
    } catch {
      Alert.alert('Erro', 'Erro ao buscar clientes');
    }
  };

  const loadServices = async () => {
    try {
      const json = await Api.getServices();
      if (json && Array.isArray(json.service)) {
        setServices(json.service);
        if (!selectedService && json.service.length > 0) {
          setSelectedService(json.service[0].id);
        }
      } else {
        Alert.alert('Erro', json?.error || 'Erro ao carregar serviços');
      }
    } catch {
      Alert.alert('Erro', 'Erro ao buscar serviços');
    }
  };

  const getClientInfo = async () => {
    setLoading(true);
    await Promise.all([loadClients(), loadServices()]);
    setLoading(false);
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
        service: Number(selectedService),
        datetime,
        service_id: Number(selectedService),
      });

      if (result.success) {
        Alert.alert('✅ Agendamento confirmado!');
        navigation.goBack();
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível agendar.');
      }
    } catch {
      Alert.alert('Erro', 'Erro ao se comunicar com o servidor.');
    }
  };

  const handleBackButton = () => navigation.goBack();

  // Inicializa com cliente vindo via params
  useEffect(() => {
    if (client?.name) {
      setClientQuery(client.name);
    } else {
      setClientQuery('');
    }
  }, [client]);

  // Carrega clientes e serviços na primeira vez
  useEffect(() => {
    getClientInfo();
  }, []);

  // Filtros
  useEffect(() => {
    const filtered = clients.filter(c =>
      c.name.toLowerCase().includes(clientQuery.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [clientQuery, clients]);

  useEffect(() => {
    const filtered = services.filter(s =>
      s.name.toLowerCase().includes(serviceQuery.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [serviceQuery, services]);

  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
      setFilteredClients([]);
      setFilteredServices([]);
    }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Container>
          <BackButton onPress={handleBackButton}>
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
              {filteredClients.map(client => (
                <SuggestionItem
                  key={client.id}
                  onPress={() => {
                    setSelectedClient(client.id);
                    setClientQuery(client.name);
                    setFilteredClients([]);
                    Keyboard.dismiss();
                  }}
                >
                  <SuggestionText>{client.name}</SuggestionText>
                </SuggestionItem>
              ))}
            </SuggestionList>
          )}

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
              {filteredServices.map(service => (
                <SuggestionItem
                  key={service.id}
                  onPress={() => {
                    setSelectedService(service.id);
                    setServiceQuery(service.name);
                    setFilteredServices([]);
                    Keyboard.dismiss();
                  }}
                >
                  <SuggestionText>{service.name}</SuggestionText>
                </SuggestionItem>
              ))}
            </SuggestionList>
          )}

          <Label>Horários disponíveis</Label>
          <HourScroll horizontal showsHorizontalScrollIndicator={false}>
            {mockHours.map(hour => (
              <HourButton
                key={hour}
                selected={selectedHour === hour}
                onPress={() => setSelectedHour(hour)}
              >
                <HourText selected={selectedHour === hour}>{hour}</HourText>
              </HourButton>
            ))}
          </HourScroll>

          <ConfirmButton onPress={handleFinalize}>
            <ConfirmButtonText>Finalizar Agendamento</ConfirmButtonText>
          </ConfirmButton>

          <Modal
            transparent
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <ModalBackground>
              <ModalContent>
                <ModalTitle>Confirmar Agendamento?</ModalTitle>
                <Text>Cliente: {clients.find(c => c.id === selectedClient)?.name || 'Não encontrado'}</Text>
                <Text>Serviço: {services.find(s => s.id === selectedService)?.name || 'Não encontrado'}</Text>
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
