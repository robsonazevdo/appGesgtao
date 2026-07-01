// components/ResponsiveContainer.tsx
import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

export const ResponsiveContainer = ({ children }: { children: React.ReactNode }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  
  return (
    <View style={[
      styles.container,
      isTablet && styles.tabletContainer
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabletContainer: {
    padding: 32,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
});