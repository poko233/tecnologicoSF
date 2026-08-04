import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { createInventarioStyles } from "../styles/inventario.styles";
import {
    ArchivoImagenInventario,
    InventarioProducto,
} from "../types/inventario.types";

type Props = {
  visible: boolean;
  producto: InventarioProducto | null;
  procesando: boolean;
  onClose: () => void;
  onSubir: (
    producto: InventarioProducto,
    params: {
      archivo?: ArchivoImagenInventario | null;
      urlFoto?: string | null;
      esPrincipal?: boolean;
    },
  ) => Promise<InventarioProducto | null>;
  onPrincipal: (
    producto: InventarioProducto,
    idImagen: number,
  ) => Promise<InventarioProducto | null>;
  onEliminar: (
    producto: InventarioProducto,
    idImagen: number,
  ) => Promise<InventarioProducto | null>;
};

function color(colors: any, key: string, fallback: string) {
  return colors?.[key] ?? fallback;
}

function createStyles(colors: any, isMobile: boolean) {
  const card = color(colors, "card", "#FFFFFF");
  const background = color(colors, "background", "#F8FAFC");
  const backgroundSecondary = color(
    colors,
    "backgroundSecondary",
    "#F1F5F9",
  );
  const border = color(colors, "border", "#E2E8F0");
  const text = color(colors, "text", "#0F172A");
  const textSecondary = color(colors, "textSecondary", "#475569");
  const textMuted = color(
    colors,
    "textMuted",
    color(colors, "mutedForeground", "#64748B"),
  );
  const primary = color(colors, "primary", "#7C3AED");
  const primaryForeground = color(colors, "primaryForeground", "#FFFFFF");
  const destructive = color(colors, "destructive", "#DC2626");
  const success = color(colors, "success", "#16A34A");

  return StyleSheet.create({
    uploadSection: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: card,
      padding: isMobile ? 13 : 16,
      gap: 13,
    },
    sectionTitle: {
      color: text,
      fontSize: 16,
      fontWeight: "900",
    },
    sectionDescription: {
      marginTop: -7,
      color: textSecondary,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "700",
    },
    selectButton: {
      minHeight: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: primary,
      backgroundColor: `${primary}12`,
      paddingHorizontal: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },
    selectButtonText: {
      color: primary,
      fontSize: 13,
      fontWeight: "900",
    },
    selectedPreviewCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: `${primary}55`,
      backgroundColor: backgroundSecondary,
      padding: 12,
      gap: 11,
    },
    selectedPreviewHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    selectedPreviewTitleBox: {
      flex: 1,
      minWidth: 0,
    },
    selectedPreviewKicker: {
      color: primary,
      fontSize: 10,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.45,
    },
    selectedPreviewName: {
      marginTop: 3,
      color: text,
      fontSize: 12.5,
      lineHeight: 17,
      fontWeight: "800",
    },
    removeSelectedButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: `${destructive}45`,
      backgroundColor: `${destructive}10`,
    },
    selectedImageShell: {
      width: "100%",
      height: isMobile ? 210 : 290,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: border,
      backgroundColor: background,
      alignItems: "center",
      justifyContent: "center",
    },
    selectedImage: {
      width: "100%",
      height: "100%",
    },
    previewHint: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      paddingHorizontal: 2,
    },
    previewHintText: {
      flex: 1,
      color: textMuted,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "700",
    },
    principalSelector: {
      minHeight: 58,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: background,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    principalTextBox: {
      flex: 1,
      minWidth: 0,
    },
    principalTitle: {
      color: text,
      fontSize: 12.5,
      fontWeight: "900",
    },
    principalDescription: {
      marginTop: 2,
      color: textSecondary,
      fontSize: 10.5,
      lineHeight: 15,
      fontWeight: "700",
    },
    switchTrack: {
      width: 56,
      height: 34,
      borderRadius: 999,
      padding: 4,
      justifyContent: "center",
      borderWidth: 1,
    },
    switchThumb: {
      width: 24,
      height: 24,
      borderRadius: 999,
      backgroundColor: "#FFFFFF",
      shadowColor: "#000000",
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 2,
    },
    switchThumbActive: {
      alignSelf: "flex-end",
    },
    uploadButton: {
      minHeight: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: primary,
      backgroundColor: primary,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },
    uploadButtonText: {
      color: primaryForeground,
      fontSize: 13,
      fontWeight: "900",
    },
    registeredSection: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: card,
      padding: isMobile ? 13 : 16,
      gap: 13,
      overflow: "hidden",
    },
    registeredHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    registeredCount: {
      minHeight: 32,
      borderRadius: 999,
      paddingHorizontal: 11,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: `${primary}45`,
      backgroundColor: `${primary}12`,
    },
    registeredCountText: {
      color: primary,
      fontSize: 11,
      fontWeight: "900",
    },
    horizontalHint: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    horizontalHintText: {
      color: textMuted,
      fontSize: 10.5,
      fontWeight: "700",
    },
    imagesScroll: {
      width: "100%",
    },
    imagesScrollContent: {
      paddingRight: 8,
      paddingBottom: 14,
      gap: 12,
    },
    imageCard: {
      width: isMobile ? 220 : 245,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: backgroundSecondary,
      padding: 10,
      gap: 10,
    },
    imageShell: {
      width: "100%",
      height: 180,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: border,
      backgroundColor: background,
      position: "relative",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    principalBadge: {
      position: "absolute",
      top: 9,
      left: 9,
      minHeight: 27,
      borderRadius: 999,
      paddingHorizontal: 9,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: primary,
    },
    principalBadgeText: {
      color: primaryForeground,
      fontSize: 9.5,
      fontWeight: "900",
    },
    imageCardFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    imageState: {
      flex: 1,
      minWidth: 0,
    },
    imageStateTitle: {
      color: text,
      fontSize: 11.5,
      fontWeight: "900",
    },
    imageStateDescription: {
      marginTop: 2,
      color: textMuted,
      fontSize: 9.8,
      fontWeight: "700",
    },
    imageActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: border,
      backgroundColor: card,
    },
    actionButtonPrimary: {
      borderColor: `${primary}45`,
      backgroundColor: `${primary}10`,
    },
    actionButtonDanger: {
      borderColor: `${destructive}45`,
      backgroundColor: `${destructive}10`,
    },
    emptyBox: {
      minHeight: 210,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: backgroundSecondary,
      padding: 24,
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },
    emptyIcon: {
      width: 62,
      height: 62,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: `${primary}40`,
      backgroundColor: `${primary}12`,
    },
    emptyTitle: {
      color: text,
      fontSize: 16,
      fontWeight: "900",
      textAlign: "center",
    },
    emptyText: {
      maxWidth: 430,
      color: textSecondary,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "700",
      textAlign: "center",
    },
    disabled: {
      opacity: 0.5,
    },
    successText: {
      color: success,
    },
  });
}

export default function ProductoImagenesModal({
  visible,
  producto,
  procesando,
  onClose,
  onSubir,
  onPrincipal,
  onEliminar,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors as any;
  const { width } = useWindowDimensions();
  const isMobile = width < 720;

  const styles = useMemo(
    () => createInventarioStyles(colors, isMobile, width < 1100),
    [colors, isMobile, width],
  );

  const localStyles = useMemo(
    () => createStyles(colors, isMobile),
    [colors, isMobile],
  );

  const [productoLocal, setProductoLocal] =
    useState<InventarioProducto | null>(producto);
  const [archivo, setArchivo] = useState<ArchivoImagenInventario | null>(null);
  const [esPrincipal, setEsPrincipal] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setProductoLocal(producto);
    setArchivo(null);
    setEsPrincipal(false);
  }, [visible, producto]);

  if (!productoLocal) return null;

  const imagenes = Array.isArray(productoLocal.imagenes)
    ? productoLocal.imagenes
    : [];

  const noTieneImagenes = imagenes.length === 0;
  const marcarComoPrincipal = noTieneImagenes || esPrincipal;
  const subirDeshabilitado = procesando || !archivo;

  const cerrarModal = () => {
    if (procesando) return;
    onClose();
  };

  const limpiarSeleccion = () => {
    if (procesando) return;
    setArchivo(null);
    setEsPrincipal(false);
  };

  const seleccionarImagen = async () => {
    if (procesando) return;

    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/png", "image/webp"],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (resultado.canceled || !resultado.assets?.length) return;

      const asset = resultado.assets[0];

      if (asset.size && asset.size > 5 * 1024 * 1024) {
        Toast.show({
          type: "error",
          text1: "Imagen demasiado grande",
          text2: "La imagen no debe superar los 5 MB.",
        });
        return;
      }

      setArchivo({
        uri: asset.uri,
        name: asset.name || `producto-${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
        file: Platform.OS === "web" ? (asset as any).file : undefined,
      });

      if (noTieneImagenes) {
        setEsPrincipal(true);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "No se pudo seleccionar la imagen",
        text2: error?.message || "Intenta nuevamente.",
      });
    }
  };

  const agregarImagen = async () => {
    if (!archivo || procesando) {
      if (!archivo) {
        Toast.show({
          type: "error",
          text1: "Imagen requerida",
          text2: "Selecciona una imagen antes de continuar.",
        });
      }
      return;
    }

    const actualizado = await onSubir(productoLocal, {
      archivo,
      urlFoto: null,
      esPrincipal: marcarComoPrincipal,
    });

    if (!actualizado) return;

    setProductoLocal(actualizado);
    setArchivo(null);
    setEsPrincipal(false);
  };

  const convertirEnPrincipal = async (idImagen: number) => {
    if (procesando) return;

    const actualizado = await onPrincipal(productoLocal, idImagen);

    if (actualizado) {
      setProductoLocal(actualizado);
    }
  };

  const eliminarImagen = async (idImagen: number) => {
    if (procesando) return;

    const actualizado = await onEliminar(productoLocal, idImagen);

    if (actualizado) {
      setProductoLocal(actualizado);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cerrarModal}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderIcon}>
              <Ionicons
                name="images-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.modalHeaderText}>
              <ThemedText style={styles.modalTitle}>
                Imágenes del producto
              </ThemedText>

              <ThemedText style={styles.modalSubtitle} numberOfLines={2}>
                {productoLocal.nombre} · {productoLocal.sku || "Sin SKU"}
              </ThemedText>
            </View>

            <Pressable
              disabled={procesando}
              onPress={cerrarModal}
              style={[styles.closeButton, procesando && styles.disabled]}
            >
              <Ionicons name="close" size={23} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator
            persistentScrollbar
            keyboardShouldPersistTaps="handled"
          >
            <View style={localStyles.uploadSection}>
              <ThemedText style={localStyles.sectionTitle}>
                Agregar imagen
              </ThemedText>

              <ThemedText style={localStyles.sectionDescription}>
                Selecciona una imagen JPG, PNG o WEBP de máximo 5 MB. Podrás
                revisarla antes de subirla.
              </ThemedText>

              <Pressable
                disabled={procesando}
                onPress={() => void seleccionarImagen()}
                style={({ pressed }) => [
                  localStyles.selectButton,
                  (pressed || procesando) && localStyles.disabled,
                ]}
              >
                <Ionicons
                  name={archivo ? "refresh-outline" : "folder-open-outline"}
                  size={19}
                  color={colors.primary}
                />

                <ThemedText style={localStyles.selectButtonText}>
                  {archivo ? "Cambiar imagen seleccionada" : "Seleccionar imagen"}
                </ThemedText>
              </Pressable>

              {archivo && (
                <View style={localStyles.selectedPreviewCard}>
                  <View style={localStyles.selectedPreviewHeader}>
                    <View style={localStyles.selectedPreviewTitleBox}>
                      <ThemedText style={localStyles.selectedPreviewKicker}>
                        Vista previa antes de subir
                      </ThemedText>

                      <ThemedText
                        style={localStyles.selectedPreviewName}
                        numberOfLines={2}
                      >
                        {archivo.name}
                      </ThemedText>
                    </View>

                    <Pressable
                      disabled={procesando}
                      onPress={limpiarSeleccion}
                      style={({ pressed }) => [
                        localStyles.removeSelectedButton,
                        (pressed || procesando) && localStyles.disabled,
                      ]}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color={colors.destructive || "#DC2626"}
                      />
                    </Pressable>
                  </View>

                  <View style={localStyles.selectedImageShell}>
                    <Image
                      source={{ uri: archivo.uri }}
                      style={localStyles.selectedImage}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={localStyles.previewHint}>
                    <Ionicons
                      name="information-circle-outline"
                      size={17}
                      color={colors.primary}
                    />

                    <ThemedText style={localStyles.previewHintText}>
                      Esta imagen todavía no fue subida. Presiona “Subir imagen”
                      para guardarla en el producto.
                    </ThemedText>
                  </View>
                </View>
              )}

              <Pressable
                disabled={procesando || noTieneImagenes}
                onPress={() => setEsPrincipal((actual) => !actual)}
                style={[
                  localStyles.principalSelector,
                  (procesando || noTieneImagenes) && localStyles.disabled,
                ]}
              >
                <View style={localStyles.principalTextBox}>
                  <ThemedText style={localStyles.principalTitle}>
                    Usar como imagen principal
                  </ThemedText>

                  <ThemedText style={localStyles.principalDescription}>
                    {noTieneImagenes
                      ? "La primera imagen será principal automáticamente."
                      : "Reemplazará a la imagen principal actual."}
                  </ThemedText>
                </View>

                <View
                  style={[
                    localStyles.switchTrack,
                    {
                      backgroundColor: marcarComoPrincipal
                        ? colors.success || "#16A34A"
                        : colors.border,
                      borderColor: marcarComoPrincipal
                        ? colors.success || "#16A34A"
                        : colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      localStyles.switchThumb,
                      marcarComoPrincipal && localStyles.switchThumbActive,
                    ]}
                  />
                </View>
              </Pressable>

              <Pressable
                disabled={subirDeshabilitado}
                onPress={() => void agregarImagen()}
                style={({ pressed }) => [
                  localStyles.uploadButton,
                  (pressed || subirDeshabilitado) && localStyles.disabled,
                ]}
              >
                {procesando ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={colors.primaryForeground}
                  />
                )}

                <ThemedText style={localStyles.uploadButtonText}>
                  {procesando
                    ? "Subiendo imagen..."
                    : archivo
                      ? "Subir imagen"
                      : "Selecciona una imagen"}
                </ThemedText>
              </Pressable>
            </View>

            <View style={localStyles.registeredSection}>
              <View style={localStyles.registeredHeader}>
                <ThemedText style={localStyles.sectionTitle}>
                  Imágenes registradas
                </ThemedText>

                <View style={localStyles.registeredCount}>
                  <ThemedText style={localStyles.registeredCountText}>
                    {imagenes.length} imagen(es)
                  </ThemedText>
                </View>
              </View>

              {imagenes.length === 0 ? (
                <View style={localStyles.emptyBox}>
                  <View style={localStyles.emptyIcon}>
                    <Ionicons
                      name="image-outline"
                      size={31}
                      color={colors.primary}
                    />
                  </View>

                  <ThemedText style={localStyles.emptyTitle}>
                    Sin imágenes registradas
                  </ThemedText>

                  <ThemedText style={localStyles.emptyText}>
                    Selecciona una imagen en la sección superior, revisa la vista
                    previa y súbela para asociarla con este producto.
                  </ThemedText>
                </View>
              ) : (
                <>
                  <View style={localStyles.horizontalHint}>
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={17}
                      color={colors.primary}
                    />

                    <ThemedText style={localStyles.horizontalHintText}>
                      Desplázate horizontalmente para revisar todas las imágenes.
                    </ThemedText>
                  </View>

                  <ScrollView
                    horizontal
                    style={localStyles.imagesScroll}
                    contentContainerStyle={localStyles.imagesScrollContent}
                    showsHorizontalScrollIndicator
                    persistentScrollbar
                    nestedScrollEnabled
                    directionalLockEnabled
                  >
                    {imagenes.map((imagen) => (
                      <View key={imagen.idImagen} style={localStyles.imageCard}>
                        <View style={localStyles.imageShell}>
                          <Image
                            source={{ uri: imagen.urlFoto }}
                            style={localStyles.image}
                            resizeMode="cover"
                          />

                          {imagen.esPrincipal && (
                            <View style={localStyles.principalBadge}>
                              <ThemedText style={localStyles.principalBadgeText}>
                                PRINCIPAL
                              </ThemedText>
                            </View>
                          )}
                        </View>

                        <View style={localStyles.imageCardFooter}>
                          <View style={localStyles.imageState}>
                            <ThemedText
                              style={localStyles.imageStateTitle}
                              numberOfLines={1}
                            >
                              {imagen.esPrincipal
                                ? "Imagen principal"
                                : "Imagen secundaria"}
                            </ThemedText>

                            <ThemedText
                              style={localStyles.imageStateDescription}
                              numberOfLines={1}
                            >
                              {imagen.esPrincipal
                                ? "Visible en el listado"
                                : "Disponible en la galería"}
                            </ThemedText>
                          </View>

                          <View style={localStyles.imageActions}>
                            <Pressable
                              disabled={procesando || imagen.esPrincipal}
                              onPress={() =>
                                void convertirEnPrincipal(imagen.idImagen)
                              }
                              style={({ pressed }) => [
                                localStyles.actionButton,
                                localStyles.actionButtonPrimary,
                                (pressed || procesando || imagen.esPrincipal) &&
                                  localStyles.disabled,
                              ]}
                            >
                              <Ionicons
                                name={imagen.esPrincipal ? "star" : "star-outline"}
                                size={19}
                                color={colors.primary}
                              />
                            </Pressable>

                            <Pressable
                              disabled={procesando}
                              onPress={() => void eliminarImagen(imagen.idImagen)}
                              style={({ pressed }) => [
                                localStyles.actionButton,
                                localStyles.actionButtonDanger,
                                (pressed || procesando) && localStyles.disabled,
                              ]}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={18}
                                color={colors.destructive || "#DC2626"}
                              />
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              disabled={procesando}
              onPress={cerrarModal}
              style={[styles.cancelButton, procesando && styles.disabled]}
            >
              <Ionicons
                name="close-circle-outline"
                size={18}
                color={colors.text}
              />

              <ThemedText style={styles.cancelButtonText}>Cerrar</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}