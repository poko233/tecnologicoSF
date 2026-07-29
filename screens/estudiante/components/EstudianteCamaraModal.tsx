import { Ionicons } from "@expo/vector-icons";
import {
    CameraView,
    useCameraPermissions,
    type CameraCapturedPicture,
    type CameraType,
} from "expo-camera";
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { FotoEstudianteArchivo } from "../types/estudiante.types";

type Props = {
  visible: boolean;
  subiendo: boolean;
  onClose: () => void;
  onCapture: (archivo: FotoEstudianteArchivo) => Promise<boolean>;
};

async function convertirCapturaEnArchivo(
  captura: CameraCapturedPicture,
): Promise<FotoEstudianteArchivo> {
  const formato = String((captura as any).format || "jpg").toLowerCase();
  const extension = formato === "png" ? "png" : "jpg";
  const mimeType = extension === "png" ? "image/png" : "image/jpeg";
  const nombre = `foto-camara-${Date.now()}.${extension}`;

  if (Platform.OS !== "web") {
    return {
      uri: captura.uri,
      name: nombre,
      type: mimeType,
    };
  }

  const base64 = String(captura.base64 || captura.uri || "").trim();

  if (!base64) {
    throw new Error("La cámara no devolvió una imagen válida.");
  }

  const uri = base64.startsWith("data:")
    ? base64
    : base64.startsWith("blob:") ||
        base64.startsWith("http://") ||
        base64.startsWith("https://")
      ? base64
      : `data:${mimeType};base64,${base64}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const WebFile = (globalThis as any).File;
  const file =
    typeof WebFile === "function"
      ? new WebFile([blob], nombre, { type: mimeType })
      : blob;

  return {
    uri,
    name: nombre,
    type: mimeType,
    file,
  };
}

export default function EstudianteCamaraModal({
  visible,
  subiendo,
  onClose,
  onCapture,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("front");
  const [cameraReady, setCameraReady] = useState(false);
  const [capturando, setCapturando] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const trabajando = capturando || subiendo;
  const isMobile = width < 720;

  useEffect(() => {
    if (!visible) {
      setFacing("front");
      setCameraReady(false);
      setCapturando(false);
      setPreviewUri(null);
    }
  }, [visible]);

  const cerrar = () => {
    if (trabajando) return;
    onClose();
  };

  const alternarCamara = () => {
    if (trabajando) return;

    setCameraReady(false);
    setFacing((actual) => (actual === "front" ? "back" : "front"));
  };

  const tomarFoto = async () => {
    if (!cameraRef.current || !cameraReady || trabajando) return;

    try {
      setCapturando(true);

      const captura = await cameraRef.current.takePictureAsync({
        quality: 0.82,
        base64: Platform.OS === "web",
      });

      if (!captura) {
        throw new Error("No se pudo obtener la fotografía.");
      }

      const archivo = await convertirCapturaEnArchivo(captura);

      setPreviewUri(archivo.uri);

      /*
       * La subida se ejecuta inmediatamente después de tomar la fotografía.
       * El modal solamente se cierra cuando el backend confirma el guardado.
       */
      const guardada = await onCapture(archivo);

      if (!guardada) {
        setPreviewUri(null);
      }
    } catch (error: any) {
      console.error("Error al tomar la foto:", error);

      setPreviewUri(null);

      Toast.show({
        type: "error",
        text1: "No se pudo tomar la foto",
        text2:
          error?.message ||
          "Verifica que la cámara esté disponible y tenga permiso.",
      });
    } finally {
      setCapturando(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cerrar}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            isMobile && styles.modalMobile,
            {
              maxHeight: Math.min(height * 0.94, 860),
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="camera-outline" size={25} color={colors.primary} />
            </View>

            <View style={styles.headerText}>
              <ThemedText style={styles.title}>Tomar foto</ThemedText>
              <ThemedText style={styles.subtitle}>
                Busca una cámara disponible, toma la fotografía y súbela
                automáticamente al perfil del estudiante.
              </ThemedText>
            </View>

            <Pressable
              disabled={trabajando}
              onPress={cerrar}
              style={({ pressed }) => [
                styles.closeButton,
                (pressed || trabajando) && styles.disabled,
              ]}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.body}>
            {!permission ? (
              <CameraState
                icon="hourglass-outline"
                title="Preparando la cámara"
                description="Comprobando los permisos del dispositivo."
                loading
                colors={colors}
                styles={styles}
              />
            ) : !permission.granted ? (
              <CameraState
                icon="lock-closed-outline"
                title="Permiso de cámara requerido"
                description="Autoriza el acceso para poder tomar la foto del estudiante."
                colors={colors}
                styles={styles}
                action={
                  <Pressable
                    onPress={() => void requestPermission()}
                    style={styles.primaryButton}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={19}
                      color={colors.primaryForeground}
                    />
                    <ThemedText style={styles.primaryButtonText}>
                      Permitir cámara
                    </ThemedText>
                  </Pressable>
                }
              />
            ) : (
              <View style={styles.cameraShell}>
                {previewUri ? (
                  <Image
                    source={{ uri: previewUri }}
                    style={styles.camera}
                    resizeMode="cover"
                  />
                ) : (
                  <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing={facing}
                    mode="picture"
                    onCameraReady={() => setCameraReady(true)}
                  />
                )}

                <View style={styles.cameraTopBar}>
                  <View style={styles.cameraStatusBadge}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: cameraReady
                            ? colors.success || "#16A34A"
                            : colors.warning || "#F59E0B",
                        },
                      ]}
                    />
                    <ThemedText style={styles.cameraStatusText}>
                      {previewUri
                        ? "Subiendo fotografía"
                        : cameraReady
                          ? "Cámara lista"
                          : "Iniciando cámara"}
                    </ThemedText>
                  </View>

                  {!previewUri && (
                    <Pressable
                      disabled={trabajando}
                      onPress={alternarCamara}
                      style={({ pressed }) => [
                        styles.flipButton,
                        (pressed || trabajando) && styles.disabled,
                      ]}
                    >
                      <Ionicons
                        name="camera-reverse-outline"
                        size={22}
                        color="#FFFFFF"
                      />
                    </Pressable>
                  )}
                </View>

                {trabajando && (
                  <View style={styles.processingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <ThemedText style={styles.processingTitle}>
                      {capturando ? "Procesando foto..." : "Subiendo foto..."}
                    </ThemedText>
                    <ThemedText style={styles.processingText}>
                      No cierres esta ventana hasta que termine el guardado.
                    </ThemedText>
                  </View>
                )}
              </View>
            )}

            <View style={styles.helpCard}>
              <Ionicons
                name="information-circle-outline"
                size={21}
                color={colors.primary}
              />
              <ThemedText style={styles.helpText}>
                Coloca el rostro dentro del centro de la imagen. Puedes cambiar
                entre cámara frontal y trasera antes de tomar la foto.
              </ThemedText>
            </View>
          </View>

          <View style={styles.footer}>
            <Pressable
              disabled={trabajando}
              onPress={cerrar}
              style={({ pressed }) => [
                styles.cancelButton,
                (pressed || trabajando) && styles.disabled,
              ]}
            >
              <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
            </Pressable>

            <Pressable
              disabled={
                !permission?.granted ||
                !cameraReady ||
                trabajando ||
                Boolean(previewUri)
              }
              onPress={() => void tomarFoto()}
              style={({ pressed }) => [
                styles.captureButton,
                (!permission?.granted ||
                  !cameraReady ||
                  trabajando ||
                  Boolean(previewUri)) &&
                  styles.disabled,
                pressed && styles.capturePressed,
              ]}
            >
              {trabajando ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Ionicons
                  name="camera"
                  size={24}
                  color={colors.primaryForeground}
                />
              )}

              <ThemedText style={styles.captureButtonText}>
                {trabajando ? "Guardando..." : "Tomar y subir foto"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function CameraState({
  icon,
  title,
  description,
  loading = false,
  action,
  colors,
  styles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  loading?: boolean;
  action?: ReactNode;
  colors: any;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.stateBox}>
      <View style={styles.stateIcon}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Ionicons name={icon} size={36} color={colors.primary} />
        )}
      </View>

      <ThemedText style={styles.stateTitle}>{title}</ThemedText>
      <ThemedText style={styles.stateDescription}>{description}</ThemedText>
      {action}
    </View>
  );
}

function createStyles(colors: any) {
  const muted = colors.textMuted || colors.muted || colors.textSecondary;

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay || "rgba(2,6,23,0.88)",
      padding: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    modal: {
      width: "94%",
      maxWidth: 920,
      backgroundColor: colors.modal || colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 26,
      overflow: "hidden",
      shadowColor: "#000000",
      shadowOpacity: 0.34,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 16 },
      elevation: 18,
    },
    modalMobile: {
      width: "100%",
      borderRadius: 20,
    },
    header: {
      minHeight: 94,
      paddingHorizontal: 18,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
      backgroundColor: colors.card,
    },
    headerIcon: {
      width: 52,
      height: 52,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: `${colors.primary}55`,
      backgroundColor: `${colors.primary}18`,
      alignItems: "center",
      justifyContent: "center",
    },
    headerText: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "900",
    },
    subtitle: {
      marginTop: 4,
      color: colors.textSecondary,
      fontSize: 12.5,
      lineHeight: 18,
      fontWeight: "700",
    },
    closeButton: {
      width: 46,
      height: 46,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    body: {
      flexShrink: 1,
      minHeight: 0,
      padding: 18,
      gap: 14,
      backgroundColor: colors.modal || colors.card,
    },
    cameraShell: {
      width: "100%",
      maxWidth: 760,
      aspectRatio: 4 / 3,
      maxHeight: 560,
      alignSelf: "center",
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      backgroundColor: "#020617",
      position: "relative",
    },
    camera: {
      width: "100%",
      height: "100%",
    },
    cameraTopBar: {
      position: "absolute",
      top: 14,
      left: 14,
      right: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    cameraStatusBadge: {
      minHeight: 38,
      borderRadius: 999,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "rgba(2,6,23,0.76)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.22)",
    },
    statusDot: {
      width: 9,
      height: 9,
      borderRadius: 999,
    },
    cameraStatusText: {
      color: "#FFFFFF",
      fontSize: 11.5,
      fontWeight: "900",
    },
    flipButton: {
      width: 44,
      height: 44,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(2,6,23,0.76)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.22)",
    },
    processingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(2,6,23,0.76)",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: 24,
    },
    processingTitle: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "900",
      textAlign: "center",
    },
    processingText: {
      maxWidth: 420,
      color: "#CBD5E1",
      fontSize: 12.5,
      lineHeight: 18,
      fontWeight: "700",
      textAlign: "center",
    },
    stateBox: {
      minHeight: 390,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      padding: 28,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    stateIcon: {
      width: 80,
      height: 80,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: `${colors.primary}55`,
      backgroundColor: `${colors.primary}16`,
      alignItems: "center",
      justifyContent: "center",
    },
    stateTitle: {
      marginTop: 4,
      color: colors.text,
      fontSize: 19,
      fontWeight: "900",
      textAlign: "center",
    },
    stateDescription: {
      maxWidth: 480,
      color: muted,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "700",
      textAlign: "center",
    },
    primaryButton: {
      minHeight: 46,
      marginTop: 8,
      paddingHorizontal: 17,
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      color: colors.primaryForeground,
      fontWeight: "900",
      fontSize: 13,
    },
    helpCard: {
      width: "100%",
      maxWidth: 760,
      alignSelf: "center",
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      padding: 13,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    helpText: {
      flex: 1,
      color: muted,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "700",
    },
    footer: {
      minHeight: 76,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 12,
    },
    cancelButton: {
      minHeight: 48,
      paddingHorizontal: 17,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "900",
    },
    captureButton: {
      minHeight: 50,
      minWidth: 220,
      paddingHorizontal: 19,
      borderRadius: 16,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },
    capturePressed: {
      opacity: 0.8,
    },
    captureButtonText: {
      color: colors.primaryForeground,
      fontSize: 14,
      fontWeight: "900",
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
