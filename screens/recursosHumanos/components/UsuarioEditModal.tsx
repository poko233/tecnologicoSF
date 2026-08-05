import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystemNS from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardTypeOptions,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { BASE_URL, httpClient } from "../../../http/httpClient";
import { useTheme } from "../../../theme/useTheme";
import {
  FotoUsuarioArchivo,
  RolRRHH,
  UsuarioFormRRHH,
  UsuarioRRHH,
} from "../types/recursosHumanos.types";

type TabKey = "datos" | "documentos" | "media";

type Props = {
  visible: boolean;
  usuario: UsuarioRRHH | null;
  rolesDisponibles: RolRRHH[];
  guardando: boolean;
  cargandoDetalle?: boolean;

  onClose: () => void;

  onSave: (
    id: number,
    form: UsuarioFormRRHH,
  ) => Promise<UsuarioRRHH | null>;

  onFotoActualizada?: (
    id: number,
    archivo: FotoUsuarioArchivo,
  ) => Promise<UsuarioRRHH | null>;

  onRegenerarQr: (
    id: number,
  ) => Promise<UsuarioRRHH | null>;

  onDocumentoSubido?: (
    id: number,
  ) => Promise<void> | void;
};

type InputProps = {
  label: string;
  value: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  colors: any;
  styles: ReturnType<typeof createStyles>;
  onChangeText: (value: string) => void;
};

const ROL_ESTUDIANTE_ID = 2;

const expedidos = [
  "LPZ",
  "CBBA",
  "OR",
  "PT",
  "TJ",
  "SCZ",
  "BN",
  "PD",
  "CH",
  "QR",
  "EXT",
];

const generos: UsuarioFormRRHH["genero"][] = [
  "MASCULINO",
  "FEMENINO",
];

const estados: UsuarioFormRRHH["estado"][] = [
  "ACTIVO",
  "INACTIVO",
];

function obtenerIdRol(rol: RolRRHH): number | null {
  const valor = rol.id ?? rol.idRol;
  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero <= 0) {
    return null;
  }

  return numero;
}

function nombreCompleto(
  usuario: UsuarioRRHH | null,
): string {
  if (!usuario) {
    return "Usuario";
  }

  return `${usuario.nombres || ""} ${
    usuario.apellidoPaterno || ""
  } ${usuario.apellidoMaterno || ""}`.trim();
}

function resolverUrlPublica(
  value?: string | null,
): string | null {
  const url = String(value || "").trim();

  if (!url || url === "0" || url.toLowerCase() === "null") {
    return null;
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  return `${BASE_URL}/${url.replace(/^\/+/, "")}`;
}

function resolverQrUsuario(
  usuario: UsuarioRRHH | null,
): string | null {
  const qrDirecto = String(
    usuario?.qrUrl || "",
  ).trim();

  if (qrDirecto && qrDirecto !== "0") {
    return resolverUrlPublica(qrDirecto);
  }

  const qrRaw = String(
    usuario?.codigo_qr || "",
  ).trim();

  if (
    !qrRaw ||
    qrRaw === "0" ||
    qrRaw.toLowerCase() === "null"
  ) {
    return null;
  }

  if (
    qrRaw.startsWith("http://") ||
    qrRaw.startsWith("https://") ||
    qrRaw.startsWith("blob:") ||
    qrRaw.startsWith("data:image")
  ) {
    return qrRaw;
  }

  if (
    qrRaw.startsWith("qr/") ||
    qrRaw.startsWith("qrs/") ||
    qrRaw.startsWith("codigos-qr/") ||
    qrRaw.startsWith("codigo-qr/")
  ) {
    return resolverUrlPublica(qrRaw);
  }

  return `data:image/png;base64,${qrRaw}`;
}

function FormInput({
  label,
  value,
  placeholder,
  keyboardType = "default",
  colors,
  styles,
  onChangeText,
}: InputProps) {
  return (
    <View style={styles.inputGroup}>
      <ThemedText style={styles.label}>
        {label}
      </ThemedText>

      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={
          keyboardType === "email-address"
            ? "none"
            : "sentences"
        }
        autoCorrect={false}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

export default function UsuarioEditModal({
  visible,
  usuario,
  rolesDisponibles,
  guardando,
  cargandoDetalle = false,
  onClose,
  onSave,
  onFotoActualizada,
  onRegenerarQr,
  onDocumentoSubido,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const styles = useMemo(
    () => createStyles(colors),
    [colors],
  );

  const [tab, setTab] =
    useState<TabKey>("datos");

  const [fotoLocal, setFotoLocal] =
    useState<FotoUsuarioArchivo | null>(null);

  const [subiendoFoto, setSubiendoFoto] =
    useState(false);

  const [
    subiendoDocumento,
    setSubiendoDocumento,
  ] = useState(false);

  const [regenerandoQr, setRegenerandoQr] =
    useState(false);

  const [
    qrRegeneradoUrl,
    setQrRegeneradoUrl,
  ] = useState<string | null>(null);

  const [form, setForm] =
    useState<UsuarioFormRRHH>({
      usuario: "",
      ci: "",
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      genero: "MASCULINO",
      fecha_nac: "",
      email: "",
      telefono: "",
      celular: "",
      direccion: "",
      expedido: "CBBA",
      estado: "ACTIVO",
      rolesIds: [],
      referenciaNombre: "",
      referenciaParentesco: "",
      referenciaNumero: "",
    });

  useEffect(() => {
    if (!visible) {
      return;
    }

    setTab("datos");
    setFotoLocal(null);
    setRegenerandoQr(false);
    setQrRegeneradoUrl(null);
  }, [visible, usuario?.id]);

  useEffect(() => {
    if (!usuario) {
      return;
    }

    const referenciaRaw =
      usuario.numeroReferencias ??
      usuario.numero_referencias;

    const referencia = Array.isArray(
      referenciaRaw,
    )
      ? referenciaRaw[0]
      : referenciaRaw;

    const rolesIds = (usuario.roles || [])
      .map(obtenerIdRol)
      .filter(
        (id): id is number => id !== null,
      );

    setForm({
      usuario: usuario.usuario || "",
      ci: usuario.ci || "",
      nombres: usuario.nombres || "",
      apellidoPaterno:
        usuario.apellidoPaterno || "",
      apellidoMaterno:
        usuario.apellidoMaterno || "",
      genero:
        usuario.genero === "FEMENINO" ||
        usuario.genero === "MASCULINO"
          ? usuario.genero
          : "MASCULINO",
      fecha_nac: usuario.fecha_nac || "",
      email: usuario.email || "",
      telefono: usuario.telefono || "",
      celular: usuario.celular || "",
      direccion: usuario.direccion || "",
      expedido: usuario.expedido || "CBBA",
      estado:
        usuario.estado === "INACTIVO" ||
        usuario.estado === "ACTIVO"
          ? usuario.estado
          : "ACTIVO",
      rolesIds,
      referenciaNombre:
        referencia?.nombreContactoReferencia ||
        "",
      referenciaParentesco:
        referencia?.parentesco || "",
      referenciaNumero:
        referencia?.numeroReferencia || "",
    });
  }, [usuario]);

  const setValue = <
    K extends keyof UsuarioFormRRHH,
  >(
    key: K,
    value: UsuarioFormRRHH[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const alternarRol = (idRol: number) => {
    const seleccionado =
      form.rolesIds.includes(idRol);

    if (
      seleccionado &&
      form.rolesIds.length === 1
    ) {
      Toast.show({
        type: "info",
        text1: "Rol requerido",
        text2:
          "El usuario debe tener al menos un rol.",
      });

      return;
    }

    setValue(
      "rolesIds",
      seleccionado
        ? form.rolesIds.filter(
            (id) => id !== idRol,
          )
        : [...form.rolesIds, idRol],
    );
  };

  const rolesTexto = useMemo(() => {
    const nombres = form.rolesIds
      .map((idSeleccionado) => {
        return rolesDisponibles.find(
          (rol) =>
            obtenerIdRol(rol) ===
            idSeleccionado,
        )?.rol;
      })
      .filter(Boolean);

    if (nombres.length) {
      return nombres.join(", ");
    }

    return (
      usuario?.roles
        ?.map((rol) => rol.rol)
        .filter(Boolean)
        .join(", ") || "Sin rol"
    );
  }, [
    form.rolesIds,
    rolesDisponibles,
    usuario?.roles,
  ]);

  const mostrarReferencia =
    form.rolesIds.includes(
      ROL_ESTUDIANTE_ID,
    );

  const qrServidorUrl = useMemo(
    () => resolverQrUsuario(usuario),
    [
      usuario?.id,
      usuario?.codigo_qr,
      usuario?.qrUrl,
    ],
  );

  const qrMostradoUrl =
    qrRegeneradoUrl || qrServidorUrl;

  const guardar = async () => {
    if (!usuario || guardando) {
      return;
    }

    if (!form.rolesIds.length) {
      Toast.show({
        type: "error",
        text1: "Selecciona un rol",
        text2:
          "El usuario debe tener al menos un rol.",
      });

      return;
    }

    const actualizado = await onSave(
      usuario.id,
      form,
    );

    if (actualizado) {
      onClose();
    }
  };

  const elegirFoto = async () => {
    try {
      const result =
        await DocumentPicker.getDocumentAsync({
          type: [
            "image/jpeg",
            "image/png",
            "image/webp",
          ],
          copyToCacheDirectory: true,
          multiple: false,
        });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      setFotoLocal({
        uri: asset.uri,
        name:
          asset.name ||
          `foto-${Date.now()}.jpg`,
        type:
          asset.mimeType || "image/jpeg",
      });
    } catch {
      Toast.show({
        type: "error",
        text1:
          "No se pudo seleccionar la foto.",
      });
    }
  };

  const subirFoto = async () => {
    if (
      !usuario ||
      !fotoLocal ||
      !onFotoActualizada
    ) {
      return;
    }

    try {
      setSubiendoFoto(true);

      const actualizado =
        await onFotoActualizada(
          usuario.id,
          fotoLocal,
        );

      if (!actualizado) {
        return;
      }

      setFotoLocal(null);

      Toast.show({
        type: "success",
        text1: "Foto actualizada",
        text2:
          "La fotografía se guardó correctamente.",
      });
    } finally {
      setSubiendoFoto(false);
    }
  };

  const subirDocumento = async () => {
    if (!usuario) {
      return;
    }

    try {
      const result =
        await DocumentPicker.getDocumentAsync({
          type: [
            "application/pdf",
            "image/jpeg",
            "image/png",
          ],
          multiple: false,
          copyToCacheDirectory: true,
        });

      if (result.canceled) {
        return;
      }

      const archivo = result.assets[0];
      const formData = new FormData();

      formData.append(
        "idUsuario",
        String(usuario.id),
      );

      formData.append(
        "nombreDocumento",
        archivo.name || "Documento",
      );

      if (Platform.OS === "web") {
        const webFile = (archivo as any).file;

        if (!webFile) {
          Toast.show({
            type: "error",
            text1: "Archivo inválido",
            text2:
              "No se pudo leer el archivo seleccionado.",
          });

          return;
        }

        formData.append(
          "archivo",
          webFile,
        );
      } else {
        formData.append(
          "archivo",
          {
            uri: archivo.uri,
            name:
              archivo.name ||
              "documento.pdf",
            type:
              archivo.mimeType ||
              "application/pdf",
          } as any,
        );
      }

      setSubiendoDocumento(true);

      await httpClient.postFormData(
        "/api/documentos-estudiante",
        formData,
      );

      Toast.show({
        type: "success",
        text1: "Documento subido",
        text2:
          archivo.name || "Documento",
      });

      if (onDocumentoSubido) {
        await onDocumentoSubido(
          usuario.id,
        );
      }
    } catch (error) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          "No se pudo subir el documento.",
      });
    } finally {
      setSubiendoDocumento(false);
    }
  };

  const abrirUrl = async (
    url?: string | null,
  ) => {
    if (!url) {
      return;
    }

    if (Platform.OS === "web") {
      window.open(url, "_blank");
      return;
    }

    const puedeAbrir =
      await Linking.canOpenURL(url);

    if (puedeAbrir) {
      await Linking.openURL(url);
    }
  };

  const generarNuevoQr = async () => {
    if (!usuario || regenerandoQr) {
      return;
    }

    try {
      setRegenerandoQr(true);

      const actualizado =
        await onRegenerarQr(usuario.id);

      if (!actualizado) {
        return;
      }

      const qrNuevo =
        resolverQrUsuario(actualizado);

      if (!qrNuevo) {
        Toast.show({
          type: "error",
          text1:
            "El QR no pudo visualizarse",
          text2:
            "El servidor respondió correctamente pero no devolvió una imagen QR válida.",
        });

        return;
      }

      setQrRegeneradoUrl(qrNuevo);

      Toast.show({
        type: "success",
        text1: "QR generado",
        text2:
          "El nuevo código QR se generó correctamente.",
      });
    } finally {
      setRegenerandoQr(false);
    }
  };

  const descargarQr = async () => {
    if (!usuario || !qrMostradoUrl) {
      Toast.show({
        type: "error",
        text1: "Sin QR",
        text2:
          "Este usuario no tiene un código QR.",
      });

      return;
    }

    const identificador = String(
      usuario.ci || usuario.id,
    )
      .trim()
      .replace(
        /[^a-zA-Z0-9_-]/g,
        "_",
      );

    const nombreArchivo =
      `qr-${identificador}.png`;

    try {
      if (Platform.OS === "web") {
        const link =
          document.createElement("a");

        link.href = qrMostradoUrl;
        link.download = nombreArchivo;
        link.rel =
          "noopener noreferrer";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return;
      }

      const FileSystem =
        FileSystemNS as any;

      const fileUri =
        `${FileSystem.cacheDirectory}${nombreArchivo}`;

      const esUrlRemota =
        qrMostradoUrl.startsWith(
          "http://",
        ) ||
        qrMostradoUrl.startsWith(
          "https://",
        );

      if (esUrlRemota) {
        const resultado =
          await FileSystem.downloadAsync(
            qrMostradoUrl,
            fileUri,
          );

        if (
          resultado?.status &&
          Number(resultado.status) >= 400
        ) {
          throw new Error(
            `No se pudo descargar el QR. Estado ${resultado.status}`,
          );
        }
      } else {
        const base64Data =
          qrMostradoUrl.includes(",")
            ? qrMostradoUrl.substring(
                qrMostradoUrl.indexOf(
                  ",",
                ) + 1,
              )
            : qrMostradoUrl;

        if (!base64Data.trim()) {
          throw new Error(
            "El contenido del QR está vacío.",
          );
        }

        await FileSystem.writeAsStringAsync(
          fileUri,
          base64Data,
          {
            encoding:
              FileSystem.EncodingType
                .Base64,
          },
        );
      }

      if (
        await Sharing.isAvailableAsync()
      ) {
        await Sharing.shareAsync(
          fileUri,
          {
            mimeType: "image/png",
            dialogTitle:
              "Descargar QR",
            UTI: "public.png",
          },
        );
      } else {
        Toast.show({
          type: "success",
          text1: "QR generado",
          text2: fileUri,
        });
      }
    } catch (error: any) {
      console.error(
        "Error descargando QR:",
        error,
      );

      Toast.show({
        type: "error",
        text1:
          "No se pudo descargar el QR",
        text2:
          error?.message ||
          "Intenta nuevamente.",
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={
        guardando ? undefined : onClose
      }
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View
              style={styles.headerTextBox}
            >
              <ThemedText
                style={styles.title}
              >
                {nombreCompleto(usuario)}
              </ThemedText>

              <ThemedText
                style={styles.subtitle}
              >
                {rolesTexto}
              </ThemedText>
            </View>

            <Pressable
              style={styles.closeBtn}
              onPress={onClose}
              disabled={guardando}
            >
              <Ionicons
                name="close"
                size={22}
                color={colors.text}
              />
            </Pressable>
          </View>

          <View style={styles.tabs}>
            <Pressable
              style={[
                styles.tabBtn,
                tab === "datos" &&
                  styles.tabActive,
              ]}
              onPress={() =>
                setTab("datos")
              }
            >
              <ThemedText
                style={[
                  styles.tabText,
                  tab === "datos" &&
                    styles.tabTextActive,
                ]}
              >
                Datos
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.tabBtn,
                tab === "documentos" &&
                  styles.tabActive,
              ]}
              onPress={() =>
                setTab("documentos")
              }
            >
              <ThemedText
                style={[
                  styles.tabText,
                  tab === "documentos" &&
                    styles.tabTextActive,
                ]}
              >
                Documentos asociados
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.tabBtn,
                tab === "media" &&
                  styles.tabActive,
              ]}
              onPress={() =>
                setTab("media")
              }
            >
              <ThemedText
                style={[
                  styles.tabText,
                  tab === "media" &&
                    styles.tabTextActive,
                ]}
              >
                QR y Foto
              </ThemedText>
            </Pressable>
          </View>

          {cargandoDetalle ? (
            <View
              style={styles.loadingBox}
            >
              <ActivityIndicator
                color={colors.primary}
                size="large"
              />

              <ThemedText
                style={styles.subtitle}
              >
                Cargando información...
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.content
              }
            >
              {tab === "datos" && (
                <>
                  <View
                    style={styles.grid}
                  >
                    <FormInput
                      label="Usuario"
                      value={form.usuario}
                      colors={colors}
                      styles={styles}
                      onChangeText={(v) =>
                        setValue(
                          "usuario",
                          v,
                        )
                      }
                    />

                    <FormInput
                      label="CI"
                      value={form.ci}
                      colors={colors}
                      styles={styles}
                      onChangeText={(v) =>
                        setValue("ci", v)
                      }
                    />

                    <FormInput
                      label="Nombres"
                      value={form.nombres}
                      colors={colors}
                      styles={styles}
                      onChangeText={(v) =>
                        setValue(
                          "nombres",
                          v,
                        )
                      }
                    />

                    <FormInput
                      label="Apellido paterno"
                      value={
                        form.apellidoPaterno
                      }
                      colors={colors}
                      styles={styles}
                      onChangeText={(v) =>
                        setValue(
                          "apellidoPaterno",
                          v,
                        )
                      }
                    />

                    <FormInput
                      label="Apellido materno"
                      value={
                        form.apellidoMaterno
                      }
                      colors={colors}
                      styles={styles}
                      onChangeText={(v) =>
                        setValue(
                          "apellidoMaterno",
                          v,
                        )
                      }
                    />

                    <FormInput
                      label="Fecha nacimiento"
                      placeholder="YYYY-MM-DD"
                      value={form.fecha_nac}
                      colors={colors}
                      styles={styles}
                      onChangeText={(v) =>
                        setValue(
                          "fecha_nac",
                          v,
                        )
                      }
                    />

                    <FormInput
                      label="Email"
                      value={form.email}
                      keyboardType="email-address"
                      colors={colors}
                      styles={styles}
                      onChangeText={(v) =>
                        setValue(
                          "email",
                          v,
                        )
                      }
                    />

                    <FormInput
                      label="Teléfono"
                      value={form.telefono}
                      keyboardType="phone-pad"
                      colors={colors}
                      styles={styles}
                      onChangeText={(v) =>
                        setValue(
                          "telefono",
                          v,
                        )
                      }
                    />

                    <FormInput
                      label="Celular"
                      value={form.celular}
                      keyboardType="phone-pad"
                      colors={colors}
                      styles={styles}
                      onChangeText={(v) =>
                        setValue(
                          "celular",
                          v,
                        )
                      }
                    />

                    <FormInput
                      label="Dirección"
                      value={form.direccion}
                      colors={colors}
                      styles={styles}
                      onChangeText={(v) =>
                        setValue(
                          "direccion",
                          v,
                        )
                      }
                    />
                  </View>

                  <View
                    style={styles.section}
                  >
                    <ThemedText
                      style={styles.label}
                    >
                      Género
                    </ThemedText>

                    <View
                      style={styles.row}
                    >
                      {generos.map((g) => {
                        const active =
                          form.genero === g;

                        return (
                          <Pressable
                            key={g}
                            style={[
                              styles.chip,
                              active &&
                                styles.chipActive,
                            ]}
                            onPress={() =>
                              setValue(
                                "genero",
                                g,
                              )
                            }
                          >
                            <ThemedText
                              style={[
                                styles.chipText,
                                active &&
                                  styles.chipTextActive,
                              ]}
                            >
                              {g}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View
                    style={styles.section}
                  >
                    <ThemedText
                      style={styles.label}
                    >
                      Expedido
                    </ThemedText>

                    <View
                      style={styles.wrap}
                    >
                      {expedidos.map(
                        (e) => {
                          const active =
                            form.expedido ===
                            e;

                          return (
                            <Pressable
                              key={e}
                              style={[
                                styles.smallChip,
                                active &&
                                  styles.chipActive,
                              ]}
                              onPress={() =>
                                setValue(
                                  "expedido",
                                  e,
                                )
                              }
                            >
                              <ThemedText
                                style={[
                                  styles.chipText,
                                  active &&
                                    styles.chipTextActive,
                                ]}
                              >
                                {e}
                              </ThemedText>
                            </Pressable>
                          );
                        },
                      )}
                    </View>
                  </View>

                  <View
                    style={styles.section}
                  >
                    <ThemedText
                      style={styles.label}
                    >
                      Estado
                    </ThemedText>

                    <View
                      style={styles.row}
                    >
                      {estados.map((e) => {
                        const active =
                          form.estado === e;

                        return (
                          <Pressable
                            key={e}
                            style={[
                              styles.chip,
                              active &&
                                styles.chipActive,
                              e ===
                                "INACTIVO" &&
                                active &&
                                styles.inactiveChip,
                            ]}
                            onPress={() =>
                              setValue(
                                "estado",
                                e,
                              )
                            }
                          >
                            <ThemedText
                              style={[
                                styles.chipText,
                                active &&
                                  styles.chipTextActive,
                              ]}
                            >
                              {e}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View
                    style={
                      styles.referenceBox
                    }
                  >
                    <ThemedText
                      style={
                        styles.sectionTitle
                      }
                    >
                      Roles del usuario
                    </ThemedText>

                    <ThemedText
                      style={styles.roleHint}
                    >
                      Selecciona uno o varios
                      roles. Los cambios se
                      guardarán en user_rol sin
                      duplicados.
                    </ThemedText>

                    <View
                      style={styles.wrap}
                    >
                      {rolesDisponibles.map(
                        (rol) => {
                          const idRol =
                            obtenerIdRol(
                              rol,
                            );

                          if (!idRol) {
                            return null;
                          }

                          const active =
                            form.rolesIds.includes(
                              idRol,
                            );

                          return (
                            <Pressable
                              key={idRol}
                              style={[
                                styles.roleChip,
                                active &&
                                  styles.chipActive,
                              ]}
                              onPress={() =>
                                alternarRol(
                                  idRol,
                                )
                              }
                            >
                              <Ionicons
                                name={
                                  active
                                    ? "checkmark-circle"
                                    : "ellipse-outline"
                                }
                                size={17}
                                color={
                                  active
                                    ? colors.primaryForeground
                                    : colors.textSecondary
                                }
                              />

                              <ThemedText
                                style={[
                                  styles.chipText,
                                  active &&
                                    styles.chipTextActive,
                                ]}
                              >
                                {rol.rol}
                              </ThemedText>
                            </Pressable>
                          );
                        },
                      )}
                    </View>
                  </View>

                  {mostrarReferencia && (
                    <View
                      style={
                        styles.referenceBox
                      }
                    >
                      <ThemedText
                        style={
                          styles.sectionTitle
                        }
                      >
                        Datos de referencia
                      </ThemedText>

                      <View
                        style={styles.grid}
                      >
                        <FormInput
                          label="Nombre contacto"
                          value={
                            form.referenciaNombre
                          }
                          colors={colors}
                          styles={styles}
                          onChangeText={(v) =>
                            setValue(
                              "referenciaNombre",
                              v,
                            )
                          }
                        />

                        <FormInput
                          label="Parentesco"
                          value={
                            form.referenciaParentesco
                          }
                          colors={colors}
                          styles={styles}
                          onChangeText={(v) =>
                            setValue(
                              "referenciaParentesco",
                              v,
                            )
                          }
                        />

                        <FormInput
                          label="Número referencia"
                          value={
                            form.referenciaNumero
                          }
                          keyboardType="phone-pad"
                          colors={colors}
                          styles={styles}
                          onChangeText={(v) =>
                            setValue(
                              "referenciaNumero",
                              v,
                            )
                          }
                        />
                      </View>
                    </View>
                  )}
                </>
              )}

              {tab === "documentos" && (
                <View
                  style={styles.section}
                >
                  <View
                    style={
                      styles.documentHeader
                    }
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={
                          styles.sectionTitle
                        }
                      >
                        Documentos asociados
                      </ThemedText>

                      <ThemedText
                        style={
                          styles.documentSubtitle
                        }
                      >
                        Sube documentos PDF,
                        JPG o PNG del usuario.
                      </ThemedText>
                    </View>

                    <Pressable
                      style={[
                        styles.uploadDocumentBtn,
                        subiendoDocumento &&
                          styles.disabled,
                      ]}
                      onPress={
                        subirDocumento
                      }
                      disabled={
                        subiendoDocumento
                      }
                    >
                      {subiendoDocumento ? (
                        <ActivityIndicator
                          color={
                            colors.primaryForeground
                          }
                        />
                      ) : (
                        <>
                          <Ionicons
                            name="cloud-upload-outline"
                            size={18}
                            color={
                              colors.primaryForeground
                            }
                          />

                          <ThemedText
                            style={
                              styles.openText
                            }
                          >
                            Subir documento
                          </ThemedText>
                        </>
                      )}
                    </Pressable>
                  </View>

                  {!usuario?.documentos
                    ?.length ? (
                    <View
                      style={styles.emptyBox}
                    >
                      <Ionicons
                        name="folder-open-outline"
                        size={40}
                        color={
                          colors.textMuted
                        }
                      />

                      <ThemedText
                        style={
                          styles.emptyText
                        }
                      >
                        Este usuario no tiene
                        documentos registrados.
                      </ThemedText>
                    </View>
                  ) : (
                    usuario.documentos.map(
                      (doc) => {
                        const archivoUrl =
                          doc.archivoUrl ||
                          doc.ubicacionArchivo;

                        const lower =
                          archivoUrl?.toLowerCase() ||
                          "";

                        const esImagen =
                          lower.endsWith(
                            ".jpg",
                          ) ||
                          lower.endsWith(
                            ".jpeg",
                          ) ||
                          lower.endsWith(
                            ".png",
                          );

                        const esPdf =
                          lower.endsWith(
                            ".pdf",
                          );

                        return (
                          <View
                            key={
                              doc.idDocumentoEstudiante
                            }
                            style={
                              styles.documentCard
                            }
                          >
                            <View
                              style={
                                styles.documentIcon
                              }
                            >
                              <Ionicons
                                name={
                                  esPdf
                                    ? "document-text-outline"
                                    : esImagen
                                      ? "image-outline"
                                      : "document-outline"
                                }
                                size={26}
                                color={
                                  colors.primary
                                }
                              />
                            </View>

                            <View
                              style={
                                styles.documentInfo
                              }
                            >
                              <ThemedText
                                style={
                                  styles.documentTitle
                                }
                              >
                                {doc.nombreDocumento ||
                                  "Documento"}
                              </ThemedText>

                              <ThemedText
                                style={
                                  styles.documentSubtitle
                                }
                              >
                                Estado:{" "}
                                {doc.estadoDocumento ||
                                  "Sin estado"}
                              </ThemedText>
                            </View>

                            {archivoUrl && (
                              <Pressable
                                style={
                                  styles.openBtn
                                }
                                onPress={() =>
                                  abrirUrl(
                                    archivoUrl,
                                  )
                                }
                              >
                                <Ionicons
                                  name="open-outline"
                                  size={18}
                                  color={
                                    colors.primaryForeground
                                  }
                                />

                                <ThemedText
                                  style={
                                    styles.openText
                                  }
                                >
                                  Ver archivo
                                </ThemedText>
                              </Pressable>
                            )}
                          </View>
                        );
                      },
                    )
                  )}
                </View>
              )}

              {tab === "media" && (
                <View
                  style={styles.mediaGrid}
                >
                  <View
                    style={styles.mediaCard}
                  >
                    <ThemedText
                      style={
                        styles.sectionTitle
                      }
                    >
                      Código QR
                    </ThemedText>

                    {qrMostradoUrl ? (
                      <View
                        style={styles.qrBox}
                      >
                        <Image
                          source={{
                            uri: qrMostradoUrl,
                          }}
                          style={
                            styles.qrImage
                          }
                        />
                      </View>
                    ) : (
                      <View
                        style={styles.emptyBox}
                      >
                        <Ionicons
                          name="qr-code-outline"
                          size={46}
                          color={
                            colors.textMuted
                          }
                        />

                        <ThemedText
                          style={
                            styles.emptyText
                          }
                        >
                          Este usuario no tiene
                          un código QR.
                        </ThemedText>
                      </View>
                    )}

                    <View
                      style={styles.qrActions}
                    >
                      {qrMostradoUrl && (
                        <Pressable
                          style={
                            styles.openBtn
                          }
                          onPress={
                            descargarQr
                          }
                          disabled={
                            regenerandoQr
                          }
                        >
                          <Ionicons
                            name="download-outline"
                            size={18}
                            color={
                              colors.primaryForeground
                            }
                          />

                          <ThemedText
                            style={
                              styles.openText
                            }
                          >
                            Descargar QR
                          </ThemedText>
                        </Pressable>
                      )}

                      <Pressable
                        style={[
                          styles.generateQrBtn,
                          regenerandoQr &&
                            styles.disabled,
                        ]}
                        onPress={
                          generarNuevoQr
                        }
                        disabled={
                          regenerandoQr
                        }
                      >
                        {regenerandoQr ? (
                          <ActivityIndicator
                            color={
                              colors.primary
                            }
                          />
                        ) : (
                          <>
                            <Ionicons
                              name="refresh-outline"
                              size={18}
                              color={
                                colors.primary
                              }
                            />

                            <ThemedText
                              style={
                                styles.generateQrText
                              }
                            >
                              Generar nuevo QR
                            </ThemedText>
                          </>
                        )}
                      </Pressable>
                    </View>

                    <ThemedText
                      style={styles.qrHelper}
                    >
                      Al generar uno nuevo se
                      reemplazará el código QR
                      guardado actualmente para
                      este usuario.
                    </ThemedText>
                  </View>

                  <View
                    style={styles.mediaCard}
                  >
                    <ThemedText
                      style={
                        styles.sectionTitle
                      }
                    >
                      Foto del usuario
                    </ThemedText>

                    {fotoLocal?.uri ? (
                      <Image
                        source={{
                          uri: fotoLocal.uri,
                        }}
                        style={
                          styles.userPhoto
                        }
                      />
                    ) : usuario?.fotoUrl ? (
                      <Image
                        source={{
                          uri: usuario.fotoUrl,
                        }}
                        style={
                          styles.userPhoto
                        }
                      />
                    ) : (
                      <View
                        style={
                          styles.userPhotoEmpty
                        }
                      >
                        <Ionicons
                          name="person-outline"
                          size={54}
                          color={
                            colors.textMuted
                          }
                        />
                      </View>
                    )}

                    <View
                      style={
                        styles.photoActions
                      }
                    >
                      <Pressable
                        style={
                          styles.selectPhotoBtn
                        }
                        onPress={elegirFoto}
                      >
                        <Ionicons
                          name="image-outline"
                          size={18}
                          color={
                            colors.primary
                          }
                        />

                        <ThemedText
                          style={
                            styles.selectPhotoText
                          }
                        >
                          Elegir foto
                        </ThemedText>
                      </Pressable>

                      {usuario?.fotoUrl && (
                        <Pressable
                          style={
                            styles.openBtn
                          }
                          onPress={() =>
                            abrirUrl(
                              usuario.fotoUrl,
                            )
                          }
                        >
                          <Ionicons
                            name="open-outline"
                            size={18}
                            color={
                              colors.primaryForeground
                            }
                          />

                          <ThemedText
                            style={
                              styles.openText
                            }
                          >
                            Abrir foto
                          </ThemedText>
                        </Pressable>
                      )}
                    </View>

                    {fotoLocal && (
                      <Pressable
                        style={[
                          styles.savePhotoBtn,
                          subiendoFoto &&
                            styles.disabled,
                        ]}
                        onPress={subirFoto}
                        disabled={
                          subiendoFoto
                        }
                      >
                        {subiendoFoto ? (
                          <ActivityIndicator
                            color={
                              colors.primaryForeground
                            }
                          />
                        ) : (
                          <>
                            <Ionicons
                              name="cloud-upload-outline"
                              size={18}
                              color={
                                colors.primaryForeground
                              }
                            />

                            <ThemedText
                              style={
                                styles.saveText
                              }
                            >
                              Subir foto
                            </ThemedText>
                          </>
                        )}
                      </Pressable>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          {tab === "datos" && (
            <View style={styles.footer}>
              <Pressable
                style={[
                  styles.cancelBtn,
                  guardando &&
                    styles.disabled,
                ]}
                onPress={onClose}
                disabled={guardando}
              >
                <ThemedText
                  style={styles.cancelText}
                >
                  Cancelar
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.saveBtn,
                  guardando &&
                    styles.disabled,
                ]}
                onPress={guardar}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator
                    color={
                      colors.primaryForeground
                    }
                  />
                ) : (
                  <>
                    <Ionicons
                      name="save-outline"
                      size={18}
                      color={
                        colors.primaryForeground
                      }
                    />

                    <ThemedText
                      style={styles.saveText}
                    >
                      Guardar
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor:
        colors.overlay ||
        "rgba(0,0,0,0.62)",
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },

    modal: {
      width: "100%",
      maxWidth: 980,
      maxHeight: "94%",
      backgroundColor:
        colors.modal || colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 8,
    },

    header: {
      padding: 22,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      backgroundColor: colors.card,
    },

    headerTextBox: {
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
      lineHeight: 20,
    },

    closeBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },

    tabs: {
      flexDirection: "row",
      gap: 10,
      padding: 12,
      backgroundColor:
        colors.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    tabBtn: {
      flex: 1,
      minHeight: 42,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 10,
    },

    tabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    tabText: {
      color: colors.textSecondary,
      fontWeight: "900",
      fontSize: 13,
      textAlign: "center",
    },

    tabTextActive: {
      color: colors.primaryForeground,
    },

    loadingBox: {
      padding: 60,
      alignItems: "center",
      gap: 12,
    },

    content: {
      padding: 22,
      gap: 18,
      backgroundColor:
        colors.modal || colors.card,
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 14,
    },

    inputGroup: {
      flexGrow: 1,
      flexBasis: 250,
      gap: 7,
    },

    label: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
    },

    input: {
      minHeight: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.input,
      color: colors.text,
      paddingHorizontal: 14,
      fontSize: 14,
      outlineStyle: "none" as any,
    },

    section: {
      gap: 12,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: "900",
      color: colors.text,
    },

    roleHint: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },

    row: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap",
    },

    wrap: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },

    chip: {
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor:
        colors.backgroundSecondary,
    },

    roleChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor:
        colors.backgroundSecondary,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    smallChip: {
      paddingHorizontal: 13,
      paddingVertical: 9,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor:
        colors.backgroundSecondary,
    },

    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    inactiveChip: {
      backgroundColor: colors.destructive,
      borderColor: colors.destructive,
    },

    chipText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
    },

    chipTextActive: {
      color: colors.primaryForeground,
    },

    referenceBox: {
      gap: 14,
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor:
        colors.backgroundSecondary,
    },

    documentHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },

    uploadDocumentBtn: {
      minHeight: 44,
      borderRadius: 14,
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },

    emptyBox: {
      minHeight: 180,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor:
        colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      gap: 10,
    },

    emptyText: {
      color: colors.textSecondary,
      textAlign: "center",
      fontWeight: "700",
    },

    documentCard: {
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor:
        colors.backgroundSecondary,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 10,
    },

    documentIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },

    documentInfo: {
      flex: 1,
    },

    documentTitle: {
      color: colors.text,
      fontWeight: "900",
      fontSize: 15,
    },

    documentSubtitle: {
      marginTop: 4,
      color: colors.textSecondary,
      fontWeight: "700",
      fontSize: 13,
    },

    openBtn: {
      minHeight: 44,
      borderRadius: 14,
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },

    openText: {
      color: colors.primaryForeground,
      fontWeight: "900",
    },

    mediaGrid: {
      flexDirection: "row",
      gap: 16,
      flexWrap: "wrap",
    },

    mediaCard: {
      flex: 1,
      minWidth: 280,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor:
        colors.backgroundSecondary,
      padding: 18,
      gap: 16,
      alignItems: "center",
    },

    qrBox: {
      width: 300,
      maxWidth: "100%",
      aspectRatio: 1,
      backgroundColor: "#FFFFFF",
      borderRadius: 18,
      padding: 12,
    },

    qrImage: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },

    qrActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 10,
    },

    generateQrBtn: {
      minHeight: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.primary,
      paddingHorizontal: 14,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },

    generateQrText: {
      color: colors.primary,
      fontWeight: "900",
    },

    qrHelper: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      maxWidth: 360,
    },

    userPhoto: {
      width: 190,
      height: 190,
      borderRadius: 95,
      backgroundColor: colors.card,
    },

    userPhotoEmpty: {
      width: 190,
      height: 190,
      borderRadius: 95,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },

    photoActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 10,
    },

    selectPhotoBtn: {
      minHeight: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.primary,
      paddingHorizontal: 14,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },

    selectPhotoText: {
      color: colors.primary,
      fontWeight: "900",
    },

    savePhotoBtn: {
      minHeight: 44,
      borderRadius: 14,
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },

    footer: {
      padding: 18,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      backgroundColor: colors.card,
    },

    cancelBtn: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor:
        colors.backgroundSecondary,
    },

    cancelText: {
      color: colors.text,
      fontWeight: "800",
    },

    saveBtn: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    saveText: {
      color: colors.primaryForeground,
      fontWeight: "900",
    },

    disabled: {
      opacity: 0.6,
    },
  });
}