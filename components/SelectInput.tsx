import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';



export default function SelectInput({ selectedValue, onValueChange, options, placeholder, IconSvg, error }) {
  // Se options não for array, defina como array vazio
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <View style={[styles.container, error && styles.errorBorder]}>
      {IconSvg && <IconSvg width="24" height="24" fill="#B4918F" />}
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
      >
        <Picker.Item label={placeholder} value="" />
        {safeOptions.map((opt) => (
          <Picker.Item key={opt.id} label={opt.name} value={opt.id} />
        ))}
      </Picker>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    backgroundColor: '#956f6d',
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  picker: {
    flex: 1,
    marginLeft: 10,
    color:"#B4918F"

    
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: 'red',
  },
});
