import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { Alert } from 'react-native';

import { UserContext } from '../../../src/contexts/UserContext';


import {
  Container,
  CustomButton,
  CustomButtonText,
  InputArea,
  SignMessageButton,
  SignMessageButtonText,
  SignMessageButtonTextBold,
  Logo
} from './styles';

import Api from '../../../Api';

import SignInput from '../../../components/SignInput';


import EmailIcon from '../../../assets/images/email.svg';
import LockIcon from '../../../assets/images/lock.svg';

export default function SignInScreen() {
  const { dispatch: userDispatch } = useContext(UserContext);
  const navigation = useNavigation<NavigationProp<any>>();

  const [emailField, setEmailField] = useState('');
  const [passwordField, setPasswordField] = useState('');

  const handleSignClick = async () => {
    if (emailField !== '' && passwordField !== '') {
      const json = await Api.signIn(emailField, passwordField);
      if (json.token) {
        await AsyncStorage.setItem('token', json.token);

        userDispatch({
          type: 'setAvatar',
          payload: {
            avatar: json?.data?.avatar || '',
          },
        });

        navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Erro', 'E-mail e/ou senha errados!');
      }
    } else {
      Alert.alert('Atenção', 'Preencha os campos!');
    }
  };

  const handleMessageButtonClick = () => {
    navigation.reset({
      routes: [{ name: 'SignUp' }],
    });
  };

  return (
    <Container>
      <Logo source={require('../../../assets/images/Logo-branco.png')}  resizeMode="contain" />

      <InputArea>
        <SignInput
          IconSvg={EmailIcon}
          placeholder="Digite seu e-mail"
          value={emailField}
          onChangeText={setEmailField}
        />

        <SignInput
          IconSvg={LockIcon}
          placeholder="Digite sua senha"
          value={passwordField}
          onChangeText={setPasswordField}
          password
        />

        <CustomButton onPress={handleSignClick}>
          <CustomButtonText>LOGIN</CustomButtonText>
        </CustomButton>
      </InputArea>

      <SignMessageButton onPress={handleMessageButtonClick}>
        <SignMessageButtonText>Ainda não possui uma conta?</SignMessageButtonText>
        <SignMessageButtonTextBold>Cadastre-se</SignMessageButtonTextBold>
      </SignMessageButton>
    </Container>
  );
}
