import { useTheme } from '@theme'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator, Modal, Pressable,
  StyleSheet,
  Switch, Text, TextInput, View
} from 'react-native'
import { Area } from '../areas/area.types'
import { areaService } from '../areas/areaService'
import { Carrera } from './carrera.types'

interface Props {
  initialData: Carrera | null
  onSave: (data: Partial<Carrera>) => Promise<void>
  onCancel: () => void
}

const TIPO_OPTS = ['Carrera', 'Certificación', 'Capacitación', 'Cursos'] as const
const REGIMEN_OPTS = ['Anual', 'Semestral', 'Mensual', 'Otro'] as const

// ── Selector desplegable ───────────────────────────────────────────────────
function Dropdown({
  label, value, options, onSelect, placeholder, error, theme,
}: {
  label: string
  value: string
  options: readonly string[]
  onSelect: (v: string) => void
  placeholder?: string
  error?: string
  theme: any
}) {
  const [open, setOpen] = useState(false)
  return (
    <View>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.background,
            borderColor: error ? '#e53935' : theme.colors.inputBorder,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        ]}
      >
        <Text style={{ color: value ? theme.colors.text : theme.colors.textMuted, fontSize: 14 }}>
          {value || placeholder || 'Seleccionar...'}
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>▼</Text>
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={[styles.dropdownMenu, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
            <Text style={[styles.dropdownTitle, { color: theme.colors.textMuted, borderBottomColor: theme.colors.border }]}>
              {label}
            </Text>
            {options.map(opt => (
              <Pressable
                key={opt}
                onPress={() => { onSelect(opt); setOpen(false) }}
                style={[
                  styles.dropdownItem,
                  { borderBottomColor: theme.colors.border },
                  value === opt && { backgroundColor: theme.colors.primary + '18' },
                ]}
              >
                <Text style={{
                  color: value === opt ? theme.colors.primary : theme.colors.text,
                  fontSize: 14,
                  fontWeight: value === opt ? '700' : '400',
                }}>
                  {opt}
                </Text>
                {value === opt && <Text style={{ color: theme.colors.primary }}>✓</Text>}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

// ── Bloque de sección ──────────────────────────────────────────────────────
function SectionBlock({ title, children, theme }: { title: string; children: React.ReactNode; theme: any }) {
  return (
    <View style={[styles.sectionBlock, { borderColor: theme.colors.border, backgroundColor: theme.colors.secondary + '55' }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>{title}</Text>
      {children}
    </View>
  )
}

// ── Formulario principal ───────────────────────────────────────────────────
export function CarreraForm({ initialData, onSave, onCancel }: Props) {
  const { theme } = useTheme()
  const [areas, setAreas] = useState<Area[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    nombreCarrera: '',
    codigo: '',
    tipo: '',
    regimen: '' as string,
    duracion_anios: '',
    cuotas_por_anio: '',
    duracion_semestres: '',
    cuotas_por_semestre: '',
    duracion_meses: '',
    cuota_mensual: '',
    duracion_personalizada: '',
    descripcion_cuotas: '',
    cargaHoraria: '',
    costo_matricula: '',
    denominacionTitutloProfesional: '',
    idArea: '',
    estadoCarrera: true,
  })

  useEffect(() => {
    areaService.getAll().then(setAreas).catch(() => {})
  }, [])

  useEffect(() => {
    if (initialData) {
      setForm(f => ({
        ...f,
        nombreCarrera: initialData.nombreCarrera ?? '',
        codigo: initialData.codigo ?? '',
        tipo: initialData.tipo ?? '',
        regimen: initialData.regimen ?? '',
        duracion_anios: String(initialData.duracion ?? ''),
        duracion_meses: String(initialData.duracion_meses ?? ''),
        cargaHoraria: initialData.cargaHoraria ?? '',
        costo_matricula: String(initialData.costo_matricula ?? ''),
        cuota_mensual: String(initialData.cuota_mensual ?? ''),
        cuotas_por_anio: String(initialData.cuotas_por_anio ?? ''),
        denominacionTitutloProfesional: initialData.denominacionTitutloProfesional ?? '',
        idArea: String(initialData.idArea ?? ''),
        estadoCarrera: initialData.estadoCarrera === 'activo',
      }))
    }
  }, [initialData])

  const set = (key: string) => (val: string) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => { const c = { ...e }; delete c[key]; return c })
  }

  const setRegimen = (r: string) => {
    setForm(f => ({ ...f, regimen: r }))
    if (errors.regimen) setErrors(e => { const c = { ...e }; delete c.regimen; return c })
  }

  const inp = (field?: string) => [
    styles.input,
    {
      backgroundColor: theme.colors.background,
      borderColor: field && errors[field] ? '#e53935' : theme.colors.inputBorder,
      color: theme.colors.text,
    },
  ]
  const lbl = [styles.label, { color: theme.colors.text }]

  const handleSave = async () => {
    const e: Record<string, string> = {}
    if (!form.nombreCarrera.trim())                  e.nombreCarrera = 'El nombre es obligatorio'
    if (!form.codigo.trim())                         e.codigo = 'El código es obligatorio'
    if (!form.tipo)                                  e.tipo = 'El tipo es obligatorio'
    if (!form.regimen)                               e.regimen = 'El régimen es obligatorio'
    if (!form.cargaHoraria.trim())                   e.cargaHoraria = 'La carga horaria es obligatoria'
    if (!form.denominacionTitutloProfesional.trim()) e.denominacionTitutloProfesional = 'La denominación es obligatoria'
    if (!form.idArea)                                e.idArea = 'Debes seleccionar un área'

    if (form.regimen === 'Anual') {
      if (!form.duracion_anios)  e.duracion_anios  = 'La duración en años es obligatoria'
      if (!form.cuotas_por_anio) e.cuotas_por_anio = 'Las cuotas por año son obligatorias'
    }
    if (form.regimen === 'Semestral') {
      if (!form.duracion_semestres)  e.duracion_semestres  = 'La duración en semestres es obligatoria'
      if (!form.cuotas_por_semestre) e.cuotas_por_semestre = 'Las cuotas por semestre son obligatorias'
    }
    if (form.regimen === 'Mensual') {
      if (!form.duracion_meses) e.duracion_meses = 'La duración en meses es obligatoria'
      if (!form.cuota_mensual)  e.cuota_mensual  = 'La cuota mensual es obligatoria'
    }
    if (form.regimen === 'Otro') {
      if (!form.duracion_personalizada) e.duracion_personalizada = 'La duración es obligatoria'
    }

    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setSaving(true)

    let duracion: number | undefined
    let duracion_meses: number | undefined
    let cuota_mensual: number | undefined
    let cuotas_por_anio: number | undefined

    if (form.regimen === 'Anual') {
      duracion = Number(form.duracion_anios)
      duracion_meses = Number(form.duracion_anios) * 12
      cuotas_por_anio = Number(form.cuotas_por_anio)
    } else if (form.regimen === 'Semestral') {
      duracion_meses = Number(form.duracion_semestres) * 6
      duracion = Math.ceil(duracion_meses / 12)   // ← AGREGA ESTA LÍNEA
      cuotas_por_anio = Number(form.cuotas_por_semestre) * 2
    } else if (form.regimen === 'Mensual') {
      duracion_meses = Number(form.duracion_meses)
      duracion = Math.ceil(duracion_meses / 12)   // ← AGREGA ESTA LÍNEA
      cuota_mensual = Number(form.cuota_mensual)
      cuotas_por_anio = 12
    } else {
      duracion_meses = form.duracion_personalizada ? Number(form.duracion_personalizada) : undefined
      duracion = duracion_meses ? Math.ceil(duracion_meses / 12) : 0  // ← AGREGA ESTA LÍNEA
    }

    await onSave({
      nombreCarrera: form.nombreCarrera,
      codigo: form.codigo,
      tipo: form.tipo,
      regimen: form.regimen as any,
      duracion,
      duracion_meses,
      cargaHoraria: form.cargaHoraria,
      costo_matricula: form.costo_matricula ? Number(form.costo_matricula) : undefined,
      cuota_mensual,
      cuotas_por_anio,
      denominacionTitutloProfesional: form.denominacionTitutloProfesional,
      idArea: Number(form.idArea),
      estadoCarrera: form.estadoCarrera ? 'activo' : 'inactivo',
    })
    setSaving(false)
  }

  return (
    <View>
      {/* ── INFORMACIÓN GENERAL ── */}
      <SectionBlock title="Información general" theme={theme}>
        <Text style={lbl}>Nombre *</Text>
        <TextInput style={inp('nombreCarrera')} value={form.nombreCarrera} onChangeText={set('nombreCarrera')}
          placeholder="Nombre del programa" placeholderTextColor={theme.colors.textMuted} />
        {errors.nombreCarrera && <Text style={styles.errorText}>{errors.nombreCarrera}</Text>}

        <Text style={lbl}>Código *</Text>
        <TextInput style={inp('codigo')} value={form.codigo} onChangeText={set('codigo')}
          placeholder="ISC-001" placeholderTextColor={theme.colors.textMuted} />
        {errors.codigo && <Text style={styles.errorText}>{errors.codigo}</Text>}

        <Dropdown
          label="Tipo *"
          value={form.tipo}
          options={TIPO_OPTS}
          onSelect={v => { setForm(f => ({ ...f, tipo: v })); setErrors(e => { const c = { ...e }; delete c.tipo; return c }) }}
          placeholder="Selecciona una categoría"
          error={errors.tipo}
          theme={theme}
        />

        <Text style={lbl}>Carga Horaria *</Text>
        <TextInput style={inp('cargaHoraria')} value={form.cargaHoraria} onChangeText={set('cargaHoraria')}
          placeholder="Carga horaria total (ej: 3600 hrs)" placeholderTextColor={theme.colors.textMuted} />
        {errors.cargaHoraria && <Text style={styles.errorText}>{errors.cargaHoraria}</Text>}

        <Text style={lbl}>Denominación del título *</Text>
        <TextInput style={[inp('denominacionTitutloProfesional'), styles.multiline]}
          value={form.denominacionTitutloProfesional} onChangeText={set('denominacionTitutloProfesional')}
          placeholder="Ej: Licenciado/a en Ingeniería de Sistemas"
          placeholderTextColor={theme.colors.textMuted} multiline numberOfLines={2} />
        {errors.denominacionTitutloProfesional && <Text style={styles.errorText}>{errors.denominacionTitutloProfesional}</Text>}
      </SectionBlock>

      {/* ── RÉGIMEN Y DURACIÓN ── */}
      <SectionBlock title="Régimen y duración" theme={theme}>
        <Dropdown
          label="Régimen *"
          value={form.regimen}
          options={REGIMEN_OPTS}
          onSelect={setRegimen}
          placeholder="Selecciona el régimen"
          error={errors.regimen}
          theme={theme}
        />

        {form.regimen === 'Anual' && (
          <View>
            <View style={[styles.regimenTag, { backgroundColor: theme.colors.primary + '18' }]}>
              <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600' }}>📅 Régimen Anual</Text>
            </View>
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={lbl}>Duración (años) *</Text>
                <TextInput style={inp('duracion_anios')} value={form.duracion_anios} onChangeText={set('duracion_anios')}
                  keyboardType="numeric" placeholder="Ej: 5" placeholderTextColor={theme.colors.textMuted} />
                {errors.duracion_anios && <Text style={styles.errorText}>{errors.duracion_anios}</Text>}
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={lbl}>Cuotas por año *</Text>
                <TextInput style={inp('cuotas_por_anio')} value={form.cuotas_por_anio} onChangeText={set('cuotas_por_anio')}
                  keyboardType="numeric" placeholder="Ej: 12" placeholderTextColor={theme.colors.textMuted} />
                {errors.cuotas_por_anio && <Text style={styles.errorText}>{errors.cuotas_por_anio}</Text>}
              </View>
            </View>
            {form.duracion_anios ? (
              <View style={[styles.calcHint, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                  ≈ {Number(form.duracion_anios) * 12} meses en total
                  {form.cuotas_por_anio ? ` · ${Number(form.duracion_anios) * Number(form.cuotas_por_anio)} cuotas totales` : ''}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {form.regimen === 'Semestral' && (
          <View>
            <View style={[styles.regimenTag, { backgroundColor: '#7c3aed18' }]}>
              <Text style={{ color: '#7c3aed', fontSize: 12, fontWeight: '600' }}>📆 Régimen Semestral</Text>
            </View>
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={lbl}>Duración (semestres) *</Text>
                <TextInput style={inp('duracion_semestres')} value={form.duracion_semestres} onChangeText={set('duracion_semestres')}
                  keyboardType="numeric" placeholder="Ej: 10" placeholderTextColor={theme.colors.textMuted} />
                {errors.duracion_semestres && <Text style={styles.errorText}>{errors.duracion_semestres}</Text>}
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={lbl}>Cuotas por semestre *</Text>
                <TextInput style={inp('cuotas_por_semestre')} value={form.cuotas_por_semestre} onChangeText={set('cuotas_por_semestre')}
                  keyboardType="numeric" placeholder="Ej: 6" placeholderTextColor={theme.colors.textMuted} />
                {errors.cuotas_por_semestre && <Text style={styles.errorText}>{errors.cuotas_por_semestre}</Text>}
              </View>
            </View>
            {form.duracion_semestres ? (
              <View style={[styles.calcHint, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                  ≈ {Number(form.duracion_semestres) * 6} meses
                  {form.cuotas_por_semestre ? ` · ${Number(form.duracion_semestres) * Number(form.cuotas_por_semestre)} cuotas totales` : ''}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {form.regimen === 'Mensual' && (
          <View>
            <View style={[styles.regimenTag, { backgroundColor: '#05966918' }]}>
              <Text style={{ color: '#059669', fontSize: 12, fontWeight: '600' }}>🗓️ Régimen Mensual</Text>
            </View>
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={lbl}>Duración (meses) *</Text>
                <TextInput style={inp('duracion_meses')} value={form.duracion_meses} onChangeText={set('duracion_meses')}
                  keyboardType="numeric" placeholder="Ej: 6" placeholderTextColor={theme.colors.textMuted} />
                {errors.duracion_meses && <Text style={styles.errorText}>{errors.duracion_meses}</Text>}
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={lbl}>Cuota mensual (Bs.) *</Text>
                <TextInput style={inp('cuota_mensual')} value={form.cuota_mensual} onChangeText={set('cuota_mensual')}
                  keyboardType="numeric" placeholder="350" placeholderTextColor={theme.colors.textMuted} />
                {errors.cuota_mensual && <Text style={styles.errorText}>{errors.cuota_mensual}</Text>}
              </View>
            </View>
          </View>
        )}

        {form.regimen === 'Otro' && (
          <View>
            <View style={[styles.regimenTag, { backgroundColor: '#d9770618' }]}>
              <Text style={{ color: '#d97706', fontSize: 12, fontWeight: '600' }}>⚙️ Régimen personalizado</Text>
            </View>
            <Text style={lbl}>Duración personalizada *</Text>
            <TextInput style={inp('duracion_personalizada')} value={form.duracion_personalizada} onChangeText={set('duracion_personalizada')}
              placeholder="Ej: 18 meses, 3 trimestres…" placeholderTextColor={theme.colors.textMuted} />
            {errors.duracion_personalizada && <Text style={styles.errorText}>{errors.duracion_personalizada}</Text>}

            <Text style={lbl}>Descripción de cuotas</Text>
            <TextInput style={[inp(), styles.multiline]} value={form.descripcion_cuotas} onChangeText={set('descripcion_cuotas')}
              placeholder="Ej: 3 pagos al inicio de cada trimestre"
              placeholderTextColor={theme.colors.textMuted} multiline numberOfLines={2} />
          </View>
        )}
      </SectionBlock>

      {/* ── COSTOS ── */}
      <SectionBlock title="Costos" theme={theme}>
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={lbl}>Costo matrícula (Bs.)</Text>
            <TextInput style={inp()} value={form.costo_matricula} onChangeText={set('costo_matricula')}
              keyboardType="numeric" placeholder="500" placeholderTextColor={theme.colors.textMuted} />
          </View>
          {form.regimen !== 'Mensual' && (
            <>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={lbl}>Cuota mensual (Bs.)</Text>
                <TextInput style={inp()} value={form.cuota_mensual} onChangeText={set('cuota_mensual')}
                  keyboardType="numeric" placeholder="350" placeholderTextColor={theme.colors.textMuted} />
              </View>
            </>
          )}
        </View>

        {initialData?.costo != null && (
          <View style={[styles.costoBox, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }]}>
            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
              Costo total estimado: Bs. {initialData.costo.toLocaleString()}
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Calculado automáticamente por el sistema</Text>
          </View>
        )}
      </SectionBlock>

      {/* ── ÁREA ── */}
      <SectionBlock title="Área académica" theme={theme}>
        <Text style={[lbl, { marginTop: 4 }]}>Área *</Text>
        <View style={[styles.chipRow, errors.idArea ? styles.chipRowError : null]}>
          {areas.map(a => (
            <Pressable key={a.idArea}
              onPress={() => { setForm(f => ({ ...f, idArea: String(a.idArea) })); setErrors(e => { const c = { ...e }; delete c.idArea; return c }) }}
              style={[styles.chip, {
                backgroundColor: form.idArea === String(a.idArea) ? theme.colors.primary : theme.colors.secondary,
                borderColor: form.idArea === String(a.idArea) ? theme.colors.primary : theme.colors.border,
              }]}>
              <Text style={{ color: form.idArea === String(a.idArea) ? theme.colors.primaryForeground : theme.colors.text, fontSize: 13 }}>
                {a.nombre}
              </Text>
            </Pressable>
          ))}
        </View>
        {errors.idArea && <Text style={styles.errorText}>{errors.idArea}</Text>}
      </SectionBlock>

      {/* ── ESTADO ── */}
      <View style={styles.switchRow}>
        <Text style={[lbl, { marginBottom: 0, marginTop: 0 }]}>Estado activo</Text>
        <Switch value={form.estadoCarrera}
          onValueChange={v => setForm(f => ({ ...f, estadoCarrera: v }))}
          thumbColor={form.estadoCarrera ? theme.colors.primary : '#ccc'}
          trackColor={{ false: '#ddd', true: theme.colors.primary + '60' }} />
      </View>

      {/* ── BOTONES ── */}
      <View style={styles.btns}>
        <Pressable onPress={onCancel} style={[styles.btn, styles.btnOutline, { borderColor: theme.colors.border }]}>
          <Text style={[styles.btnText, { color: theme.colors.text }]}>Cancelar</Text>
        </Pressable>
        <Pressable onPress={handleSave} disabled={saving}
          style={[styles.btn, { backgroundColor: theme.colors.primary, opacity: saving ? 0.7 : 1 }]}>
          {saving
            ? <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
            : <Text style={[styles.btnText, { color: theme.colors.primaryForeground }]}>Guardar</Text>}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderRadius: 8, padding: 11, fontSize: 14 },
  multiline: { height: 70, textAlignVertical: 'top' },
  row2: { flexDirection: 'row', marginTop: 0 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chipRowError: { borderWidth: 1, borderColor: '#e53935', borderRadius: 8, padding: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 4 },
  costoBox: { borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 12, gap: 4 },
  btns: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 9, alignItems: 'center' },
  btnOutline: { borderWidth: 1, backgroundColor: 'transparent' },
  btnText: { fontWeight: '700', fontSize: 15 },
  errorText: { color: '#e53935', fontSize: 12, marginTop: 3 },
  sectionBlock: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  overlay: { flex: 1, backgroundColor: '#00000055', justifyContent: 'center', alignItems: 'center', padding: 24 },
  dropdownMenu: { width: '100%', borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  dropdownTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, padding: 12, borderBottomWidth: 1 },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  regimenTag: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginTop: 10, marginBottom: 2 },
  calcHint: { borderRadius: 6, borderWidth: 1, padding: 8, marginTop: 8 },
})