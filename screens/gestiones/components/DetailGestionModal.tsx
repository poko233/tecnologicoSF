// screens/gestiones/components/DetailGestionModal.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { formatDate, formatDateTimeNatural } from "@/utils/dateHelpers";
import { X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal as RNModal,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { springConfig } from "../animations/gestiones.animations";
import { Gestion } from "../types/gestiones.types";

interface DetailGestionModalProps {
  gestion: Gestion | null;
  onClose: () => void;
}

export function DetailGestionModal({
  gestion,
  onClose,
}: DetailGestionModalProps) {
  const { theme } = useTheme();

  if (!gestion) return null;

  return (
    <AnimatePresence>
      {gestion && (
        <RNModal transparent visible onRequestClose={onClose}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.centeredView}
          >
            {/* Overlay animado */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 200 }}
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.4)" },
              ]}
            />
            <MotiView
              from={{ opacity: 0, scale: 0.92, translateY: 30 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.95, translateY: -10 }}
              transition={{ type: "spring", ...springConfig }}
              style={[
                styles.modal,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.header,
                  { borderBottomColor: theme.colors.border },
                ]}
              >
                <ThemedText
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: theme.colors.text,
                  }}
                >
                  {gestion.nombre}
                </ThemedText>
                <Pressable onPress={onClose}>
                  <X size={20} color={theme.colors.textSecondary} />
                </Pressable>
              </View>
              <ScrollView
                style={styles.body}
                contentContainerStyle={{ gap: 16 }}
              >
                <DetailRow label="ID" value={`#${gestion.id}`} theme={theme} />
                <DetailRow
                  label="Período"
                  value={gestion.periodo}
                  theme={theme}
                />
                <DetailRow
                  label="Año"
                  value={String(gestion.anio)}
                  theme={theme}
                />
                <DetailRow
                  label="Fecha inicio"
                  value={formatDate(gestion.fecha_inicio)}
                  theme={theme}
                />
                <DetailRow
                  label="Fecha fin"
                  value={formatDate(gestion.fecha_fin)}
                  theme={theme}
                />
                <DetailRow
                  label="Estado"
                  value={gestion.estado}
                  theme={theme}
                />
                {gestion.cerrado_por && (
                  <DetailRow
                    label="Cerrado por"
                    value={gestion.cerrado_por.nombre}
                    theme={theme}
                  />
                )}
                {gestion.fecha_cierre && (
                  <DetailRow
                    label="Fecha cierre"
                    value={formatDateTimeNatural(gestion.fecha_cierre)} // ← ahora con hora
                    theme={theme}
                  />
                )}
                <DetailRow
                  label="Creado"
                  value={formatDateTimeNatural(gestion.created_at)} // ← ahora con hora
                  theme={theme}
                />
                <DetailRow
                  label="Actualizado"
                  value={formatDateTimeNatural(gestion.updated_at)} // ← ahora con hora
                  theme={theme}
                />
              </ScrollView>
              <View
                style={[styles.footer, { borderTopColor: theme.colors.border }]}
              >
                <Pressable
                  onPress={onClose}
                  style={[
                    styles.closeBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: theme.colors.primaryForeground,
                      fontWeight: "600",
                    }}
                  >
                    Cerrar
                  </ThemedText>
                </Pressable>
              </View>
            </MotiView>
          </KeyboardAvoidingView>
        </RNModal>
      )}
    </AnimatePresence>
  );
}

function DetailRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={styles.detailRow}>
      <ThemedText
        style={{
          color: theme.colors.textSecondary,
          fontSize: 13,
          marginBottom: 2,
        }}
      >
        {label}
      </ThemedText>
      <ThemedText
        style={{ color: theme.colors.text, fontSize: 15, fontWeight: "500" }}
      >
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  body: {
    padding: 16,
    maxHeight: 400,
  },
  detailRow: {
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    alignItems: "flex-end",
  },
  closeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});
