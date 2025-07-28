import React, { useState } from 'react';
import { Modal, Alert, Text, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import SignInput from './SignInput';

import SearchIcon from '../assets/images/search.svg';
import BackIcon from '../assets/images/back.svg';
import SaveIcon from '../assets/images/check.svg';
import { LoadingIcon } from '@/src/screens/home/styles';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<any[]>;
  onSelectItem: (item: any) => void;
  title: string;
  placeholder?: string;
  renderItem: (item: any) => React.ReactNode;
  lista: any[];
}

const Overlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  background-color: #fff;
  border-radius: 12px;
  width: 90%;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #b4918f;
  padding: 12px 16px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  text-align: center;
  flex: 1;
`;

const HeaderButton = styled.TouchableOpacity`
  width: 32px;
  align-items: center;
  justify-content: center;
`;

const InputsContainer = styled.View`
  gap: 16px;
  margin: 20px auto;
  width: 90%;
`;

const Card = styled.View`
  background-color: #fff;
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
`;

const ListContainer = styled.View`
  max-height: 300px; /* ajuste conforme necessário */
  margin-bottom: 20px;
`;


export default function SearchModal({
  visible,
  onClose,
  onSearch,
  onSelectItem,
  title,
  placeholder = 'Buscar...',
  renderItem,
  lista
}: Props) {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);

  const handleSearch = async () => {
    const query = searchText.trim();
    if (!query) {
      Alert.alert('Campo obrigatório', 'Por favor, preencha o campo.');
      return;
    }

    try {
      setLoading(true);
      const results = await onSearch(query);
      setList(results);
      setSearchText('');
    } catch (error) {
      console.error('Erro na busca:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao buscar os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Overlay>
        <ModalContent>
          <Header>
            <HeaderButton onPress={onClose}>
              <BackIcon width={30} height={30} fill="#fff" />
            </HeaderButton>

            <Title>{title}</Title>

            <HeaderButton onPress={handleSearch}>
              <SaveIcon width={24} height={24} fill="#fff" />
            </HeaderButton>
          </Header>

          <InputsContainer>
            <SignInput
              placeholder={placeholder}
              value={searchText}
              onChangeText={setSearchText}
              IconSvg={SearchIcon}
              
            />
          </InputsContainer>

          {loading && <LoadingIcon size="large" color="#B4918F" />}

          {!loading && list.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#999', marginTop: 10 }}>
              Nenhum item encontrado.
            </Text>
          )}
          <ListContainer>
            <ScrollView>
              {!loading &&
                list.map((item) => (
                  <Card key={item.id} onTouchEnd={() => onSelectItem(item)}>
                    {renderItem(item)}
                  </Card>
                ))}
            </ScrollView>
          </ListContainer>

        </ModalContent>
      </Overlay>
    </Modal>
  );
}
