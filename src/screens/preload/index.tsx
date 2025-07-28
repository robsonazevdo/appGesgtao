import React, { useEffect, useContext } from 'react';
import { Container, LoadingIcon, Logo } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';



import  {UserContext}  from '../../contexts/UserContext';
import Api from '../../../Api';


type RootStackParamList = {
  SignIn: string;
  Main: undefined; 
};


export default function Preload() {
  const { dispatch: userDispatch } = useContext(UserContext);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        
        const res = await Api.checkToken(token);

        if (res.token) {
          await AsyncStorage.setItem('token', res.token);

          userDispatch({
            type: 'setAvatar',
            payload: {
              avatar: res?.data?.avatar || '',
            },
          });

          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            })
          );
          
        } else {
          navigation.navigate('SignIn');
        }
      } else {
        navigation.navigate('SignIn');
      }
    };

    checkToken();
  }, [navigation, userDispatch]);

  return (
    <Container>
      
      <Logo source={require('../../../assets/images/Logo-branco.png')}  resizeMode="contain" />
      <LoadingIcon size="large" color="#FFFFFF" />
    </Container>
  );
}



