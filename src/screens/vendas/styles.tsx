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

export const Scroller = styled.ScrollView`
    flex: 1;
    padding: 20px;
`;

export const Logo = styled.Image`
    width: 100%;
    height:110px;
    margin-bottom:15px;
`;

export const Card = styled.TouchableOpacity`
flex-direction:row;
   background-color: #f4f4f4;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 25px;
  height:68px;
  
  
`;

export const Title = styled.Text`
   background-color: #f4f4f4;
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 10px;
  
`;

export const CardText = styled.Text`
  font-size: 18px;
  color: #b4918f;
`;

export const BackButton = styled.TouchableOpacity`
    position: absolute;
    left: 0;
    top: 0;
    z-index: 9;
    margin-top: 70px;
    margin-left: 20px;
`;

        
