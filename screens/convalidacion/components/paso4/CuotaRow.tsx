import { useTheme } from '@theme';
import { Pressable, Text, View } from 'react-native';
import { MiniInput } from './MiniInput';

export type EstadoCuota = 'Debe' | 'Condonado';
export type CuotaEditable = {
  numeroCuota: number;
  monto: string;
  fecha_vencimiento: string;
  estadoCuota: EstadoCuota;
};

export function CuotaRow({
  cuota,
  index,
  onChange,
}: {
  cuota: CuotaEditable;
  index: number;
  onChange: (index: number, field: keyof CuotaEditable, value: string) => void;
}) {
  const { theme } = useTheme();
  const cond = cuota.estadoCuota === 'Condonado';

  return (
    <View style={{
      borderWidth: 1, borderRadius: 14, padding: 10, gap: 10,
      flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
      backgroundColor: cond ? '#16A34A22' : theme.colors.background,
      borderColor: cond ? '#16A34A' : theme.colors.border,
    }}>
      <View style={{
        width: 44, height: 44, borderRadius: 12, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: cond ? '#16A34A' : theme.colors.card,
        borderColor: cond ? '#16A34A' : theme.colors.border,
      }}>
        <Text style={{ color: cond ? '#fff' : theme.colors.text, fontWeight: '900' }}>
          #{cuota.numeroCuota}
        </Text>
      </View>

      <View style={{ flex: 1.2 }}>
        <MiniInput
          label="Monto"
          value={cuota.monto}
          onChangeText={v => onChange(index, 'monto', v)}
          keyboardType="numeric"
        />
      </View>

      <View style={{ flex: 1.2 }}>
        <MiniInput
          label="Fecha vencimiento"
          value={cuota.fecha_vencimiento}
          onChangeText={v => onChange(index, 'fecha_vencimiento', v)}
          placeholder="yyyy-mm-dd"
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['Debe', 'Condonado'] as EstadoCuota[]).map(est => {
          const act = cuota.estadoCuota === est;
          return (
            <Pressable
              key={est}
              onPress={() => onChange(index, 'estadoCuota', est)}
              style={{
                borderWidth: 1, borderRadius: 999,
                paddingVertical: 8, paddingHorizontal: 10,
                backgroundColor: act ? (est === 'Condonado' ? '#16A34A' : theme.colors.primary) : theme.colors.card,
                borderColor:      act ? (est === 'Condonado' ? '#16A34A' : theme.colors.primary) : theme.colors.border,
              }}
            >
              <Text style={{ color: act ? '#fff' : theme.colors.text, fontWeight: '900', fontSize: 11 }}>
                {est}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}