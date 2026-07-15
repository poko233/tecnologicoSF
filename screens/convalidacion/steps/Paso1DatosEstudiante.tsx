// screens/convalidacion/steps/Paso1DatosEstudiante.tsx
import FormDateInput from '@/screens/inscripcion/components/FormDateInput';
import { useTheme } from '@theme';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SelectField } from '../components/SelectField';
import { useConvalidacionContext } from '../context/ConvalidacionContext';
import { usePaso1 } from '../hooks/usePaso1';

const EXPEDIDOS = ['LPZ', 'CBBA', 'OR', 'PT', 'TJ', 'SCZ', 'BN', 'PD', 'CH', 'QR', 'EXT'];
const GENEROS = ['MASCULINO', 'FEMENINO'];
const TIPOS = [
  { value: 'externa', label: 'Externa' },
  { value: 'cambio_carrera', label: 'Cambio de carrera' },
];

export function Paso1DatosEstudiante() {
  const { theme } = useTheme();
  const { avanzarPaso, setSolicitudId, setCodigoSolicitud, setIdCarreraDestino, setIdUsuario, setGestionLabel } =
    useConvalidacionContext();
  const { formData, updateField, carreras, gestiones, loading, loadingData, submitForm, matriculaGenerada } = usePaso1();

  const handleSiguiente = async () => {
    const result = await submitForm();
    if (result) {
      setSolicitudId(result.id);
      setCodigoSolicitud(result.codigo);
      setIdCarreraDestino(result.idCarreraDestino);
      setIdUsuario(result.idUsuario);

      const gestion = gestiones.find(g => g.id === result.idGestion);
      if (gestion) {
        const label = `${gestion.anio || 'N/A'} — ${gestion.nombre || 'N/A'}`;
        setGestionLabel(label);
      }

      avanzarPaso();
    }
  };

  // ❌ ANTES: aquí había un `if (loadingData) return <LoadingScreen />` que
  //    bloqueaba TODO el formulario. Se quitó para que el usuario pueda
  //    empezar a escribir de inmediato.

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
        DATOS DEL ESTUDIANTE
      </Text>

      <View style={styles.grid}>
        {/* CI */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            C.I. *
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
            value={formData.ci}
            onChangeText={(text) => updateField('ci', text)}
            placeholder="Ingrese CI"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
          />
        </View>

        {/* Expedido */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            EXPEDIDO *
          </Text>
          <SelectField
            value={formData.expedido}
            onChange={(value) => updateField('expedido', value)}
            options={EXPEDIDOS.map((exp) => ({ label: exp, value: exp }))}
            placeholder="Seleccione expedido"
          />
        </View>

        {/* Nombres */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            NOMBRES *
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
            value={formData.nombres}
            onChangeText={(text) => updateField('nombres', text)}
            placeholder="Ingrese nombres"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        {/* Apellido Paterno */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            APELLIDO PATERNO *
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
            value={formData.apellidoPaterno}
            onChangeText={(text) => updateField('apellidoPaterno', text)}
            placeholder="Ingrese apellido paterno"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        {/* Apellido Materno */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            APELLIDO MATERNO
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
            value={formData.apellidoMaterno}
            onChangeText={(text) => updateField('apellidoMaterno', text)}
            placeholder="Ingrese apellido materno"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        {/* Género */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            GÉNERO *
          </Text>
          <SelectField
            value={formData.genero}
            onChange={(value) => updateField('genero', value)}
            options={GENEROS.map((gen) => ({ label: gen, value: gen }))}
            placeholder="Seleccione género"
          />
        </View>

        {/* Fecha de Nacimiento */}
        <View style={styles.field}>
          <FormDateInput
            label="Fecha de nacimiento"
            value={
              formData.fecha_nac
                ? `${String(formData.fecha_nac.getDate()).padStart(2,'0')}/${String(formData.fecha_nac.getMonth()+1).padStart(2,'0')}/${formData.fecha_nac.getFullYear()}`
                : ''
            }
            onChangeText={(text) => {
              const parts = text.split('/');
              if (parts.length === 3) {
                const date = new Date(
                  parseInt(parts[2]),
                  parseInt(parts[1]) - 1,
                  parseInt(parts[0]),
                  12, 0, 0
                );
                updateField('fecha_nac', date);
              }
            }}
          />
        </View>

        {/* Email */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            EMAIL
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
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Teléfono */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            TELÉFONO
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
            value={formData.telefono}
            onChangeText={(text) => updateField('telefono', text)}
            placeholder="Teléfono fijo"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="phone-pad"
          />
        </View>

        {/* Celular */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            CELULAR
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
            value={formData.celular}
            onChangeText={(text) => updateField('celular', text)}
            placeholder="Número de celular"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="phone-pad"
          />
        </View>

        {/* Dirección */}
        <View style={[styles.field, styles.fieldFull]}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            DIRECCIÓN
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
            value={formData.direccion}
            onChangeText={(text) => updateField('direccion', text)}
            placeholder="Dirección completa"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        {/* Matrícula — generada automáticamente por el backend */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            Nº DE MATRÍCULA
          </Text>
          <View
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
                justifyContent: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              },
            ]}
          >
            {loadingData ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>
                  {matriculaGenerada}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>
                  Auto
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Carrera Destino — 👇 aquí sí importa loadingData, porque depende de la API */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            CARRERA DESTINO *
          </Text>
          {loadingData ? (
            <View
              style={[
                styles.input,
                styles.inputLoading,
                { backgroundColor: theme.colors.input, borderColor: theme.colors.inputBorder },
              ]}
            >
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginLeft: 8 }}>
                Cargando carreras...
              </Text>
            </View>
          ) : (
            <>
              <SelectField
                value={formData.idCarreraDestino || ''}
                onChange={(value) => updateField('idCarreraDestino', value ? parseInt(value) : null)}
                options={carreras.map((c) => ({
                  label: c.nombreCarrera,
                  value: c.idCarrera,
                }))}
                placeholder="Seleccione carrera"
              />
              {carreras.length === 0 && (
                <Text style={{ color: theme.colors.destructive, fontSize: 11, marginTop: 4 }}>
                  No hay carreras disponibles
                </Text>
              )}
            </>
          )}
        </View>

        {/* Gestión — 👇 mismo caso */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            GESTIÓN *
          </Text>
          {loadingData ? (
            <View
              style={[
                styles.input,
                styles.inputLoading,
                { backgroundColor: theme.colors.input, borderColor: theme.colors.inputBorder },
              ]}
            >
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginLeft: 8 }}>
                Cargando gestiones...
              </Text>
            </View>
          ) : (
            <>
              <SelectField
                value={formData.idGestion || ''}
                onChange={(value) => updateField('idGestion', value ? parseInt(value) : null)}
                options={gestiones.map((g) => ({
                  label: `${g.nombre} — ${g.periodo}`,
                  value: g.id,
                }))}
                placeholder="Seleccione gestión"
              />
              {gestiones.length === 0 && (
                <Text style={{ color: theme.colors.destructive, fontSize: 11, marginTop: 4 }}>
                  No hay gestiones disponibles
                </Text>
              )}
            </>
          )}
        </View>

        {/* Tipo */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            TIPO DE CONVALIDACIÓN *
          </Text>
          <SelectField
            value={formData.tipo}
            onChange={(value) => updateField('tipo', value as any)}
            options={TIPOS}
            placeholder="Seleccione tipo"
          />
        </View>

        {/* Institución de Origen */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            INSTITUCIÓN DE ORIGEN *
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
            value={formData.institucion_origen}
            onChangeText={(text) => updateField('institucion_origen', text)}
            placeholder="Nombre de la institución"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        {/* Carrera de Origen */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            CARRERA DE ORIGEN *
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
            value={formData.carrera_origen_nombre}
            onChangeText={(text) => updateField('carrera_origen_nombre', text)}
            placeholder="Nombre de la carrera"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        {/* Motivo */}
        <View style={[styles.field, styles.fieldFull]}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            MOTIVO DE LA SOLICITUD
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
            value={formData.motivo}
            onChangeText={(text) => updateField('motivo', text)}
            placeholder="Describa el motivo de la solicitud..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Botón Siguiente */}
      <View style={styles.buttonContainer}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={handleSiguiente}
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary },
          ]}
          disabled={loading || loadingData} // 👈 evita avanzar si aún no llegó carrera/gestión
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Siguiente →</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  field: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  fieldFull: {
    width: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});