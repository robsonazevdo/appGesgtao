import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DateInput({ value, onChange, placeholder, IconSvg, error }) {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      onChange(selectedDate.toISOString().split('T')[0]); // yyyy-mm-dd
    }
  };

  return (
    <TouchableOpacity onPress={() => setShowPicker(true)} style={[styles.inputArea, error && styles.errorBorder]}>
      {IconSvg && <IconSvg width="24" height="24" fill="#B4918F" />}
      <Text style={styles.inputText}>{value || placeholder}</Text>
      {showPicker && (
        <DateTimePicker
          mode="date"
          value={value ? new Date(value) : new Date()}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#956f6d',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    
  },
  inputText: {
    flex: 1,
    marginLeft: 10,
    color: '#B4918F',
    
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: 'red',
  },
});
