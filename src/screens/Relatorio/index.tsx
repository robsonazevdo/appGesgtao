import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RelatorioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relatório de Vendas</Text>
      <Text>Total de vendas: 25</Text>
      <Text>Faturamento: R$ 3.200</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
});
