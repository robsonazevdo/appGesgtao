import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, FlatList, Text } from 'react-native';
import Api from '../../Api';
import PersonAddIcon from '../../assets/images/add-folder.svg';
import BackIcon from '../../assets/images/back.svg';
import DeleteIcon from '../../assets/images/delete.svg';
import SearchIcon from '../../assets/images/search.svg';
import PersonIcon from '../../assets/images/person.svg';
import PriceIcon from '../../assets/images/price.svg';
import ProductIcon from '../../assets/images/product.svg';
import DollarIcon from '../../assets/images/dollar.svg';

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


const options = [
  { key: 'Buscar Produtos', label: 'Buscar Produtos', Icon: SearchIcon },
  { key: 'Cadastro Produtos', label: 'Cadastro Produtos', Icon: ProductIcon },
  { key: 'Atualizar Dados', label: 'Atualizar Dados', Icon: PersonAddIcon },
  { key: 'Delete Produtos', label: 'Delete Produtos', Icon: DeleteIcon },
];



export default function HomeProduto() {
  const navigation = useNavigation();
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [showSearchProdutoModal, setShowSearchProdutoModal] = useState(false);
  const [showUpdateProdutoModal, setShowUpdateProdutoModal] = useState(false);
  const [showDeleteProdutoModal, setShowDeleteProdutoModal] = useState(false);
  const [selectedProdutcs, setSelectedProdutcs] = useState<any | null>(null);
  const [showEditProdutcsModal, setShowEditProdutcsModal] = useState(false);
  const [deleteList, setDeleteList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  

  const handlePress = (key: string) => {
    if (key === 'Cadastro Produtos') {
      setShowProdutoModal(true);
    } else if (key === 'Buscar Produtos'){
      setShowSearchProdutoModal(true);
    }else if(key === 'Atualizar Dados'){
      setShowUpdateProdutoModal(true);
    }else if (key === 'Delete Produtos'){
      setShowDeleteProdutoModal(true);
    }else 
    {
      navigation.navigate(key as never);
    }
  };

const handleSaveProduto = async (data: { name: string; price: number; cost: number; unit: string; description: string; }) => {
  try {
    const res = await Api.setProducts({
      
      name: data.name,
      price: data.price,
      cost: data.cost,
      unit: data.unit,
      description: data.description
     
    });

    if (res.success) {
      Alert.alert('Sucesso', 'Produtos salvo com sucesso!');
      setShowProdutoModal(false);
    } else {
      Alert.alert('Erro', res.error || 'Erro ao salvar serviço');
    }

  } catch (error) {
    console.error('Erro ao salvar serviços:', error);
    Alert.alert('Erro', 'Erro inesperado ao salvar serviço');
  }
};


const handleServiceEditar = (service: any) => {
  setSelectedProdutcs({ ...service });
  
  setShowEditProdutcsModal(true);
};




const handleProdutcsDelet = (produtcsId: number) => {
  Alert.alert(
    'Confirmar Exclusão',
    'Tem certeza que deseja excluir este produto?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
        setLoading(true);
        try {
          const json = await Api.deleteProdutcs({ products_id: produtcsId });
          if (json.success) {
            
            setDeleteList([]);
            Alert.alert('Sucesso', 'Produtos excluído com sucesso.');
            
            setShowDeleteProdutoModal(false);
          } else {
            Alert.alert('Erro', json.error || 'Falha ao excluir o produto.');
          }
        } catch {
          Alert.alert('Erro', 'Não foi possível excluir o produto.');
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
          visible={showProdutoModal}
          title="Cadastro de Produtos"
          onClose={() => setShowProdutoModal(false)}
          onSave={(data) => {
            
           handleSaveProduto(data);
          }}
          fields={[
                  { name: 'name', placeholder: 'Nome do Produto', icon: PersonIcon },
                  { name: 'price', placeholder: 'Preço do Produto', icon: PriceIcon },
                  { name: 'cost', placeholder: 'Custo do Produto', icon: DollarIcon },
                  { name: 'unit', placeholder: 'Unidade', icon: PersonIcon },
                  { name: 'description', placeholder: 'Descrição', icon: PersonIcon },
                ]}

        />



      <SearchModal
        visible={showUpdateProdutoModal}
        onClose={() => setShowUpdateProdutoModal(false)}
        title="Atualizar"
        placeholder="Digite o nome do produto"
        onSearch={async (name) => {
          const res = await Api.getProdutcsSerch({ name });
          return res.data || [];
        } }
        onSelectItem={(service) => {
          setShowUpdateProdutoModal(false);
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
        visible={showDeleteProdutoModal}
        onClose={() => {
          setShowDeleteProdutoModal(false);
          setDeleteList([]);
        }}
        title="Deletar"
        placeholder="Digite o nome do produto"
        lista={deleteList}
        onSearch={async (name) => {
          const res = await Api.getProdutcsSerch({ name });
          const arr = res.data || [];
          setDeleteList(arr);
          return arr;
        }}
       onSelectItem={(produtcs) => {
          
          handleProdutcsDelet(produtcs.id);
        }}

        renderItem={(produtcs) => (
          <InfoAndButtonRow>
            <InfoColumn>
              <InfoRow>
                <IconText numberOfLines={1} ellipsizeMode="tail">
                  {produtcs.name}
                </IconText>
              </InfoRow>
            </InfoColumn>

            <AgendarButton onPress={() => handleProdutcsDelet(produtcs.id )}>

              <AgendarButtonText>Deletar</AgendarButtonText>
            </AgendarButton>
          </InfoAndButtonRow>
        )}
      />

      

        <SearchModal
        visible={showSearchProdutoModal}
        onClose={() => setShowSearchProdutoModal(false)}
        title="Buscar Produtos"
        placeholder="Digite o nome do serviço"
        onSearch={async (name) => {
          const res = await Api.getProdutcsSerch({ name });
          return res.data || [];
        } }
        onSelectItem={(service) => {
          setSelectedProdutcs(service);
          setShowSearchProdutoModal(false);

        } }
        renderItem={(service) => (
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{service.name}</Text>
        )} lista={[]}        />





          {loading && <LoadingIcon size="large" color="#B4918F" />}
          {showEditProdutcsModal && selectedProdutcs?.id && (
            <FormEditModal
              visible={showEditProdutcsModal}
              onClose={() => setShowEditProdutcsModal(false)}
              initialData={selectedProdutcs}
              fields={[
                { name: 'name', placeholder: 'Nome do Produto', icon: PersonIcon },
                  { name: 'price', placeholder: 'Preço do Produto', icon: PriceIcon },
                  { name: 'cost', placeholder: 'Custo do Produto', icon: DollarIcon },
                  { name: 'unit', placeholder: 'Unidade', icon: PersonIcon },
                  { name: 'description', placeholder: 'Descrição', icon: PersonIcon },
               
              ]}
             onSave={async (srv) => {
                try {
                  const json = await Api.UpdateProdutcs({ ...srv });
                  
                  if (json.success) {
                    setSelectedProdutcs(json.service);
                    Alert.alert('Sucesso', 'Produtos atualizado com sucesso.');
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



          

  

      
    </Container>
  );
}






