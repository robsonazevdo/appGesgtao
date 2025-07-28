import React, { useContext } from 'react';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components/native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { UserContext } from '../src/contexts/UserContext';

import HomeIcon from '../assets/images/home.svg';
import ResgisterIcon from '../assets/images/register.svg';
import TodayIcon from '../assets/images/today.svg';
import SalesIcon from '../assets/images/sales.svg';
import AccountIcon from '../assets/images/account.svg';


const TabArea = styled.View`
  height: 60px;
  background-color: #b4918f;
  flex-direction: row;
  padding-bottom: 10px;
  margin-bottom: 8px;
`;

const TabItem = styled.TouchableOpacity`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const TabItemCenter = styled.TouchableOpacity`
  width: 70px;
  height: 70px;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border-radius: 35px;
  border: 3px solid #C68D95;
  margin-top: -20px;
`;

const AvatarIcon = styled.Image`
  width: 24px;
  height: 24px;
  border-radius: 12px;
`;

// TSX Component
const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const { state: user } = useContext(UserContext);

  const goTo = (screenName: string) => {
    navigation.navigate(screenName as never);
  };

  return (
    <TabArea>
      <TabItem onPress={() => goTo('Início')}>
        <HomeIcon
          style={{ opacity: state.index === 0 ? 1 : 0.5 }}
          width="24"
          height="24"
          fill="#FFFFFF"
        />
      </TabItem>
      <TabItem onPress={() => goTo('Cadastro')}>
        <ResgisterIcon
          style={{ opacity: state.index === 1 ? 1 : 0.5 }}
          width="23"
          height="23"
          fill="#FFFFFF"
        />
      </TabItem>
      <TabItemCenter onPress={() => goTo('Agenda')}>
        <TodayIcon width="32" height="32" fill="#b4918f" />
      </TabItemCenter>
      <TabItem onPress={() => goTo('Venda')}>
        <SalesIcon
          style={{ opacity: state.index === 3 ? 1 : 0.5 }}
          width="24"
          height="24"
          fill="#FFFFFF"
        />
      </TabItem>
      <TabItem onPress={() => goTo('Profile')}>
        {user.avatar !== '' ? (
          
          <AvatarIcon source={{ uri: user.avatar }} />
          
        ) : (
          <AccountIcon
            style={{ opacity: state.index === 4 ? 1 : 0.5 }}
            width="24"
            height="24"
            fill="#FFFFFF"
          />
        )}
      </TabItem>
    </TabArea>
  );
};

export default CustomTabBar;
