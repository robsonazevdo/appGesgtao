import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, RefreshControl } from 'react-native';
import BackIcon from '../../assets/images/back.svg';
import DeleteIcon from '../../assets/images/delete.svg';
import PersonAddIcon from '../../assets/images/person-add.svg';
import PersonIcon from '../../assets/images/person.svg';
import SearchIcon from '../../assets/images/search.svg';
import EmailIcon from '../../assets/images/email.svg';
import PhoneIcon from '../../assets/images/phone.svg';
import Api from '../../Api';

import {
    BackButton,
    Container,
    FormArea,
    Logo,
    InfoAndButtonRow,
    InfoColumn,
    InfoRow,
    IconText,
    IconTextSmall,
    AgendarButton,
    AgendarButtonText,
    ScrollContainer,
    ContentContainer
} from './styles';

import ClientOptionCard from '../../components/ClientOption';
import SearchModal from '@/components/SearchModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LoadingIcon } from '@/src/screens/home/styles';
import { FormEditModal } from '@/components/BaseFormEditModal';
import GenericFormModal from '@/components/GenericFormModal';
import ClientListModal from '@/components/ClientListModal';


const options = [
  { key: 'Cadastro Cliente', label: 'Cadastro Cliente', Icon: PersonIcon },
  { key: 'Atualizar Dados', label: 'Atualizar Dados', Icon: PersonAddIcon },
  { key: 'Delete Cliente', label: 'Delete Cliente', Icon: DeleteIcon },
  { key: 'listar Clientes', label: 'Listar Clientes', Icon: PersonIcon },
];

type RootStackParamList = {
  Home: undefined;
  Agendamento: { client: any };
  onClose: () => void;
  'Listar Clientes': undefined;
};

export default function HomeCliente() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showClientModal, setShowClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showSearchClientModal, setShowSearchClientModal] = useState(false);
  const [showUpdateClientModal, setShowUpdateClientModal] = useState(false);
  const [showDeleteClientModal, setShowDeleteClientModal] = useState(false);
  const [showListClientModal, setShowListClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [deleteList, setDeleteList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filteredClients, setFilteredClients] = useState([]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  const handlePress = (key: string) => {
    if (key === 'Cadastro Cliente') {
      setShowClientModal(true);
    } else if (key === 'Buscar Cliente') {
      setShowSearchClientModal(true);
    } else if (key === 'Atualizar Dados') {
      setShowUpdateClientModal(true);
    } else if (key === 'Delete Cliente') {
      setShowDeleteClientModal(true);
    } else if (key === 'listar Clientes') {
      setShowListClientModal(true);
    }
  };

  const handleSaveClient = async (data: { name: string; phone: string; email: string, created_at: string; }) => {
    const now = new Date().toISOString();
    try {
      const res = await Api.setClients({
        name: data.name,
        phone: data.phone,
        email: data.email,
        created_at: now
      });

      if (res.id || res.success === true) {
        Alert.alert('Sucesso', 'Cliente salvo com sucesso!');
        setShowClientModal(false);
        await loadClients();
      } else {
        Alert.alert('Erro', res.error || 'Erro ao salvar cliente');
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      Alert.alert('Erro', 'Erro inesperado ao salvar serviço');
    }
  };

  const loadClients = async () => {
    try {
      const json = await Api.getClients();
      if (Array.isArray(json)) {
        setClients(json);
        if (json.length > 0) setSelectedClient(json[0].id);
      }
    } catch {
      Alert.alert('Erro', 'Erro ao carregar clientes');
    }
  };


  
  const handleAgendar = (client: any) => {
    console.log('Cliente selecionado para agendamento:', client);
    setTimeout(() => {
      navigation.navigate('Agendamento', { client });
    }, 100);
  };

  const handleBackButton = () => {
    navigation.goBack();
  };

  const handleDelete = async (clientId: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este cliente?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await Api.deleteClient(clientId);

              if (response?.success) {
                setDeleteList((prevList) => prevList.filter(client => client.id !== clientId));
                Alert.alert('Sucesso', response?.message || 'Cliente excluído com sucesso.');
                setShowDeleteClientModal?.(false);
                await loadClients();
              } else {
                Alert.alert('Erro', response?.error || 'Erro ao excluir o cliente.');
              }
            } catch (error) {
              console.error('Erro ao excluir cliente:', error);
              Alert.alert('Erro', 'Não foi possível excluir o cliente.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleClientEditar = (client: any) => {
    setSelectedClient({ ...client });
    setShowEditClientModal(true);
  };

  return (
    <Container>
      <ScrollContainer
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#B4918F']}
            tintColor="#B4918F"
          />
        }
      >
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
      </ScrollContainer>

      {/* Modais */}
      <GenericFormModal
        visible={showClientModal}
        title="Cadastro de Cliente"
        onClose={() => setShowClientModal(false)}
        onSave={handleSaveClient}
        validate={(data) => {
          const name = String(data.name).trim();
          const phone = String(data.phone).trim();
          const email = String(data.email).trim();

          if (!name || !phone || !email) {
            Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos.');
            return false;
          }

          if (phone.length < 10 || phone.length > 11) {
            Alert.alert('Telefone inválido', 'O telefone deve conter 10 ou 11 dígitos.');
            return false;
          }

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Alert.alert('E-mail inválido', 'Por favor, digite um e-mail válido.');
            return false;
          }

          return true;
        }}
        fields={[
          { name: 'name', placeholder: 'Nome do Cliente', icon: PersonIcon },
          { name: 'phone', placeholder: 'Telefone', icon: PhoneIcon },
          { name: 'email', placeholder: 'Email', icon: EmailIcon },
        ]}
      />

      <SearchModal
        visible={showUpdateClientModal}
        onClose={() => setShowUpdateClientModal(false)}
        title="Atualizar Dados"
        placeholder="Digite o Nome Cliente"
        onSearch={async (name) => {
          const res = await Api.getClientsSerch({ name });
          const arr = res || [];
          return arr;
        }}
        onSelectItem={(arr) => {
          handleClientEditar(arr);
        }}
        renderItem={(arr) => (
          <InfoAndButtonRow>
            <InfoColumn>
              <InfoRow>
                <IconText numberOfLines={1} ellipsizeMode="tail">
                  {arr.name}
                </IconText>
              </InfoRow>
            </InfoColumn>
            <AgendarButton onPress={() => handleClientEditar(arr)}>
              <AgendarButtonText>Editar</AgendarButtonText>
            </AgendarButton>
          </InfoAndButtonRow>
        )}
        lista={[]}
      />

      <SearchModal
        visible={showDeleteClientModal}
        onClose={() => {
          setShowDeleteClientModal(false);
          setDeleteList([]);
        }}
        title="Deletar"
        placeholder="Digite o nome do Cliente"
        lista={deleteList}
        onSearch={async (name) => {
          const res = await Api.getClientsSerch({ name });
          const arr = res || [];
          setDeleteList(arr);
          return arr;
        }}
        onSelectItem={(client) => {
          handleDelete(client.id);
        }}
        renderItem={(client) => (
          <InfoAndButtonRow>
            <InfoColumn>
              <InfoRow>
                <IconText numberOfLines={1} ellipsizeMode="tail">
                  {client.name}
                </IconText>
              </InfoRow>
            </InfoColumn>
            <AgendarButton onPress={() => handleDelete(client.id)}>
              <AgendarButtonText>Deletar</AgendarButtonText>
            </AgendarButton>
          </InfoAndButtonRow>
        )}
      />

      <ClientListModal
        visible={showListClientModal}
        onClose={() => setShowListClientModal(false)}
        title="Lista de Clientes"
        placeholder="Digite o nome do cliente"
        onSearch={async (name) => {
          if (name && name.trim() !== '') {
            const res = await Api.getClientsSerch(name);
            return res || [];
          } else {
            const res = await Api.getClients();
            return res || [];
          }
        }}
        onSelectItem={(client) => {
          setSelectedClient(client);
          setShowListClientModal(false);
        }}
        renderItem={(client) => (
          <InfoAndButtonRow>
            <InfoColumn>
              <InfoRow>
                <IconText numberOfLines={1} ellipsizeMode="tail">
                  {client.name}
                </IconText>
              </InfoRow>
              {client.phone && (
                <InfoRow>
                  <IconTextSmall numberOfLines={1} ellipsizeMode="tail">
                    📞 {client.phone}
                  </IconTextSmall>
                </InfoRow>
              )}
              {client.email && (
                <InfoRow>
                  <IconTextSmall numberOfLines={1} ellipsizeMode="tail">
                    ✉️ {client.email}
                  </IconTextSmall>
                </InfoRow>
              )}
            </InfoColumn>
            <AgendarButton onPress={() => handleAgendar(client)}>
              <AgendarButtonText>Agendar</AgendarButtonText>
            </AgendarButton>
          </InfoAndButtonRow>
        )}
        lista={[]}
        initialData={[]}
      />

      {loading && <LoadingIcon size="large" color="#B4918F" />}
      
      {showEditClientModal && selectedClient?.id && (
        <FormEditModal
          visible={showEditClientModal}
          onClose={() => setShowEditClientModal(false)}
          initialData={selectedClient}
          fields={[
            { name: 'name', placeholder: 'Nome', icon: PersonIcon },
            { name: 'phone', placeholder: 'Telefone', icon: PhoneIcon },
            { name: 'email', placeholder: 'Email', icon: EmailIcon },
          ]}
          onSave={async (clientData) => {
            setLoading(true);
            try {
              const updateData = {
                id: selectedClient?.id,
                name: clientData.name,
                phone: clientData.phone,
                email: clientData.email,
                created_at: selectedClient?.created_at || new Date().toISOString()
              };
              
              console.log('Enviando para API:', updateData);
              
              const response = await Api.updateClient(updateData);

              if (response.success) {
                Alert.alert('Sucesso', response.message || 'Cliente atualizado com sucesso.');
                setShowEditClientModal(false);
                await loadClients();
              } else {
                Alert.alert('Erro', response.error || 'Erro ao atualizar o cliente.');
              }
            } catch (error) {
              console.error('Erro ao atualizar cliente:', error);
              Alert.alert('Erro', 'Erro inesperado ao atualizar o cliente.');
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
    </Container>
  );
}