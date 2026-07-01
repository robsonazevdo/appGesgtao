import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, RefreshControl } from 'react-native';
import styled from 'styled-components/native';
import Api from '../Api';
import { useNavigation } from '@react-navigation/native';

const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
`;

const Header = styled.View`
  background-color: #b4918f;
  padding: 16px;
  flex-direction: row;
  align-items: center;
`;

const BackButton = styled.TouchableOpacity`
  padding: 8px;
`;

const BackText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: white;
  flex: 1;
  text-align: center;
`;

const SearchInput = styled.TextInput`
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  margin: 16px;
  font-size: 16px;
  border-width: 1px;
  border-color: #ddd;
`;

const ClientCard = styled.TouchableOpacity`
  background-color: white;
  margin: 8px 16px;
  padding: 16px;
  border-radius: 12px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

const ClientInfo = styled.View`
  flex: 1;
`;

const ClientName = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const ClientPhone = styled.Text`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const ClientEmail = styled.Text`
  font-size: 12px;
  color: #888;
  margin-top: 2px;
`;

const AgendButton = styled.TouchableOpacity`
  background-color: #b4918f;
  padding: 8px 16px;
  border-radius: 8px;
`;

const AgendButtonText = styled.Text`
  color: white;
  font-weight: bold;
`;

const EmptyText = styled.Text`
  text-align: center;
  margin-top: 40px;
  color: #888;
  font-size: 16px;
`;

const Footer = styled.View`
  padding: 20px;
  align-items: center;
`;

const FooterText = styled.Text`
  color: #999;
  font-size: 12px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

// Componente principal
export default function ProdutosListModal({ visible, onClose, onSelectColaborador }) {
  const navigation = useNavigation();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (visible) {
      loadProdutos();
    }
  }, [visible]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredClients(produtos);
    } else {
      const filtered = produtos.filter(produto =>
        produto.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (produto.phone && produto.phone.includes(searchText))
      );
      setFilteredClients(filtered);
    }
  }, [searchText, produtos]);

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const response = await Api.getProducts();
      const produtoList = response.data || response || [];
      setProdutos(produtoList);
      setFilteredClients(produtoList);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProdutos();
    setRefreshing(false);
  };

  const handleSelectClient = (client) => {
    if (onSelectColaborador) {
      onSelectColaborador(client);
    }
    onClose();
  };

 

  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  const renderClient = ({ item, index }) => (
    <ClientCard 
      key={item.id}
      onPress={() => handleSelectClient(item)}
      style={{ marginBottom: index === filteredClients.length - 1 ? 16 : 8 }}
    >
      <ClientInfo>
        <ClientName>{item.name}</ClientName>
        {item.price && <ClientPhone>Preço: R$ {item.price.toFixed(2)}</ClientPhone>}
        {item.unit && <ClientEmail>Unidade: {item.unit}</ClientEmail>}
        
      </ClientInfo>
      
    </ClientCard>
  );

  if (!visible) return null;

  return (
    <Container>
      <Header>
        <BackButton onPress={onClose}>
          <BackText>←</BackText>
        </BackButton>
        <Title>Lista de Produtos</Title>
        <View style={{ width: 40 }} />
      </Header>
      
      <SearchInput
        placeholder="🔍 Buscar por nome..."
        value={searchText}
        onChangeText={setSearchText}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      
      {loading ? (
        <LoadingContainer>
          <ActivityIndicator size="large" color="#b4918f" />
          <Text style={{ marginTop: 12, color: '#666' }}>Carregando produtos...</Text>
        </LoadingContainer>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredClients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderClient}
          showsVerticalScrollIndicator={true}
          ListEmptyComponent={
            <EmptyText>
              {searchText ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </EmptyText>
          }
          ListFooterComponent={
            filteredClients.length > 0 ? (
              <Footer>
                <FooterText>
                  Total de produtos: {filteredClients.length}
                </FooterText>
                <TouchableOpacity onPress={scrollToTop}>
                  <FooterText>↑ Voltar ao topo</FooterText>
                </TouchableOpacity>
              </Footer>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#b4918f']}
              tintColor="#b4918f"
            />
          }
          initialNumToRender={10}
          maxToRenderPerBatch={15}
          windowSize={10}
        />
      )}
    </Container>
  );
}