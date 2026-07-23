import { useTheme } from '@theme';
import { Pressable, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { CuotaEditable, CuotaRow } from './CuotaRow';
import { MiniInput } from './MiniInput';

export function CuotasPanel({
  cuotas,
  cantidadCuotas,
  totalCuotasEditable,
  totalCondonado,
  totalConvalidacion,
  fechaBase,
  montoTodasCuotas,
  onCambiarTotal,
  onCambiarCantidad,
  onCambiarFechaBase,
  onCambiarMontoTodas,
  onActualizarCuota,
}: {
  cuotas: CuotaEditable[];
  cantidadCuotas: string;
  totalCuotasEditable: string;
  totalCondonado: number;
  totalConvalidacion: number;
  fechaBase: string;
  montoTodasCuotas: string;
  onCambiarTotal: (v: string) => void;
  onCambiarCantidad: (v: string) => void;
  onCambiarFechaBase: (v: string) => void;
  onCambiarMontoTodas: (v: string) => void;
  onActualizarCuota: (index: number, field: keyof CuotaEditable, value: string) => void;
}) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 800;

  return (
    <>
      {/* barra totales */}
      <View style={{
        borderWidth: 1, borderRadius: 16, padding: 14, gap: 12, marginBottom: 16,
        backgroundColor: theme.colors.card, borderColor: theme.colors.border,
        flexDirection: isMobile ? 'column' : 'row',
      }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '700' }}>
            Total convalidación
          </Text>
          <Text style={{ color: theme.colors.primary, fontWeight: '900', fontSize: 18 }}>
            Bs {totalConvalidacion.toFixed(2)}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '700' }}>
            Cuotas a cobrar
          </Text>
          <TextInput
            value={totalCuotasEditable}
            onChangeText={onCambiarTotal}
            keyboardType="numeric"
            style={{
              height: 38, borderRadius: 10, borderWidth: 1,
              borderColor: theme.colors.inputBorder,
              backgroundColor: theme.colors.input,
              color: theme.colors.text,
              paddingHorizontal: 10, fontWeight: '800',
            }}
          />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '700' }}>
            Condonado
          </Text>
          <Text style={{ color: '#16A34A', fontWeight: '900', fontSize: 18 }}>
            Bs {totalCondonado.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={{
        borderWidth: 1, borderRadius: 16, padding: 16, gap: 14, marginBottom: 16,
        backgroundColor: theme.colors.card, borderColor: theme.colors.border,
      }}>

        {/* 1. cantidad + stepper ARRIBA */}
        <View style={{
          borderWidth: 1, borderRadius: 14, padding: 12, gap: 12,
          backgroundColor: theme.colors.background, borderColor: theme.colors.border,
          flexDirection: isMobile ? 'column' : 'row', alignItems: 'center',
        }}>
          <MiniInput
            label="Cantidad de cuotas"
            value={cantidadCuotas}
            onChangeText={onCambiarCantidad}
            keyboardType="numeric"
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => onCambiarCantidad(String(Math.max(Number(cantidadCuotas || 1) - 1, 1)))}
              style={{
                width: 42, height: 42, borderRadius: 12, borderWidth: 1,
                justifyContent: 'center', alignItems: 'center',
                backgroundColor: theme.colors.card, borderColor: theme.colors.border,
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 18 }}>-</Text>
            </Pressable>
            <Pressable
              onPress={() => onCambiarCantidad(String(Number(cantidadCuotas || 1) + 1))}
              style={{
                width: 42, height: 42, borderRadius: 12, borderWidth: 1,
                justifyContent: 'center', alignItems: 'center',
                backgroundColor: theme.colors.primary, borderColor: theme.colors.primary,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* 2. fecha base + monto para todas ABAJO */}
        <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
          <MiniInput
            label="Fecha base cuotas"
            value={fechaBase}
            onChangeText={onCambiarFechaBase}
            placeholder="yyyy-mm-dd"
          />
          <MiniInput
            label="Monto para todas"
            value={montoTodasCuotas}
            onChangeText={onCambiarMontoTodas}
            keyboardType="numeric"
            placeholder="Ej: 500"
          />
        </View>

        {/* 3. lista cuotas */}
        <View style={{ gap: 8 }}>
          {cuotas.map((cuota, i) => (
            <CuotaRow
              key={`cuota-${cuota.numeroCuota}`}
              cuota={cuota}
              index={i}
              onChange={onActualizarCuota}
            />
          ))}
        </View>
      </View>
    </>
  );
}