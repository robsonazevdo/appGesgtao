import { useNavigation } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { Alert, FlatList, Text, RefreshControl, ScrollView } from 'react-native';
import Api from '../../Api';
import PersonAddIcon from '../../assets/images/add-folder.svg';
import BackIcon from '../../assets/images/back.svg';
import DeleteIcon from '../../assets/images/delete.svg';
import ServiveIcon from '../../assets/images/hair-dryer.svg';
import SearchIcon from '../../assets/images/search.svg';
import ConfigIcon from '../../assets/images/config.svg';
import PersonIcon from '../../assets/images/person.svg';

import {
  AgendarButton,
  AgendarButtonText,
  BackButton,
  Container,
  FormArea,
  IconText,
  InfoAndButtonRow,
  InfoColumn,
  InfoRow,
  Logo,
  ScrollContainer,
  ContentContainer,
  StyledFlatList
} from './styles';

import ClientOptionCard from '../../components/ClientOption';
import SearchModal from '@/components/SearchModal';
import { LoadingIcon } from '@/src/screens/home/styles';
import { FormEditModal } from '@/components/BaseFormEditModal';
import GenericFormModal from '@/components/GenericFormModal';
import BarberServiceConfigModal from '@/src/screens/barberServiceConfig/BarberServiceConfigModal';
import ColaboradorListModal from '@/components/ColaboradorListModal';

const options = [
  { key: 'Cadastro Colaborador', label: 'Cadastro Colaborador', Icon: ServiveIcon },
  { key: 'Atualizar Dados', label: 'Atualizar Dados', Icon: PersonAddIcon },
  { key: 'Delete Colaborador', label: 'Delete Colaborador', Icon: DeleteIcon },
  { key: 'Lista Colaborador', label: 'Lista Colaborador', Icon: SearchIcon },
];

export default function HomeColaborador() {
  const navigation = useNavigation();
  const [showColaboradorModal, setShowColaboradorModal] = useState(false);
  const [showSearchColaboradorModal, setShowSearchColaboradorModal] = useState(false);
  const [showUpdateColaboradorModal, setShowUpdateColaboradorModal] = useState(false);
  const [showDeleteColaboradorModal, setShowDeleteColaboradorModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedColaborador, setSelectedColaborador] = useState<any | null>(null);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [deleteList, setDeleteList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showColaboradorServiceModal, setShowColaboradorServiceModal] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Recarregar dados se necessário
    setRefreshing(false);
  }, []);

  const handlePress = (key: string) => {
    if (key === 'Cadastro Colaborador') {
      setShowColaboradorModal(true);
    } else if (key === 'Lista Colaborador') {
      setShowColaboradorServiceModal(true);
    } else if (key === 'Atualizar Dados') {
      setShowUpdateColaboradorModal(true);
    } else if (key === 'Delete Colaborador') {
      setShowDeleteColaboradorModal(true);
    } else {
      navigation.navigate(key as never);
    }
  };

  const handleSaveColaborador = async (data: { name: string; loc?: string; phone?: string; email?: string }) => {
    try {
      setLoading(true);
      const response = await Api.createBarber({
        name: data.name,
        loc: data.loc,
        stars: 0,
      });
      
      if (response.success) {
        Alert.alert('Sucesso', 'Colaborador criado com sucesso!');
        setShowColaboradorModal(false);
      } else {
        Alert.alert('Erro', response.error || 'Erro ao criar colaborador');
      }
    } catch (error) {
      console.error('Erro ao criar:', error);
      Alert.alert('Erro', 'Erro inesperado ao criar colaborador');
    } finally {
      setLoading(false);
    }
  };

  const handleColaboradorEditar = (res: any) => {
    setSelectedService({ ...res });
    setShowEditServiceModal(true);
  };

  const handleColaboradorUpdate = async (data: { id: number; name: string; avatar?: string; stars?: number; lat?: number; lng?: number; loc?: string }) => {
    try {
      setLoading(true);
      const response = await Api.updateBarber(data);
      
      if (response.success) {
        Alert.alert('Sucesso', 'Colaborador atualizado com sucesso.');
        setShowEditServiceModal(false);
        setSelectedService(null);
      } else {
        Alert.alert('Erro', response.error || 'Erro ao atualizar Colaborador.');
      }
    } catch (error) {
      console.error('Erro ao atualizar Colaborador:', error);
      Alert.alert('Erro', 'Erro inesperado ao atualizar Colaborador.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceDelete = (id: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este Colaborador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await Api.deleteBarber({ id: id });
              if (response.success) {
                setDeleteList([]);
                Alert.alert('Sucesso', 'Colaborador excluído com sucesso.');
                setShowDeleteColaboradorModal(false);
              } else {
                Alert.alert('Erro', response.error || 'Falha ao excluir o Colaborador.');
              }
            } catch (error) {
              console.error('Erro ao deletar:', error);
              Alert.alert('Erro', 'Não foi possível excluir o Colaborador.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleBackButton = () => {
    navigation.goBack();
  };

  // Cabeçalho da lista
  const ListHeaderComponent = () => (
    <ContentContainer>
      <Logo source={require('../../assets/images/Logo-branco.png')} resizeMode="contain" />

      <BackButton onPress={handleBackButton}>
        <BackIcon width="45px" height="45px" fill="#333" />
      </BackButton>

      <FormArea>
        <FlatList
          data={options}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <ClientOptionCard
              label={item.label}
              Icon={item.Icon}
              onPress={() => handlePress(item.key)}
            />
          )}
          scrollEnabled={false}
        />
      </FormArea>
    </ContentContainer>
  );

  return (
    <Container>
      <StyledFlatList
        data={[]}
        keyExtractor={() => 'header'}
        renderItem={null}
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#B4918F']}
            tintColor="#B4918F"
          />
        }
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      {/* Modal de Cadastro */}
      <GenericFormModal
        visible={showColaboradorModal}
        title="Cadastro de Colaborador"
        onClose={() => setShowColaboradorModal(false)}
        onSave={(data) => {
          handleSaveColaborador(data);
        }}
        fields={[
          { name: 'name', placeholder: 'Nome do Colaborador', icon: PersonIcon },
          { name: 'loc', placeholder: 'Localização (Cidade)', icon: () => <Text>📍</Text> },
          { name: 'phone', placeholder: 'Telefone', icon: () => <Text>📞</Text> },
          { name: 'email', placeholder: 'Email', icon: () => <Text>✉️</Text> },
        ]}
      />

      {/* Modal de Busca/Atualização */}
      <SearchModal
        visible={showUpdateColaboradorModal}
        onClose={() => setShowUpdateColaboradorModal(false)}
        title="Atualizar Colaborador"
        placeholder="Digite o nome do Colaborador"
        onSearch={async (name) => {
          const res = await Api.searchBarbers(name);
          return res || [];
        }}
        onSelectItem={(res) => {
          setShowUpdateColaboradorModal(false);
          handleColaboradorEditar(res);
        }}
        renderItem={(res) => (
          <InfoAndButtonRow>
            <InfoColumn>
              <InfoRow>
                <IconText numberOfLines={1} ellipsizeMode="tail">
                  {res.name}
                </IconText>
              </InfoRow>
            </InfoColumn>
            <AgendarButton onPress={() => handleColaboradorEditar(res)}>
              <AgendarButtonText>Editar</AgendarButtonText>
            </AgendarButton>
          </InfoAndButtonRow>
        )}
        lista={[]}
      />

      {/* Modal de Delete */}
      <SearchModal
        visible={showDeleteColaboradorModal}
        onClose={() => {
          setShowDeleteColaboradorModal(false);
          setDeleteList([]);
        }}
        title="Deletar Colaborador"
        placeholder="Digite o nome do Colaborador"
        lista={deleteList}
        onSearch={async (name) => {
          const res = await Api.searchBarbers(name);
          const arr = res || [];
          setDeleteList(arr);
          return arr;
        }}
        onSelectItem={(res) => {
          handleServiceDelete(res.id);
        }}
        renderItem={(res) => (
          <InfoAndButtonRow>
            <InfoColumn>
              <InfoRow>
                <IconText numberOfLines={1} ellipsizeMode="tail">
                  {res.name}
                </IconText>
              </InfoRow>
            </InfoColumn>
            <AgendarButton onPress={() => handleServiceDelete(res.id)}>
              <AgendarButtonText>Deletar</AgendarButtonText>
            </AgendarButton>
          </InfoAndButtonRow>
        )}
      />

      <ColaboradorListModal
        visible={showColaboradorServiceModal}
        onClose={() => setShowColaboradorServiceModal(false)}
        title="Lista de Colaboradores"
        placeholder="Digite o nome do colaborador"
        onSearch={async (name) => {
          if (name && name.trim() !== '') {
            const res = await Api.searchBarbers(name);
            return res || [];
          } else {
            const res = await Api.getAllBarbers();
            return res || [];
          }
        }}
        onSelectItem={(service) => {
          setSelectedService(service);
          setShowColaboradorServiceModal(false);
        }}
        renderItem={(service) => (
          <InfoAndButtonRow>
            <InfoColumn>
              <InfoRow>
                <IconText numberOfLines={1} ellipsizeMode="tail">
                  {service.name}
                </IconText>
              </InfoRow>
              {service.loc && (
                <InfoRow>
                  <IconTextSmall numberOfLines={1} ellipsizeMode="tail">
                    📍 {service.loc}
                  </IconTextSmall>
                </InfoRow>
              )}
              {service.stars && (
                <InfoRow>
                  <IconTextSmall>
                    ⭐ {service.stars}
                  </IconTextSmall>
                </InfoRow>
              )}
            </InfoColumn>
          </InfoAndButtonRow>
        )}
        lista={[]}
        initialData={[]}
      />

      {loading && <LoadingIcon size="large" color="#B4918F" />}

      {/* Modal de Edição com todos os campos */}
      {showEditServiceModal && selectedService?.id && (
        <FormEditModal
          visible={showEditServiceModal}
          onClose={() => {
            setShowEditServiceModal(false);
            setSelectedService(null);
          }}
          initialData={selectedService}
          fields={[
            { name: 'name', placeholder: 'Nome do Colaborador', icon: PersonIcon },
            { name: 'avatar', placeholder: 'URL do Avatar', icon: () => <Text>🖼️</Text>, keyboardType: 'url' },
            { name: 'stars', placeholder: 'Avaliação (0-5)', icon: () => <Text>⭐</Text>, keyboardType: 'numeric' },
            { name: 'lat', placeholder: 'Latitude', icon: () => <Text>📍</Text>, keyboardType: 'numeric' },
            { name: 'lng', placeholder: 'Longitude', icon: () => <Text>📍</Text>, keyboardType: 'numeric' },
            { name: 'loc', placeholder: 'Localização (Cidade)', icon: () => <Text>🏙️</Text> },
          ]}
          onSave={async (updatedData) => {
            await handleColaboradorUpdate(updatedData);
          }}
        />
      )}
    </Container>
  );
}