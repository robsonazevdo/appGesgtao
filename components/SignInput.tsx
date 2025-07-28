import React from 'react';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components/native';

const InputArea = styled.View<{ error?: boolean }>`
  width: 100%;
  height: 60px;
  background-color: #956f6d;
  border-radius: 30px;
  flex-direction: row;
  align-items: center;
  padding-left: 15px;
  margin-bottom: 15px;
  border: 2px solid ${({ error }) => (error ? '#f00' : '#fff')};
`;

const Input = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: #fff;
  margin-left: 10px;
`;

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  IconSvg: React.FC<any>; // <- Garantir que aceita props SVG como `width`, `height`, `fill`
  error?: boolean;
}

export default function SignInput({ placeholder, value, onChangeText, IconSvg, error }: Props) {
  return (
    <InputArea error={error}>
      <IconSvg width={24} height={24} fill="#B4918F" />
      <Input
        placeholder={placeholder}
        placeholderTextColor="#B4918F"
        value={value}
        onChangeText={onChangeText}
        keyboardType={placeholder.toLowerCase().includes('telefone') ? 'phone-pad' : 'default'}
      />
    </InputArea>
  );
}
