import { useTheme } from '@theme';
import { LucideProps } from 'lucide-react-native';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from 'react-native';

interface CampoTextoEmpresaProps extends Omit<TextInputProps, 'style'> {
  etiqueta: string;
  error?: string;
  multilinea?: boolean;
  /** Ícono que se muestra a la derecha del campo (ej. teléfono, email, ubicación). */
  icono?: React.ComponentType<LucideProps>;
}

/**
 * Input de texto estandarizado: label en negrita arriba, campo con
 * borde redondeado y un ícono circular a la derecha (estilo
 * "tarjeta de contacto").
 */
export function CampoTextoEmpresa({
  etiqueta,
  error,
  multilinea = false,
  icono: Icono,
  ...inputProps
}: CampoTextoEmpresaProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.contenedor}>
      <Text style={[styles.etiqueta, { color: theme.colors.text }]}>
        {etiqueta}
      </Text>

      <View style={styles.fila}>
        <TextInput
          {...inputProps}
          multiline={multilinea}
          numberOfLines={multilinea ? 4 : 1}
          placeholderTextColor={theme.colors.textMuted}
          style={[
            styles.campo,
            {
              backgroundColor: theme.colors.input,
              borderColor: error
                ? theme.colors.destructive
                : theme.colors.inputBorder,
              color: theme.colors.text,
            },
            multilinea && styles.campoMultilinea,
            Icono && styles.campoConIcono,
          ]}
        />

        {Icono && (
          <View
            style={[
              styles.iconoCirculo,
              {
                backgroundColor: theme.colors.primarySubtle,
                borderColor: theme.colors.inputBorder,
              },
            ]}
          >
            <Icono size={18} color={theme.colors.primary} />
          </View>
        )}
      </View>

      {error && (
        <Text style={[styles.error, { color: theme.colors.destructive }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 6,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '700',
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  campo: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  campoConIcono: {
    paddingRight: 14,
  },
  campoMultilinea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  iconoCirculo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontSize: 12,
  },
});