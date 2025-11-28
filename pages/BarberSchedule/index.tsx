import React, { useEffect, useState } from 'react';
import { Alert, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../../assets/images/back.svg';
import Api from '../../Api';

import {
  Container,
  Header,
  Title,
  BackButton,
  DayCard,
  DayText,
  HourButton,
  HourText,
  SaveButton,
  SaveButtonText,
} from './styles';

export default function BarberScheduleConfig() {
  const navigation = useNavigation();

  const [barberList, setBarberList] = useState<any[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<any | null>(null);
  const [week, setWeek] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ==== GERA SEMANA ====
  const generateWeek = () => {
    const today = new Date();
    const weekArr: any[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);

      weekArr.push({
        date: d.toISOString().split('T')[0],
        hours: generateDailyHours(),
      });
    }
    return weekArr;
  };

  // ==== HORÁRIOS PADRÃO ====
  const generateDailyHours = () => {
    const hours = [];
    for (let h = 8; h <= 18; h++) {
      hours.push({
        time: `${String(h).padStart(2, '0')}:00`,
        active: true,
      });
    }
    return hours;
  };

  // ==== CARREGAR BARBEIROS ====
  useEffect(() => {
    const loadBarbers = async () => {
      const res = await Api.getAllBarbers();
      setBarberList(res.data || []);
    };
    loadBarbers();

    setWeek(generateWeek());
  }, []);

  // ==== TOGGLE HORA ====
  const toggleHour = (dayIndex: number, hourIndex: number) => {
    const newWeek = [...week];
    newWeek[dayIndex].hours[hourIndex].active =
      !newWeek[dayIndex].hours[hourIndex].active;

    setWeek(newWeek);
  };

 const handleSave = async () => {
  if (!selectedBarber) {
    Alert.alert("Selecione um barbeiro!");
    return;
  }

  try {
    const res = await Api.saveSchedule({
      barber_id: selectedBarber.id,
      week: week
    });

    if (res.success) {
      Alert.alert("Sucesso", "Horários salvos!");
    } else {
      Alert.alert("Erro", res.error || "Falha ao salvar.");
    }

  } catch (err) {
    Alert.alert("Erro", "Não foi possível salvar.");
  }
};


  return (
    <Container>
      {/* ----- HEADER ----- */}
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <BackIcon width={40} height={40} fill="#fff" />
        </BackButton>
        <Title>Configurar Horários</Title>
      </Header>

      {/* ----- LISTA DE BARBEIROS ----- */}
      <FlatList
        data={barberList}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        style={{ marginVertical: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedBarber(item)}
            style={{
              padding: 12,
              backgroundColor: selectedBarber?.id === item.id ? '#b4918f' : '#eee',
              marginRight: 10,
              borderRadius: 12,
            }}
          >
            <DayText style={{ color: selectedBarber?.id === item.id ? '#fff' : '#333' }}>
              {item.name}
            </DayText>
          </TouchableOpacity>
        )}
      />

      {/* ----- SEMANA ----- */}
      <FlatList
        data={week}
        keyExtractor={(item) => item.date}
        renderItem={({ item, index }) => (
          <DayCard>
            <DayText>{item.date}</DayText>

            <FlatList
              data={item.hours}
              keyExtractor={(h) => h.time}
              horizontal
              renderItem={({ item: h, hourIndex }) => (
                <HourButton
                  active={h.active}
                  onPress={() => toggleHour(index, hourIndex)}
                >
                  <HourText active={h.active}>{h.time}</HourText>
                </HourButton>
              )}
            />
          </DayCard>
        )}
      />

      {/* ----- BOTÃO SALVAR ----- */}
      <SaveButton onPress={handleSave}>
        <SaveButtonText>Salvar Configuração</SaveButtonText>
      </SaveButton>
    </Container>
  );
}
