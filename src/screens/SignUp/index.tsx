import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';

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
import PersonIcon from '../../../assets/images/person.svg';

export default function SignUpScreen() {
  const { dispatch: userDispatch } = useContext(UserContext);
  const navigation = useNavigation<NavigationProp<any>>();


  const [nameField, setNameField] = useState('');
  const [emailField, setEmailField] = useState('');
  const [passwordField, setPasswordField] = useState('');

  const handleSignClick = async () => {
     if(nameField !== '' && emailField !== '' && passwordField !== '') {
          let res = await Api.signUp(nameField, emailField, passwordField);

      if (res.token) {
        await AsyncStorage.setItem('token', res.token);

        userDispatch({
          type: 'setAvatar',
          payload: {
             avatar: res?.data?.avatar || '',
          },
        });

        navigation.reset({
          routes: [{ name:'Main' }],
        });
      } else {
        alert("Erro: "+res.error);
      }
    } else {
       alert("Preencha os campos");
    }
  };

  const handleMessageButtonClick = () => {
    navigation.reset({
      routes: [{ name: 'SignIn' }]
    });
  };

  return (
    <Container>
      <Logo source={require('../../../assets/images/Logo-branco.png')}  resizeMode="contain" />

      <InputArea>
      <SignInput
          IconSvg={PersonIcon}
          placeholder="Digite seu nome"
          value={nameField}
          onChangeText={setNameField}
        />

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
          <CustomButtonText>CADASTRAR</CustomButtonText>
        </CustomButton>
      </InputArea>

      <SignMessageButton onPress={handleMessageButtonClick}>
        <SignMessageButtonText>Já possui uma conta?</SignMessageButtonText>
        <SignMessageButtonTextBold>Faça Login</SignMessageButtonTextBold>
      </SignMessageButton>
    </Container>
  );
}
