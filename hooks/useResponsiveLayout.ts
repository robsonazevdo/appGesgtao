// hooks/useResponsiveLayout.ts
import { useWindowDimensions } from 'react-native';

export const useResponsiveLayout = () => {
  const { width, height } = useWindowDimensions();
  
  const isTablet = width >= 768;
  const isLandscape = width > height;
  
  // Tamanhos responsivos
  const spacing = {
    small: isTablet ? 12 : 8,
    medium: isTablet ? 20 : 16,
    large: isTablet ? 32 : 24,
    xlarge: isTablet ? 48 : 32,
  };
  
  // Fontes responsivas
  const fontSize = {
    small: isTablet ? 14 : 12,
    medium: isTablet ? 18 : 16,
    large: isTablet ? 24 : 20,
    xlarge: isTablet ? 32 : 24,
    title: isTablet ? 28 : 22,
  };
  
  // Layout
  const layout = {
    numColumns: isTablet ? (isLandscape ? 3 : 2) : 1,
    cardWidth: isTablet 
      ? (isLandscape ? width / 3 - 24 : width / 2 - 24)
      : width - 32,
  };
  
  return {
    isTablet,
    isLandscape,
    spacing,
    fontSize,
    layout,
    width,
    height,
  };
};