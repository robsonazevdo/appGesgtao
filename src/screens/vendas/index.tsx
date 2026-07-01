import React from 'react';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackIcon from "../../../assets/images/back.svg";
import NextIcon from '../../../assets/images/nav_next.svg';
import { Container, Logo, Card, CardText, BackButton } from './styles';

type RootStackParamList = {
  Comandas: undefined;
  Finalizar: undefined;
  Caixa: undefined;
  FluxoMensal: undefined
  Relatorio: undefined;

};

const options = [
  { key: 'Comandas', label: 'Abrir Comanda', Icon: NextIcon },
  { key: 'Finalizar', label: 'Finalizar Venda', Icon: NextIcon },
  { key: 'Saidas', label: 'Novo Lançamento', Icon: NextIcon },
  { key: 'Caixa', label: 'Fluxo Diário', Icon: NextIcon },
  { key: 'FluxoMensal', label: 'Fluxo mensal', Icon: NextIcon },
  { key: 'Relatorio', label: 'Relatório', Icon: NextIcon },
  { key: 'Orcamento', label: 'Orçamento', Icon: NextIcon },
  { key: 'Historico', label: 'Histórico', Icon: NextIcon },
 
];

export default function VendaScreen() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();

  const handlePress = (key: string) => {
    navigation.navigate(key as any);
  };

  return (
    <Container>
      <Logo
        source={require('../../../assets/images/Logo-branco.png')}
        resizeMode="contain"
      />

       <BackButton onPress={() => navigation.goBack()}>
              <BackIcon width="45" height="45" fill="#fff" />
            </BackButton>

      <FlatList
        data={options}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          const Icon = item.Icon;
          return (
            <Card onPress={() => handlePress(item.key)}>
              <CardText>{item.label}</CardText>
              <Icon width={32} height={32} fill="#b4918f" style={{ marginLeft: 'auto' }} />
            </Card>
          );
        }}
      />
    </Container>
  );
}
