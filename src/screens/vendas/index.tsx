import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ComandasScreen from '../../screens/comanda';
import FinalizarScreen from '../../screens/Finalizar';
import CaixaScreen from '../../screens/Caixa';
import RelatorioScreen from '../../screens/Relatorio';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function VendasTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Comandas" component={ComandasScreen} options={{
        tabBarIcon: ({ color }) => <Ionicons name="clipboard-outline" size={20} color={color} />
      }} />
      <Tab.Screen name="Finalizar" component={FinalizarScreen} options={{
        tabBarIcon: ({ color }) => <Ionicons name="checkmark-done-outline" size={20} color={color} />
      }} />
      <Tab.Screen name="Caixa" component={CaixaScreen} options={{
        tabBarIcon: ({ color }) => <Ionicons name="cash-outline" size={20} color={color} />
      }} />
      <Tab.Screen name="Relatórios" component={RelatorioScreen} options={{
        tabBarIcon: ({ color }) => <Ionicons name="analytics-outline" size={20} color={color} />
      }} />
    </Tab.Navigator>
  );
}
