import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: #222;
  padding: 20px;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
`;

export const BackButton = styled.TouchableOpacity`
  margin-right: 10px;
`;

export const Title = styled.Text`
  color: #fff;
  font-size: 22px;
  font-weight: bold;
`;

export const DayCard = styled.View`
  background-color: #333;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 12px;
`;

export const DayText = styled.Text`
  color: #fff;
  font-size: 16px;
  margin-bottom: 10px;
`;

export const HourButton = styled.TouchableOpacity<{ active: boolean }>`
  background-color: ${({ active }) => (active ? '#b4918f' : '#666')};
  padding: 10px;
  margin-right: 10px;
  border-radius: 10px;
`;

export const HourText = styled.Text<{ active: boolean }>`
  color: ${({ active }) => (active ? '#fff' : '#ddd')};
`;

export const SaveButton = styled.TouchableOpacity`
  background-color: #b4918f;
  padding: 15px;
  border-radius: 12px;
  align-items: center;
`;

export const SaveButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;
