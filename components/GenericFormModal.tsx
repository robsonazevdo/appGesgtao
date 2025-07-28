import React, { useState } from 'react';
import { Alert } from 'react-native';
import SignInput from './SignInput';
import BaseFormModal from './BaseFormModal';
import DateInput from './DateInput';
import SelectInput from './SelectInput';

interface Props<T> {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSave: (data: T) => void;
  validate?: (data: T) => boolean;
  fields: {
  name: keyof T;
  placeholder: string;
  icon: React.FC;
  type?: 'text' | 'select' | 'date';
  options?: { label: string; value: any }[]; // para select
}[]

}



export default function GenericFormModal<T extends Record<string, any>>({
  visible,
  title,
  onClose,
  onSave,
  fields,
  validate
}: Props<T>) {
  const [formData, setFormData] = useState<Partial<T>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    const errors: Record<string, boolean> = {};

    for (let field of fields) {
      const val = formData[field.name];
      if (val === undefined || val === '') {
        errors[String(field.name)] = true;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    

    const parsedData = { ...formData } as T;
    for (let field of fields) {
      const val = parsedData[field.name];
      if (typeof val === 'string' && /^\d+(\.\d+)?$/.test(val)) {
        parsedData[field.name] = Number(val) as any;
      }
    }

    if (validate && !validate(parsedData)) {
      return;
    }

    setFieldErrors({});
    onSave(parsedData);
    setFormData({});
  };

  return (
    <BaseFormModal visible={visible} title={title} onClose={onClose} onSave={handleSave}>
      {fields.map(({ name, placeholder, icon: Icon, type = 'text', options }) => {
  const value = formData[name] ?? '';

  // Campo SELECT
  if (type === 'select' && options) {
    return (
      <SelectInput
        key={String(name)}
        placeholder={placeholder}
        selectedValue={value}
        onValueChange={(val: any) =>
          setFormData((prev) => ({ ...prev, [name]: val }))
        }
        options={options}
        IconSvg={Icon}
        error={fieldErrors[String(name)]}
      />
    );
  }

  // Campo DATE
  if (type === 'date') {
    return (
      <DateInput
        key={String(name)}
        placeholder={placeholder}
        value={value}
        onChange={(val: any) =>
          setFormData((prev) => ({ ...prev, [name]: val }))
        }
        IconSvg={Icon}
        error={fieldErrors[String(name)]}
      />
    );
  }

  // Campo TEXT padrão
  return (
    <SignInput
      key={String(name)}
      placeholder={placeholder}
      value={value}
      onChangeText={(txt) => {
        let newValue = txt;

        if (name === 'phone') {
          newValue = txt.replace(/[^0-9]/g, '');
          if (newValue.length > 11) return;
          setFieldErrors((prev) => ({ ...prev, [name]: newValue.length < 10 }));
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
      }}
      IconSvg={Icon}
      error={fieldErrors[String(name)]}
    />
  );
})}

    </BaseFormModal>
  );
}
