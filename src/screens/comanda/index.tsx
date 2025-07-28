import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Button,
  Alert,
} from 'react-native';

type Servico = {
  id: string;
  nome: string;
  preco: number;
};

type Comanda = {
  id: string;
  cliente: string;
  servicos: Servico[];
};

export default function ComandasScreen() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [historico, setHistorico] = useState<Comanda[]>([]);

  const [clienteNome, setClienteNome] = useState('');
  const [servicoNome, setServicoNome] = useState('');
  const [servicoPreco, setServicoPreco] = useState('');
  const [comandaAtivaId, setComandaAtivaId] = useState<string | null>(null);

  const abrirComanda = () => {
    if (!clienteNome.trim()) return Alert.alert('Erro', 'Informe o nome do cliente');

    const novaComanda: Comanda = {
      id: Date.now().toString(),
      cliente: clienteNome.trim(),
      servicos: [],
    };

    setComandas(prev => [...prev, novaComanda]);
    setComandaAtivaId(novaComanda.id);
    setClienteNome('');
  };

  const adicionarServico = () => {
    if (!servicoNome.trim() || !servicoPreco.trim()) {
      return Alert.alert('Erro', 'Informe nome e preço do serviço');
    }

    const preco = parseFloat(servicoPreco);
    if (isNaN(preco)) return Alert.alert('Erro', 'Preço inválido');

    const novoServico: Servico = {
      id: Date.now().toString(),
      nome: servicoNome.trim(),
      preco,
    };

    setComandas(prev =>
      prev.map(c =>
        c.id === comandaAtivaId
          ? { ...c, servicos: [...c.servicos, novoServico] }
          : c
      )
    );

    setServicoNome('');
    setServicoPreco('');
  };

  const fecharComanda = (id: string) => {
    const comanda = comandas.find(c => c.id === id);
    if (!comanda) return;

    Alert.alert(
      'Fechar Comanda',
      `Deseja fechar a comanda de ${comanda.cliente}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Fechar',
          onPress: () => {
            setComandas(prev => prev.filter(c => c.id !== id));
            setHistorico(prev => [...prev, comanda]);
            if (comandaAtivaId === id) setComandaAtivaId(null);
          },
        },
      ]
    );
  };

  const getTotal = (servicos: Servico[]) =>
    servicos.reduce((total, s) => total + s.preco, 0);

  const comandaAtiva = comandas.find(c => c.id === comandaAtivaId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Comanda</Text>
      {!comandaAtiva && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nome do cliente"
            value={clienteNome}
            onChangeText={setClienteNome}
          />
          <Button title="Abrir Comanda" onPress={abrirComanda} />
        </View>
      )}

      {comandaAtiva && (
        <View style={styles.comandaBox}>
          <Text style={styles.subtitle}>Cliente: {comandaAtiva.cliente}</Text>
          <FlatList
            data={comandaAtiva.servicos}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Text style={styles.item}>
                {item.nome} - R$ {item.preco.toFixed(2)}
              </Text>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Nenhum serviço ainda.</Text>}
          />

          <Text style={styles.total}>
            Total: R$ {getTotal(comandaAtiva.servicos).toFixed(2)}
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Serviço"
              value={servicoNome}
              onChangeText={setServicoNome}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço"
              value={servicoPreco}
              keyboardType="numeric"
              onChangeText={setServicoPreco}
            />
            <Button title="Adicionar Serviço" onPress={adicionarServico} />
          </View>

          <Button
            title="Fechar Comanda"
            color="#B71C1C"
            onPress={() => fecharComanda(comandaAtiva.id)}
          />
        </View>
      )}

      <Text style={styles.title}>Histórico</Text>
      <FlatList
        data={historico}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.historicoBox}>
            <Text style={styles.subtitle}>{item.cliente}</Text>
            {item.servicos.map(serv => (
              <Text key={serv.id} style={styles.item}>
                {serv.nome} - R$ {serv.preco.toFixed(2)}
              </Text>
            ))}
            <Text style={styles.total}>
              Total: R$ {getTotal(item.servicos).toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma comanda fechada.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  form: { marginVertical: 10 },
  comandaBox: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  item: { fontSize: 16, paddingVertical: 2 },
  total: { marginTop: 10, fontWeight: 'bold', fontSize: 16 },
  empty: { color: '#888', fontStyle: 'italic', marginTop: 6 },
  historicoBox: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
});
