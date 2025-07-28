import React from 'react';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components/native';
import Clock from '../assets/images/clock.svg';
import Dollar from '../assets/images/dollar.svg';

type Props = {
  service: string;
  barberName: string;
  clientName: string;
  time: string;
  price: string;
  onCancel?: () => void;
  showCancelButton?: boolean; // 👈 nova prop
};


const Card = styled.View`
  background-color: #fff;
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
`;

const TopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: #333;
  flex: 1;
`;

const SubText = styled.Text`
  font-size: 16px;
  color: #444;
  margin-top: 4px;
`;

const SubTextName = styled.Text`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const InfoAndButtonRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
`;

const InfoColumn = styled.View`
  flex-direction: column;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 5px;
`;

const IconText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-left: 5px;
`;

const CancelButton = styled.TouchableOpacity`
  border: 1px solid #b4918f;
  padding: 8px 12px;
  border-radius: 10px;
  background-color: transparent;
`;

const CancelButtonText = styled.Text`
  color: #b4918f;
  font-size: 13px;
`;

const ReservationItem: React.FC<Props> = ({ service, barberName,clientName, time, price, onCancel, showCancelButton = true }) => {

  return (
    <Card>
      <TopRow>
        <Title>{service}</Title>
      </TopRow>

      <SubText>{barberName}</SubText>
      <SubTextName>{clientName}</SubTextName>

      <InfoAndButtonRow>
        <InfoColumn>
          <InfoRow>
            <Clock width={24} height={24} fill="#b4918f" />
            <IconText>{time}</IconText>
          </InfoRow>
          <InfoRow>
            <Dollar width={24} height={24} fill="#b4918f" />
            <IconText>R$ {parseFloat(price).toFixed(2)}</IconText>
          </InfoRow>
        </InfoColumn>

        
        {showCancelButton && onCancel && (
          <CancelButton onPress={onCancel}>
            <CancelButtonText>Cancelar</CancelButtonText>
          </CancelButton>
        )}

      </InfoAndButtonRow>
    </Card>
  );
};

export default ReservationItem;
