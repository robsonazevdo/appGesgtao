import React, { useEffect, useState, useContext } from "react";
import { Alert, ActivityIndicator, TextInput, ScrollView, Platform } from "react-native";
import { useNavigation, CommonActions } from '@react-navigation/native';
import { File, Directory, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styled from "styled-components/native";

import { Container } from "@/components/GradientHeader";
import Api from "@/Api";
import { UserContext } from "../../contexts/UserContext";

// ---------------- STYLES ----------------

const Header = styled.View`
  padding: 25px;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 22px;
  color: white;
  font-weight: bold;
`;

const Card = styled.View`
  background: white;
  margin: 20px;
  padding: 20px;
  border-radius: 12px;
`;

const Field = styled.View`
  margin-bottom: 18px;
`;

const Label = styled.Text`
  font-size: 14px;
  color: #888;
  margin-bottom: 6px;
`;

const Input = styled.TextInput`
  font-size: 16px;
  color: #333;
  border-bottom-width: 1px;
  border-bottom-color: #ddd;
  padding-bottom: 6px;
`;

const Button = styled.TouchableOpacity`
  background: #956f6d;
  padding: 14px;
  border-radius: 8px;
  margin-top: 10px;
`;

const ButtonOutline = styled.TouchableOpacity`
  background: transparent;
  padding: 14px;
  border-radius: 8px;
  margin-top: 10px;
  border: 1px solid #956f6d;
`;

const ButtonOutlineText = styled.Text`
  color: #956f6d;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

const LogoutButton = styled.TouchableOpacity`
  background: #d9534f;
  padding: 14px;
  border-radius: 8px;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const LogoutButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

const Divider = styled.View`
  height: 1px;
  background-color: #e0e0e0;
  margin: 20px 0;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
`;

const BackupInfo = styled.Text`
  font-size: 12px;
  color: #888;
  text-align: center;
  margin-top: 10px;
`;

const ScrollContainer = styled(ScrollView)`
  flex: 1;
`;

// ---------------- SCREEN ----------------

export default function PerfilScreen() {
  const navigation = useNavigation();
  const { dispatch: userDispatch } = useContext(UserContext);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await Api.getProfile();
        setName(data.name || "");
        setEmail(data.email || "");
      } catch {
        Alert.alert("Erro", "Não foi possível carregar perfil");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function salvar() {
    if (!name.trim()) {
      Alert.alert("Erro", "Nome é obrigatório");
      return;
    }
    
    if (!email.trim()) {
      Alert.alert("Erro", "Email é obrigatório");
      return;
    }
    
    try {
      setLoading(true);
      await Api.updateProfile(name, email);
      Alert.alert("Sucesso", "Perfil atualizado com sucesso");
    } catch {
      Alert.alert("Erro", "Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  }
 const handleLogout = async () => {
    Alert.alert(
      "Confirmar Logout",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              setLogoutLoading(true);
              
              await Api.logout();
              
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('userEmail');
              await AsyncStorage.removeItem('userName');
              
              userDispatch({
                type: 'setAvatar',
                payload: { avatar: '' },
              });
              
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'SignIn' }],
                })
              );
              
              Alert.alert("Sucesso", "Logout realizado com sucesso!");
            } catch (error) {
              console.error("Erro ao fazer logout:", error);
              Alert.alert("Erro", "Não foi possível fazer logout");
            } finally {
              setLogoutLoading(false);
            }
          }
        }
      ]
    );
  };

  // ========== BACKUP DO BANCO DE DADOS ==========

  // Exportar backup com escolha de local (usando Sharing)
  const exportBackupWithChoice = async () => {
    try {
      setBackupLoading(true);
      
      const dbPath = `${FileSystem.documentDirectory}SQLite/barbearia.db`;
      const dbInfo = await FileSystem.getInfoAsync(dbPath);
      
      if (!dbInfo.exists) {
        Alert.alert("Erro", "Banco de dados não encontrado");
        return;
      }
      
      const date = new Date();
      const fileName = `barbearia_backup_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}.db`;
      
      // Criar arquivo temporário
      const tempDir = new Directory(Paths.cache, 'temp_backups');
      tempDir.create({ idempotent: true, intermediates: true });
      
      const tempFile = new File(tempDir, fileName);
      await FileSystem.copyAsync({ from: dbPath, to: tempFile.uri });
      
      // Compartilhar - permite escolher onde salvar
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(tempFile.uri, {
          mimeType: 'application/x-sqlite3',
          dialogTitle: 'Escolha onde salvar o backup',
        });
      } else {
        Alert.alert("Erro", "Compartilhamento não disponível");
      }
      
      // Limpar arquivo temporário
      setTimeout(async () => {
        try { await tempFile.delete(); } catch (e) {}
      }, 5000);
      
      Alert.alert("Sucesso", "Backup exportado com sucesso!");
      
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setBackupLoading(false);
    }
  };

  // Importar backup escolhendo o arquivo
  const importBackupWithChoice = async () => {
    try {
      setBackupLoading(true);
      
      // Usar DocumentPicker para escolher o arquivo
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/x-sqlite3', 'application/octet-stream', '*/*'],
        copyToCacheDirectory: true
      });
      
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('📁 Arquivo selecionado:', asset.name);
        
        Alert.alert(
          "Importar Backup",
          `⚠️ ATENÇÃO: Isso substituirá TODO o banco de dados atual!\n\nArquivo: ${asset.name}\n\nTem certeza?`,
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Importar",
              style: "destructive",
              onPress: async () => {
                try {
                  const dbPath = `${FileSystem.documentDirectory}SQLite/barbearia.db`;
                  
                  // Fazer backup do banco atual
                  await FileSystem.copyAsync({
                    from: dbPath,
                    to: `${FileSystem.documentDirectory}SQLite/barbearia_backup_antes_import.db`
                  });
                  
                  // Copiar arquivo selecionado
                  await FileSystem.copyAsync({
                    from: asset.uri,
                    to: dbPath
                  });
                  
                  Alert.alert("Sucesso", "Backup importado! O app vai reiniciar.");
                  
                  setTimeout(() => {
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'SignIn' }],
                      })
                    );
                  }, 2000);
                  
                } catch (error) {
                  Alert.alert("Erro", error.message);
                }
              }
            }
          ]
        );
      } else if (result.type === 'cancel') {
        console.log('Usuário cancelou');
      } else {
        Alert.alert("Erro", "Não foi possível selecionar o arquivo");
      }
      
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setBackupLoading(false);
    }
  };

  // Salvar backup localmente
  const saveLocalBackup = async () => {
    try {
      setBackupLoading(true);
      
      const dbPath = `${FileSystem.documentDirectory}SQLite/barbearia.db`;
      const dbInfo = await FileSystem.getInfoAsync(dbPath);
      
      if (!dbInfo.exists) {
        Alert.alert("Erro", "Banco de dados não encontrado");
        return;
      }
      
      const backupDir = new Directory(Paths.document, 'meus_backups');
      backupDir.create({ idempotent: true, intermediates: true });
      
      const date = new Date();
      const fileName = `backup_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.db`;
      const backupFile = new File(backupDir, fileName);
      
      await FileSystem.copyAsync({ from: dbPath, to: backupFile.uri });
      
      Alert.alert(
        "Sucesso", 
        `Backup salvo em:\n${backupDir.uri}\n\nArquivo: ${fileName}\n\nTamanho: ${(dbInfo.size / 1024).toFixed(2)} KB`
      );
      
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setBackupLoading(false);
    }
  };

  // Listar backups locais
  const listLocalBackups = async () => {
    try {
      const backupDir = new Directory(Paths.document, 'meus_backups');
      
      if (backupDir.exists) {
        const files = backupDir.list();
        const backupFiles = files.filter(f => f.name.endsWith('.db'));
        
        if (backupFiles.length === 0) {
          Alert.alert("Backups", "Nenhum backup encontrado");
        } else {
          const backupsList = backupFiles.map((f, i) => 
            `${i + 1}. 📁 ${f.name}\n   Tamanho: ${(f.size / 1024).toFixed(2)} KB`
          ).join('\n\n');
          
          Alert.alert("Backups Disponíveis", backupsList);
        }
      } else {
        Alert.alert("Backups", "Nenhum backup encontrado");
      }
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  // Restaurar backup local
  const restoreLocalBackup = async () => {
    try {
      const backupDir = new Directory(Paths.document, 'meus_backups');
      
      if (!backupDir.exists) {
        Alert.alert("Erro", "Nenhum backup encontrado");
        return;
      }
      
      const files = backupDir.list();
      const backupFiles = files.filter(f => f.name.endsWith('.db'));
      
      if (backupFiles.length === 0) {
        Alert.alert("Erro", "Nenhum backup encontrado");
        return;
      }
      
      // Mostrar lista para escolher
      const options = backupFiles.map((f, i) => ({
        text: f.name,
        onPress: async () => {
          try {
            const dbPath = `${FileSystem.documentDirectory}SQLite/barbearia.db`;
            
            // Backup atual
            await FileSystem.copyAsync({
              from: dbPath,
              to: `${FileSystem.documentDirectory}SQLite/barbearia_backup_antes_restore.db`
            });
            
            // Restaurar
            await FileSystem.copyAsync({
              from: f.uri,
              to: dbPath
            });
            
            Alert.alert("Sucesso", "Backup restaurado! O app vai reiniciar.");
            
            setTimeout(() => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'SignIn' }],
                })
              );
            }, 2000);
            
          } catch (error) {
            Alert.alert("Erro", error.message);
          }
        }
      }));
      
      Alert.alert(
        "Escolha um backup",
        "Selecione qual backup deseja restaurar:",
        [...options, { text: "Cancelar", style: "cancel" }]
      );
      
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Meu Perfil</Title>
        </Header>
        <ActivityIndicator size="large" color="#956f6d" style={{ marginTop: 50 }} />
      </Container>
    );
  }

  return (
    <Container>
      <ScrollContainer 
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Header>
          <Title>Meu Perfil</Title>
        </Header>

        <Card>
          <Field>
            <Label>Nome</Label>
            <Input value={name} onChangeText={setName} />
          </Field>

          <Field>
            <Label>E-mail</Label>
            <Input
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </Field>

          <Button onPress={salvar}>
            <ButtonText>Salvar Alterações</ButtonText>
          </Button>

          <Divider />

          <SectionTitle>Backup do Banco de Dados</SectionTitle>
          
          <ButtonOutline onPress={exportBackupWithChoice} disabled={backupLoading}>
            <ButtonOutlineText>
              {backupLoading ? "Exportando..." : "📤 Exportar Backup (Escolher Local)"}
            </ButtonOutlineText>
          </ButtonOutline>
          
          <ButtonOutline onPress={saveLocalBackup} disabled={backupLoading}>
            <ButtonOutlineText>
              {backupLoading ? "Salvando..." : "💾 Salvar Backup Local"}
            </ButtonOutlineText>
          </ButtonOutline>
          
          <ButtonOutline onPress={importBackupWithChoice} disabled={backupLoading}>
            <ButtonOutlineText>
              {backupLoading ? "Importando..." : "📥 Importar Backup (Escolher Arquivo)"}
            </ButtonOutlineText>
          </ButtonOutline>
          
          <ButtonOutline onPress={listLocalBackups} disabled={backupLoading}>
            <ButtonOutlineText>
              📋 Listar Backups Locais
            </ButtonOutlineText>
          </ButtonOutline>
          
          <ButtonOutline onPress={restoreLocalBackup} disabled={backupLoading}>
            <ButtonOutlineText>
              🔄 Restaurar Backup Local
            </ButtonOutlineText>
          </ButtonOutline>
          
          <BackupInfo>
            ⚠️ Exportar Backup: salva o arquivo .db onde você quiser (Drive, WhatsApp, Email, etc)\n
            ⚠️ Importar Backup: selecione um arquivo .db para restaurar\n
            ⚠️ Backup Local: salva/restaura na pasta do aplicativo
          </BackupInfo>

          <Divider />

          <LogoutButton onPress={handleLogout} disabled={logoutLoading}>
            <LogoutButtonText>
              {logoutLoading ? "Saindo..." : "🚪 Sair do Aplicativo"}
            </LogoutButtonText>
          </LogoutButton>
        </Card>
      </ScrollContainer>
    </Container>
  );
}