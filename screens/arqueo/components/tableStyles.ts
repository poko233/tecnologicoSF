// screens/arqueo/components/tableStyles.ts
import { StyleSheet } from "react-native";

export const tableStyles = StyleSheet.create({
  // Columnas para Arqueos (ya existentes)
  colId: { flex: 0.4 },
  colTurno: { flex: 0.8 },
  colApertura: { flex: 1.6 },
  colCierre: { flex: 1.6 },
  colTotal: { flex: 1.2, alignItems: "flex-end" },
  colEstado: { flex: 1.0, alignItems: "center" },
  colUsuario: { flex: 0.8 },
  colNombreCompleto: { flex: 1.5 },
  colAcciones: { flex: 0.6, alignItems: "flex-end" },

  // Columnas para Transacciones (Ingresos/Egresos) - SIN SUCURSAL
  colFecha: { flex: 1.6 },
  colBoleta: { flex: 0.8 },
  colCajero: { flex: 0.8 },
  colConcepto: { flex: 1.5 },
  colMonto: { flex: 1.0, alignItems: "flex-end" },
  colGlosa: {
    flex: 2.5, // Incrementa la proporción de ancho (ej. de 1 a 2.5)
    minWidth: 200, // Garantiza espacio mínimo horizontal
    paddingHorizontal: 4,
  },
  colTipoPago: { flex: 0.8 },
  // Reutilizamos colEstado y colAcciones
});
