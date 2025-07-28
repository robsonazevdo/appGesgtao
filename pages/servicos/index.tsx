import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, FlatList, Text } from 'react-native';
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
  Logo
} from './styles';

import ClientOptionCard from '../../components/ClientOption';

import SearchModal from '@/components/SearchModal';
import { LoadingIcon } from '@/src/screens/home/styles';
import { FormEditModal } from '@/components/BaseFormEditModal';
import GenericFormModal from '@/components/GenericFormModal';
import BarberServiceConfigModal from '@/src/screens/barberServiceConfig/BarberServiceConfigModal';

const options = [
  { key: 'Buscar Serviço', label: 'Buscar Serviço', Icon: SearchIcon },
  { key: 'Cadastro Serviço', label: 'Cadastro Serviço', Icon: ServiveIcon },
  { key: 'Atualizar Dados', label: 'Atualizar Dados', Icon: PersonAddIcon },
  { key: 'Delete Serviço', label: 'Delete Serviço', Icon: DeleteIcon },
  { key: 'Configurações Serviço', label: 'Configurações Serviço', Icon: ConfigIcon },
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
  const [showConfigServiceModal, setShowConfigServiceModal] = useState(false);
 

  const handlePress = (key: string) => {
    if (key === 'Cadastro Serviço') {
      setShowServicoModal(true);
    } else if (key === 'Buscar Serviço'){
      setShowSearchServicoModal(true);
    }else if(key === 'Atualizar Dados'){
      setShowUpdateServicoModal(true);
    }else if (key === 'Delete Serviço'){
      setShowDeleteServicoModal(true);
    }else if (key === 'Configurações Serviço'){
      setShowConfigServiceModal(true);
    }else
    {
      navigation.navigate(key as never);
    }
  };

const handleSaveServico = async (data: { name: string; }) => {
  try {
    const res = await Api.setServices({
      
      name: data.name,
     
    });

    if (res.success) {
      Alert.alert('Sucesso', 'Serviço salvo com sucesso!');
      setShowServicoModal(false);
    } else {
      Alert.alert('Erro', res.error || 'Erro ao salvar serviço');
    }

  } catch (error) {
    console.error('Erro ao salvar serviços:', error);
    Alert.alert('Erro', 'Erro inesperado ao salvar serviço');
  }
};


const handleServiceEditar = (service: any) => {
  setSelectedService({ ...service });
  console.log('Editando serviço:', service);
  setShowEditServiceModal(true);
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

 

  return (
    <Container>
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
        />
      </FormArea>

      

      <GenericFormModal
          visible={showServicoModal}
          title="Cadastro de Serviço"
          onClose={() => setShowServicoModal(false)}
          onSave={(data) => {
            
           handleSaveServico(data);
          }}
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
          const res = await Api.getServiceSerch({ name });
          return res.data || [];
        } }
        onSelectItem={(service) => {
          setShowUpdateServicoModal(false);
          handleServiceEditar(service);
        } }

        renderItem={(service) => (
          <InfoAndButtonRow>
            <InfoColumn>
              <InfoRow>
                <IconText numberOfLines={1} ellipsizeMode="tail">
                  {service.name}
                </IconText>
              </InfoRow>
            </InfoColumn>

            <AgendarButton onPress={() => handleServiceEditar({ ...service })}>

              <AgendarButtonText>Editar</AgendarButtonText>
            </AgendarButton>
          </InfoAndButtonRow>
        )} lista={[]}      />


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
          const res = await Api.getServiceSerch({ name });
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

            <AgendarButton onPress={() => handleServiceDelet(service.id )}>

              <AgendarButtonText>Deletar</AgendarButtonText>
            </AgendarButton>
          </InfoAndButtonRow>
        )}
      />

      

        <SearchModal
        visible={showSearchServicoModal}
        onClose={() => setShowSearchServicoModal(false)}
        title="Buscar Serviço"
        placeholder="Digite o nome do serviço"
        onSearch={async (name) => {
          const res = await Api.getServiceSerch({ name });
          return res.data || [];
        } }
        onSelectItem={(service) => {
          setSelectedService(service);
          setShowSearchServicoModal(false);

        } }
        renderItem={(service) => (
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{service.name}</Text>
        )} lista={[]}        />





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
           onClose={() => setShowConfigServiceModal(false)}/>

      
    </Container>
  );
}






