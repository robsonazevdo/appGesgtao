import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DateInput({ value, onChange, placeholder, IconSvg, error }) {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [tempDate, setTempDate] = useState(value ? new Date(value) : new Date());

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'set') {
      const currentDate = selectedDate || tempDate;
      setTempDate(currentDate);
      setShowDate(false);
      setShowTime(true);
    } else {
      setShowDate(false);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (event.type === 'set') {
      const newDate = new Date(tempDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setShowTime(false);
      onChange(newDate.toISOString());
    } else {
      setShowTime(false);
    }
  };

  const formattedValue = value
    ? new Date(value).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : placeholder;

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowDate(true)}
        style={[styles.inputArea, error && styles.errorBorder]}>
        {IconSvg && <IconSvg width="24" height="24" fill="#B4918F" />}
        <Text style={styles.inputText}>{formattedValue}</Text>
      </TouchableOpacity>

      {showDate && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showTime && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </>
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
