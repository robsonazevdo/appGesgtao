import React from 'react';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';

export const Container = styled(LinearGradient).attrs({
  colors: ['#b4918f', '#956f6d'], // de cima para baixo
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
})`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const LoadingIcon = styled.ActivityIndicator`
    margin-top: 50px;
`;

export const Logo = styled.Image`
    width: 100%;
    height:160px;
`;