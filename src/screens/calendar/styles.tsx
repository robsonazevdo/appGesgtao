import React from 'react';
import styled from 'styled-components/native';

import { LinearGradient } from 'expo-linear-gradient';

export const Container = styled(LinearGradient).attrs({
  colors: ['#b4918f', '#956f6d'], 
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
})`
  flex: 1;
 padding:20px;
`;

export const ReservasText = styled.Text`
   font-weight: bold;
  font-size: 13px;
  color: #555;
  margin-top: 12px;
  margin-bottom: 12px;
  padding-left: 10px;
  padding-right: 10px;
`;

export const Scroller = styled.ScrollView`
    flex: 1;
    padding: 20px;
`;

export const ListArea = styled.View`
    margin-top: 30px;
    margin-bottom: 30px;
`;

export const AgendaButton = styled.TouchableOpacity`
  border: 1px solid #b4918f;
  padding: 8px 12px;
  border-radius: 10px;
  background-color: transparent;
`;

export const AgendaButtonText = styled.Text`
  color: #fff;
  font-size: 13px;
`;

export const ButtonArea = styled.View`
   flex-direction: row;
`;

