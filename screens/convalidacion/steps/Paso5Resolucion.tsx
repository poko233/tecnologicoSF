import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@theme';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useConvalidacionContext } from '../context/ConvalidacionContext';
import { convalidacionService } from '../services/convalidacionService';
import type { Resolucion } from '../types';

export function Paso5Resolucion() {
  const { theme } = useTheme();
  const { solicitudId, retrocederPaso } = useConvalidacionContext();
  const [resolucion, setResolucion] = useState<Resolucion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (solicitudId) {
      loadResolucion();
    }
  }, [solicitudId]);

  const loadResolucion = async () => {
    if (!solicitudId) return;

    try {
      setLoading(true);
      const response = await convalidacionService.getSolicitud(solicitudId);
      const solicitud = response.data;

      setResolucion({
        detalles: solicitud.detalles.map((d: any) => ({
          nombre: d.materia_destino?.nombreMateria || d.materia_origen_nombre,
          creditos: d.materia_destino?.semestre || 0,
          estado: d.estado === 'pendiente' ? 'En revisión'
                : d.estado === 'aprobado' ? 'Aprobada'
                : d.estado === 'rechazado' ? 'Observada'
                : 'En revisión',
          observacion: d.observacion,
        })),
        observacion_resolucion: solicitud.observacion_resolucion,
        creditos_incorporados: 0,
        materias_acreditadas: 0,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'No se pudo cargar la resolución',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarReporte = () => {
    Toast.show({
      type: 'info',
      text1: 'Generando reporte',
      text2: 'Esta funcionalidad estará disponible pronto',
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Aprobada':
        return theme.colors.success;
      case 'En revisión':
        return theme.colors.warning;
      case 'Observada':
        return theme.colors.destructive;
      default:
        return theme.colors.textMuted;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[styles.loadingText, { color: theme.colors.textSecondary }]}
        >
          Cargando resolución...
        </Text>
      </View>
    );
  }

  if (!resolucion) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          No se encontró información de la resolución
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
        RESOLUCIÓN ACADÉMICA
      </Text>

      <View
        style={[
          styles.table,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.tableHeader}>
          <Text
            style={[
              styles.tableHeaderText,
              { color: theme.colors.textMuted, flex: 3 },
            ]}
          >
            MATERIA
          </Text>
          <Text
            style={[
              styles.tableHeaderText,
              { color: theme.colors.textMuted, width: 60, textAlign: 'center' },
            ]}
          >
            CR.
          </Text>
          <Text
            style={[
              styles.tableHeaderText,
              { color: theme.colors.textMuted, width: 120, textAlign: 'center' },
            ]}
          >
            ESTADO
          </Text>
        </View>

        {resolucion.detalles.map((detalle, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              { borderTopColor: theme.colors.border },
            ]}
          >
            <Text
              style={[styles.tableCell, { color: theme.colors.text, flex: 3 }]}
              numberOfLines={2}
            >
              {detalle.nombre}
            </Text>
            <Text
              style={[
                styles.tableCell,
                {
                  color: theme.colors.text,
                  width: 60,
                  textAlign: 'center',
                  fontWeight: 'bold',
                },
              ]}
            >
              {detalle.creditos}
            </Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: getEstadoColor(detalle.estado) + '20',
                  width: 120,
                  alignSelf: 'center',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: getEstadoColor(detalle.estado) },
                ]}
              >
                {detalle.estado}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.colors.textMuted }]}>
        OBSERVACIÓN DE LA COMISIÓN
      </Text>
      <TextInput
        style={[
          styles.input,
          styles.textArea,
          {
            backgroundColor: theme.colors.input,
            borderColor: theme.colors.inputBorder,
            color: theme.colors.text,
          },
        ]}
        value={resolucion.observacion_resolucion || ''}
        editable={false}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholder="Sin observaciones"
        placeholderTextColor={theme.colors.textMuted}
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            Nº DE RESOLUCIÓN
          </Text>
          <View
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.input,
                borderColor: theme.colors.inputBorder,
                justifyContent: 'center',
              },
            ]}
          >
            <Text style={{ color: theme.colors.text }}>
              {resolucion.numero_resolucion || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.halfField}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            DOCENTE REVISOR
          </Text>
          <View
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.input,
                borderColor: theme.colors.inputBorder,
                justifyContent: 'center',
              },
            ]}
          >
            <Text style={{ color: theme.colors.text }}>
              {resolucion.docente_revisor || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {resolucion.materias_acreditadas > 0 && (
        <View
          style={[
            styles.alert,
            { backgroundColor: theme.colors.success + '20' },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={theme.colors.success}
          />
          <Text style={[styles.alertText, { color: theme.colors.success }]}>
            Historial académico actualizado: {resolucion.materias_acreditadas}{' '}
            materia(s) acreditada(s) — {resolucion.creditos_incorporados}{' '}
            créditos incorporados.
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={retrocederPaso}
          style={[
            styles.button,
            styles.buttonOutline,
            { borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>
            ← Anterior
          </Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={handleGenerarReporte}
          style={[
            styles.button,
            styles.buttonFilled,
            { backgroundColor: theme.colors.info },
          ]}
        >
          <Text style={styles.buttonTextWhite}>Generar reporte ↗</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  table: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  tableCell: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 0.3,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfField: {
    flex: 1,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    gap: 10,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonOutline: {
    borderWidth: 1,
  },
  buttonFilled: {},
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextWhite: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
