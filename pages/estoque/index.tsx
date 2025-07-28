import { useNavigation } from '@react-navigation/native';
import { Alert, FlatList, Text } from 'react-native';
import { useEffect, useState } from 'react';
import Api from '../../Api';
import PersonAddIcon from '../../assets/images/add-folder.svg';
import BackIcon from '../../assets/images/back.svg';
import DeleteIcon from '../../assets/images/delete.svg';
import SearchIcon from '../../assets/images/search.svg';
import PersonIcon from '../../assets/images/person.svg';
import PriceIcon from '../../assets/images/price.svg';
import ProductIcon from '../../assets/images/product.svg';
import DollarIcon from '../../assets/images/dollar.svg';
import { format } from 'date-fns';

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
  { key: 'Buscar Estoque', label: 'Buscar Estoque', Icon: SearchIcon },
  { key: 'Cadastro Estoque', label: 'Cadastro Estoque', Icon: ProductIcon },
  { key: 'Atualizar Dados', label: 'Atualizar Dados', Icon: PersonAddIcon },
  { key: 'Delete Estoque', label: 'Delete Estoque', Icon: DeleteIcon },
];



export default function HomeEstoque() {
  const navigation = useNavigation();
  const [showEstoqueModal, setShowEstoqueModal] = useState(false);
  const [showSearchEstoqueModal, setShowSearchEstoqueModal] = useState(false);
  const [showUpdateEstoqueModal, setShowUpdateEstoqueModal] = useState(false);
  const [showDeleteEstoqueModal, setShowDeleteEstoqueModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any | null>(null);
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [deleteList, setDeleteList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [productOptions, setProductOptions] = useState<any[]>([]);
  

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
  const loadOptions = async () => {
    try {
      const res = await Api.getProductOptions();
      setProductOptions(res.data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  };

  loadOptions();
}, []); // ← Executa apenas uma vez

  const handlePress = (key: string) => {
    if (key === 'Cadastro Estoque') {
      setShowEstoqueModal(true);
    } else if (key === 'Buscar Estoque'){
      setShowSearchEstoqueModal(true);
    }else if(key === 'Atualizar Dados'){
      setShowUpdateEstoqueModal(true);
    }else if (key === 'Delete Estoque'){
      setShowDeleteEstoqueModal(true);
    }else 
    {
      navigation.navigate(key as never);
    }
  };

const handleSaveEstoque = async (data: { product_id: number;
  quantity: number;
  type: 'entrada' | 'saida';
  description: string;
  date: string; }) => {

  try {
    const res = await Api.setStock({
      
      product_id: data.product_id,
      quantity: data.quantity,
      type: data.type,
      description:data.description,
      date: new Date(data.date).toISOString(), 
     
    });

    if (res.success) {
      Alert.alert('Sucesso', 'Estoque salvo com sucesso!');
      setShowEstoqueModal(false);
    } else {
      Alert.alert('Erro', res.error || 'Erro ao salvar serviço');
    }

  } catch (error) {
    console.error('Erro ao salvar serviços:', error);
    Alert.alert('Erro', 'Erro inesperado ao salvar serviço');
  }
};


const handleServiceEditar = (service: any) => {
  setSelectedStock({ ...service });
  
  setShowEditStockModal(true);
};






const handleStockDelet = (produtcsId: number) => {
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
          const json = await Api.deleteStock({ products_id: produtcsId });
          if (json.success) {
            
            setDeleteList([]);
            Alert.alert('Sucesso', 'Estoque excluído com sucesso.');
            
            setShowDeleteEstoqueModal(false);
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
          visible={showEstoqueModal}
          title="Cadastro de Estoque"
          onClose={() => setShowEstoqueModal(false)}
          onSave={(data) => {
            
           handleSaveEstoque(data);
          }}
          fields={[
              {
                name: 'product_id',
                placeholder: 'Produto',
                icon: PersonIcon,
                type: 'select',
                options: productOptions
                
              },
              { name: 'quantity', placeholder: 'Quantidade', icon: PriceIcon },
              { name: 'type', placeholder: 'entrada | saida', icon: DollarIcon },
              { name: 'description', placeholder: 'Descrição', icon: PriceIcon },
              {
                name: 'date',
                placeholder: 'Data',
                icon: PersonIcon,
                type: 'date' // custom type handled by your modal
              },
            ]}


        />



      <SearchModal
        visible={showUpdateEstoqueModal}
        onClose={() => setShowUpdateEstoqueModal(false)}
        title="Atualizar"
        placeholder="Digite o nome do produto"
        onSearch={async (name) => {
          const res = await Api.getStockSerch({ name });
          return res.data || [];
        } }
        onSelectItem={(service) => {
          setShowUpdateEstoqueModal(false);
          handleServiceEditar(service);
        } }

        renderItem={(service) => (
          <InfoAndButtonRow>
            <InfoColumn>
              <InfoRow>
                <IconText numberOfLines={1} ellipsizeMode="tail">
                  {service.product}
                </IconText>
              </InfoRow>
            </InfoColumn>

            <AgendarButton onPress={() => handleServiceEditar({ ...service })}>

              <AgendarButtonText>Editar</AgendarButtonText>
            </AgendarButton>
          </InfoAndButtonRow>
        )} lista={[]}      />


      <SearchModal
        visible={showDeleteEstoqueModal}
        onClose={() => {
          setShowDeleteEstoqueModal(false);
          setDeleteList([]);
        }}
        title="Deletar"
        placeholder="Digite o nome do produto"
        lista={deleteList}
        onSearch={async (name) => {
          const res = await Api.getStockSerch({ name });
          const arr = res.data || [];
          setDeleteList(arr);
          return arr;
        }}
       onSelectItem={(produtcs) => {
          
          handleStockDelet(produtcs.id);
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

            <AgendarButton onPress={() => handleStockDelet(produtcs.id )}>

              <AgendarButtonText>Deletar</AgendarButtonText>
            </AgendarButton>
          </InfoAndButtonRow>
        )}
      />

      

        <SearchModal
        visible={showSearchEstoqueModal}
        onClose={() => setShowSearchEstoqueModal(false)}
        title="Buscar Estoque"
        placeholder="Digite o nome Produto"
        onSearch={async (name) => {
          const res = await Api.getStockSerch({ name });
          return res.data || [];
        } }
        onSelectItem={(service) => {
          setSelectedStock(service);
          setShowSearchEstoqueModal(false);

        } }
        renderItem={(service) => (
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{service.product}| Qtd. {service.quantity}</Text>
        )} lista={[]}        />








          {loading && <LoadingIcon size="large" color="#B4918F" />}
          {showEditStockModal && selectedStock?.id && (
            <FormEditModal
              visible={showEditStockModal}
              onClose={() => setShowEditStockModal(false)}
              initialData={{
    ...selectedStock,
    datetime: new Date(selectedStock.datetime).toISOString(), // garantir formato
  }}
              
              fields={[
                { name: 'product', placeholder: 'Nome do pro', icon: PersonIcon },
                  { name: 'type', placeholder: 'Preço do Estoque', icon: PriceIcon },
                  { name: 'quantity', placeholder: 'Custo do Estoque', icon: DollarIcon },
                  { name: 'description', placeholder: 'Unidade', icon: PersonIcon },
                  {
                    name: 'datetime',
                    placeholder: 'Data',
                    icon: PersonIcon,
                    type: 'date', 
                  }
                            
              ]}
             onSave={async (srv) => {
                try {
                  console.log(srv)
                  const json = await Api.UpdateStock({ ...srv });
                  
                  if (json.success) {
                    setSelectedStock(json.service);
                    Alert.alert('Sucesso', 'Estoque atualizado com sucesso.');
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






