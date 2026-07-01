import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, FlatList, Text, RefreshControl } from 'react-native';
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
  ContentContainer,
  StyledFlatList
} from './styles';

import ClientOptionCard from '../../components/ClientOption';

import SearchModal from '@/components/SearchModal';
import { LoadingIcon } from '@/src/screens/home/styles';
import { FormEditModal } from '@/components/BaseFormEditModal';
import GenericFormModal from '@/components/GenericFormModal';
import BarberServiceConfigModal from '@/src/screens/barberServiceConfig/BarberServiceConfigModal';
import ClientListModal from '@/components/ClientListModal';
import { IconTextSmall } from '../clientes/styles';
import ServiceListModal from '@/components/ServiceListModal';

const options = [
  { key: 'Cadastro Serviço', label: 'Cadastro Serviço', Icon: ServiveIcon },
  { key: 'Atualizar Dados', label: 'Atualizar Dados', Icon: PersonAddIcon },
  { key: 'Delete Serviço', label: 'Delete Serviço', Icon: DeleteIcon },
  { key: 'Configurações Serviço', label: 'Configurações Serviço', Icon: ConfigIcon },
  { key: 'Lista Serviços', label: 'Lista Serviços', Icon: SearchIcon },
];

export default function HomeServico() {
  const navigation = useNavigation();
  const [showServicoModal, setShowServicoModal] = useState(false);
  const [showSearchServicoModal, setShowSearchServicoModal] = useState(false);
  const [showUpdateServicoModal, setShowUpdateServicoModal] = useState(false);
  const [showDeleteServicoModal, setShowDeleteServicoModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [deleteList, setDeleteList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfigServiceModal, setShowConfigServiceModal] = useState(false);
  const [showListServiceModal, setShowListServiceModal] = useState(false);
  const [services, setServices] = useState<any[]>([]);

  const handlePress = (key: string) => {
    if (key === 'Cadastro Serviço') {
      setShowServicoModal(true);
    } else if (key === 'Atualizar Dados') {
      setShowUpdateServicoModal(true);
    } else if (key === 'Delete Serviço') {
      setShowDeleteServicoModal(true);
    } else if (key === 'Configurações Serviço') {
      setShowConfigServiceModal(true);
    } else if (key === 'Lista Serviços') {
      setShowListServiceModal(true);
    } else {
      navigation.navigate(key as never);
    }
  };

  const handleSaveServico = async (data: { name: string }) => {
    try {
      const res = await Api.setServices({
        name: data.name,
      });

      if (res.success) {
        Alert.alert('Sucesso', 'Serviço salvo com sucesso!');
        setShowServicoModal(false);
        await loadServices();
      } else {
        Alert.alert('Erro', res.error || 'Erro ao salvar serviço');
      }
    } catch (error) {
      console.error('Erro ao salvar serviços:', error);
      Alert.alert('Erro', 'Erro inesperado ao salvar serviço');
    }
  };

  const loadServices = async () => {
    try {
      const json = await Api.getServices();
      if (Array.isArray(json)) {
        setServices(json);
        if (json.length > 0) setSelectedService(json[0].id);
      }
    } catch {
      Alert.alert('Erro', 'Erro ao carregar serviços');
    }
  };

  const handleServiceEditar = (service: any) => {
    setSelectedService({ ...service });
    setShowEditServiceModal(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const handleServiceDelet = (serviceId: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este serviço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const json = await Api.deleteService({ service_id: serviceId });
              if (json.success) {
                setDeleteList([]);
                Alert.alert('Sucesso', 'Serviço excluído com sucesso.');
                setShowDeleteServicoModal(false);
                await loadServices();
              } else {
                Alert.alert('Erro', json.error || 'Falha ao excluir o serviço.');
              }
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o serviço.');
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

  const handleAgendar = (service: any) => {
    console.log('Serviço selecionado:', service);
    // Implementar lógica de agendamento se necessário
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

      {/* Modais */}
      <GenericFormModal
        visible={showServicoModal}
        title="Cadastro de Serviço"
        onClose={() => setShowServicoModal(false)}
        onSave={handleSaveServico}
        fields={[
          { name: 'name', placeholder: 'Nome do Serviço', icon: PersonIcon },
        ]}
      />

      <SearchModal
        visible={showUpdateServicoModal}
        onClose={() => setShowUpdateServicoModal(false)}
        title="Atualizar"
        placeholder="Digite o nome do serviço"
        onSearch={async (name) => {
          const res = await Api.getServiceSearchName(name);
          return res.data || [];
        }}
        onSelectItem={(service) => {
          setShowUpdateServicoModal(false);
          handleServiceEditar(service);
        }}
        renderItem={(service) => (
          <InfoAndButtonRow>
            <InfoColumn>
              <InfoRow>
                <IconText numberOfLines={1} ellipsizeMode="tail">
                  {service.name}
                </IconText>
              </InfoRow>
            </InfoColumn>
            <AgendarButton onPress={() => handleServiceEditar(service)}>
              <AgendarButtonText>Editar</AgendarButtonText>
            </AgendarButton>
          </InfoAndButtonRow>
        )}
        lista={[]}
      />

      <SearchModal
        visible={showDeleteServicoModal}
        onClose={() => {
          setShowDeleteServicoModal(false);
          setDeleteList([]);
        }}
        title="Deletar"
        placeholder="Digite o nome do serviço"
        lista={deleteList}
        onSearch={async (name) => {
          const res = await Api.getServiceSearchName(name);
          const arr = res.data || [];
          setDeleteList(arr);
          return arr;
        }}
        onSelectItem={(service) => {
          handleServiceDelet(service.id);
        }}
        renderItem={(service) => (
          <InfoAndButtonRow>
            <InfoColumn>
              <InfoRow>
                <IconText numberOfLines={1} ellipsizeMode="tail">
                  {service.name}
                </IconText>
              </InfoRow>
            </InfoColumn>
            <AgendarButton onPress={() => handleServiceDelet(service.id)}>
              <AgendarButtonText>Deletar</AgendarButtonText>
            </AgendarButton>
          </InfoAndButtonRow>
        )}
      />

      <ServiceListModal
        visible={showListServiceModal}
        onClose={() => setShowListServiceModal(false)}
        title="Lista de Serviços"
        placeholder="Digite o nome do serviço"
        onSearch={async (name) => {
          if (name && name.trim() !== '') {
            const res = await Api.getServiceSearchName(name);
            return res || [];
          } else {
            const res = await Api.getServices();
            return res || [];
          }
        }}
        onSelectItem={(service) => {
          setSelectedService(service);
          setShowListServiceModal(false);
        }}
        renderItem={(service) => (
          <InfoAndButtonRow>
            <InfoColumn>
              <InfoRow>
                <IconText numberOfLines={1} ellipsizeMode="tail">
                  {service.name}
                </IconText>
              </InfoRow>
            </InfoColumn>
            <AgendarButton onPress={() => handleAgendar(service)}>
              <AgendarButtonText>Agendar</AgendarButtonText>
            </AgendarButton>
          </InfoAndButtonRow>
        )}
        lista={[]}
        initialData={[]}
      />

      {loading && <LoadingIcon size="large" color="#B4918F" />}
      
      {showEditServiceModal && selectedService?.id && (
        <FormEditModal
          visible={showEditServiceModal}
          onClose={() => setShowEditServiceModal(false)}
          initialData={selectedService}
          fields={[
            { name: 'name', placeholder: 'Nome Serviço', icon: PersonIcon }
          ]}
          onSave={async (srv) => {
            try {
              const json = await Api.UpdateService({ ...srv });
              if (json.success) {
                setSelectedService(json.service);
                Alert.alert('Sucesso', 'Serviço atualizado com sucesso.');
                await loadServices();
              } else {
                Alert.alert('Erro', json.error || 'Erro ao atualizar serviço.');
              }
            } catch (error) {
              console.error('Erro ao atualizar serviço:', error);
              Alert.alert('Erro', 'Erro inesperado ao atualizar serviço.');
            }
          }}
        />
      )}

      <BarberServiceConfigModal
        visible={showConfigServiceModal}
        onClose={() => setShowConfigServiceModal(false)}
      />
    </Container>
  );
}