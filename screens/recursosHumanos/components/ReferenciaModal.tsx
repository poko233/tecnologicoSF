import { Ionicons } from "@expo/vector-icons";
import {
    Linking,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { UsuarioRRHH } from "../types/recursosHumanos.types";

type Props = {
  visible: boolean;
  usuario: UsuarioRRHH | null;
  onClose: () => void;
};

export default function ReferenciasModal({ visible, usuario, onClose }: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const referencias =
    usuario?.numeroReferencias || usuario?.numero_referencias || [];

  const llamar = (numero?: string | null) => {
    if (!numero) return;
    Linking.openURL(`tel:${numero}`);
  };

  const whatsapp = (numero?: string | null) => {
    if (!numero) return;
    const limpio = numero.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/591${limpio}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <ThemedText style={styles.title}>Referencia del estudiante</ThemedText>
              <ThemedText style={styles.subtitle}>
                {usuario
                  ? `${usuario.nombres} ${usuario.apellidoPaterno}`
                  : "Usuario"}
              </ThemedText>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {!referencias.length ? (
              <View style={styles.empty}>
                <Ionicons
                  name="call-outline"
                  size={42}
                  color={colors.textMuted}
                />
                <ThemedText style={styles.emptyText}>
                  Este estudiante no tiene referencias registradas.
                </ThemedText>
              </View>
            ) : (
              referencias.map((ref, index) => (
                <View
                  key={ref.idNumeroReferencia || index}
                  style={styles.refCard}
                >
                  <View style={styles.iconBox}>
                    <Ionicons
                      name="call-outline"
                      size={22}
                      color={colors.primaryForeground}
                    />
                  </View>

                  <View style={styles.refBody}>
                    <ThemedText style={styles.refName}>
                      {ref.nombreContactoReferencia || "Sin nombre"}
                    </ThemedText>

                    <ThemedText style={styles.refText}>
                      Parentesco: {ref.parentesco || "Sin dato"}
                    </ThemedText>

                    <ThemedText style={styles.refPhone}>
                      {ref.numeroReferencia || "Sin teléfono"}
                    </ThemedText>

                    <View style={styles.actions}>
                      <Pressable
                        style={styles.callBtn}
                        onPress={() => llamar(ref.numeroReferencia)}
                      >
                        <Ionicons
                          name="call"
                          size={16}
                          color={colors.primaryForeground}
                        />
                        <ThemedText style={styles.actionText}>Llamar</ThemedText>
                      </Pressable>

                      <Pressable
                        style={styles.whatsBtn}
                        onPress={() => whatsapp(ref.numeroReferencia)}
                      >
                        <Ionicons
                          name="logo-whatsapp"
                          size={16}
                          color="#fff"
                        />
                        <ThemedText style={styles.whatsText}>WhatsApp</ThemedText>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    modal: {
      width: "100%",
      maxWidth: 600,
      maxHeight: "86%",
      backgroundColor: colors.modal,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    header: {
      padding: 20,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 16,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
    },
    subtitle: {
      marginTop: 4,
      color: colors.textSecondary,
      fontWeight: "700",
    },
    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      padding: 18,
      gap: 12,
    },
    refCard: {
      flexDirection: "row",
      gap: 12,
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    iconBox: {
      width: 46,
      height: 46,
      borderRadius: 23,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.primary,
    },
    refBody: {
      flex: 1,
      gap: 5,
    },
    refName: {
      color: colors.text,
      fontWeight: "900",
      fontSize: 16,
    },
    refText: {
      color: colors.textSecondary,
      fontWeight: "700",
    },
    refPhone: {
      color: colors.primary,
      fontWeight: "900",
      fontSize: 16,
    },
    actions: {
      marginTop: 8,
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },
    callBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    actionText: {
      color: colors.primaryForeground,
      fontWeight: "900",
      fontSize: 12,
    },
    whatsBtn: {
      backgroundColor: "#16a34a",
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    whatsText: {
      color: "#fff",
      fontWeight: "900",
      fontSize: 12,
    },
    empty: {
      padding: 38,
      alignItems: "center",
      gap: 10,
    },
    emptyText: {
      color: colors.textSecondary,
      fontWeight: "800",
      textAlign: "center",
    },
  });
}