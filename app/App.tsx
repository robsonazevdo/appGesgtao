import React from 'react';
import Navigation from '../src/navigation';
import UserProvider from '../src/contexts/UserContext';

export default function App() {
  return (
    <UserProvider>
      <Navigation />
    </UserProvider>
  );
}
