// screens/gestiones/components/tableStyles.ts
import { StyleSheet } from "react-native";

export const tableStyles = StyleSheet.create({
  colId: { flex: 0.4 },
  colNombre: { flex: 1.5 },
  colPeriodo: { flex: 0.8 },
  colFechas: { flex: 1.2 },
  colEstado: { flex: 0.8 },
  colAcciones: { flex: 1, alignItems: "flex-end", justifyContent: "center" },
});
