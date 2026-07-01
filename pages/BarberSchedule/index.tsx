import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, TouchableOpacity } from 'react-native';
import Api from '../../Api';
import BackIcon from '../../assets/images/back.svg';
import SaveIcon from '../../assets/images/check.svg';

import { HeaderButton } from '@/src/screens/barberServiceConfig/styles';
import { Logo } from '../package/styles';
import {
  BackButton,
  Container,
  DayCard,
  DayText,
  Header,
  HourButton,
  HourText,
  Title
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
    const startHour = 8;
    const endHour = 20;

    for (let h = startHour; h < endHour; h++) {
      hours.push({
        time: `${String(h).padStart(2, '0')}:00`,
        active: true,
      });
      hours.push({
        time: `${String(h).padStart(2, '0')}:30`,
        active: true,
      });
    }

    return hours;
  };

  // ==== CARREGAR BARBEIROS ====
  useEffect(() => {
    const loadBarbers = async () => {
      const res = await Api.getAllBarbers();
      setBarberList(res || []);
    };
    loadBarbers();

    setWeek(generateWeek());
  }, []);

  // ==== TOGGLE HORA (CORRIGIDO) ====
  const toggleHour = (dayIndex: number, hourIndex: number) => {
    setWeek(prevWeek => {
      const newWeek = [...prevWeek];
      
      // Verificações de segurança
      if (!newWeek[dayIndex] || !newWeek[dayIndex].hours[hourIndex]) {
        return prevWeek;
      }
      
      newWeek[dayIndex].hours[hourIndex].active =
        !newWeek[dayIndex].hours[hourIndex].active;
      
      return newWeek;
    });
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

  // Função para renderizar os horários de forma segura
  const renderHours = ({
    item: hourItem,
    index: hourIndex,
    dayIndex,
  }: {
    item: { time: string; active: boolean };
    index: number;
    dayIndex: number;
  }) => {
    // Verificação de segurança
    if (!hourItem) return null;
    
    return (
      <HourButton
        active={hourItem.active}
        onPress={() => toggleHour(dayIndex, hourIndex)}
      >
        <HourText active={hourItem.active}>{hourItem.time}</HourText>
      </HourButton>
    );
  };

  // Renderizar cada dia
  const renderDay = ({ item, index: dayIndex }: { item: { date: string; hours: { time: string; active: boolean }[] } | any; index: number }) => {
    // Verificação de segurança
    if (!item || !item.hours || !Array.isArray(item.hours)) {
      return null;
    }

    return (
      <DayCard>
        <DayText>{item.date}</DayText>

        <FlatList
          data={item.hours}
          keyExtractor={(hour, hourIdx) => `${item.date}-${hour.time}-${hourIdx}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: hourItem, index: hourIndex }) => (
            <HourButton
              active={hourItem?.active ?? false}
              onPress={() => {
                if (hourItem) {
                  toggleHour(dayIndex, hourIndex);
                }
              }}
            >
              <HourText active={hourItem?.active ?? false}>
                {hourItem?.time ?? '--:--'}
              </HourText>
            </HourButton>
          )}
        />
      </DayCard>
    );
  };

  return (
    <Container colors={['#ffffff', '#fafafa']}>

      <Logo source={require('../../assets/images/Logo-branco.png')} resizeMode="contain" />
    
    <Header>
          <BackButton onPress={() => navigation.goBack()}>
          <BackIcon width={40} height={40} fill="#fff" />
        </BackButton>
        <Title>Configurar Horários</Title>
        <HeaderButton onPress={handleSave}><SaveIcon width={24} height={24} fill="#fff" /></HeaderButton>
    </Header>
        
   

      {/* ----- LISTA DE BARBEIROS ----- */}
      <FlatList
        data={barberList}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        horizontal
        style={{ marginVertical: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedBarber(item)}
            style={{
              padding: 5,
              backgroundColor: selectedBarber?.id === item?.id ? '#b4918f' : '#eee',
              
              borderRadius: 12,
            }}
          >
            <DayText style={{ color: selectedBarber?.id === item?.id ? '#fff' : '#561c1c' }}>
              {item?.name || 'Sem nome'}
            </DayText>
          </TouchableOpacity>
        )}
      />

      {/* ----- SEMANA ----- */}
      <FlatList
        data={week}
        keyExtractor={(item, index) => item?.date || `day-${index}`}
        renderItem={renderDay}
        
      />

      {/* ----- BOTÃO SALVAR ----- */}
      {/* <SaveButton onPress={handleSave}>
        <SaveButtonText>Salvar Configuração</SaveButtonText>
      </SaveButton> */}
    </Container>
  );
}