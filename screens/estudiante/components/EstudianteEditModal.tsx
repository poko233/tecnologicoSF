import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystemNS from "expo-file-system";
import * as Sharing from "expo-sharing";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardTypeOptions,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { BASE_URL, httpClient } from "../../../http/httpClient";
import { useTheme } from "../../../theme/useTheme";
import { createEstudianteEditModalStyles } from "../styles/estudianteEditModal.styles";
import {
  EstudianteForm,
  EstudianteUsuario,
  FotoEstudianteArchivo,
} from "../types/estudiante.types";
import {
  nombreCompleto,
  obtenerFechaInscripcion,
  obtenerMatricula,
  obtenerPromocionActual,
  obtenerReferencia,
} from "../utils/estudiante.helpers";
import EstudianteDatePickerModal from "./EstudianteDatePickerModal";
import EstudianteDocumentosPanel from "./EstudianteDocumentosPanel";

type TabKey = "datos" | "documentos" | "media";

type Props = {
  visible: boolean;
  estudiante: EstudianteUsuario | null;
  cargandoDetalle?: boolean;
  guardando: boolean;
  subiendoFoto: boolean;
  onClose: () => void;
  onSave: (
    id: number,
    form: EstudianteForm,
  ) => Promise<EstudianteUsuario | null>;
  onFotoActualizada: (
    id: number,
    archivo: FotoEstudianteArchivo,
  ) => Promise<EstudianteUsuario | null>;
  onDocumentoSubido: (idUsuario: number) => Promise<void> | void;
};

type FormErrors = Partial<Record<keyof EstudianteForm, string>>;
type ModalStyles = ReturnType<typeof createEstudianteEditModalStyles>;

type RegenerarQrResponse = {
  message?: string;
  codigo_qr?: string | null;
  qrUrl?: string | null;
  estudiante?: Partial<EstudianteUsuario> | null;
};

type InputProps = {
  label: string;
  value: string;
  field: keyof EstudianteForm;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  multiline?: boolean;
  colors: any;
  styles: ModalStyles;
  inputStyle: (field: keyof EstudianteForm) => any;
  onBlurField: (field: keyof EstudianteForm) => void;
  onChangeText: (value: string) => void;
  renderError: (field: keyof EstudianteForm) => ReactNode;
  renderOk: (field: keyof EstudianteForm) => ReactNode;
};

const EXPEDIDOS = [
  { value: "LPZ", label: "La Paz" },
  { value: "CBBA", label: "Cochabamba" },
  { value: "OR", label: "Oruro" },
  { value: "PT", label: "Potosí" },
  { value: "TJ", label: "Tarija" },
  { value: "SCZ", label: "Santa Cruz" },
  { value: "BN", label: "Beni" },
  { value: "PD", label: "Pando" },
  { value: "CH", label: "Chuquisaca" },
  { value: "QR", label: "QR" },
  { value: "EXT", label: "Exterior" },
];

const GENEROS: EstudianteForm["genero"][] = ["MASCULINO", "FEMENINO"];

const ONLY_NUMBERS = /^\d+$/;
const TEXT_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
const ADDRESS_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9\s.,#°/-]+$/;

const FIELD_LABELS: Partial<Record<keyof EstudianteForm, string>> = {
  ci: "Carnet de identidad",
  fecha_nac: "Fecha de nacimiento",
  nombres: "Nombres",
  apellidoPaterno: "Apellido paterno",
  celular: "Celular",
  direccion: "Dirección",
  expedido: "Expedido en",
  genero: "Género",
  estado: "Estado",
  referenciaNombre: "Nombre de referencia",
  referenciaParentesco: "Parentesco",
  referenciaNumero: "Número de referencia",
};

function parseDate(value: string) {
  if (!value) return null;

  const onlyDate = value.includes("T")
    ? value.split("T")[0]
    : value.includes(" ")
      ? value.split(" ")[0]
      : value;

  const [year, month, day] = onlyDate.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function normalizarFechaInput(value?: string | null) {
  if (!value) return "";

  if (value.includes("T")) return value.split("T")[0];
  if (value.includes(" ")) return value.split(" ")[0];

  return value;
}

function normalizarEstadoForm(value?: string | null): EstudianteForm["estado"] {
  const estado = String(value || "").toUpperCase();

  return estado === "INACTIVO" ? "INACTIVO" : "ACTIVO";
}

function resolverUrlPublica(ruta?: string | null) {
  const value = String(ruta || "").trim();

  if (!value || value === "0" || value.toLowerCase() === "null") {
    return null;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  return `${BASE_URL}/${value.replace(/^\/+/, "")}`;
}

function resolverFotoEstudiante(estudiante: EstudianteUsuario | null) {
  return resolverUrlPublica(estudiante?.fotoUrl || estudiante?.foto);
}

function resolverQrEstudiante(estudiante: EstudianteUsuario | null) {
  const qrDirecto = String(estudiante?.qrUrl || "").trim();

  if (qrDirecto && qrDirecto !== "0") {
    return resolverUrlPublica(qrDirecto);
  }

  const qrRaw = String(estudiante?.codigo_qr || "").trim();

  if (!qrRaw || qrRaw === "0" || qrRaw.toLowerCase() === "null") {
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

function getAge(dateValue: string) {
  const birthDate = parseDate(dateValue);

  if (!birthDate) return null;

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

function validateForm(form: EstudianteForm): FormErrors {
  const errors: FormErrors = {};

  const ci = form.ci.trim();
  const nombres = form.nombres.trim();
  const apellidoPaterno = form.apellidoPaterno.trim();
  const fechaNac = form.fecha_nac.trim();
  const celular = form.celular.trim();
  const direccion = form.direccion.trim();

  const referenciaNombre = form.referenciaNombre.trim();
  const referenciaParentesco = form.referenciaParentesco.trim();
  const referenciaNumero = form.referenciaNumero.trim();

  if (!ci) {
    errors.ci = "El carnet es obligatorio.";
  } else if (!ONLY_NUMBERS.test(ci)) {
    errors.ci = "Solo debe contener números.";
  } else if (ci.length < 5) {
    errors.ci = "Debe tener al menos 5 dígitos.";
  } else if (ci.length > 12) {
    errors.ci = "No debe superar 12 dígitos.";
  }

  if (!fechaNac) {
    errors.fecha_nac = "La fecha de nacimiento es obligatoria.";
  } else {
    const date = parseDate(fechaNac);
    const age = getAge(fechaNac);

    if (!date) {
      errors.fecha_nac = "La fecha no es válida.";
    } else if (date > new Date()) {
      errors.fecha_nac = "No puede ser futura.";
    } else if (age !== null && age > 90) {
      errors.fecha_nac = "La edad no puede superar 90 años.";
    }
  }

  if (!nombres) {
    errors.nombres = "Los nombres son obligatorios.";
  } else if (nombres.length < 2) {
    errors.nombres = "Debe tener al menos 2 caracteres.";
  } else if (!TEXT_REGEX.test(nombres)) {
    errors.nombres = "Solo se permiten letras y espacios.";
  }

  if (!apellidoPaterno) {
    errors.apellidoPaterno = "El apellido paterno es obligatorio.";
  } else if (apellidoPaterno.length < 2) {
    errors.apellidoPaterno = "Debe tener al menos 2 caracteres.";
  } else if (!TEXT_REGEX.test(apellidoPaterno)) {
    errors.apellidoPaterno = "Solo se permiten letras y espacios.";
  }

  if (!celular) {
    errors.celular = "El celular es obligatorio.";
  } else if (!ONLY_NUMBERS.test(celular)) {
    errors.celular = "Solo debe contener números.";
  } else if (celular.length < 7 || celular.length > 20) {
    errors.celular = "Debe tener entre 7 y 20 dígitos.";
  }

  if (!direccion) {
    errors.direccion = "La dirección es obligatoria.";
  } else if (direccion.length < 4) {
    errors.direccion = "La dirección es muy corta.";
  } else if (!ADDRESS_REGEX.test(direccion)) {
    errors.direccion = "Contiene caracteres no válidos.";
  }

  if (referenciaNombre && !TEXT_REGEX.test(referenciaNombre)) {
    errors.referenciaNombre = "Solo se permiten letras y espacios.";
  }

  if (referenciaParentesco && !TEXT_REGEX.test(referenciaParentesco)) {
    errors.referenciaParentesco = "Solo se permiten letras y espacios.";
  }

  if (referenciaNumero && !ONLY_NUMBERS.test(referenciaNumero)) {
    errors.referenciaNumero = "Solo debe contener números.";
  } else if (
    referenciaNumero &&
    (referenciaNumero.length < 7 || referenciaNumero.length > 20)
  ) {
    errors.referenciaNumero = "Debe tener entre 7 y 20 dígitos.";
  }

  return errors;
}

function FormInput({
  label,
  value,
  field,
  placeholder,
  keyboardType = "default",
  maxLength,
  multiline = false,
  colors,
  styles,
  inputStyle,
  onBlurField,
  onChangeText,
  renderError,
  renderOk,
}: InputProps) {
  return (
    <View style={styles.inputGroup}>
      <ThemedText style={[styles.label, { color: colors.text }]}>
        {label}
      </ThemedText>

      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary || colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        autoCorrect={false}
        maxLength={maxLength}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        onBlur={() => onBlurField(field)}
        onChangeText={onChangeText}
        style={[inputStyle(field), multiline && styles.textArea]}
      />

      {renderError(field)}
      {renderOk(field)}
    </View>
  );
}

export default function EstudianteEditModal({
  visible,
  estudiante,
  cargandoDetalle = false,
  guardando,
  subiendoFoto,
  onClose,
  onSave,
  onFotoActualizada,
  onDocumentoSubido,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { width } = useWindowDimensions();

  const styles = useMemo(
    () => createEstudianteEditModalStyles(colors),
    [colors],
  );

  const isMobile = width < 760;

  const success = colors.success || "#16A34A";
  const warning = colors.warning || "#F59E0B";
  const destructive = colors.destructive || "#DC2626";

  const [tab, setTab] = useState<TabKey>("datos");
  const [fotoLocal, setFotoLocal] = useState<FotoEstudianteArchivo | null>(
    null,
  );
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [regenerandoQr, setRegenerandoQr] = useState(false);
  const [qrRegeneradoUrl, setQrRegeneradoUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<keyof EstudianteForm, boolean>>
  >({});

  const [form, setForm] = useState<EstudianteForm>({
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
    referenciaNombre: "",
    referenciaParentesco: "",
    referenciaNumero: "",
    observacionPromociones: "",
  });

  useEffect(() => {
    if (!visible) return;

    setTouched({});
    setSubmitted(false);
    setTab("datos");
    setFotoLocal(null);
    setQrRegeneradoUrl(null);
    setRegenerandoQr(false);
  }, [visible, estudiante?.id]);

  useEffect(() => {
    if (!estudiante) return;

    const referencia = obtenerReferencia(estudiante);
    const promocionActual = obtenerPromocionActual(estudiante);

    /*
     * No reiniciamos la pestaña ni la foto local aquí. El detalle del mismo
     * estudiante puede refrescarse después de abrir el modal y antes esto
     * hacía que Documentos o Foto y QR desaparecieran visualmente.
     */
    setForm({
      usuario: estudiante.usuario || estudiante.ci || "",
      ci: estudiante.ci || "",
      nombres: estudiante.nombres || "",
      apellidoPaterno: estudiante.apellidoPaterno || "",
      apellidoMaterno: estudiante.apellidoMaterno || "",
      genero:
        estudiante.genero === "FEMENINO" || estudiante.genero === "MASCULINO"
          ? estudiante.genero
          : "MASCULINO",
      fecha_nac: normalizarFechaInput(estudiante.fecha_nac),
      email: estudiante.email || "",
      telefono: estudiante.telefono || "",
      celular: estudiante.celular || "",
      direccion: estudiante.direccion || "",
      expedido: estudiante.expedido || "CBBA",
      estado: normalizarEstadoForm(estudiante.estado),
      referenciaNombre: referencia?.nombreContactoReferencia || "",
      referenciaParentesco: referencia?.parentesco || "",
      referenciaNumero: referencia?.numeroReferencia || "",
      observacionPromociones: promocionActual,
    });
  }, [estudiante]);

  const errors = useMemo(() => validateForm(form), [form]);

  const errorEntries = Object.entries(errors) as [
    keyof EstudianteForm,
    string,
  ][];

  const isValid = errorEntries.length === 0;
  const showSummary = submitted && !isValid;
  const fieldWidth = isMobile ? "100%" : "48.8%";

  const promocionActual = obtenerPromocionActual(estudiante);
  const matriculaActual = obtenerMatricula(estudiante);
  const fechaInscripcionActual = obtenerFechaInscripcion(estudiante);

  const fotoServidorUrl = useMemo(
    () => resolverFotoEstudiante(estudiante),
    [estudiante?.id, estudiante?.foto, estudiante?.fotoUrl],
  );

  const qrServidorUrl = useMemo(
    () => resolverQrEstudiante(estudiante),
    [estudiante?.id, estudiante?.codigo_qr, estudiante?.qrUrl],
  );

  const qrMostradoUrl = qrRegeneradoUrl || qrServidorUrl;
  const fotoCabeceraUrl = fotoLocal?.uri || fotoServidorUrl;

  const touchField = (field: keyof EstudianteForm) => {
    setTouched((previous) => ({
      ...previous,
      [field]: true,
    }));
  };

  const shouldShowFieldError = (field: keyof EstudianteForm) => {
    return (touched[field] || submitted) && !!errors[field];
  };

  const shouldShowFieldOk = (field: keyof EstudianteForm) => {
    if (!touched[field]) return false;
    if (errors[field]) return false;

    const value = String(form[field] ?? "").trim();

    if (
      field === "apellidoMaterno" ||
      field === "telefono" ||
      field === "email" ||
      field === "referenciaNombre" ||
      field === "referenciaParentesco" ||
      field === "referenciaNumero" ||
      field === "observacionPromociones"
    ) {
      return value.length > 0;
    }

    return true;
  };

  const getBorderColor = (field: keyof EstudianteForm) => {
    if (shouldShowFieldError(field)) return destructive;
    if (shouldShowFieldOk(field)) return success;

    return colors.inputBorder;
  };

  const inputStyle = (field: keyof EstudianteForm) => [
    styles.input,
    {
      backgroundColor: colors.input,
      borderColor: getBorderColor(field),
      color: colors.text,
    },
  ];

  const optionStyle = (active: boolean) => [
    styles.option,
    {
      backgroundColor: active ? colors.primary : colors.input,
      borderColor: active ? colors.primary : colors.border,
    },
  ];

  const setValue = <K extends keyof EstudianteForm>(
    key: K,
    value: EstudianteForm[K],
  ) => {
    touchField(key);

    setForm((previous) => {
      if (key === "ci") {
        const cleanValue = String(value).replace(/\D/g, "");

        return {
          ...previous,
          ci: cleanValue,
          usuario: cleanValue,
        };
      }

      if (
        key === "celular" ||
        key === "telefono" ||
        key === "referenciaNumero"
      ) {
        return {
          ...previous,
          [key]: String(value).replace(/\D/g, ""),
        };
      }

      if (
        key === "nombres" ||
        key === "apellidoPaterno" ||
        key === "apellidoMaterno" ||
        key === "referenciaNombre" ||
        key === "referenciaParentesco"
      ) {
        return {
          ...previous,
          [key]: String(value).replace(
            /[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g,
            "",
          ),
        };
      }

      return {
        ...previous,
        [key]: value,
      };
    });
  };

  const markAllTouched = () => {
    setTouched({
      usuario: true,
      ci: true,
      nombres: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      genero: true,
      fecha_nac: true,
      email: true,
      telefono: true,
      celular: true,
      direccion: true,
      expedido: true,
      estado: true,
      referenciaNombre: true,
      referenciaParentesco: true,
      referenciaNumero: true,
      observacionPromociones: true,
    });
  };

  const renderError = (field: keyof EstudianteForm) => {
    if (!shouldShowFieldError(field)) return null;

    return (
      <View style={styles.feedbackRow}>
        <Ionicons
          name="alert-circle-outline"
          size={14}
          color={destructive}
        />

        <ThemedText style={[styles.errorText, { color: destructive }]}>
          {errors[field]}
        </ThemedText>
      </View>
    );
  };

  const renderOk = (field: keyof EstudianteForm) => {
    if (!shouldShowFieldOk(field)) return null;

    return (
      <View style={styles.feedbackRow}>
        <Ionicons name="checkmark-circle-outline" size={14} color={success} />

        <ThemedText style={[styles.okText, { color: success }]}>
          Correcto
        </ThemedText>
      </View>
    );
  };

  const validateAndSave = async () => {
    if (!estudiante || guardando) return;

    setSubmitted(true);
    markAllTouched();

    const currentErrors = validateForm(form);

    if (Object.keys(currentErrors).length > 0) {
      Toast.show({
        type: "error",
        text1: "Formulario incompleto",
        text2: "Revisa el resumen de errores.",
      });

      return;
    }

    const payload: EstudianteForm = {
      ...form,
      usuario: form.ci.trim(),
      ci: form.ci.trim(),
      nombres: form.nombres.trim(),
      apellidoPaterno: form.apellidoPaterno.trim(),
      apellidoMaterno: form.apellidoMaterno.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      celular: form.celular.trim(),
      direccion: form.direccion.trim(),
      referenciaNombre: form.referenciaNombre.trim(),
      referenciaParentesco: form.referenciaParentesco.trim(),
      referenciaNumero: form.referenciaNumero.trim(),
      observacionPromociones: form.observacionPromociones.trim(),
    };

    await onSave(estudiante.id, payload);
  };

  const elegirFoto = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/png", "image/webp"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      setFotoLocal({
        uri: asset.uri,
        name: asset.name || `foto-${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
        file: (asset as any).file,
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "No se pudo seleccionar la foto.",
      });
    }
  };

  const subirFoto = async () => {
    if (!estudiante || !fotoLocal) return;

    const actualizado = await onFotoActualizada(estudiante.id, fotoLocal);

    if (actualizado) {
      setFotoLocal(null);
    }
  };

  const abrirUrl = async (url?: string | null) => {
    if (!url) return;

    if (Platform.OS === "web") {
      window.open(url, "_blank");
      return;
    }

    const puedeAbrir = await Linking.canOpenURL(url);

    if (puedeAbrir) {
      Linking.openURL(url);
    }
  };

  const regenerarQr = async () => {
    const estudianteActual = estudiante;

    if (!estudianteActual || regenerandoQr) return;

    try {
      setRegenerandoQr(true);

      const response = await httpClient.postAuth<RegenerarQrResponse>(
        `/api/estudiantes-usuarios/${estudianteActual.id}/qr/regenerar`,
        {},
      );

      const qrRespuesta = String(
        response?.qrUrl ||
          response?.codigo_qr ||
          response?.estudiante?.qrUrl ||
          response?.estudiante?.codigo_qr ||
          "",
      ).trim();

      const qrNuevo = qrRespuesta
        ? resolverQrEstudiante({
            ...estudianteActual,
            codigo_qr: qrRespuesta,
            qrUrl: qrRespuesta,
          })
        : null;

      if (!qrNuevo) {
        throw new Error(
          "El servidor regeneró el QR, pero no devolvió una imagen válida.",
        );
      }

      /*
       * Se actualiza inmediatamente para que el usuario vea el nuevo QR sin
       * esperar la recarga completa del detalle. Después se sincroniza el
       * estudiante con el listado y la caché mediante el callback existente.
       */
      setQrRegeneradoUrl(qrNuevo);

      Toast.show({
        type: "success",
        text1: "QR regenerado",
        text2:
          response?.message ||
          "El código QR del estudiante se generó correctamente.",
      });

      await onDocumentoSubido(estudianteActual.id);
    } catch (error: any) {
      console.error("Error al regenerar QR:", error);

      Toast.show({
        type: "error",
        text1: "No se pudo regenerar el QR",
        text2:
          error?.message ||
          "Ocurrió un error al generar el código QR del estudiante.",
      });
    } finally {
      setRegenerandoQr(false);
    }
  };

  const descargarQr = async () => {
    const estudianteActual = estudiante;
    const qrActual = qrMostradoUrl;

    if (!estudianteActual || !qrActual) {
      Toast.show({
        type: "error",
        text1: "Sin QR",
        text2: "Este estudiante no tiene un código QR registrado.",
      });

      return;
    }

    const identificadorArchivo = String(
      estudianteActual.ci || estudianteActual.id,
    )
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    const nombreArchivo = `qr-${identificadorArchivo}.png`;

    try {
      if (Platform.OS === "web") {
        const link = document.createElement("a");

        link.href = qrActual;
        link.download = nombreArchivo;
        link.rel = "noopener noreferrer";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return;
      }

      const FileSystem = FileSystemNS as any;
      const fileUri = `${FileSystem.cacheDirectory}${nombreArchivo}`;

      const esUrlRemota =
        qrActual.startsWith("http://") || qrActual.startsWith("https://");

      if (esUrlRemota) {
        const resultado = await FileSystem.downloadAsync(qrActual, fileUri);

        if (resultado?.status && Number(resultado.status) >= 400) {
          throw new Error(
            `No se pudo descargar el QR. Estado ${resultado.status}`,
          );
        }
      } else {
        const base64Data = qrActual.includes(",")
          ? qrActual.substring(qrActual.indexOf(",") + 1)
          : qrActual;

        if (!base64Data.trim()) {
          throw new Error("El contenido del QR está vacío.");
        }

        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      if (!(await Sharing.isAvailableAsync())) {
        Toast.show({
          type: "error",
          text1: "Archivo generado",
          text2: "El dispositivo no permite compartir o guardar el archivo.",
        });

        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "image/png",
        dialogTitle: "Guardar código QR",
        UTI: "public.png",
      });
    } catch (error: any) {
      console.error("Error al descargar QR:", error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "No se pudo descargar el código QR.",
      });
    }
  };

  const renderDatos = () => (
    <>
      <View
        style={[
          styles.statusBox,
          {
            backgroundColor: isValid ? `${success}18` : `${warning}18`,
            borderColor: isValid ? success : warning,
          },
        ]}
      >
        <Ionicons
          name={isValid ? "checkmark-circle-outline" : "alert-circle-outline"}
          size={20}
          color={isValid ? success : warning}
        />

        <ThemedText
          style={[
            styles.statusText,
            {
              color: isValid ? success : warning,
            },
          ]}
        >
          {isValid
            ? "Formulario listo para guardar."
            : `Hay ${errorEntries.length} campo(s) con errores.`}
        </ThemedText>
      </View>

      {showSummary && (
        <View
          style={[
            styles.errorSummary,
            {
              backgroundColor: `${destructive}16`,
              borderColor: destructive,
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            <Ionicons name="warning-outline" size={20} color={destructive} />

            <ThemedText style={[styles.summaryTitle, { color: destructive }]}>
              Corrige estos campos
            </ThemedText>
          </View>

          {errorEntries.map(([field, message]) => (
            <ThemedText
              key={field}
              style={[styles.summaryItem, { color: colors.text }]}
            >
              • {FIELD_LABELS[field] ?? field}: {message}
            </ThemedText>
          ))}
        </View>
      )}

      <View style={styles.readOnlySection}>
        <View style={styles.blockHeader}>
          <Ionicons name="school-outline" size={19} color={colors.primary} />

          <ThemedText style={[styles.blockTitle, { color: colors.text }]}>
            Información académica
          </ThemedText>
        </View>

        <View style={styles.readOnlyGrid}>
          <View style={styles.readOnlyCard}>
            <View style={styles.readOnlyIcon}>
              <Ionicons
                name="id-card-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <ThemedText style={styles.readOnlyLabel}>Matrícula</ThemedText>

              <ThemedText style={styles.readOnlyValue}>
                {matriculaActual}
              </ThemedText>
            </View>
          </View>

          <View style={styles.readOnlyCard}>
            <View style={styles.readOnlyIcon}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <ThemedText style={styles.readOnlyLabel}>
                Fecha de inscripción
              </ThemedText>

              <ThemedText style={styles.readOnlyValue}>
                {fechaInscripcionActual}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Ionicons name="person-outline" size={19} color={colors.primary} />

          <ThemedText style={[styles.blockTitle, { color: colors.text }]}>
            Datos personales
          </ThemedText>
        </View>

        <View style={styles.formGrid}>
          <View style={[styles.fieldBox, { width: fieldWidth }]}>
            <FormInput
              label="Carnet de identidad *"
              field="ci"
              value={form.ci}
              placeholder="Ej: 6688289"
              keyboardType="numeric"
              maxLength={12}
              colors={colors}
              styles={styles}
              inputStyle={inputStyle}
              onBlurField={touchField}
              onChangeText={(value) => setValue("ci", value)}
              renderError={renderError}
              renderOk={renderOk}
            />

            <ThemedText style={[styles.helper, { color: colors.textSecondary }]}>
              También será el usuario del estudiante.
            </ThemedText>
          </View>

          <View style={[styles.fieldBox, { width: fieldWidth }]}>
            <ThemedText style={[styles.label, { color: colors.text }]}>
              Fecha de nacimiento *
            </ThemedText>

            <Pressable
              onPress={() => {
                touchField("fecha_nac");
                setDatePickerVisible(true);
              }}
              style={[
                styles.dateButton,
                {
                  backgroundColor: colors.input,
                  borderColor: getBorderColor("fecha_nac"),
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.primary}
              />

              <ThemedText
                style={[
                  styles.dateText,
                  {
                    color: form.fecha_nac
                      ? colors.text
                      : colors.textTertiary || colors.textMuted,
                  },
                ]}
              >
                {form.fecha_nac || "Seleccionar fecha"}
              </ThemedText>
            </Pressable>

            {renderError("fecha_nac")}
            {renderOk("fecha_nac")}
          </View>

          <View style={[styles.fieldBox, { width: fieldWidth }]}>
            <FormInput
              label="Nombres *"
              field="nombres"
              value={form.nombres}
              placeholder="Ej: Juan Carlos"
              colors={colors}
              styles={styles}
              inputStyle={inputStyle}
              onBlurField={touchField}
              onChangeText={(value) => setValue("nombres", value)}
              renderError={renderError}
              renderOk={renderOk}
            />
          </View>

          <View style={[styles.fieldBox, { width: fieldWidth }]}>
            <FormInput
              label="Apellido paterno *"
              field="apellidoPaterno"
              value={form.apellidoPaterno}
              placeholder="Ej: Quispe"
              colors={colors}
              styles={styles}
              inputStyle={inputStyle}
              onBlurField={touchField}
              onChangeText={(value) => setValue("apellidoPaterno", value)}
              renderError={renderError}
              renderOk={renderOk}
            />
          </View>

          <View style={[styles.fieldBox, { width: fieldWidth }]}>
            <FormInput
              label="Apellido materno"
              field="apellidoMaterno"
              value={form.apellidoMaterno}
              placeholder="Opcional"
              colors={colors}
              styles={styles}
              inputStyle={inputStyle}
              onBlurField={touchField}
              onChangeText={(value) => setValue("apellidoMaterno", value)}
              renderError={renderError}
              renderOk={renderOk}
            />
          </View>

          <View style={[styles.fieldBox, { width: fieldWidth }]}>
            <FormInput
              label="Celular *"
              field="celular"
              value={form.celular}
              placeholder="Ej: 70707070"
              keyboardType="phone-pad"
              maxLength={20}
              colors={colors}
              styles={styles}
              inputStyle={inputStyle}
              onBlurField={touchField}
              onChangeText={(value) => setValue("celular", value)}
              renderError={renderError}
              renderOk={renderOk}
            />
          </View>

          <View style={[styles.fieldBox, { width: fieldWidth }]}>
            <FormInput
              label="Teléfono"
              field="telefono"
              value={form.telefono}
              placeholder="Opcional"
              keyboardType="phone-pad"
              maxLength={10}
              colors={colors}
              styles={styles}
              inputStyle={inputStyle}
              onBlurField={touchField}
              onChangeText={(value) => setValue("telefono", value)}
              renderError={renderError}
              renderOk={renderOk}
            />
          </View>

          <View style={[styles.fieldBox, { width: fieldWidth }]}>
            <FormInput
              label="Email (opcional)"
              field="email"
              value={form.email}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              colors={colors}
              styles={styles}
              inputStyle={inputStyle}
              onBlurField={touchField}
              onChangeText={(value) => setValue("email", value)}
              renderError={renderError}
              renderOk={renderOk}
            />
          </View>

          <View style={[styles.fieldBox, { width: fieldWidth }]}>
            <FormInput
              label="Dirección *"
              field="direccion"
              value={form.direccion}
              placeholder="Dirección actual"
              colors={colors}
              styles={styles}
              inputStyle={inputStyle}
              onBlurField={touchField}
              onChangeText={(value) => setValue("direccion", value)}
              renderError={renderError}
              renderOk={renderOk}
            />
          </View>
        </View>
      </View>

      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Ionicons name="location-outline" size={19} color={colors.primary} />

          <ThemedText style={[styles.blockTitle, { color: colors.text }]}>
            Expedido en *
          </ThemedText>
        </View>

        <View style={styles.optionsWrap}>
          {EXPEDIDOS.map((item) => {
            const active = form.expedido === item.value;

            return (
              <Pressable
                key={item.value}
                onPress={() => setValue("expedido", item.value)}
                style={optionStyle(active)}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    {
                      color: active ? colors.primaryForeground : colors.text,
                    },
                  ]}
                >
                  {item.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Ionicons
            name="male-female-outline"
            size={19}
            color={colors.primary}
          />

          <ThemedText style={[styles.blockTitle, { color: colors.text }]}>
            Género *
          </ThemedText>
        </View>

        <View style={styles.optionsWrap}>
          {GENEROS.map((item) => {
            const active = form.genero === item;

            return (
              <Pressable
                key={item}
                onPress={() => setValue("genero", item)}
                style={optionStyle(active)}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    {
                      color: active ? colors.primaryForeground : colors.text,
                    },
                  ]}
                >
                  {item}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.estadoSection}>
        <View style={styles.estadoTitleBox}>
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color={colors.primary}
          />

          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.estadoTitle, { color: colors.text }]}>
              Estado de la cuenta
            </ThemedText>

            <ThemedText
              style={[styles.estadoSubtitle, { color: colors.textSecondary }]}
            >
              Controla si el estudiante puede seguir usando su cuenta.
            </ThemedText>
          </View>
        </View>

        <View style={styles.estadoOptions}>
          {["ACTIVO", "INACTIVO"].map((item) => {
            const estadoItem = item as EstudianteForm["estado"];
            const active = form.estado === estadoItem;
            const danger = estadoItem === "INACTIVO";

            return (
              <Pressable
                key={estadoItem}
                onPress={() => setValue("estado", estadoItem)}
                style={[
                  styles.estadoOption,
                  {
                    backgroundColor: active
                      ? danger
                        ? destructive
                        : success
                      : colors.input,
                    borderColor: active
                      ? danger
                        ? destructive
                        : success
                      : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={
                    estadoItem === "ACTIVO"
                      ? "checkmark-circle-outline"
                      : "ban-outline"
                  }
                  size={20}
                  color={active ? colors.primaryForeground : colors.text}
                />

                <ThemedText
                  style={[
                    styles.estadoOptionText,
                    {
                      color: active ? colors.primaryForeground : colors.text,
                    },
                  ]}
                >
                  {estadoItem}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {form.estado === "INACTIVO" && (
          <View
            style={[
              styles.warningBox,
              {
                backgroundColor: `${warning}18`,
                borderColor: warning,
              },
            ]}
          >
            <Ionicons name="warning-outline" size={22} color={warning} />

            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.warningTitle, { color: warning }]}>
                Esta acción deshabilitará la cuenta
              </ThemedText>

              <ThemedText
                style={[styles.warningText, { color: colors.textSecondary }]}
              >
                El estudiante quedará inactivo. No se borrará su información,
                documentos, foto, QR ni historial registrado.
              </ThemedText>
            </View>
          </View>
        )}
      </View>

      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Ionicons name="call-outline" size={19} color={colors.primary} />

          <ThemedText style={[styles.blockTitle, { color: colors.text }]}>
            Datos de referencia
          </ThemedText>
        </View>

        <View style={styles.formGrid}>
          <View style={[styles.fieldBox, { width: fieldWidth }]}>
            <FormInput
              label="Nombre contacto"
              field="referenciaNombre"
              value={form.referenciaNombre}
              placeholder="Opcional"
              colors={colors}
              styles={styles}
              inputStyle={inputStyle}
              onBlurField={touchField}
              onChangeText={(value) => setValue("referenciaNombre", value)}
              renderError={renderError}
              renderOk={renderOk}
            />
          </View>

          <View style={[styles.fieldBox, { width: fieldWidth }]}>
            <FormInput
              label="Parentesco"
              field="referenciaParentesco"
              value={form.referenciaParentesco}
              placeholder="Opcional"
              colors={colors}
              styles={styles}
              inputStyle={inputStyle}
              onBlurField={touchField}
              onChangeText={(value) => setValue("referenciaParentesco", value)}
              renderError={renderError}
              renderOk={renderOk}
            />
          </View>

          <View style={[styles.fieldBox, { width: fieldWidth }]}>
            <FormInput
              label="Número referencia"
              field="referenciaNumero"
              value={form.referenciaNumero}
              placeholder="Opcional"
              keyboardType="phone-pad"
              maxLength={20}
              colors={colors}
              styles={styles}
              inputStyle={inputStyle}
              onBlurField={touchField}
              onChangeText={(value) => setValue("referenciaNumero", value)}
              renderError={renderError}
              renderOk={renderOk}
            />
          </View>
        </View>
      </View>

      <View style={styles.promoSection}>
        <View style={styles.blockHeader}>
          <Ionicons name="gift-outline" size={19} color={colors.primary} />

          <ThemedText style={[styles.blockTitle, { color: colors.text }]}>
            Promociones / observaciones
          </ThemedText>
        </View>

        <View style={styles.promoCurrentBox}>
          <View style={styles.promoCurrentIcon}>
            <Ionicons
              name="pricetag-outline"
              size={20}
              color={colors.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <ThemedText style={styles.promoCurrentLabel}>
              Promoción actualmente registrada
            </ThemedText>

            <ThemedText style={styles.promoCurrentText}>
              {promocionActual || "Sin promoción registrada"}
            </ThemedText>
          </View>
        </View>

        <FormInput
          label="Editar promoción / observación"
          field="observacionPromociones"
          value={form.observacionPromociones}
          multiline
          placeholder="Ejemplo: beca, promoción, regalo, descuento u observación interna..."
          colors={colors}
          styles={styles}
          inputStyle={inputStyle}
          onBlurField={touchField}
          onChangeText={(value) => setValue("observacionPromociones", value)}
          renderError={renderError}
          renderOk={renderOk}
        />
      </View>
    </>
  );

  const renderMedia = () => (
    <View style={styles.mediaGrid}>
      <View style={styles.mediaCard}>
        <ThemedText style={styles.sectionTitle}>Foto del estudiante</ThemedText>

        {fotoLocal?.uri ? (
          <Image source={{ uri: fotoLocal.uri }} style={styles.userPhoto} />
        ) : fotoServidorUrl ? (
          <Image source={{ uri: fotoServidorUrl }} style={styles.userPhoto} />
        ) : (
          <View style={styles.userPhotoEmpty}>
            <Ionicons
              name="person-outline"
              size={56}
              color={colors.textMuted || colors.muted}
            />

            <ThemedText style={styles.emptyText}>Sin foto</ThemedText>
          </View>
        )}

        <View style={styles.photoActions}>
          <Pressable style={styles.selectPhotoBtn} onPress={elegirFoto}>
            <Ionicons name="image-outline" size={18} color={colors.primary} />

            <ThemedText style={styles.selectPhotoText}>Elegir foto</ThemedText>
          </Pressable>

          {fotoServidorUrl && (
            <Pressable
              style={styles.primaryBtn}
              onPress={() => abrirUrl(fotoServidorUrl)}
            >
              <Ionicons
                name="open-outline"
                size={18}
                color={colors.primaryForeground}
              />

              <ThemedText style={styles.primaryBtnText}>Abrir foto</ThemedText>
            </Pressable>
          )}
        </View>

        {fotoLocal && (
          <Pressable
            style={[styles.primaryBtn, subiendoFoto && styles.disabled]}
            disabled={subiendoFoto}
            onPress={subirFoto}
          >
            {subiendoFoto ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <>
                <Ionicons
                  name="cloud-upload-outline"
                  size={18}
                  color={colors.primaryForeground}
                />

                <ThemedText style={styles.primaryBtnText}>Subir foto</ThemedText>
              </>
            )}
          </Pressable>
        )}
      </View>

      <View style={styles.mediaCard}>
        <ThemedText style={styles.sectionTitle}>Código QR</ThemedText>

        {qrMostradoUrl ? (
          <View style={styles.qrBox}>
            <Image source={{ uri: qrMostradoUrl }} style={styles.qrImage} />
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons
              name="qr-code-outline"
              size={46}
              color={colors.textMuted || colors.muted}
            />

            <ThemedText style={styles.emptyText}>Sin QR registrado.</ThemedText>
          </View>
        )}

        <View style={styles.qrActions}>
          {qrMostradoUrl && (
            <Pressable
              style={[styles.primaryBtn, regenerandoQr && styles.disabled]}
              disabled={regenerandoQr}
              onPress={descargarQr}
            >
              <Ionicons
                name="download-outline"
                size={18}
                color={colors.primaryForeground}
              />

              <ThemedText style={styles.primaryBtnText}>
                Descargar QR
              </ThemedText>
            </Pressable>
          )}

          <Pressable
            style={[styles.regenerateQrBtn, regenerandoQr && styles.disabled]}
            disabled={regenerandoQr}
            onPress={regenerarQr}
          >
            {regenerandoQr ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={colors.primary}
                />

                <ThemedText style={styles.regenerateQrText}>
                  {qrMostradoUrl ? "Regenerar QR" : "Generar QR"}
                </ThemedText>
              </>
            )}
          </Pressable>
        </View>

        <ThemedText style={styles.qrHelper}>
          Al regenerar se reemplazará el QR guardado actualmente para este
          estudiante.
        </ThemedText>
      </View>
    </View>
  );

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <View style={styles.headerInfo}>
                {fotoCabeceraUrl ? (
                  <Image
                    key={fotoCabeceraUrl}
                    source={{ uri: fotoCabeceraUrl }}
                    style={styles.headerPhoto}
                    resizeMode="cover"
                    onError={(event) => {
                      console.warn(
                        "No se pudo cargar la foto del estudiante:",
                        fotoCabeceraUrl,
                        event.nativeEvent,
                      );
                    }}
                  />
                ) : (
                  <View style={styles.headerPhotoEmpty}>
                    <Ionicons
                      name="person-outline"
                      size={34}
                      color={
                        colors.textMuted ||
                        colors.muted ||
                        colors.textSecondary
                      }
                    />
                  </View>
                )}

                <View style={styles.headerTextBox}>
                  <ThemedText style={styles.title}>
                    {nombreCompleto(estudiante)}
                  </ThemedText>

                  <ThemedText style={styles.subtitle}>
                    Editar datos, documentos, foto y QR del estudiante
                  </ThemedText>
                </View>
              </View>

              <Pressable style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.tabs}>
              <Pressable
                style={[styles.tabBtn, tab === "datos" && styles.tabActive]}
                onPress={() => setTab("datos")}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    tab === "datos" && styles.tabTextActive,
                  ]}
                >
                  Datos
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.tabBtn,
                  tab === "documentos" && styles.tabActive,
                ]}
                onPress={() => setTab("documentos")}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    tab === "documentos" && styles.tabTextActive,
                  ]}
                >
                  Documentos
                </ThemedText>
              </Pressable>

              <Pressable
                style={[styles.tabBtn, tab === "media" && styles.tabActive]}
                onPress={() => setTab("media")}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    tab === "media" && styles.tabTextActive,
                  ]}
                >
                  Foto y QR
                </ThemedText>
              </Pressable>
            </View>

            {cargandoDetalle ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={colors.primary} size="large" />

                <ThemedText style={styles.subtitle}>
                  Cargando información...
                </ThemedText>
              </View>
            ) : tab === "documentos" ? (
              <View style={styles.documentsBody}>
                <EstudianteDocumentosPanel
                  estudiante={estudiante}
                  onDocumentoSubido={onDocumentoSubido}
                />
              </View>
            ) : (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
                contentContainerStyle={styles.content}
              >
                {tab === "datos" && renderDatos()}
                {tab === "media" && renderMedia()}
              </ScrollView>
            )}

            {tab === "datos" && (
              <View
                style={[
                  styles.footer,
                  {
                    flexDirection: isMobile ? "column" : "row",
                  },
                ]}
              >
                <Pressable
                  style={[
                    styles.cancelBtn,
                    guardando && styles.disabled,
                    { width: isMobile ? "100%" : 145 },
                  ]}
                  disabled={guardando}
                  onPress={onClose}
                >
                  <ThemedText style={styles.cancelText}>Cancelar</ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.saveBtn,
                    guardando && styles.disabled,
                    {
                      width: isMobile ? "100%" : 280,
                      backgroundColor: guardando
                        ? colors.disabled || colors.border
                        : isValid
                          ? colors.primary
                          : destructive,
                    },
                  ]}
                  disabled={guardando}
                  onPress={validateAndSave}
                >
                  {guardando ? (
                    <ActivityIndicator color={colors.primaryForeground} />
                  ) : (
                    <>
                      <Ionicons
                        name={isValid ? "save-outline" : "alert-circle-outline"}
                        size={17}
                        color={colors.primaryForeground}
                      />

                      <ThemedText style={styles.saveText}>
                        {isValid ? "Guardar cambios" : "Ver errores"}
                      </ThemedText>
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <EstudianteDatePickerModal
        visible={datePickerVisible}
        value={form.fecha_nac}
        title="Fecha de nacimiento"
        onClose={() => setDatePickerVisible(false)}
        onChange={(date) => {
          touchField("fecha_nac");
          setValue("fecha_nac", date);
        }}
      />
    </>
  );
}