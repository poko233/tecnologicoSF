import { useTheme } from '@theme';
import {
    Building2,
    Globe2,
    Image as ImageIcon,
    Layers,
    Mail,
    MapPin,
    Phone,
    Smartphone,
    Store,
    User,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import {
    CampoTextoEmpresa,
    EstadoErrorEmpresa,
    SeccionEmpresa,
    SelectorImagenEmpresa,
} from '../components';
import {
    useActualizarEmpresa,
    useEmpresa,
    useSeleccionarImagenEmpresa,
} from '../hooks';
import { Empresa, EmpresaFormData } from '../types/empresa.types';

type SeccionId = 'identidad' | 'contacto' | 'redes' | 'contenido' | 'imagenes';

function aFormulario(empresa: Empresa): EmpresaFormData {
  return {
    EMPRESA: empresa.EMPRESA ?? '',
    SLOGAN: empresa.SLOGAN ?? '',
    SIGLA: empresa.SIGLA ?? '',
    TELEFONO: empresa.TELEFONO ?? '',
    CELULAR: empresa.CELULAR ?? '',
    EMAIL: empresa.EMAIL ?? '',
    DIRECCION: empresa.DIRECCION ?? '',
    RESPONSABLE: empresa.RESPONSABLE ?? '',
    OBJETO: empresa.OBJETO ?? '',
    MISION: empresa.MISION ?? '',
    VISION: empresa.VISION ?? '',
    FACEBOOK: empresa.FACEBOOK ?? '',
    INSTAGRAM: empresa.INSTAGRAM ?? '',
    TIKTOK: empresa.TIKTOK ?? '',
    LINKEDIN: empresa.LINKEDIN ?? '',
    TITULO_CIERRE: empresa.TITULO_CIERRE ?? '',
    MENSAJE_CIERRE: empresa.MENSAJE_CIERRE ?? '',
    TITULO_INICIO: empresa.TITULO_INICIO ?? '',
    MENSAJE_INICIO: empresa.MENSAJE_INICIO ?? '',
    DOMINIO: empresa.DOMINIO ?? '',
    CORREO_INSTITUCIONAL: empresa.CORREO_INSTITUCIONAL ?? '',
  };
}

export function EmpresaScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const esAncho = width >= 768;

  const { empresa, cargando, error, refrescar } = useEmpresa();
  const {
    actualizar,
    guardando,
    error: errorGuardado,
    erroresCampo,
    exito,
    limpiarEstado,
  } = useActualizarEmpresa();
  const { imagenes, seleccionarImagen, quitarImagen, limpiarImagenes } =
    useSeleccionarImagenEmpresa();

  const [formulario, setFormulario] = useState<EmpresaFormData>({});
  const [seccionesEditando, setSeccionesEditando] = useState<Set<SeccionId>>(new Set());
  const [seccionGuardando, setSeccionGuardando] = useState<SeccionId | null>(null);
  const [cacheKey, setCacheKey] = useState<number>(Date.now());

  useEffect(() => {
    if (empresa) setFormulario(aFormulario(empresa));
  }, [empresa]);

  useEffect(() => {
    if (exito) {
      Alert.alert('Listo', 'La configuración se actualizó correctamente.');
      limpiarImagenes();
      limpiarEstado();
      setCacheKey(Date.now());
      if (seccionGuardando) {
        setSeccionesEditando((prev) => {
          const c = new Set(prev);
          c.delete(seccionGuardando);
          return c;
        });
      }
      setSeccionGuardando(null);
      refrescar();
    }
  }, [exito]);

  useEffect(() => {
    if (errorGuardado) {
      Alert.alert('Error', errorGuardado);
      limpiarEstado();
      setSeccionGuardando(null);
    }
  }, [errorGuardado]);

  const actualizarCampo = (campo: keyof EmpresaFormData, valor: string) =>
    setFormulario((prev) => ({ ...prev, [campo]: valor }));

  const errorDeCampo = (campo: keyof EmpresaFormData) =>
    erroresCampo?.[campo as string]?.[0];

  const obtenerUrlConCache = (url: string | null): string | null => {
    if (!url) return null;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}v=${cacheKey}`;
  };

  const alternarEdicion = (seccion: SeccionId) =>
    setSeccionesEditando((prev) => {
      const c = new Set(prev);
      c.has(seccion) ? c.delete(seccion) : c.add(seccion);
      return c;
    });

  const guardarSeccion = (seccion: SeccionId) => {
    setSeccionGuardando(seccion);
    actualizar(formulario, imagenes);
  };

  const estaEditando = (s: SeccionId) => seccionesEditando.has(s);
  const estaGuardando = (s: SeccionId) => guardando && seccionGuardando === s;

  if (cargando) {
    return (
      <View style={[styles.cargandoContenedor, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.cargandoTexto, { color: theme.colors.textSecondary }]}>
          Cargando configuración…
        </Text>
      </View>
    );
  }

  if (error || !empresa) {
    return (
      <EstadoErrorEmpresa
        mensaje={error ?? 'No se encontró configuración de empresa.'}
        onReintentar={refrescar}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.contenido}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={refrescar} />}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.encabezadoTextos}>
          <Text style={[styles.titulo, { color: theme.colors.text }]}>
            Configuración de empresa
          </Text>
          <Text style={[styles.subtitulo, { color: theme.colors.textSecondary }]}>
            Esta información se usa en reportes, correos y en la app.
          </Text>
        </View>

        {/* ── Layout 2 columnas en tablet/web, 1 columna en móvil ── */}
        <View style={esAncho ? styles.columnas : styles.columnasMobile}>

          {/* ── COLUMNA IZQUIERDA: imágenes ── */}
          <View style={esAncho ? styles.colIzquierda : styles.colFull}>
            <SeccionEmpresa
              titulo="Imágenes empresa"
              descripcion="Al reemplazar una imagen, se sobrescribe el archivo existente en el servidor."
              icono={ImageIcon}
              iniciaAbierta
              editando={estaEditando('imagenes')}
              guardando={estaGuardando('imagenes')}
              onEditar={() => alternarEdicion('imagenes')}
              onGuardar={() => guardarSeccion('imagenes')}
            >
              <SelectorImagenEmpresa
                campo="LOGO_CUADRADO"
                etiqueta="Logo cuadrado"
                descripcion="Usado como ícono principal. Dimensiones iguales. Máx 2 MB · JPG / PNG."
                urlActual={obtenerUrlConCache(empresa.LOGO_CUADRADO)}
                archivoSeleccionado={imagenes.LOGO_CUADRADO}
                relacionAspecto={1}
                deshabilitado={estaGuardando('imagenes')}
                onSeleccionar={seleccionarImagen}
                onQuitar={quitarImagen}
              />
              <SelectorImagenEmpresa
                campo="LOGO_LARGO"
                etiqueta="Logo largo"
                descripcion="Usado en encabezados y reportes. Máx 2 MB · JPG / PNG."
                urlActual={obtenerUrlConCache(empresa.LOGO_LARGO)}
                archivoSeleccionado={imagenes.LOGO_LARGO}
                relacionAspecto={4}
                deshabilitado={estaGuardando('imagenes')}
                onSeleccionar={seleccionarImagen}
                onQuitar={quitarImagen}
              />
              <SelectorImagenEmpresa
                campo="BANER_INICIO"
                etiqueta="Banner de inicio"
                descripcion="Imagen principal de la pantalla de inicio. Máx 4 MB · JPG / PNG / WEBP."
                urlActual={obtenerUrlConCache(empresa.BANER_INICIO)}
                archivoSeleccionado={imagenes.BANER_INICIO}
                relacionAspecto={16 / 9}
                deshabilitado={estaGuardando('imagenes')}
                onSeleccionar={seleccionarImagen}
                onQuitar={quitarImagen}
              />
              <SelectorImagenEmpresa
                campo="ICONO"
                etiqueta="Ícono / Favicon"
                descripcion="Ícono de la app. Máx 1 MB · PNG / ICO."
                urlActual={obtenerUrlConCache(empresa.ICONO)}
                archivoSeleccionado={imagenes.ICONO}
                relacionAspecto={1}
                deshabilitado={estaGuardando('imagenes')}
                onSeleccionar={seleccionarImagen}
                onQuitar={quitarImagen}
              />
            </SeccionEmpresa>
          </View>

          {/* ── COLUMNA DERECHA: formularios ── */}
          <View style={esAncho ? styles.colDerecha : styles.colFull}>
            <SeccionEmpresa
              titulo="Identidad"
              icono={Building2}
              iniciaAbierta
              editando={estaEditando('identidad')}
              guardando={estaGuardando('identidad')}
              onEditar={() => alternarEdicion('identidad')}
              onGuardar={() => guardarSeccion('identidad')}
            >
              <CampoTextoEmpresa etiqueta="Nombre de la empresa" value={formulario.EMPRESA ?? ''} onChangeText={(t) => actualizarCampo('EMPRESA', t)} placeholder="Ej. Tecnológico SB" error={errorDeCampo('EMPRESA')} editable={estaEditando('identidad')} icono={Store} />
              <CampoTextoEmpresa etiqueta="Eslogan" value={formulario.SLOGAN ?? ''} onChangeText={(t) => actualizarCampo('SLOGAN', t)} placeholder="Frase corta que representa a la empresa" error={errorDeCampo('SLOGAN')} editable={estaEditando('identidad')} />
              <CampoTextoEmpresa etiqueta="Sigla" value={formulario.SIGLA ?? ''} onChangeText={(t) => actualizarCampo('SIGLA', t)} autoCapitalize="characters" error={errorDeCampo('SIGLA')} editable={estaEditando('identidad')} />
            </SeccionEmpresa>

            <SeccionEmpresa
              titulo="Contacto"
              icono={User}
              editando={estaEditando('contacto')}
              guardando={estaGuardando('contacto')}
              onEditar={() => alternarEdicion('contacto')}
              onGuardar={() => guardarSeccion('contacto')}
            >
              <CampoTextoEmpresa etiqueta="Teléfono" value={formulario.TELEFONO ?? ''} onChangeText={(t) => actualizarCampo('TELEFONO', t)} keyboardType="phone-pad" error={errorDeCampo('TELEFONO')} editable={estaEditando('contacto')} icono={Phone} />
              <CampoTextoEmpresa etiqueta="Celular" value={formulario.CELULAR ?? ''} onChangeText={(t) => actualizarCampo('CELULAR', t)} keyboardType="phone-pad" error={errorDeCampo('CELULAR')} editable={estaEditando('contacto')} icono={Smartphone} />
              <CampoTextoEmpresa etiqueta="Correo" value={formulario.EMAIL ?? ''} onChangeText={(t) => actualizarCampo('EMAIL', t)} keyboardType="email-address" autoCapitalize="none" error={errorDeCampo('EMAIL')} editable={estaEditando('contacto')} icono={Mail} />
              <CampoTextoEmpresa etiqueta="Correo institucional" value={formulario.CORREO_INSTITUCIONAL ?? ''} onChangeText={(t) => actualizarCampo('CORREO_INSTITUCIONAL', t)} keyboardType="email-address" autoCapitalize="none" error={errorDeCampo('CORREO_INSTITUCIONAL')} editable={estaEditando('contacto')} icono={Mail} />
              <CampoTextoEmpresa etiqueta="Dirección" value={formulario.DIRECCION ?? ''} onChangeText={(t) => actualizarCampo('DIRECCION', t)} multilinea error={errorDeCampo('DIRECCION')} editable={estaEditando('contacto')} icono={MapPin} />
              <CampoTextoEmpresa etiqueta="Responsable" value={formulario.RESPONSABLE ?? ''} onChangeText={(t) => actualizarCampo('RESPONSABLE', t)} error={errorDeCampo('RESPONSABLE')} editable={estaEditando('contacto')} icono={User} />
            </SeccionEmpresa>

            <SeccionEmpresa
              titulo="Redes sociales"
              icono={Globe2}
              editando={estaEditando('redes')}
              guardando={estaGuardando('redes')}
              onEditar={() => alternarEdicion('redes')}
              onGuardar={() => guardarSeccion('redes')}
            >
              <CampoTextoEmpresa etiqueta="Facebook" value={formulario.FACEBOOK ?? ''} onChangeText={(t) => actualizarCampo('FACEBOOK', t)} autoCapitalize="none" keyboardType="url" error={errorDeCampo('FACEBOOK')} editable={estaEditando('redes')} />
              <CampoTextoEmpresa etiqueta="Instagram" value={formulario.INSTAGRAM ?? ''} onChangeText={(t) => actualizarCampo('INSTAGRAM', t)} autoCapitalize="none" keyboardType="url" error={errorDeCampo('INSTAGRAM')} editable={estaEditando('redes')} />
              <CampoTextoEmpresa etiqueta="TikTok" value={formulario.TIKTOK ?? ''} onChangeText={(t) => actualizarCampo('TIKTOK', t)} autoCapitalize="none" keyboardType="url" error={errorDeCampo('TIKTOK')} editable={estaEditando('redes')} />
              <CampoTextoEmpresa etiqueta="LinkedIn" value={formulario.LINKEDIN ?? ''} onChangeText={(t) => actualizarCampo('LINKEDIN', t)} autoCapitalize="none" keyboardType="url" error={errorDeCampo('LINKEDIN')} editable={estaEditando('redes')} />
            </SeccionEmpresa>

            <SeccionEmpresa
              titulo="Contenido del sitio"
              descripcion="Textos que se muestran en la pantalla de inicio y de cierre."
              icono={Layers}
              editando={estaEditando('contenido')}
              guardando={estaGuardando('contenido')}
              onEditar={() => alternarEdicion('contenido')}
              onGuardar={() => guardarSeccion('contenido')}
            >
              <CampoTextoEmpresa etiqueta="Título de inicio" value={formulario.TITULO_INICIO ?? ''} onChangeText={(t) => actualizarCampo('TITULO_INICIO', t)} error={errorDeCampo('TITULO_INICIO')} editable={estaEditando('contenido')} />
              <CampoTextoEmpresa etiqueta="Mensaje de inicio" value={formulario.MENSAJE_INICIO ?? ''} onChangeText={(t) => actualizarCampo('MENSAJE_INICIO', t)} multilinea error={errorDeCampo('MENSAJE_INICIO')} editable={estaEditando('contenido')} />
              <CampoTextoEmpresa etiqueta="Título de cierre" value={formulario.TITULO_CIERRE ?? ''} onChangeText={(t) => actualizarCampo('TITULO_CIERRE', t)} error={errorDeCampo('TITULO_CIERRE')} editable={estaEditando('contenido')} />
              <CampoTextoEmpresa etiqueta="Mensaje de cierre" value={formulario.MENSAJE_CIERRE ?? ''} onChangeText={(t) => actualizarCampo('MENSAJE_CIERRE', t)} multilinea error={errorDeCampo('MENSAJE_CIERRE')} editable={estaEditando('contenido')} />
              <CampoTextoEmpresa etiqueta="Misión" value={formulario.MISION ?? ''} onChangeText={(t) => actualizarCampo('MISION', t)} multilinea error={errorDeCampo('MISION')} editable={estaEditando('contenido')} />
              <CampoTextoEmpresa etiqueta="Visión" value={formulario.VISION ?? ''} onChangeText={(t) => actualizarCampo('VISION', t)} multilinea error={errorDeCampo('VISION')} editable={estaEditando('contenido')} />
              <CampoTextoEmpresa etiqueta="Objeto" value={formulario.OBJETO ?? ''} onChangeText={(t) => actualizarCampo('OBJETO', t)} multilinea error={errorDeCampo('OBJETO')} editable={estaEditando('contenido')} />
            </SeccionEmpresa>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  contenido: { padding: 16, gap: 16 },
  encabezadoTextos: { gap: 4, paddingHorizontal: 4 },
  titulo: { fontSize: 20, fontWeight: '800' },
  subtitulo: { fontSize: 13 },
  cargandoContenedor: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cargandoTexto: { fontSize: 15 },

  // layout 2 columnas (tablet / web)
  columnas: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  columnasMobile: {
    flexDirection: 'column',
    gap: 16,
  },
  colIzquierda: {
    flex: 35,          // ~35%
  },
  colDerecha: {
    flex: 65,          // ~65%
    gap: 16,
  },
  colFull: {
    flex: 1,
    gap: 16,
  },
});