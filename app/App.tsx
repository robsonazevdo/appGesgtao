import React, { useEffect } from 'react';
import Navigation from '../src/navigation/index';
import UserProvider from '../src/contexts/UserContext';
import { initDatabase, loadInitialData } from '../Api';


export default function App() {
  useEffect(() => {
    const setup = async () => {
      await initDatabase();
      await loadInitialData(); // Carrega os dados iniciais
    };
    setup().catch(console.error);
  }, []);

  return (
    <UserProvider>
      <Navigation />
    </UserProvider>
  );
}