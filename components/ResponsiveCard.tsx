// components/ResponsiveCard.tsx
import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

export const ResponsiveCard = ({ children }: { children: React.ReactNode }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  
  return (
    <View style={[
      styles.card,
      isTablet && styles.tabletCard
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabletCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
});