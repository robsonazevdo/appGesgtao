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

export const ScrollContainer = styled.ScrollView`
  flex: 1;
  
`;

export const StyledFlatList = styled.FlatList`
  flex: 1;
  
`;

export const ContentContainer = styled.View`
  padding-bottom: 30px;
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
    margin-top:100px;
    margin-bottom: auto;
    
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

export const IconText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-left: 5px;
  max-width: 200px;
`;

export const AgendarButton = styled.TouchableOpacity`
  border: 1px solid #b4918f;
  padding: 8px 12px;
  border-radius: 10px;
  background-color: transparent;
`;

export const AgendarButtonText = styled.Text`
  color: #b4918f;
  font-size: 13px;
`;
