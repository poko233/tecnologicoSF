// screens/convalidacion/steps/Paso2Documentos.tsx
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@theme';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useConvalidacionContext } from '../context/ConvalidacionContext';
import {
  DOCUMENTOS_REQUERIDOS,
  usePaso2Documentos,
} from '../hooks/usePaso2Documentos';

export function Paso2Documentos() {
  const { theme } = useTheme();
  const { solicitudId, avanzarPaso, retrocederPaso } =
    useConvalidacionContext();
  const {
    loading,
    uploading,
    subirDocumento,
    eliminarDocumento,
    getDocumentoByTipo,
    validarObligatorios,
    cantidadFaltantes,
  } = usePaso2Documentos(solicitudId);

  const handleSiguiente = () => {
    if (!validarObligatorios()) {
      Toast.show({
        type: 'error',
        text1: 'Documentos incompletos',
        text2: `Faltan ${cantidadFaltantes()} documento(s) obligatorio(s)`,
      });
      return;
    }
    avanzarPaso();
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[styles.loadingText, { color: theme.colors.textSecondary }]}
        >
          Cargando documentos...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
        DOCUMENTOS REQUERIDOS
      </Text>

      <View style={styles.grid}>
        {DOCUMENTOS_REQUERIDOS.map((docReq) => {
          const documento = getDocumentoByTipo(docReq.tipo);
          const subido = !!documento;

          return (
            <View
              key={docReq.tipo}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {/* Badge obligatorio/opcional */}
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: docReq.obligatorio
                      ? theme.colors.destructive
                      : theme.colors.success,
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {docReq.obligatorio ? 'Obligatorio' : 'Opcional'}
                </Text>
              </View>

              {/* Icono */}
              <View style={styles.cardHeader}>
                <Ionicons
                  name={docReq.icono as any}
                  size={28}
                  color={theme.colors.primary}
                />
              </View>

              {/* Nombre y descripción */}
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {docReq.nombre}
              </Text>
              <Text
                style={[
                  styles.cardDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {docReq.descripcion}
              </Text>

              {/* Estado del archivo */}
              {subido ? (
                <View
                  style={[
                    styles.fileRow,
                    { backgroundColor: theme.colors.success + '20' },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={theme.colors.success}
                  />
                  <Text
                    style={[
                      styles.fileName,
                      { color: theme.colors.success, flex: 1 },
                    ]}
                    numberOfLines={1}
                  >
                    {documento.nombreDocumento}
                  </Text>
                  <Text
                    style={[
                      styles.fileSize,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {formatFileSize(documento.tamanio)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => eliminarDocumento(documento.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={theme.colors.destructive}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    { borderColor: theme.colors.border },
                  ]}
                  onPress={() => subirDocumento(docReq.tipo)}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="cloud-upload-outline"
                        size={20}
                        color={theme.colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.uploadText,
                          { color: theme.colors.textMuted },
                        ]}
                      >
                        Subir imagen o PDF
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      {/* Alerta si faltan obligatorios */}
      {!validarObligatorios() && (
        <View
          style={[
            styles.alert,
            { backgroundColor: theme.colors.warning + '20' },
          ]}
        >
          <Ionicons
            name="warning-outline"
            size={20}
            color={theme.colors.warning}
          />
          <Text style={[styles.alertText, { color: theme.colors.warning }]}>
            Falta {cantidadFaltantes()} documento(s) obligatorio(s). No se puede
            avanzar hasta completarlos.
          </Text>
        </View>
      )}

      {/* Navegación */}
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
          onPress={handleSiguiente}
          style={[
            styles.button,
            styles.buttonFilled,
            {
              backgroundColor: validarObligatorios()
                ? theme.colors.primary
                : theme.colors.backgroundTertiary,
            },
          ]}
          disabled={!validarObligatorios()}
        >
          <Text style={styles.buttonTextWhite}>Siguiente →</Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  card: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  cardHeader: {
    paddingTop: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cardTitle: {
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardDescription: {
    paddingHorizontal: 16,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 11,
  },
  deleteButton: {
    padding: 2,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '500',
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
});
