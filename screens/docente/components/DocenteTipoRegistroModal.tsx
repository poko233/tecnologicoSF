import { Ionicons } from "@expo/vector-icons";
import {
    Modal,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";

type Props = {
  visible: boolean;
  onClose: () => void;
  onNuevoDocente: () => void;
  onUsuarioExistente: () => void;
};

export default function DocenteTipoRegistroModal({
  visible,
  onClose,
  onNuevoDocente,
  onUsuarioExistente,
}: Props) {
  const { theme } = useTheme();

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
          { backgroundColor: theme.colors.overlay },
        ]}
      >
        <View
          style={[
            styles.modal,
            {
              backgroundColor: theme.colors.modal,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <ThemedText
                style={[
                  styles.title,
                  { color: theme.colors.text },
                ]}
              >
                Registrar docente
              </ThemedText>

              <ThemedText
                style={[
                  styles.subtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Selecciona cómo deseas registrar al docente.
              </ThemedText>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: theme.colors.input,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <Pressable
            onPress={onNuevoDocente}
            style={[
              styles.option,
              {
                backgroundColor: theme.colors.input,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: theme.colors.primarySubtle,
                },
              ]}
            >
              <Ionicons
                name="person-add-outline"
                size={29}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.optionInfo}>
              <ThemedText
                style={[
                  styles.optionTitle,
                  { color: theme.colors.text },
                ]}
              >
                Nuevo docente
              </ThemedText>

              <ThemedText
                style={[
                  styles.optionDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Registrar un usuario nuevo usando el formulario completo.
              </ThemedText>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.colors.textSecondary}
            />
          </Pressable>

          <Pressable
            onPress={onUsuarioExistente}
            style={[
              styles.option,
              {
                backgroundColor: theme.colors.input,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: theme.colors.primarySubtle,
                },
              ]}
            >
              <Ionicons
                name="people-outline"
                size={29}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.optionInfo}>
              <ThemedText
                style={[
                  styles.optionTitle,
                  { color: theme.colors.text },
                ]}
              >
                Usuario ya existente
              </ThemedText>

              <ThemedText
                style={[
                  styles.optionDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Buscar un usuario activo y agregarle el rol Docente.
              </ThemedText>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.colors.textSecondary}
            />
          </Pressable>

          <Pressable
            onPress={onClose}
            style={[
              styles.cancelButton,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.cancelText,
                { color: theme.colors.text },
              ]}
            >
              Cancelar
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  modal: {
    width: "100%",
    maxWidth: 620,
    borderWidth: 1,
    borderRadius: 26,
    padding: 20,
    gap: 14,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  headerInfo: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },

  closeButton: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  option: {
    minHeight: 108,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  optionInfo: {
    flex: 1,
    minWidth: 0,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  optionDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  cancelButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "900",
  },
});