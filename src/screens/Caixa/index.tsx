import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CaixaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fluxo de Caixa</Text>
      <Text>Entradas: R$ 1000</Text>
      <Text>Saídas: R$ 200</Text>
      <Text>Saldo: R$ 800</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
});
