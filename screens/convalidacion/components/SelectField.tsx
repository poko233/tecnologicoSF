// screens/convalidacion/components/SelectField.tsx
import { useTheme } from '@theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SelectFieldProps {
  value: string | number;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string | number }>;
  placeholder?: string;
  error?: string;
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder = 'Seleccione una opción',
  error,
}: SelectFieldProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.selectWrapper,
          {
            backgroundColor: theme.colors.input,
            borderColor: error ? theme.colors.destructive : theme.colors.inputBorder,
          },
        ]}
      >
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            backgroundColor: theme.colors.input,
            border: 'none',
            color: theme.colors.text,
            fontSize: 15,
            outline: 'none',
            width: '100%',
            height: '100%',
            padding: '12px',
            cursor: 'pointer',
          }}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </View>
      {error && <Text style={[styles.errorText, { color: theme.colors.destructive }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    overflow: 'hidden',
  },
  errorText: {
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
});
