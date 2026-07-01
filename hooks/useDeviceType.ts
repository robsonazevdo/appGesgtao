// hooks/useDeviceType.ts
import { useWindowDimensions } from 'react-native';

export const useDeviceType = () => {
  const { width, height } = useWindowDimensions();
  
  const isTablet = width >= 768;
  const isLandscape = width > height;
  
  return {
    isTablet,
    isLandscape,
    width,
    height,
    isSmallDevice: width < 375,
    isMediumDevice: width >= 375 && width < 768,
    isLargeDevice: width >= 768,
  };
};