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
  const nombre = `${usuario?.nombres ?? ""} ${usuario?.apellidoPaterno ?? ""}`.trim();
  const activo = docente?.estadoDocente === "activo";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: activo ? "#FEE2E2" : "#DCFCE7",
              },
            ]}
          >
            <Ionicons
              name={activo ? "warning-outline" : "checkmark-circle-outline"}
              size={34}
              color={activo ? "#DC2626" : "#16A34A"}
            />
          </View>

          <ThemedText style={styles.title}>
            {activo ? "Desactivar docente" : "Activar docente"}
          </ThemedText>

          <ThemedText style={[styles.message, { color: theme.colors.text }]}>
            {activo
              ? `Si desactivas a ${nombre || "este docente"}, ya no se podrá elegir para ninguna materia y no estará habilitado.`
              : `Si activas a ${nombre || "este docente"}, volverá a estar disponible para asignarlo a materias.`}
          </ThemedText>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              disabled={loading}
              style={[
                styles.cancelButton,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <ThemedText style={styles.cancelText}>Cancelar</ThemedText>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={[
                styles.confirmButton,
                {
                  backgroundColor: activo ? "#DC2626" : "#16A34A",
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={activo ? "ban-outline" : "checkmark-outline"}
                    size={20}
                    color="#fff"
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
    backgroundColor: "rgba(0,0,0,0.58)",
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
    opacity: 0.76,
    textAlign: "center",
    lineHeight: 21,
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
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
});