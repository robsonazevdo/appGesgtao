// components/ClientOptionCard.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

const Card = styled(TouchableOpacity)`
  flex-direction:row;
   background-color: #f4f4f4;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 40px;
  height:68px;
  
`;

const CardText = styled.Text`
 font-size: 18px;
  color: #b4918f;
  
`;

interface ClientOptionCardProps {
  label: string;
  Icon: React.FC<any>;
  onPress: () => void;
}

const ClientOptionCard: React.FC<ClientOptionCardProps> = ({ label, Icon, onPress }) => {
  return (
    <Card onPress={onPress}>
      <Icon width={32} height={32} fill="#b4918f" style={{ marginRight: '55' }}  />
      <CardText>{label}</CardText>
    </Card>
  );
};

export default ClientOptionCard;
