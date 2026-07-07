import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import { Docente } from "../types/docente.types";

type Props = {
  visible: boolean;
  docente: Docente | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmEstadoDocenteModal({
  visible,
  docente,
  loading,
  onClose,
  onConfirm,
}: Props) {
  const { theme } = useTheme();

  const usuario = docente?.usuario;

  const nombre = [
    usuario?.nombres ?? "",
    usuario?.apellidoPaterno ?? "",
    usuario?.apellidoMaterno ?? "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const activo = docente?.estadoDocente === "activo";

  const colorAccion = activo ? "#DC2626" : "#16A34A";
  const fondoIcono = activo ? "#FEE2E2" : "#DCFCE7";

  const titulo = activo ? "Desactivar docente" : "Activar docente";

  const mensaje = activo
    ? `Si desactivas a ${
        nombre || "este docente"
      }, ya no estará disponible para asignarlo a materias.`
    : `Si activas a ${
        nombre || "este docente"
      }, volverá a estar disponible para asignarlo a materias.`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: theme.colors.overlay,
          },
        ]}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: fondoIcono,
              },
            ]}
          >
            <Ionicons
              name={
                activo
                  ? "warning-outline"
                  : "checkmark-circle-outline"
              }
              size={34}
              color={colorAccion}
            />
          </View>

          <ThemedText
            style={[
              styles.title,
              {
                color: theme.colors.text,
              },
            ]}
          >
            {titulo}
          </ThemedText>

          <ThemedText
            style={[
              styles.message,
              {
                color: theme.colors.textSecondary,
              },
            ]}
          >
            {mensaje}
          </ThemedText>

          <View style={styles.actions}>
            <Pressable
              disabled={loading}
              onPress={onClose}
              style={[
                styles.cancelButton,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  opacity: loading ? 0.55 : 1,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.cancelText,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                Cancelar
              </ThemedText>
            </Pressable>

            <Pressable
              disabled={loading}
              onPress={onConfirm}
              style={[
                styles.confirmButton,
                {
                  backgroundColor: colorAccion,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name={
                      activo
                        ? "ban-outline"
                        : "checkmark-outline"
                    }
                    size={20}
                    color="#FFFFFF"
                  />

                  <ThemedText style={styles.confirmText}>
                    {activo ? "Sí, desactivar" : "Sí, activar"}
                  </ThemedText>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },

  card: {
    width: "100%",
    maxWidth: 430,
    borderWidth: 1,
    borderRadius: 26,
    padding: 22,
    alignItems: "center",
    gap: 14,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 10,
  },

  iconBox: {
    width: 74,
    height: 74,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },

  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    fontWeight: "600",
  },

  actions: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },

  cancelButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "900",
  },

  confirmButton: {
    flex: 1.4,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  confirmText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});