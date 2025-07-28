import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';

export default function FinalizarScreen() {
  const finalizar = () => {
    Alert.alert('Venda finalizada com sucesso!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finalizar Atendimento</Text>
      <Button title="Finalizar Venda" onPress={finalizar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 20 },
});
