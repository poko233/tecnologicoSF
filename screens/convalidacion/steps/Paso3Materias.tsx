import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@theme';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { SelectField } from '../components/SelectField';
import { useConvalidacionContext } from '../context/ConvalidacionContext';
import { usePaso3Materias } from '../hooks/usePaso3Materias';

export function Paso3Materias() {
  const { theme } = useTheme();
  const { solicitudId, idCarreraDestino, avanzarPaso, retrocederPaso } =
    useConvalidacionContext();
  const { materias, detalles, loading, loadingData, agregarMateria, eliminarMateria } =
    usePaso3Materias(solicitudId, idCarreraDestino);

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    materia_origen_nombre: '',
    materia_origen_institucion: '',
    nota_origen: '',
    idMateriaDestino: null as number | null,
  });

  const resetForm = () => {
    setFormData({
      materia_origen_nombre: '',
      materia_origen_institucion: '',
      nota_origen: '',
      idMateriaDestino: null,
    });
  };

  const handleAgregarMateria = async () => {
    if (
      !formData.materia_origen_nombre.trim() ||
      !formData.materia_origen_institucion.trim() ||
      !formData.nota_origen ||
      !formData.idMateriaDestino
    ) {
      Toast.show({
        type: 'error',
        text1: 'Campos incompletos',
        text2: 'Complete todos los campos requeridos',
      });
      return;
    }

    const success = await agregarMateria({
      ...formData,
      nota_origen: parseFloat(formData.nota_origen),
      idMateriaDestino: formData.idMateriaDestino!,
    });

    if (success) {
      setModalVisible(false);
      resetForm();
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Aprobada':
        return theme.colors.success;
      case 'Pendiente':
        return theme.colors.warning;
      case 'Observada':
        return theme.colors.destructive;
      default:
        return theme.colors.textMuted;
    }
  };

  const getNotaColor = (nota: number) => {
    return nota >= 60 ? theme.colors.success : theme.colors.warning;
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[styles.loadingText, { color: theme.colors.textSecondary }]}
        >
          Cargando materias...
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
          MATERIAS A CONVALIDAR
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
                { color: theme.colors.textMuted, flex: 2 },
              ]}
            >
              MATERIA DE ORIGEN
            </Text>
            <Text
              style={[
                styles.tableHeaderText,
                { color: theme.colors.textMuted, flex: 1.5 },
              ]}
            >
              INSTITUCIÓN
            </Text>
            <Text
              style={[
                styles.tableHeaderText,
                { color: theme.colors.textMuted, width: 60, textAlign: 'center' },
              ]}
            >
              NOTA
            </Text>
            
            <Text
              style={[
                styles.tableHeaderText,
                { color: theme.colors.textMuted, width: 30, textAlign: 'center' },
              ]}
            >
              →
            </Text>
            <Text
              style={[
                styles.tableHeaderText,
                { color: theme.colors.textMuted, flex: 2 },
              ]}
            >
              MATERIA DESTINO
            </Text>
            <Text
              style={[
                styles.tableHeaderText,
                { color: theme.colors.textMuted, width: 100, textAlign: 'center' },
              ]}
            >
              ESTADO
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {detalles.map((detalle) => {
            const materiaDestino = materias.find(
              (m) => m.idMateria === detalle.idMateriaDestino
            );
            return (
              <View
                key={detalle.id}
                style={[
                  styles.tableRow,
                  { borderTopColor: theme.colors.border },
                ]}
              >
                <Text
                  style={[styles.tableCell, { color: theme.colors.text, flex: 2 }]}
                  numberOfLines={1}
                >
                  {detalle.materia_origen_nombre}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { color: theme.colors.textSecondary, flex: 1.5 },
                  ]}
                  numberOfLines={1}
                >
                  {detalle.materia_origen_institucion}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    {
                      color: getNotaColor(detalle.nota_origen),
                      width: 60,
                      textAlign: 'center',
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  {detalle.nota_origen}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    {
                      color: theme.colors.textMuted,
                      width: 30,
                      textAlign: 'center',
                    },
                  ]}
                >
                  →
                </Text>
                <Text
                  style={[styles.tableCell, { color: theme.colors.text, flex: 2 }]}
                  numberOfLines={1}
                >
                  {materiaDestino?.nombreMateria || 'N/A'}
                </Text>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        getEstadoColor(detalle.estado) + '20',
                      width: 100,
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
                <TouchableOpacity
                  onPress={() => eliminarMateria(detalle.id)}
                  style={{ width: 40, alignItems: 'center' }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={theme.colors.destructive}
                  />
                </TouchableOpacity>
              </View>
            );
          })}

          {detalles.length === 0 && (
            <View style={styles.emptyState}>
              <Text
                style={[styles.emptyText, { color: theme.colors.textMuted }]}
              >
                No hay materias agregadas aún
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[
            styles.addButton,
            { borderColor: theme.colors.primary },
          ]}
        >
          <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>
            Agregar materia
          </Text>
        </TouchableOpacity>

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
            onPress={avanzarPaso}
            style={[
              styles.button,
              styles.buttonFilled,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={styles.buttonTextWhite}>Siguiente →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Agregar materia
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                NOMBRE DE LA MATERIA EN ORIGEN *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.input,
                    borderColor: theme.colors.inputBorder,
                    color: theme.colors.text,
                  },
                ]}
                value={formData.materia_origen_nombre}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, materia_origen_nombre: text }))
                }
                placeholder="Introduzca el nombre de la materia"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                INSTITUCIÓN *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.input,
                    borderColor: theme.colors.inputBorder,
                    color: theme.colors.text,
                  },
                ]}
                value={formData.materia_origen_institucion}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    materia_origen_institucion: text,
                  }))
                }
                placeholder="Nombre de la institución"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                NOTA *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.input,
                    borderColor: theme.colors.inputBorder,
                    color: theme.colors.text,
                  },
                ]}
                value={formData.nota_origen}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, nota_origen: text }))
                }
                placeholder="Ej: 85"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
              />


              <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                MATERIA DESTINO *
              </Text>
              <SelectField
                value={formData.idMateriaDestino?.toString() || ''}
                onChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    idMateriaDestino: value ? parseInt(value) : null
                  }));
                }}
                options={materias.map(m => ({
                  label: `${m.nombreMateria} - Sem. ${m.semestre}`,
                  value: m.idMateria.toString(),
                }))}
                placeholder="Seleccione materia destino"
              />
              {materias.length === 0 && (
                <Text style={{ color: theme.colors.destructive, fontSize: 11, marginTop: 4 }}>
                  No hay materias disponibles para esta carrera
                </Text>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                style={[
                  styles.modalButton,
                  styles.buttonOutline,
                  { borderColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAgregarMateria}
                style={[
                  styles.modalButton,
                  styles.buttonFilled,
                  { backgroundColor: theme.colors.primary },
                ]}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonTextWhite}>Agregar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
    minWidth: 120,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
    letterSpacing: 0.3,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
});
