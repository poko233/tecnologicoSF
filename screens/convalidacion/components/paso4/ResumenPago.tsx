import { useTheme } from '@theme';
import { Text, TextInput, View } from 'react-native';

const METODOS_PAGO = [
  { value: 'TRANSFERENCIA', label: 'Banco Unión — depósito' },
  { value: 'EFECTIVO',      label: 'Pago en caja' },
  { value: 'QR',            label: 'QR / billetera digital' },
];

export function ResumenPago({
  cantidadMaterias,
  arancelPorMateria,
  descuento,
  totalConvalidacion,
  gestionLabel,
  metodo,
  comprobante,
  fechaPago,
  onArancelChange,
  onDescuentoChange,
  onMetodoChange,
  onComprobanteChange,
  onFechaPagoChange,
}: {
  cantidadMaterias: number;
  arancelPorMateria: number;
  descuento: number;
  totalConvalidacion: number;
  gestionLabel: string;
  metodo: string;
  comprobante: string;
  fechaPago: string;           // yyyy-mm-dd
  onArancelChange: (v: number) => void;
  onDescuentoChange: (v: number) => void;
  onMetodoChange: (v: string) => void;
  onComprobanteChange: (v: string) => void;
  onFechaPagoChange: (v: string) => void;
}) {
  const { theme } = useTheme();

  const rowStyle = { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 12 };
  const labelStyle = { fontSize: 14, color: theme.colors.textSecondary };
  const valueStyle = { fontSize: 15, fontWeight: '600' as const, color: theme.colors.text };
  const sectionLabel = { fontSize: 11, fontWeight: '600' as const, marginBottom: 8, marginTop: 16, letterSpacing: 0.3, color: theme.colors.textMuted };
  const inputStyle = {
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12,
    fontSize: 15, marginBottom: 16,
    backgroundColor: theme.colors.input,
    borderColor: theme.colors.inputBorder,
    color: theme.colors.text,
  };
  const miniInputStyle = {
    borderRadius: 6, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6,
    fontSize: 15, fontWeight: '600' as const, minWidth: 80, textAlign: 'right' as const,
    backgroundColor: theme.colors.input,
    borderColor: theme.colors.inputBorder,
    color: theme.colors.text,
  };

  return (
    <>
      <View style={{
        borderRadius: 12, borderWidth: 1, padding: 20, marginBottom: 24,
        backgroundColor: theme.colors.card, borderColor: theme.colors.border,
      }}>
        <View style={rowStyle}>
          <Text style={labelStyle}>Materias solicitadas</Text>
          <Text style={valueStyle}>{cantidadMaterias} materias</Text>
        </View>
        <View style={rowStyle}>
          <Text style={labelStyle}>Arancel por materia</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={valueStyle}>Bs.</Text>
            <TextInput
              style={miniInputStyle}
              value={String(arancelPorMateria)}
              onChangeText={v => onArancelChange(parseFloat(v) || 0)}
              keyboardType="numeric"
              placeholder="100"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
        </View>
        <View style={rowStyle}>
          <Text style={labelStyle}>Gestión</Text>
          <Text style={valueStyle}>{gestionLabel}</Text>
        </View>
        <View style={rowStyle}>
          <Text style={labelStyle}>Descuento</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.success }}>— Bs.</Text>
            <TextInput
              style={miniInputStyle}
              value={String(descuento)}
              onChangeText={v => onDescuentoChange(parseFloat(v) || 0)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 }} />
        <View style={{
          padding: 16, borderRadius: 10, flexDirection: 'row',
          justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: theme.colors.primary,
        }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Total a cancelar</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>Bs. {totalConvalidacion.toFixed(2)}</Text>
        </View>
      </View>
    </>
  );
}