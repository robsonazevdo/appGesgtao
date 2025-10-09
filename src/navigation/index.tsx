// src/navigation/index.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';


import HomeCliente from '@/pages/clientes';
import HomeServico from '@/pages/servicos';
import HomeProduto from '@/pages/produtos';
import HomeEstoque from '@/pages/estoque';
import HomePacotes from '@/pages/package';
import CustomTabBar from '../../components/CustomTabBar';
import Agendamento from '../screens/agendamento';
import Cadastro from '../screens/cadastro';
import AgendaScreen from '../screens/calendar';
import clientes from '../screens/clientes';
import Home from '../screens/home/index';
import Preload from '../screens/preload';
import SignIn from '../screens/SignIn';
import SignUp from '../screens/SignUp';
import Venda from '../screens/vendas';



export type MainTabParamList = {
  Início: undefined;
  Cadastro: undefined;
  Appointments: undefined;
  Profile: undefined;
  Agenda: undefined;
  Agendamento: undefined;
  Venda: undefined;
  clientes: undefined;
  HomeCliente:undefined;
};


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Início" component={Home} />
      <Tab.Screen name="Cadastro" component={Cadastro} />
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Venda" component={Venda} />
      {/*<Tab.Screen name="Serviços" component={ServicosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} /> */}
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Preload" component={Preload} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="HomeCliente" component={HomeCliente} />
        <Stack.Screen name="HomeServico" component={HomeServico} />
        <Stack.Screen name="HomeProduto" component={HomeProduto} />
        <Stack.Screen name="HomeEstoque" component={HomeEstoque} />
        <Stack.Screen name="HomePacotes" component={HomePacotes} />
        <Stack.Screen name="clientes" component={clientes} />
        <Stack.Screen name="Agendamento" component={Agendamento} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
