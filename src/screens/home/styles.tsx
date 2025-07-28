import React from 'react';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';

export const Container = styled(LinearGradient).attrs({
  colors: ['#b4918f', '#956f6d'], // de cima para baixo
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
})`
  flex: 1;
 
`;


export const Scroller = styled.ScrollView`
    flex: 1;
    padding: 20px;
`;

export const HeaderContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 20px;
`;


export const HeaderNumber = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #fff;
`;

export const HeaderLabel = styled.Text`
  font-size: 14px;
  color: #fff;
  margin-top: 5px;
`;
export const HeaderBoxSmall = styled.View`
  flex: 1; /* menor proporção */
  border: 2px solid #B76E79;
  margin: 0 5px;
  padding: 20px;
  border-radius: 15px;
  align-items: center;
  justify-content: center;
`;

export const HeaderBoxLarge = styled.View`
  flex: 2; /* maior proporção */
  border: 2px solid #B76E79;
  margin: 0 5px;
  padding: 20px;
  border-radius: 15px;
  align-items: center;
  justify-content: center;
`;



export const LoadingIcon = styled.ActivityIndicator`
    margin-top: 50px;
`;
export const ListArea = styled.View`
    margin-top: 30px;
    margin-bottom: 30px;
`;

export const Logo = styled.Image`
    width: 100%;
    height:110px;
`;

export const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 20px 15px 10px;
`;