import React, { useState } from 'react';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NextIcon from '../../../assets/images/nav_next.svg';

import { 
  Container, 
  Card,
  Logo,
  CardText 
} from './styles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  HomeCliente: undefined;
  HomeServico: undefined;
  HomeProduto: undefined;
  HomeEstoque: undefined;
  HomePacotes: undefined;
  HomeConfig: undefined;
};

const options = [
  { key: 'clientes', label: 'Clientes', Icon: NextIcon  },
  { key: 'servicos', label: 'Serviços', Icon: NextIcon },
  { key: 'produtos', label: 'Produtos', Icon: NextIcon  },
  { key: 'estoque', label: 'Estoque', Icon: NextIcon  },
  { key: 'pacotes', label: 'Pacotes', Icon: NextIcon  },
  { key: 'config', label: 'Config', Icon: NextIcon  },
];

export default function CadastroScreen() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

   const navigation = useNavigation<NavigationProp>();
  
  const handlePress = (key: string) => {
    if (key === 'clientes') {
     navigation.navigate('HomeCliente')
    } else if (key === 'servicos'){
      navigation.navigate('HomeServico')
    }else if (key === 'produtos'){
      navigation.navigate('HomeProduto')
    }else if (key === 'estoque'){
      navigation.navigate('HomeEstoque')
    }else if (key === 'pacotes'){
      navigation.navigate('HomePacotes')
    
    }else if (key === 'config'){
      navigation.navigate('HomeConfig')
    }else {
      navigation.navigate(key as never);
    }
  };



  return (
    <Container>
      <Logo source={require('../../../assets/images/Logo-branco.png')} resizeMode="contain" />

      <FlatList
        data={options}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          const Icon = item.Icon;
          return (
            <Card onPress={() => handlePress(item.key)}>
              <CardText>{item.label}</CardText>
              <Icon width={32} height={32} fill='#b4918f' style={{ marginLeft: 'auto' }} />
            </Card>
          );
        }}
      />

      
    </Container>
  );
}
