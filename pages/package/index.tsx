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
  { key: 'Buscar Pacotes', label: 'Buscar Pacotes', Icon: SearchIcon },
  { key: 'Cadastro Pacotes', label: 'Cadastro Pacotes', Icon: ProductIcon },
  { key: 'Atualizar Dados', label: 'Atualizar Dados', Icon: PersonAddIcon },
  { key: 'Delete Pacotes', label: 'Delete Pacotes', Icon: DeleteIcon },
];



export default function HomePacotes() {
  const navigation = useNavigation();
  const [showPacotesModal, setShowPacotesModal] = useState(false);
  const [showSearchPacotesModal, setShowSearchPacotesModal] = useState(false);
  const [showUpdatePacotesModal, setShowUpdatePacotesModal] = useState(false);
  const [showDeletePacotesModal, setShowDeletePacotesModal] = useState(false);
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
    if (key === 'Cadastro Pacotes') {
      setShowPacotesModal(true);
    } else if (key === 'Buscar Pacotes'){
      setShowSearchPacotesModal(true);
    }else if(key === 'Atualizar Dados'){
      setShowUpdatePacotesModal(true);
    }else if (key === 'Delete Pacotes'){
      setShowDeletePacotesModal(true);
    }else 
    {
      navigation.navigate(key as never);
    }
  };

const handleSavePacotes = async (data: { product_id: number;
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
      Alert.alert('Sucesso', 'Pacotes salvo com sucesso!');
      setShowPacotesModal(false);
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






const handleStockDelet = (stockId: number) => {
  Alert.alert(
    'Confirmar Exclusão',
    'Tem certeza que deseja excluir este Pacotes?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
        setLoading(true);
        try {
          const json = await Api.deleteStock({ stock_id: stockId });
          if (json.success) {
            
            setDeleteList([]);
            Alert.alert('Sucesso', 'Pacotes excluído com sucesso.');
            
            setShowDeletePacotesModal(false);
          } else {
            Alert.alert('Erro', json.error || 'Falha ao excluir o Pacotes.');
          }
        } catch {
          Alert.alert('Erro', 'Não foi possível excluir o Pacotes.');
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
          visible={showPacotesModal}
          title="Cadastro de Pacotes"
          onClose={() => setShowPacotesModal(false)}
          onSave={(data) => {
            
           handleSavePacotes(data);
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
        visible={showUpdatePacotesModal}
        onClose={() => setShowUpdatePacotesModal(false)}
        title="Atualizar"
        placeholder="Digite o nome do produto"
        onSearch={async (name) => {
          const res = await Api.getStockSerch({ name });
          return res.data || [];
        } }
        onSelectItem={(service) => {
          setShowUpdatePacotesModal(false);
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
        visible={showDeletePacotesModal}
        onClose={() => {
          setShowDeletePacotesModal(false);
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
       onSelectItem={(stock) => {
          
          handleStockDelet(stock.id);
        }}

        renderItem={(stock) => (
          <InfoAndButtonRow>
            <InfoColumn>
              <InfoRow>
                <IconText numberOfLines={1} ellipsizeMode="tail">
                  {stock.product}
                </IconText>
              </InfoRow>
            </InfoColumn>

            <AgendarButton onPress={() => handleStockDelet(stock.id )}>

              <AgendarButtonText>Deletar</AgendarButtonText>
            </AgendarButton>
          </InfoAndButtonRow>
        )}
      />

      

        <SearchModal
        visible={showSearchPacotesModal}
        onClose={() => setShowSearchPacotesModal(false)}
        title="Buscar Pacotes"
        placeholder="Digite o nome Produto"
        onSearch={async (name) => {
          const res = await Api.getPackageSerch({ name });
          return res.data || [];
        } }
        onSelectItem={(service) => {
          setSelectedStock(service);
          setShowSearchPacotesModal(false);

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
                  { name: 'type', placeholder: 'Preço do Pacotes', icon: PriceIcon },
                  { name: 'quantity', placeholder: 'Custo do Pacotes', icon: DollarIcon },
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
                    Alert.alert('Sucesso', 'Pacotes atualizado com sucesso.');
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






