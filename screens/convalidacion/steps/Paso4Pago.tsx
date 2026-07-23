import { useTheme } from '@theme';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { CuotaEditable } from '../components/paso4/CuotaRow';
import { CuotasPanel } from '../components/paso4/CuotasPanel';
import { ResumenPago } from '../components/paso4/ResumenPago';
import { useConvalidacionContext } from '../context/ConvalidacionContext';
import { usePaso4Pago } from '../hooks/usePaso4Pago';

const redondear2 = (v: number) => Math.round(v * 100) / 100;
const limpiarNum  = (v: string) => v.replace(/[^0-9.]/g, '');
const fechaHoy    = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const decimoDia = (base: string, meses: number) => {
  const [y, m] = (base || fechaHoy()).slice(0,10).split('-').map(Number);
  const f = new Date(y, m - 1 + meses, 10);
  return `${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,'0')}-10`;
};
const fechaPorIndice = (base: string, i: number) =>
  i === 0 ? fechaHoy() : decimoDia(base, i);

export function Paso4Pago() {
  const { theme } = useTheme();
  const { solicitudId, gestionLabel, retrocederPaso, resetWizard, idUsuario, idCarreraDestino } = useConvalidacionContext();
  const { cuota, formData, updateField, loading, loadingData, registrarPago, guardarPagoCuotas } = usePaso4Pago(solicitudId);

  const cantidadMaterias   = cuota?.cantidad_materias || 0;
  const totalConvalidacion = Math.max(cantidadMaterias * formData.arancel_por_materia - formData.descuento, 0);

  // ── matrícula ────────────────────────────────────────────────────────────
  const [montoMatricula,  setMontoMatricula]  = useState('0');
  const [fechaMatricula,  setFechaMatricula]  = useState(fechaHoy());

  // ── cuotas ───────────────────────────────────────────────────────────────
  const [cantidadCuotas,      setCantidadCuotas]      = useState('1');
  const [cuotas,              setCuotas]              = useState<CuotaEditable[]>([]);
  const [totalCuotasEditable, setTotalCuotasEditable] = useState('0');
  const [fechaBase,           setFechaBase]           = useState(fechaHoy());
  const [montoTodasCuotas,    setMontoTodasCuotas]    = useState('');
  const [fechaPagoStr,        setFechaPagoStr]        = useState(fechaHoy());

  const totalCondonado = useMemo(
    () => cuotas.reduce((s, c) => c.estadoCuota === 'Condonado' ? s + Number(c.monto||0) : s, 0),
    [cuotas],
  );

  // total de cuotas = total convalidacion - matricula
  const totalACobrarEnCuotas = Math.max(redondear2(totalConvalidacion - Number(montoMatricula||0)), 0);

  const generarCuotas = (cantidad: number, total: number, previas: CuotaEditable[] = []): CuotaEditable[] => {
    const n    = Math.max(cantidad, 1);
    const base = redondear2(total / n);
    const arr: CuotaEditable[] = Array.from({ length: n }, (_, i) => ({
      numeroCuota: i + 1,
      monto: base.toFixed(2),
      fecha_vencimiento: i === 0 ? fechaHoy() : (previas[i]?.fecha_vencimiento || fechaPorIndice(fechaBase, i)),
      estadoCuota: previas[i]?.estadoCuota ?? 'Debe',
    }));
    const suma = arr.reduce((s, c) => s + Number(c.monto), 0);
    const diff = redondear2(total - suma);
    if (arr.length) arr[arr.length-1].monto = redondear2(Number(arr[arr.length-1].monto) + diff).toFixed(2);
    return arr;
  };

  const repartir = (total: number, previas: CuotaEditable[]): CuotaEditable[] => {
    const deben = previas.filter(c => c.estadoCuota !== 'Condonado');
    if (!deben.length) return previas;
    const base = redondear2(total / deben.length);
    let acum = 0;
    return previas.map(c => {
      if (c.estadoCuota === 'Condonado') return c;
      const esUltima = c.numeroCuota === deben[deben.length-1].numeroCuota;
      const m = esUltima ? redondear2(total - acum) : base;
      acum = redondear2(acum + m);
      return { ...c, monto: m.toFixed(2) };
    });
  };

  // inicializar cuando llega el total
  useEffect(() => {
    if (!loadingData && totalConvalidacion > 0) {
      const t = redondear2(totalConvalidacion);
      setTotalCuotasEditable(t.toFixed(2));
      setCuotas(generarCuotas(1, t));
    }
  }, [loadingData, totalConvalidacion]);

  // recalcular cuotas cuando cambia la matrícula
  const cambiarMatricula = (v: string) => {
    const limpio = limpiarNum(v);
    setMontoMatricula(limpio);
    const nuevoTotal = Math.max(redondear2(totalConvalidacion - Number(limpio||0)), 0);
    setTotalCuotasEditable(nuevoTotal.toFixed(2));
    setCuotas(prev => repartir(nuevoTotal, prev));
  };

  const cambiarFechaMatricula = (v: string) => {
    setFechaMatricula(v);
    setFechaBase(v);
    setCuotas(prev => prev.map((c, i) => ({ ...c, fecha_vencimiento: fechaPorIndice(v, i) })));
  };

  const cambiarCantidad = (v: string) => {
    const n = Math.max(Number(v.replace(/\D/g,'') || '1'), 1);
    setCantidadCuotas(String(n));
    setCuotas(prev => generarCuotas(n, Number(totalCuotasEditable||0), prev));
  };

  const cambiarTotal = (v: string) => {
    const limpio = limpiarNum(v);
    setTotalCuotasEditable(limpio);
    setCuotas(prev => repartir(Number(limpio||0), prev));
  };

  const cambiarMontoTodas = (v: string) => {
    const limpio = limpiarNum(v);
    setMontoTodasCuotas(limpio);
    setCuotas(prev => {
      const nuevas = prev.map(c => ({ ...c, monto: limpio || '0' }));
      const nuevoTotal = nuevas.reduce((s,c) => c.estadoCuota !== 'Condonado' ? s+Number(c.monto||0) : s, 0);
      setTotalCuotasEditable(nuevoTotal.toFixed(2));
      return nuevas;
    });
  };

  const cambiarFechaBase = (v: string) => {
    setFechaBase(v);
    setCuotas(prev => prev.map((c, i) => ({ ...c, fecha_vencimiento: fechaPorIndice(v, i) })));
  };

  const actualizarCuota = (index: number, field: keyof CuotaEditable, value: string) => {
    const final = field === 'monto' ? limpiarNum(value) : value;
    setCuotas(prev => {
      const nuevas = prev.map((c, i) => i === index ? { ...c, [field]: final } : c);
      const totalDebe = nuevas.reduce((s,c) => c.estadoCuota !== 'Condonado' ? s+Number(c.monto||0) : s, 0);
      setTotalCuotasEditable(totalDebe.toFixed(2));
      return nuevas;
    });
  };

  const handleFinalizar = async () => {
    if (!formData.metodo) {
      Toast.show({ type: 'error', text1: 'Seleccione forma de pago' });
      return;
    }
    if (!fechaMatricula) {
      Toast.show({ type: 'error', text1: 'Ingrese fecha de matrícula' });
      return;
    }
    if (cuotas.some(c => !c.fecha_vencimiento)) {
      Toast.show({ type: 'error', text1: 'Todas las cuotas deben tener fecha' });
      return;
    }

    updateField('fecha_pago', new Date(fechaPagoStr + 'T12:00:00'));

    const success = await guardarPagoCuotas({
      idUsuario: idUsuario!,
      idCarrera: idCarreraDestino!,
      arancel_por_materia: formData.arancel_por_materia,
      matricula: {
        monto: Number(montoMatricula || 0),
        descuento: 0,
        fecha_vencimiento: fechaMatricula,
      },
      cuotas: cuotas.map((cuota, index) => ({
        numeroCuota: cuota.numeroCuota,
        monto: Number(cuota.monto || 0),
        descuento: 0,
        fecha_vencimiento: index === 0 ? fechaHoy() : cuota.fecha_vencimiento,
        estadoCuota: cuota.estadoCuota,
      })),
    });

    if (success) {
      Toast.show({ type: 'success', text1: '¡Solicitud completada!', visibilityTime: 5000 });
      setTimeout(() => resetWizard(), 2000);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.textSecondary, marginTop: 12 }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>PAGO POR CONVALIDACIÓN</Text>

      <ResumenPago
        cantidadMaterias={cantidadMaterias}
        arancelPorMateria={formData.arancel_por_materia}
        descuento={formData.descuento}
        totalConvalidacion={totalConvalidacion}
        gestionLabel={gestionLabel}
        metodo={formData.metodo}
        comprobante={formData.comprobante}
        fechaPago={fechaPagoStr}
        onArancelChange={v => updateField('arancel_por_materia', v)}
        onDescuentoChange={v => updateField('descuento', v)}
        onMetodoChange={v => updateField('metodo', v as any)}
        onComprobanteChange={v => updateField('comprobante', v)}
        onFechaPagoChange={setFechaPagoStr}
      />

      {/* ── MATRÍCULA ── */}
      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted, marginTop: 8 }]}>MATRÍCULA</Text>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        {/* totales */}
        <View style={styles.row}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Total convalidación</Text>
          <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 15 }}>Bs. {totalConvalidacion.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Matrícula</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Bs.</Text>
            <TextInput
              style={[styles.miniInput, { backgroundColor: theme.colors.input, borderColor: theme.colors.inputBorder, color: theme.colors.text }]}
              value={montoMatricula}
              onChangeText={cambiarMatricula}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
        </View>
        <View style={styles.row}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Fecha matrícula</Text>
          <TextInput
            style={[styles.miniInput, { backgroundColor: theme.colors.input, borderColor: theme.colors.inputBorder, color: theme.colors.text, minWidth: 120 }]}
            value={fechaMatricula}
            onChangeText={cambiarFechaMatricula}
            placeholder="yyyy-mm-dd"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>
      </View>

      {/* ── PLAN DE CUOTAS ── */}
      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted, marginTop: 8 }]}>PLAN DE CUOTAS</Text>

      <CuotasPanel
        cuotas={cuotas}
        cantidadCuotas={cantidadCuotas}
        totalCuotasEditable={totalCuotasEditable}
        totalCondonado={totalCondonado}
        totalConvalidacion={totalConvalidacion}
        fechaBase={fechaBase}
        montoTodasCuotas={montoTodasCuotas}
        onCambiarTotal={cambiarTotal}
        onCambiarCantidad={cambiarCantidad}
        onCambiarFechaBase={cambiarFechaBase}
        onCambiarMontoTodas={cambiarMontoTodas}
        onActualizarCuota={actualizarCuota}
      />

      {/* ── BOTONES ── */}
      <View style={styles.buttons}>
        <TouchableOpacity onPress={retrocederPaso} style={[styles.btn, { borderWidth: 1, borderColor: theme.colors.border }]} disabled={loading}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text }}>← Anterior</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleFinalizar} style={[styles.btn, { backgroundColor: theme.colors.success }]} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>✓ Finalizar</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 12, fontWeight: '600', marginBottom: 16, letterSpacing: 0.5 },
  card:         { borderRadius: 12, borderWidth: 1, padding: 20, marginBottom: 16 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  miniInput:    { borderRadius: 6, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, fontSize: 15, fontWeight: '600', minWidth: 80, textAlign: 'right' },
  buttons:      { flexDirection: 'row', marginTop: 24, marginBottom: 20 },
  btn:          { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10, minWidth: 120, alignItems: 'center' },
});