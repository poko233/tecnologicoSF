import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import { Docente } from "../types/docente.types";

type Props = {
  docente: Docente;
  loadingEstado: boolean;
  onEdit: () => void;
  onToggleEstado: () => void;
};

function initials(docente: Docente) {
  const u = docente.usuario;
  const n = u?.nombres?.[0] ?? "D";
  const a = u?.apellidoPaterno?.[0] ?? "";
  return `${n}${a}`.toUpperCase();
}

export default function DocenteCard({
  docente,
  loadingEstado,
  onEdit,
  onToggleEstado,
}: Props) {
  const { theme } = useTheme();
  const usuario = docente.usuario;
  const activo = docente.estadoDocente === "activo";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          opacity: activo ? 1 : 0.72,
        },
      ]}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: activo ? theme.colors.primary : theme.colors.disabled },
        ]}
      >
        <ThemedText
          style={[styles.avatarText, { color: theme.colors.primaryForeground }]}
        >
          {initials(docente)}
        </ThemedText>
      </View>

      <View style={styles.info}>
        <View style={styles.top}>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.name, { color: theme.colors.text }]}>
              {usuario?.apellidoPaterno ?? ""} {usuario?.apellidoMaterno ?? ""},{" "}
              {usuario?.nombres ?? "Sin usuario"}
            </ThemedText>

            <ThemedText
              style={[styles.profession, { color: theme.colors.textSecondary }]}
            >
              {docente.abreviaturaProfesional || "-"} · {docente.profesion}
            </ThemedText>
          </View>

          <View
            style={[
              styles.badge,
              {
                backgroundColor: activo
                  ? theme.colors.success + "22"
                  : theme.colors.disabled,
                borderColor: activo ? theme.colors.success : theme.colors.border,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.badgeText,
                { color: activo ? theme.colors.success : theme.colors.disabledForeground },
              ]}
            >
              {activo ? "Activo" : "Inactivo"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.metaRow}>
          <ThemedText style={[styles.meta, { color: theme.colors.textSecondary }]}>
            CI: {usuario?.ci ?? "-"} {usuario?.expedido ?? ""}
          </ThemedText>

          <ThemedText style={[styles.meta, { color: theme.colors.textSecondary }]}>
            Reg: {docente.fechaRegistro ?? "-"}
          </ThemedText>
        </View>

        <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
          <Pressable
            onPress={onEdit}
            disabled={loadingEstado}
            style={[
              styles.iconButton,
              { backgroundColor: theme.colors.primarySubtle },
            ]}
          >
            <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
          </Pressable>

          <Pressable
            onPress={onToggleEstado}
            disabled={loadingEstado}
            style={[
              styles.iconButton,
              {
                backgroundColor: activo
                  ? theme.colors.destructive + "20"
                  : theme.colors.success + "20",
              },
            ]}
          >
            {loadingEstado ? (
              <ActivityIndicator
                size="small"
                color={activo ? theme.colors.destructive : theme.colors.success}
              />
            ) : (
              <Ionicons
                name={activo ? "ban-outline" : "checkmark-circle-outline"}
                size={20}
                color={activo ? theme.colors.destructive : theme.colors.success}
              />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 440,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    gap: 16,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 17,
    fontWeight: "900",
  },
  info: {
    flex: 1,
    gap: 10,
  },
  top: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  name: {
    fontSize: 15,
    fontWeight: "900",
  },
  profession: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginTop: 3,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
  },
  metaRow: {
    gap: 3,
  },
  meta: {
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    borderTopWidth: 1,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});