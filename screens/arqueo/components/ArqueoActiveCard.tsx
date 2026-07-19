// screens/arqueo/components/ArqueoActiveCard.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { formatDate } from "../../../utils/dateHelpers";
import { Arqueo } from "../types/arqueo.types";

interface ArqueoActiveCardProps {
  arqueo: Arqueo;
}

export const ArqueoActiveCard = ({ arqueo }: ArqueoActiveCardProps) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <ThemedText style={[styles.title, { color: theme.colors.text }]}>
        Turno activo: {arqueo.turno}
      </ThemedText>
      <View style={styles.row}>
        <ThemedText
          style={[styles.label, { color: theme.colors.textSecondary }]}
        >
          Apertura:
        </ThemedText>
        <ThemedText style={{ color: theme.colors.text }}>
          {formatDate(arqueo.fecha_apertura)}
        </ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText
          style={[styles.label, { color: theme.colors.textSecondary }]}
        >
          Saldo anterior:
        </ThemedText>
        <ThemedText style={{ color: theme.colors.text }}>
          {arqueo.saldo_anterior.toFixed(2)} Bs
        </ThemedText>
      </View>
      <View style={styles.divider} />
      <ThemedText style={[styles.subtitle, { color: theme.colors.text }]}>
        Totales hasta ahora:
      </ThemedText>
      <View style={styles.totalsRow}>
        <View style={styles.totalItem}>
          <ThemedText
            style={[styles.totalLabel, { color: theme.colors.textSecondary }]}
          >
            Efectivo
          </ThemedText>
          <ThemedText style={[styles.totalValue, { color: theme.colors.text }]}>
            {arqueo.total_efectivo?.toFixed(2) || "0.00"}
          </ThemedText>
        </View>
        <View style={styles.totalItem}>
          <ThemedText
            style={[styles.totalLabel, { color: theme.colors.textSecondary }]}
          >
            Tarjeta
          </ThemedText>
          <ThemedText style={[styles.totalValue, { color: theme.colors.text }]}>
            {arqueo.total_tarjeta?.toFixed(2) || "0.00"}
          </ThemedText>
        </View>
        <View style={styles.totalItem}>
          <ThemedText
            style={[styles.totalLabel, { color: theme.colors.textSecondary }]}
          >
            QR
          </ThemedText>
          <ThemedText style={[styles.totalValue, { color: theme.colors.text }]}>
            {arqueo.total_qr?.toFixed(2) || "0.00"}
          </ThemedText>
        </View>
        <View style={styles.totalItem}>
          <ThemedText
            style={[styles.totalLabel, { color: theme.colors.textSecondary }]}
          >
            Transferencia
          </ThemedText>
          <ThemedText style={[styles.totalValue, { color: theme.colors.text }]}>
            {arqueo.total_transferencia?.toFixed(2) || "0.00"}
          </ThemedText>
        </View>
      </View>
      <View
        style={[
          styles.totalGeneral,
          { backgroundColor: theme.colors.backgroundSecondary },
        ]}
      >
        <ThemedText
          style={[styles.totalGeneralLabel, { color: theme.colors.text }]}
        >
          Total general
        </ThemedText>
        <ThemedText
          style={[styles.totalGeneralValue, { color: theme.colors.primary }]}
        >
          {arqueo.total_general?.toFixed(2) || "0.00"} Bs
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  title: { fontSize: 18, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: {},
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
  subtitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  totalsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  totalItem: { flex: 1, minWidth: 70, alignItems: "center" },
  totalLabel: { fontSize: 11 },
  totalValue: { fontSize: 14, fontWeight: "600" },
  totalGeneral: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  totalGeneralLabel: { fontSize: 14, fontWeight: "600" },
  totalGeneralValue: { fontSize: 16, fontWeight: "700" },
});
