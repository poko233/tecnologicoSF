// screens/convalidacion/steps/Paso1DatosEstudiante.tsx
import { DatePickerField } from '@/screens/auth/components/DatePickerField';
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
  const { formData, updateField, carreras, gestiones, loading, loadingData, submitForm } = usePaso1();

  const handleSiguiente = async () => {
    const result = await submitForm();
    if (result) {
      setSolicitudId(result.id);
      setCodigoSolicitud(result.codigo);
      setIdCarreraDestino(result.idCarreraDestino);
      setIdUsuario(result.idUsuario);

      const gestion = gestiones.find(g => g.id === result.idGestion);
      console.log('Gestión encontrada:', gestion, 'para idGestion:', result.idGestion);
      if (gestion) {
        const label = `${gestion.anio || 'N/A'} — ${gestion.semestre || 'N/A'}`;
        console.log('Setting gestionLabel:', label);
        setGestionLabel(label);
      } else {
        console.warn('No se encontró la gestión con id:', result.idGestion);
      }

      avanzarPaso();
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Cargando datos...
        </Text>
      </View>
    );
  }

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
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            FECHA DE NACIMIENTO *
          </Text>
          <DatePickerField
            label="Seleccione fecha"
            value={
              formData.fecha_nac
                ? formData.fecha_nac.toISOString().split('T')[0]
                : null
            }
            onChange={(dateString) => {
              const date = new Date(dateString + 'T12:00:00');
              updateField('fecha_nac', date);
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

        {/* Matrícula */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            Nº DE MATRÍCULA *
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
            value={formData.matricula}
            onChangeText={(text) => updateField('matricula', text)}
            placeholder="MAT-2024-00001"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        {/* Carrera Destino */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            CARRERA DESTINO *
          </Text>
          <SelectField
            value={formData.idCarreraDestino || ''}
            onChange={(value) => updateField('idCarreraDestino', value ? parseInt(value) : null)}
            options={carreras.map((c) => ({
              label: c.nombreCarrera,
              value: c.idCarrera,
            }))}
            placeholder="Seleccione carrera"
          />
          {carreras.length === 0 && !loadingData && (
            <Text style={{ color: theme.colors.destructive, fontSize: 11, marginTop: 4 }}>
              No hay carreras disponibles
            </Text>
          )}
        </View>

        {/* Gestión */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            GESTIÓN *
          </Text>
          <SelectField
            value={formData.idGestion || ''}
            onChange={(value) => updateField('idGestion', value ? parseInt(value) : null)}
            options={gestiones.map((g) => ({
              label: g.nombre,
              value: g.id,
            }))}
            placeholder="Seleccione gestión"
          />
          {gestiones.length === 0 && !loadingData && (
            <Text style={{ color: theme.colors.destructive, fontSize: 11, marginTop: 4 }}>
              No hay gestiones disponibles
            </Text>
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
            { backgroundColor: theme.colors.info },
          ]}
          disabled={loading}
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
