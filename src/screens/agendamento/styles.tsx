import React from 'react';
import styled from 'styled-components/native';

import { LinearGradient } from 'expo-linear-gradient';

export const Container = styled(LinearGradient).attrs({
  colors: ['#b4918f', '#956f6d'], 
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
})`
  flex: 1;
 padding:25px;
 
`;

export const Label = styled.Text`
  font-weight: bold;
  font-size: 16px;
  color: #444;
`;

export const PickerInput = styled.View`
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-top: 4px;
`;

export const HourScroll = styled.ScrollView`
  margin-top: 8px;
  margin-bottom: 16px;
`;

export const HourButton = styled.TouchableOpacity<{ selected?: boolean }>`
  height: 48px;
  padding: 0 12px;
  padding: 12px;
  border-width: 1px;
  border-color: ${(props: { selected: any; }) => (props.selected ? '#C68D95' : '#ccc')};
  background-color: ${(props: { selected: any; }) => (props.selected ? '#C68D95' : 'transparent')};
  border-radius: 8px;
  margin-right: 10px;
`;



export const HourText = styled.Text<{ selected?: boolean }>`
  color: ${(props: { selected: any; }) => (props.selected ? '#fff' : '#000')};
  font-weight: bold;
`;

export const ConfirmButton = styled.TouchableOpacity`
  background-color: #C68D95;
  padding: 14px;
  border-radius: 8px;
  align-items: center;
  margin-bottom: 45px;
`;

export const ConfirmButtonText = styled.Text`
  color: #fff;
  font-weight: bold;
`;

export const ModalBackground = styled.View`
  flex: 1;
  justify-content: center;
  background-color: rgba(0,0,0,0.5);
  padding: 20px;
`;

export const ModalContent = styled.View`
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
`;

export const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
`;

export const ModalButtons = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

export const CancelButton = styled.TouchableOpacity`
  background-color: #ccc;
  padding: 12px;
  border-radius: 8px;
  flex: 1;
  margin-right: 8px;
`;

export const CancelButtonText = styled.Text`
  text-align: center;
`;

export const OkButton = styled.TouchableOpacity`
  background-color: #C68D95;
  padding: 12px;
  border-radius: 8px;
  flex: 1;
`;

export const OkButtonText = styled.Text`
  text-align: center;
  color: #fff;
`;

export const BackButton = styled.TouchableOpacity`
    position: absolute;
    left: 0;
    top: 0;
    z-index: 9;
    margin-top: 70px;
    margin-left: 20px;
`;

export const Logo = styled.Image`
    width: 100%;
    height:110px;
    
`;


export const SearchInput = styled.TextInput`
  background-color: #fff;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 5px;
  font-size: 16px;
`;

export const SuggestionList = styled.ScrollView`
  max-height: 150px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
`;

export const SuggestionItem = styled.TouchableOpacity`
  padding: 10px;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

export const SuggestionText = styled.Text`
  font-size: 16px;
  color: #333;
`;
