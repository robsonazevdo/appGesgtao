// components/ComandaOptionCard.tsx
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import styled from 'styled-components/native';

const Card = styled(View)`
  background-color: #f4f4f4;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 40px;
`;

const CardRow = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LeftRow = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const CardText = styled.Text`
  font-size: 16px;
  color: #b4918f;
`;

const Button = styled.TouchableOpacity`
  background-color: #b4918f;
  padding: 6px 14px;
  border-radius: 15px;
  margin-left: 10px;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 12px;
`;

interface ComandaOptionCardProps {
  label: string;
  numero: string;
  Icon: React.FC<any>;
  onCancel: () => void;
  onFinish: () => void;
}

const ComandaOptionCard: React.FC<ComandaOptionCardProps> = ({
  label,
  numero,
  Icon,
  onCancel,
  onFinish,
}) => {
  return (
    <Card>
      <CardRow>

        {/* Ícone + Nome + Número */}
        <LeftRow>
          <Icon width={30} height={30} fill="#b4918f" style={{ marginRight: 10 }} />

          <View>
            <CardText>{label}</CardText>
            <Text style={{ color: '#666', marginTop: 2 }}>Nº {numero}</Text>
          </View>
        </LeftRow>

        {/* Botões lado a lado */}
        <LeftRow>
          <Button onPress={onCancel}>
            <ButtonText>Cancelar</ButtonText>
          </Button>

          <Button onPress={onFinish}>
            <ButtonText>Ad. Item</ButtonText>
          </Button>
        </LeftRow>

      </CardRow>
    </Card>
  );
};

export default ComandaOptionCard;
