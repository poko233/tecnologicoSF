// screens/convalidacion/steps/Paso2Documentos.tsx
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@theme';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useConvalidacionContext } from '../context/ConvalidacionContext';
import { convalidacionService } from '../services/convalidacionService';
import type { Documento } from '../types';

const DOCUMENTOS_CONVALIDACION = [
  {
    tipo: 'certificado_notas',
    titulo: 'Certificado de notas',
    descripcion: 'Notas originales de la institución de origen, con sello y firma del secretario académico.',
  },
  {
    tipo: 'constancia_institucional',
    titulo: 'Constancia institucional',
    descripcion: 'Documento que acredita la institución de origen: resolución ministerial o código SIE.',
  },
  {
    tipo: 'documento_identidad',
    titulo: 'Documento de identidad',
    descripcion: 'Fotocopia del carnet de identidad vigente del estudiante (anverso y reverso).',
  },
  {
    tipo: 'certificado_nacimiento',
    titulo: 'Certificado de nacimiento',
    descripcion: 'Certificado original o copia legalizada reciente.',
  },
  {
    tipo: 'fotocopia_legalizada',
    titulo: 'Fotocopia legalizada',
    descripcion: 'Diploma de bachiller o título previo debidamente legalizado.',
  },
];

type DocumentoConUpload = Documento & {
  previewUri?: string | null;
  mimeType?: string | null;
};

function DocumentoConvalidacionCard({
  solicitudId,
  tipo,
  titulo,
  descripcion,
  documentoSubido,
  onSubido,
  onEliminado,
}: {
  solicitudId: number;
  tipo: string;
  titulo: string;
  descripcion: string;
  documentoSubido?: DocumentoConUpload;
  onSubido: (doc: DocumentoConUpload) => void;
  onEliminado: (id: number) => void;
}) {
  const { theme } = useTheme();
  const [subiendo, setSubiendo] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(documentoSubido?.previewUri ?? null);
  const [mimeType, setMimeType] = useState<string | null>(documentoSubido?.mimeType ?? null);
  const [archivoNombre, setArchivoNombre] = useState<string | null>(documentoSubido?.nombreDocumento ?? null);

  useEffect(() => {
    setPreviewUri(documentoSubido?.previewUri ?? null);
    setMimeType(documentoSubido?.mimeType ?? null);
    setArchivoNombre(documentoSubido?.nombreDocumento ?? null);
  }, [documentoSubido]);

  const existeArchivo = !!documentoSubido;
  const esImagen = mimeType?.startsWith('image/');
  const esPdf = mimeType === 'application/pdf';

  const abrirArchivo = () => {
    if (!previewUri) return;
    if (Platform.OS === 'web') { window.open(previewUri, '_blank'); return; }
    Linking.openURL(previewUri);
  };

  const subirArchivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const archivo = result.assets[0];
      setSubiendo(true);

      const formData = new FormData();
      formData.append('tipo', tipo);

      if (Platform.OS === 'web') {
        const webFile = (archivo as any).file;
        if (!webFile) { Toast.show({ type: 'error', text1: 'Archivo inválido' }); return; }
        formData.append('archivo', webFile, archivo.name);
      } else {
        formData.append('archivo', {
          uri: archivo.uri,
          name: archivo.name || 'documento.pdf',
          type: archivo.mimeType || 'application/pdf',
        } as any);
      }

      const response = await convalidacionService.subirDocumento(solicitudId, formData);

      setPreviewUri(archivo.uri);
      setMimeType(archivo.mimeType ?? null);
      setArchivoNombre(archivo.name ?? titulo);

      onSubido({ ...response.data, previewUri: archivo.uri, mimeType: archivo.mimeType ?? null });
      Toast.show({ type: 'success', text1: 'Documento subido', text2: titulo });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error?.message || 'No se pudo subir' });
    } finally {
      setSubiendo(false);
    }
  };

  const eliminarArchivo = async () => {
    if (!documentoSubido) return;
    try {
      await convalidacionService.eliminarDocumento(solicitudId, documentoSubido.id);
      setPreviewUri(null); setMimeType(null); setArchivoNombre(null);
      onEliminado(documentoSubido.id);
      Toast.show({ type: 'success', text1: 'Documento eliminado' });
    } catch {
      Toast.show({ type: 'error', text1: 'Error al eliminar' });
    }
  };

  return (
    <View style={{
      flex: 1, minWidth: 260,
      borderWidth: 1,
      borderColor: existeArchivo ? theme.colors.primary : theme.colors.border,
      backgroundColor: theme.colors.card,
      borderRadius: 22, padding: 20, gap: 18,
    }}>
      {/* Ícono */}
      <View style={{
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: existeArchivo ? `${theme.colors.primary}22` : theme.colors.background,
        borderWidth: 1,
        borderColor: existeArchivo ? `${theme.colors.primary}55` : theme.colors.border,
        justifyContent: 'center', alignItems: 'center',
      }}>
        <Ionicons
          name={existeArchivo ? 'checkmark-circle' : 'document-text-outline'}
          size={28}
          color={existeArchivo ? theme.colors.primary : theme.colors.muted}
        />
      </View>

      {/* Título y descripción */}
      <View>
        <ThemedText style={{ fontSize: 20, fontWeight: '900', color: theme.colors.text }}>
          {titulo}
        </ThemedText>
        <ThemedText style={{ marginTop: 6, color: theme.colors.muted, lineHeight: 22, fontWeight: '600' }}>
          {descripcion}
        </ThemedText>
      </View>

      {/* Zona dashed */}
      <View style={{
        borderWidth: 1, borderStyle: 'dashed',
        borderColor: existeArchivo ? theme.colors.primary : theme.colors.border,
        backgroundColor: existeArchivo ? `${theme.colors.primary}12` : theme.colors.background,
        borderRadius: 16, padding: 18, alignItems: 'center', gap: 10,
      }}>
        <Ionicons
          name={existeArchivo ? 'checkmark-circle' : 'cloud-upload-outline'}
          size={24}
          color={existeArchivo ? theme.colors.primary : theme.colors.muted}
        />
        <ThemedText style={{
          fontSize: 12, fontWeight: '800', textAlign: 'center',
          color: existeArchivo ? theme.colors.text : theme.colors.muted,
        }}>
          {archivoNombre || 'PDF, JPG o PNG - máximo 10MB'}
        </ThemedText>
        {existeArchivo && (
          <ThemedText style={{ fontSize: 11, color: theme.colors.primary, fontWeight: '900', textAlign: 'center' }}>
            Documento cargado correctamente
          </ThemedText>
        )}
      </View>

      {/* Preview imagen */}
      {previewUri && esImagen && (
        <Image
          source={{ uri: previewUri }}
          style={{ width: '100%', height: 200, borderRadius: 16, resizeMode: 'cover', borderWidth: 1, borderColor: theme.colors.border }}
        />
      )}

      {/* Preview PDF web */}
      {previewUri && esPdf && Platform.OS === 'web' && (
        <iframe
          src={previewUri}
          style={{ width: '100%', height: 280, border: `1px solid ${theme.colors.border}`, borderRadius: 16, backgroundColor: '#fff' }}
          title={archivoNombre || 'PDF'}
        />
      )}

      {/* Preview PDF móvil */}
      {previewUri && esPdf && Platform.OS !== 'web' && (
        <Pressable onPress={abrirArchivo} style={{
          borderWidth: 1, borderColor: theme.colors.border,
          backgroundColor: theme.colors.background, borderRadius: 14,
          padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10,
        }}>
          <Ionicons name="document-outline" size={22} color={theme.colors.primary} />
          <View style={{ flex: 1 }}>
            <ThemedText style={{ fontWeight: '900', color: theme.colors.text }}>Vista previa PDF</ThemedText>
            <ThemedText style={{ color: theme.colors.muted, marginTop: 2, fontWeight: '600', fontSize: 12 }}>
              Toca para abrir el documento completo.
            </ThemedText>
          </View>
        </Pressable>
      )}

      {/* Ver archivo completo */}
      {previewUri && (
        <Pressable onPress={abrirArchivo} style={{
          height: 46, borderRadius: 14, borderWidth: 1,
          borderColor: theme.colors.border, backgroundColor: theme.colors.background,
          justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8,
        }}>
          <Ionicons name="open-outline" size={18} color={theme.colors.primary} />
          <ThemedText style={{ color: theme.colors.primary, fontWeight: '900' }}>
            Ver archivo completo
          </ThemedText>
        </Pressable>
      )}

      {/* Eliminar */}
      {existeArchivo && (
        <Pressable onPress={eliminarArchivo} style={{
          height: 46, borderRadius: 14, borderWidth: 1,
          borderColor: theme.colors.destructive + '60',
          backgroundColor: theme.colors.destructive + '15',
          justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8,
        }}>
          <Ionicons name="trash-outline" size={18} color={theme.colors.destructive} />
          <ThemedText style={{ color: theme.colors.destructive, fontWeight: '900' }}>
            Eliminar documento
          </ThemedText>
        </Pressable>
      )}

      {/* Subir */}
      <Pressable
        disabled={subiendo}
        onPress={subirArchivo}
        style={{
          height: 54, borderRadius: 16,
          backgroundColor: subiendo ? theme.colors.border : theme.colors.primary,
          justifyContent: 'center', alignItems: 'center',
          flexDirection: 'row', gap: 8, opacity: subiendo ? 0.7 : 1,
        }}
      >
        {subiendo ? (
          <>
            <ActivityIndicator color="#fff" />
            <ThemedText style={{ color: '#fff', fontWeight: '900' }}>Subiendo...</ThemedText>
          </>
        ) : (
          <>
            <Ionicons name={existeArchivo ? 'refresh-circle-outline' : 'add-circle-outline'} size={20} color="#fff" />
            <ThemedText style={{ color: '#fff', fontWeight: '900' }}>
              {existeArchivo ? 'Cambiar Archivo' : 'Subir Archivo'}
            </ThemedText>
          </>
        )}
      </Pressable>
    </View>
  );
}

export function Paso2Documentos() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 900;
  const { solicitudId, avanzarPaso, retrocederPaso } = useConvalidacionContext();
  const [documentos, setDocumentos] = useState<DocumentoConUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (solicitudId) loadDocumentos();
  }, [solicitudId]);

  const loadDocumentos = async () => {
    if (!solicitudId) return;
    try {
      setLoading(true);
      const response = await convalidacionService.getDocumentos(solicitudId);
      setDocumentos(response.data || []);
    } catch { } finally {
      setLoading(false);
    }
  };

  const getDocumentoByTipo = (tipo: string) => documentos.find(d => d.tipo === tipo);

  const documentosCargados = DOCUMENTOS_CONVALIDACION.filter(d => getDocumentoByTipo(d.tipo)).length;
  const totalDocumentos = DOCUMENTOS_CONVALIDACION.length;
  const todosCargados = documentosCargados === totalDocumentos;
  const algunoCargado = documentosCargados > 0;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={{ color: theme.colors.textSecondary, marginTop: 12 }}>
          Cargando documentos...
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ gap: 24 }}>
        {/* Título */}
        <View>
          <ThemedText style={{ fontSize: 28, fontWeight: '900', color: theme.colors.text }}>
            Carga de Documentos
          </ThemedText>
          <ThemedText style={{ marginTop: 6, color: theme.colors.muted, fontWeight: '600' }}>
            Sube los documentos requeridos para la convalidación.
          </ThemedText>
        </View>

        {/* Contador */}
        <View style={{
          borderWidth: 1,
          borderColor: todosCargados ? theme.colors.primary : theme.colors.border,
          backgroundColor: todosCargados ? `${theme.colors.primary}14` : theme.colors.card,
          borderRadius: 18, padding: 16,
          flexDirection: 'row', alignItems: 'center', gap: 10,
        }}>
          <Ionicons
            name={todosCargados ? 'checkmark-circle' : algunoCargado ? 'cloud-done-outline' : 'document-text-outline'}
            size={24}
            color={todosCargados || algunoCargado ? theme.colors.primary : theme.colors.muted}
          />
          <View>
            <ThemedText style={{ fontWeight: '900', color: theme.colors.text }}>
              Documentos cargados: {documentosCargados}/{totalDocumentos}
            </ThemedText>
            <ThemedText style={{ marginTop: 3, color: theme.colors.muted, fontSize: 13, fontWeight: '600' }}>
              {todosCargados
                ? 'Todos los documentos fueron cargados.'
                : 'Puedes avanzar con los documentos disponibles.'}
            </ThemedText>
          </View>
        </View>

        {/* Cards */}
        <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 18, flexWrap: 'wrap' }}>
          {DOCUMENTOS_CONVALIDACION.map(doc => (
            <DocumentoConvalidacionCard
              key={doc.tipo}
              solicitudId={solicitudId!}
              tipo={doc.tipo}
              titulo={doc.titulo}
              descripcion={doc.descripcion}
              documentoSubido={getDocumentoByTipo(doc.tipo)}
              onSubido={nuevoDoc => setDocumentos(prev => [...prev.filter(d => d.tipo !== doc.tipo), nuevoDoc])}
              onEliminado={id => setDocumentos(prev => prev.filter(d => d.id !== id))}
            />
          ))}
        </View>

        {/* Validación institucional */}
        <View style={{
          borderWidth: 1, borderColor: theme.colors.border,
          backgroundColor: theme.colors.card, borderRadius: 16, padding: 18,
        }}>
          <ThemedText style={{ fontWeight: '900', color: theme.colors.text }}>
            Validación Institucional
          </ThemedText>
          <ThemedText style={{ marginTop: 6, color: theme.colors.muted, fontWeight: '600', lineHeight: 20 }}>
            El departamento académico revisará los documentos cargados y podrá
            solicitar los faltantes posteriormente.
          </ThemedText>
        </View>

        {/* Navegación */}
        <View style={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 14 }}>
          <Pressable
            onPress={retrocederPaso}
            style={{
              height: 52, paddingHorizontal: 24, borderRadius: 14,
              borderWidth: 1, borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8,
            }}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            <ThemedText style={{ fontWeight: '900', color: theme.colors.primary }}>Atrás</ThemedText>
          </Pressable>

          <Pressable
            onPress={avanzarPaso}
            style={{
              height: 52, paddingHorizontal: 24, borderRadius: 14,
              backgroundColor: theme.colors.primary,
              justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8,
            }}
          >
            <Ionicons name="arrow-forward" size={20} color="#fff" />
            <ThemedText style={{ color: '#fff', fontWeight: '900' }}>Siguiente</ThemedText>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}