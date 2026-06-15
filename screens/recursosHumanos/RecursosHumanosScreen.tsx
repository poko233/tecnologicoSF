import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../components/ThemedText";
import { getToken } from "../../storage/secureStorage";
import { useTheme } from "../../theme/useTheme";
import UsuarioEditModal from "./components/UsuarioEditModal";
import UsuariosTable from "./components/UsuariosTable";
import { useRecursosHumanos } from "./hooks/useRecursosHumanos";
import {
  FotoUsuarioArchivo,
  UsuarioRRHH,
} from "./types/recursosHumanos.types";

const API_URL = "https://tecnologico.metasoft-bolivia.com/api";

export default function RecursosHumanosScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;

  const {
    usuarios,
    loading,
    guardando,
    cargandoDetalle,
    cargarUsuarios,
    guardarUsuario,
    cargarDetalleUsuario,
    actualizarFotoUsuario,
  } = useRecursosHumanos();

  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioRRHH | null>(
    null,
  );

  const [modalQrVisible, setModalQrVisible] = useState(false);
  const [confirmarQrVisible, setConfirmarQrVisible] = useState(false);
  const [regenerandoQr, setRegenerandoQr] = useState(false);

  const abrirEditar = async (usuario: UsuarioRRHH) => {
    setUsuarioEditando(usuario);

    const detalle = await cargarDetalleUsuario(usuario.id);

    if (detalle) {
      setUsuarioEditando(detalle);
    }
  };

  const cerrarEditar = () => {
    setUsuarioEditando(null);
  };

  const refrescarDetalleEditando = async (id: number) => {
    const detalle = await cargarDetalleUsuario(id);

    if (detalle) {
      setUsuarioEditando(detalle);
    }

    await cargarUsuarios();
  };

  const regenerarTodosQr = async () => {
    try {
      setRegenerandoQr(true);

      const token = await getToken();

      const res = await fetch(`${API_URL}/qr/regenerate-all`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "No se pudieron regenerar los QR.");
      }

      Toast.show({
        type: "success",
        text1: "QR regenerados",
        text2: "Se regeneraron todos los QR correctamente.",
      });

      setConfirmarQrVisible(false);
      setModalQrVisible(false);

      await cargarUsuarios();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Error al regenerar los QR.",
      });
    } finally {
      setRegenerandoQr(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <ThemedText style={styles.kicker}>Recursos humanos</ThemedText>

          <ThemedText style={styles.title}>
            Gestión general de usuarios
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Administra, edita y revisa los datos, documentos, QR y foto de los
            usuarios registrados en el sistema.
          </ThemedText>

          <Pressable
            style={styles.qrButton}
            onPress={() => setModalQrVisible(true)}
          >
            <ThemedText style={styles.qrButtonText}>
              Regenerar QR
            </ThemedText>
          </Pressable>
        </View>

        <UsuariosTable
          usuarios={usuarios}
          loading={loading}
          onEditar={abrirEditar}
          onRefresh={cargarUsuarios}
        />
      </ScrollView>

      <Modal
        visible={modalQrVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalQrVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ThemedText style={styles.modalTitle}>
              Regenerar códigos QR
            </ThemedText>

            <ThemedText style={styles.modalSubtitle}>
              Esta opción regenerará los códigos QR de todos los usuarios
              registrados en el sistema.
            </ThemedText>

            <View style={styles.sectionBox}>
              <ThemedText style={styles.sectionTitle}>
                Regenerar todos
              </ThemedText>

              <ThemedText style={styles.warningText}>
                Esta acción actualizará el QR de todos los usuarios. Los QR
                anteriores dejarán de ser los actuales.
              </ThemedText>

              <Pressable
                style={[
                  styles.dangerButton,
                  regenerandoQr && styles.disabledButton,
                ]}
                onPress={() => setConfirmarQrVisible(true)}
                disabled={regenerandoQr}
              >
                <ThemedText style={styles.actionButtonText}>
                  Regenerar todos los QR
                </ThemedText>
              </Pressable>
            </View>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setModalQrVisible(false)}
              disabled={regenerandoQr}
            >
              <ThemedText style={styles.cancelButtonText}>
                Cancelar
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={confirmarQrVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmarQrVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <ThemedText style={styles.confirmTitle}>
              ¿Estás seguro?
            </ThemedText>

            <ThemedText style={styles.confirmText}>
              Se regenerarán los QR de todos los usuarios registrados. Esta
              acción modificará los códigos actuales.
            </ThemedText>

            <View style={styles.confirmActions}>
              <Pressable
                style={styles.confirmCancelButton}
                onPress={() => setConfirmarQrVisible(false)}
                disabled={regenerandoQr}
              >
                <ThemedText style={styles.confirmCancelText}>
                  No, cancelar
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.confirmDangerButton,
                  regenerandoQr && styles.disabledButton,
                ]}
                onPress={regenerarTodosQr}
                disabled={regenerandoQr}
              >
                {regenerandoQr ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.confirmDangerText}>
                    Sí, regenerar
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <UsuarioEditModal
        visible={!!usuarioEditando}
        usuario={usuarioEditando}
        guardando={guardando}
        cargandoDetalle={cargandoDetalle}
        onClose={cerrarEditar}
        onSave={guardarUsuario}
        onFotoActualizada={async (
          id: number,
          archivo: FotoUsuarioArchivo,
        ) => {
          const actualizado = await actualizarFotoUsuario(id, archivo);

          if (actualizado) {
            setUsuarioEditando(actualizado);
            await cargarUsuarios();
          }
        }}
        onDocumentoSubido={async (id: number) => {
          await refrescarDetalleEditando(id);
        }}
      />
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      padding: 20,
      gap: 18,
      backgroundColor: colors.background,
    },
    hero: {
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 24,
    },
    kicker: {
      color: colors.primary,
      fontWeight: "900",
      textTransform: "uppercase",
      fontSize: 12,
      letterSpacing: 1,
    },
    title: {
      marginTop: 8,
      fontSize: 30,
      fontWeight: "900",
      color: colors.text,
    },
    subtitle: {
      marginTop: 8,
      color: colors.textSecondary,
      maxWidth: 760,
      lineHeight: 21,
      fontSize: 15,
    },
    qrButton: {
      marginTop: 18,
      alignSelf: "flex-start",
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 14,
    },
    qrButtonText: {
      color: "#fff",
      fontWeight: "900",
      fontSize: 14,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalCard: {
      width: "100%",
      maxWidth: 560,
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 22,
      gap: 16,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "900",
      color: colors.text,
    },
    modalSubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    sectionBox: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 16,
      gap: 12,
      backgroundColor: colors.background,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.text,
    },
    warningText: {
      color: colors.textSecondary,
      lineHeight: 20,
      fontSize: 14,
    },
    dangerButton: {
      backgroundColor: "#DC2626",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 46,
    },
    actionButtonText: {
      color: "#fff",
      fontWeight: "900",
      fontSize: 14,
    },
    cancelButton: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 14,
      alignItems: "center",
    },
    cancelButtonText: {
      color: colors.text,
      fontWeight: "900",
      fontSize: 14,
    },
    disabledButton: {
      opacity: 0.6,
    },
    confirmCard: {
      width: "100%",
      maxWidth: 440,
      backgroundColor: colors.card,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 22,
      gap: 16,
    },
    confirmTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
    },
    confirmText: {
      color: colors.textSecondary,
      lineHeight: 20,
      fontSize: 14,
    },
    confirmActions: {
      flexDirection: "row",
      gap: 12,
      justifyContent: "flex-end",
    },
    confirmCancelButton: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 14,
    },
    confirmCancelText: {
      color: colors.text,
      fontWeight: "900",
    },
    confirmDangerButton: {
      backgroundColor: "#DC2626",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 14,
      minWidth: 130,
      alignItems: "center",
    },
    confirmDangerText: {
      color: "#fff",
      fontWeight: "900",
    },
  });
}