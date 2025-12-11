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



export const Logo = styled.Image`
    width: 100%;
    height:110px;
   margin-top: 73px;
`;


        
export const BackButton = styled.TouchableOpacity`
    position: absolute;
    left: 0;
    top: 0;
    z-index: 9;
    margin-top: 70px;
    margin-left: 20px;
`;

export const FormArea = styled.View`
  flex: 1;
  width: 100%;
  padding: 20px;
`;


export const InfoAndButtonRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const InfoColumn = styled.View`
  flex-direction: column;
`;

export const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 5px;
`;

export const Label = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-left: 5px;
  max-width: 200px;
  margin-top:10px;
  margin-bottom:12px;
`;

export const AgendarButton = styled.TouchableOpacity`
  border: 2px solid #b4918f;
  padding: 8px 12px;
  border-radius: 10px;
  background-color: transparent;
  margin-bottom: 16px;
  margin-top: 16px;
  justify-content: center;
  align-items: center;
  
`;

export const AgendarButtonText = styled.Text`

  font-size: 16px;
  color: #fff;
  
`;

export const PickerInput = styled.View`
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-top: 4px;
`;

export const TextplaceholderInput = styled.TextInput`
  background-color: #fff;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 5px;
  font-size: 16px;
`;


