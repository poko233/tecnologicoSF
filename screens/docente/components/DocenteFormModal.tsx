import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import {
    Docente,
    DocenteForm,
    EstadoUsuario,
    EXPEDIDOS,
    Genero,
    initialDocenteForm,
} from "../types/docente.types";
import DatePickerModal from "./DatePickerModal";

type Props = {
  visible: boolean;
  saving: boolean;
  docente: Docente | null;

  serverErrors?: Partial<Record<keyof DocenteForm, string>>;
  onClearServerError?: (field: keyof DocenteForm) => void;

  onClose: () => void;
  onSave: (data: DocenteForm) => void;
};

type FormErrors = Partial<Record<keyof DocenteForm, string>>;

const ONLY_NUMBERS = /^\d+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEXT_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
const ADDRESS_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9\s.,#°/-]+$/;

const FIELD_LABELS: Partial<Record<keyof DocenteForm, string>> = {
  ci: "Carnet de identidad",
  fecha_nac: "Fecha de nacimiento",
  nombres: "Nombres",
  apellidoPaterno: "Apellido paterno",
  apellidoMaterno: "Apellido materno",
  celular: "Celular",
  email: "Email",
  direccion: "Dirección",
  profesion: "Profesión",
  abreviaturaProfesional: "Abreviatura profesional",
  expedido: "Expedido en",
  genero: "Género",
};

function parseDate(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
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

function validateForm(form: DocenteForm): FormErrors {
  const errors: FormErrors = {};

  const ci = form.ci.trim();
  const nombres = form.nombres.trim();
  const apellidoPaterno = form.apellidoPaterno.trim();
  const apellidoMaterno = form.apellidoMaterno.trim();
  const fechaNac = form.fecha_nac.trim();
  const celular = form.celular.trim();
  const email = form.email.trim();
  const direccion = form.direccion.trim();
  const profesion = form.profesion.trim();
  const abreviaturaProfesional = form.abreviaturaProfesional.trim();

  if (!ci) errors.ci = "El carnet es obligatorio.";
  else if (!ONLY_NUMBERS.test(ci)) errors.ci = "Solo debe contener números.";
  else if (ci.length < 5) errors.ci = "Debe tener al menos 5 dígitos.";
  else if (ci.length > 12) errors.ci = "No debe superar 12 dígitos.";

  if (!fechaNac) {
    errors.fecha_nac = "La fecha de nacimiento es obligatoria.";
  } else {
    const date = parseDate(fechaNac);
    const age = getAge(fechaNac);

    if (!date) errors.fecha_nac = "La fecha no es válida.";
    else if (date > new Date()) errors.fecha_nac = "No puede ser futura.";
    else if (age !== null && age < 18)
      errors.fecha_nac = "El docente debe tener al menos 18 años.";
    else if (age !== null && age > 90)
      errors.fecha_nac = "La edad no puede superar 90 años.";
  }

  if (!nombres) errors.nombres = "Los nombres son obligatorios.";
  else if (nombres.length < 2)
    errors.nombres = "Debe tener al menos 2 caracteres.";
  else if (!TEXT_REGEX.test(nombres))
    errors.nombres = "Solo se permiten letras y espacios.";

  if (!apellidoPaterno)
    errors.apellidoPaterno = "El apellido paterno es obligatorio.";
  else if (apellidoPaterno.length < 2)
    errors.apellidoPaterno = "Debe tener al menos 2 caracteres.";
  else if (!TEXT_REGEX.test(apellidoPaterno))
    errors.apellidoPaterno = "Solo se permiten letras y espacios.";

  if (apellidoMaterno && !TEXT_REGEX.test(apellidoMaterno)) {
    errors.apellidoMaterno = "Solo se permiten letras y espacios.";
  }

  if (!celular) errors.celular = "El celular es obligatorio.";
  else if (!ONLY_NUMBERS.test(celular))
    errors.celular = "Solo debe contener números.";
  else if (celular.length < 7 || celular.length > 20)
    errors.celular = "Debe tener entre 7 y 20 dígitos.";

  if (!email) errors.email = "El email es obligatorio.";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Ingresa un email válido.";

  if (!direccion) errors.direccion = "La dirección es obligatoria.";
  else if (direccion.length < 4) errors.direccion = "La dirección es muy corta.";
  else if (!ADDRESS_REGEX.test(direccion))
    errors.direccion = "Contiene caracteres no válidos.";

  if (!profesion) errors.profesion = "La profesión es obligatoria.";
  else if (profesion.length < 3)
    errors.profesion = "Debe tener al menos 3 caracteres.";

  if (!abreviaturaProfesional)
    errors.abreviaturaProfesional = "La abreviatura es obligatoria.";
  else if (abreviaturaProfesional.length < 2)
    errors.abreviaturaProfesional = "Debe tener al menos 2 caracteres.";
  else if (abreviaturaProfesional.length > 10)
    errors.abreviaturaProfesional = "Máximo 10 caracteres.";

  return errors;
}

export default function DocenteFormModal({
  visible,
  saving,
  docente,
  serverErrors = {},
  onClearServerError,
  onClose,
  onSave,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const [form, setForm] = useState<DocenteForm>(initialDocenteForm);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<keyof DocenteForm, boolean>>
  >({});

  useEffect(() => {
    if (!visible) return;

    setTouched({});
    setSubmitted(false);

    if (docente) {
      setForm({
        usuario: docente.usuario?.ci ?? "",
        ci: docente.usuario?.ci ?? "",
        expedido: docente.usuario?.expedido ?? "CBBA",
        nombres: docente.usuario?.nombres ?? "",
        apellidoPaterno: docente.usuario?.apellidoPaterno ?? "",
        apellidoMaterno: docente.usuario?.apellidoMaterno ?? "",
        genero: docente.usuario?.genero ?? "MASCULINO",
        fecha_nac: docente.usuario?.fecha_nac ?? "",
        email: docente.usuario?.email ?? "",
        celular: docente.usuario?.celular ?? "",
        direccion: docente.usuario?.direccion ?? "",
        estado: docente.usuario?.estado ?? "ACTIVO",
        profesion: docente.profesion ?? "",
        abreviaturaProfesional: docente.abreviaturaProfesional ?? "",
        estadoDocente: docente.estadoDocente ?? "activo",
      });
    } else {
      setForm(initialDocenteForm);
    }
  }, [visible, docente]);

  const localErrors = useMemo(() => validateForm(form), [form]);

  const errors = useMemo(
    () => ({
      ...localErrors,
      ...serverErrors,
    }),
    [localErrors, serverErrors]
  );

  const errorEntries = Object.entries(errors) as [keyof DocenteForm, string][];
  const isValid = errorEntries.length === 0;
  const showSummary = submitted && !isValid;
  const fieldWidth = isMobile ? "100%" : "48.8%";

  const touchField = (field: keyof DocenteForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const shouldShowFieldError = (field: keyof DocenteForm) => {
    return (touched[field] || submitted) && !!errors[field];
  };

  const shouldShowFieldOk = (field: keyof DocenteForm) => {
    return !!touched[field] && !errors[field];
  };

  const setValue = <K extends keyof DocenteForm>(
    key: K,
    value: DocenteForm[K]
  ) => {
    touchField(key);
    onClearServerError?.(key);

    setForm((prev) => {
      if (key === "ci") {
        const cleanValue = String(value).replace(/\D/g, "");
        return { ...prev, ci: cleanValue, usuario: cleanValue };
      }

      if (key === "celular") {
        return { ...prev, celular: String(value).replace(/\D/g, "") };
      }

      if (
        key === "nombres" ||
        key === "apellidoPaterno" ||
        key === "apellidoMaterno"
      ) {
        return {
          ...prev,
          [key]: String(value).replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, ""),
        };
      }

      return { ...prev, [key]: value };
    });
  };

  const markAllTouched = () => {
    setTouched({
      ci: true,
      fecha_nac: true,
      nombres: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      celular: true,
      email: true,
      direccion: true,
      profesion: true,
      abreviaturaProfesional: true,
      expedido: true,
      genero: true,
    });
  };

  const validateAndSave = () => {
    setSubmitted(true);
    markAllTouched();

    const currentErrors = {
      ...validateForm(form),
      ...serverErrors,
    };

    if (Object.keys(currentErrors).length > 0) {
      Toast.show({
        type: "error",
        text1: "Formulario incompleto",
        text2: "Revisa el resumen de errores.",
      });
      return;
    }

    const payload: DocenteForm = {
      ...form,
      usuario: form.ci.trim(),
      ci: form.ci.trim(),
      nombres: form.nombres.trim(),
      apellidoPaterno: form.apellidoPaterno.trim(),
      apellidoMaterno: form.apellidoMaterno.trim(),
      email: form.email.trim().toLowerCase(),
      celular: form.celular.trim(),
      direccion: form.direccion.trim(),
      profesion: form.profesion.trim(),
      abreviaturaProfesional: form.abreviaturaProfesional.trim(),
      estadoDocente: form.estado === "ACTIVO" ? "activo" : "inactivo",
    };

    onSave(payload);
  };

  const getBorderColor = (field: keyof DocenteForm) => {
    if (shouldShowFieldError(field)) return theme.colors.destructive;
    if (shouldShowFieldOk(field)) return theme.colors.success;
    return theme.colors.inputBorder;
  };

  const inputStyle = (field: keyof DocenteForm) => [
    styles.input,
    {
      backgroundColor: theme.colors.input,
      borderColor: getBorderColor(field),
      color: theme.colors.text,
    },
  ];

  const optionStyle = (active: boolean) => [
    styles.option,
    {
      backgroundColor: active ? theme.colors.primary : theme.colors.input,
      borderColor: active ? theme.colors.primary : theme.colors.border,
    },
  ];

  const renderError = (field: keyof DocenteForm) => {
    if (!shouldShowFieldError(field)) return null;

    return (
      <View style={styles.feedbackRow}>
        <Ionicons
          name="alert-circle-outline"
          size={14}
          color={theme.colors.destructive}
        />
        <ThemedText
          style={[styles.errorText, { color: theme.colors.destructive }]}
        >
          {errors[field]}
        </ThemedText>
      </View>
    );
  };

  const renderOk = (field: keyof DocenteForm) => {
    if (!shouldShowFieldOk(field)) return null;

    return (
      <View style={styles.feedbackRow}>
        <Ionicons
          name="checkmark-circle-outline"
          size={14}
          color={theme.colors.success}
        />
        <ThemedText style={[styles.okText, { color: theme.colors.success }]}>
          Correcto
        </ThemedText>
      </View>
    );
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
          <View
            style={[
              styles.modal,
              {
                backgroundColor: theme.colors.modal,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.header}>
              <View style={[styles.headerIcon, { backgroundColor: theme.colors.primary }]}>
                <Ionicons
                  name="school-outline"
                  size={25}
                  color={theme.colors.primaryForeground}
                />
              </View>

              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.title, { color: theme.colors.text }]}>
                  {docente ? "Editar docente" : "Nuevo docente"}
                </ThemedText>

                <ThemedText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Todos los campos son obligatorios excepto apellido materno.
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
                <Ionicons name="close" size={25} color={theme.colors.text} />
              </Pressable>
            </View>

            <View
              style={[
                styles.statusBox,
                {
                  backgroundColor: isValid
                    ? theme.colors.success + "18"
                    : theme.colors.warning + "18",
                  borderColor: isValid ? theme.colors.success : theme.colors.warning,
                },
              ]}
            >
              <Ionicons
                name={isValid ? "checkmark-circle-outline" : "alert-circle-outline"}
                size={20}
                color={isValid ? theme.colors.success : theme.colors.warning}
              />
              <ThemedText
                style={[
                  styles.statusText,
                  { color: isValid ? theme.colors.success : theme.colors.warning },
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
                    backgroundColor: theme.colors.destructive + "16",
                    borderColor: theme.colors.destructive,
                  },
                ]}
              >
                <View style={styles.summaryHeader}>
                  <Ionicons
                    name="warning-outline"
                    size={20}
                    color={theme.colors.destructive}
                  />
                  <ThemedText
                    style={[
                      styles.summaryTitle,
                      { color: theme.colors.destructive },
                    ]}
                  >
                    Corrige estos campos
                  </ThemedText>
                </View>

                {errorEntries.map(([field, message]) => (
                  <ThemedText
                    key={field}
                    style={[styles.summaryItem, { color: theme.colors.text }]}
                  >
                    • {FIELD_LABELS[field] ?? field}: {message}
                  </ThemedText>
                ))}
              </View>
            )}

            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator
              persistentScrollbar
            >
              <View style={styles.block}>
                <View style={styles.blockHeader}>
                  <Ionicons name="person-outline" size={19} color={theme.colors.primary} />
                  <ThemedText style={[styles.blockTitle, { color: theme.colors.text }]}>
                    Datos personales
                  </ThemedText>
                </View>

                <View style={styles.formGrid}>
                  <View style={[styles.field, { width: fieldWidth }]}>
                    <ThemedText style={[styles.label, { color: theme.colors.text }]}>
                      Carnet de identidad *
                    </ThemedText>
                    <TextInput
                      placeholder="Ej: 6688289"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={form.ci}
                      onChangeText={(value) => setValue("ci", value)}
                      onBlur={() => touchField("ci")}
                      keyboardType="numeric"
                      maxLength={12}
                      style={inputStyle("ci")}
                    />
                    <ThemedText style={[styles.helper, { color: theme.colors.textSecondary }]}>
                      También será el usuario y contraseña inicial.
                    </ThemedText>
                    {renderError("ci")}
                    {renderOk("ci")}
                  </View>

                  <View style={[styles.field, { width: fieldWidth }]}>
                    <ThemedText style={[styles.label, { color: theme.colors.text }]}>
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
                          backgroundColor: theme.colors.input,
                          borderColor: getBorderColor("fecha_nac"),
                        },
                      ]}
                    >
                      <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                      <ThemedText
                        style={[
                          styles.dateText,
                          {
                            color: form.fecha_nac
                              ? theme.colors.text
                              : theme.colors.textTertiary,
                          },
                        ]}
                      >
                        {form.fecha_nac || "Seleccionar fecha"}
                      </ThemedText>
                    </Pressable>
                    {renderError("fecha_nac")}
                    {renderOk("fecha_nac")}
                  </View>

                  <View style={[styles.field, { width: fieldWidth }]}>
                    <ThemedText style={[styles.label, { color: theme.colors.text }]}>
                      Nombres *
                    </ThemedText>
                    <TextInput
                      placeholder="Ej: Juan Carlos"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={form.nombres}
                      onChangeText={(value) => setValue("nombres", value)}
                      onBlur={() => touchField("nombres")}
                      style={inputStyle("nombres")}
                    />
                    {renderError("nombres")}
                    {renderOk("nombres")}
                  </View>

                  <View style={[styles.field, { width: fieldWidth }]}>
                    <ThemedText style={[styles.label, { color: theme.colors.text }]}>
                      Apellido paterno *
                    </ThemedText>
                    <TextInput
                      placeholder="Ej: Quispe"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={form.apellidoPaterno}
                      onChangeText={(value) => setValue("apellidoPaterno", value)}
                      onBlur={() => touchField("apellidoPaterno")}
                      style={inputStyle("apellidoPaterno")}
                    />
                    {renderError("apellidoPaterno")}
                    {renderOk("apellidoPaterno")}
                  </View>

                  <View style={[styles.field, { width: fieldWidth }]}>
                    <ThemedText style={[styles.label, { color: theme.colors.text }]}>
                      Apellido materno
                    </ThemedText>
                    <TextInput
                      placeholder="Opcional"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={form.apellidoMaterno}
                      onChangeText={(value) => setValue("apellidoMaterno", value)}
                      onBlur={() => touchField("apellidoMaterno")}
                      style={inputStyle("apellidoMaterno")}
                    />
                    {renderError("apellidoMaterno")}
                    {form.apellidoMaterno.trim() ? renderOk("apellidoMaterno") : null}
                  </View>

                  <View style={[styles.field, { width: fieldWidth }]}>
                    <ThemedText style={[styles.label, { color: theme.colors.text }]}>
                      Celular *
                    </ThemedText>
                    <TextInput
                      placeholder="Ej: 70707070"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={form.celular}
                      onChangeText={(value) => setValue("celular", value)}
                      onBlur={() => touchField("celular")}
                      keyboardType="phone-pad"
                      maxLength={20}
                      style={inputStyle("celular")}
                    />
                    {renderError("celular")}
                    {renderOk("celular")}
                  </View>

                  <View style={[styles.field, { width: fieldWidth }]}>
                    <ThemedText style={[styles.label, { color: theme.colors.text }]}>
                      Email *
                    </ThemedText>
                    <TextInput
                      placeholder="correo@ejemplo.com"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={form.email}
                      onChangeText={(value) => setValue("email", value)}
                      onBlur={() => touchField("email")}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={inputStyle("email")}
                    />
                    {renderError("email")}
                    {renderOk("email")}
                  </View>

                  <View style={[styles.field, { width: fieldWidth }]}>
                    <ThemedText style={[styles.label, { color: theme.colors.text }]}>
                      Dirección *
                    </ThemedText>
                    <TextInput
                      placeholder="Dirección actual"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={form.direccion}
                      onChangeText={(value) => setValue("direccion", value)}
                      onBlur={() => touchField("direccion")}
                      style={inputStyle("direccion")}
                    />
                    {renderError("direccion")}
                    {renderOk("direccion")}
                  </View>
                </View>
              </View>

              <View style={styles.block}>
                <View style={styles.blockHeader}>
                  <Ionicons name="briefcase-outline" size={19} color={theme.colors.primary} />
                  <ThemedText style={[styles.blockTitle, { color: theme.colors.text }]}>
                    Datos profesionales
                  </ThemedText>
                </View>

                <View style={styles.formGrid}>
                  <View style={[styles.field, { width: fieldWidth }]}>
                    <ThemedText style={[styles.label, { color: theme.colors.text }]}>
                      Profesión *
                    </ThemedText>
                    <TextInput
                      placeholder="Ej: Ingeniero"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={form.profesion}
                      onChangeText={(value) => setValue("profesion", value)}
                      onBlur={() => touchField("profesion")}
                      style={inputStyle("profesion")}
                    />
                    {renderError("profesion")}
                    {renderOk("profesion")}
                  </View>

                  <View style={[styles.field, { width: fieldWidth }]}>
                    <ThemedText style={[styles.label, { color: theme.colors.text }]}>
                      Abreviatura profesional *
                    </ThemedText>
                    <TextInput
                      placeholder="Ej: Ing"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={form.abreviaturaProfesional}
                      onChangeText={(value) => setValue("abreviaturaProfesional", value)}
                      onBlur={() => touchField("abreviaturaProfesional")}
                      maxLength={10}
                      style={inputStyle("abreviaturaProfesional")}
                    />
                    {renderError("abreviaturaProfesional")}
                    {renderOk("abreviaturaProfesional")}
                  </View>
                </View>
              </View>

              <View style={styles.block}>
                <View style={styles.blockHeader}>
                  <Ionicons name="location-outline" size={19} color={theme.colors.primary} />
                  <ThemedText style={[styles.blockTitle, { color: theme.colors.text }]}>
                    Expedido en *
                  </ThemedText>
                </View>

                <View style={styles.optionsWrap}>
                  {EXPEDIDOS.map((item) => (
                    <Pressable
                      key={item.value}
                      onPress={() => {
                        touchField("expedido");
                        setValue("expedido", item.value);
                      }}
                      style={optionStyle(form.expedido === item.value)}
                    >
                      <ThemedText
                        style={[
                          styles.optionText,
                          {
                            color:
                              form.expedido === item.value
                                ? theme.colors.primaryForeground
                                : theme.colors.text,
                          },
                        ]}
                      >
                        {item.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.block}>
                <View style={styles.blockHeader}>
                  <Ionicons name="male-female-outline" size={19} color={theme.colors.primary} />
                  <ThemedText style={[styles.blockTitle, { color: theme.colors.text }]}>
                    Género *
                  </ThemedText>
                </View>

                <View style={styles.optionsWrap}>
                  {(["MASCULINO", "FEMENINO"] as Genero[]).map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => {
                        touchField("genero");
                        setValue("genero", item);
                      }}
                      style={optionStyle(form.genero === item)}
                    >
                      <ThemedText
                        style={[
                          styles.optionText,
                          {
                            color:
                              form.genero === item
                                ? theme.colors.primaryForeground
                                : theme.colors.text,
                          },
                        ]}
                      >
                        {item}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              {docente && (
                <View style={styles.block}>
                  <View style={styles.blockHeader}>
                    <Ionicons name="power-outline" size={19} color={theme.colors.primary} />
                    <ThemedText style={[styles.blockTitle, { color: theme.colors.text }]}>
                      Estado
                    </ThemedText>
                  </View>

                  <View style={styles.optionsWrap}>
                    {(["ACTIVO", "INACTIVO"] as EstadoUsuario[]).map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => {
                          setValue("estado", item);
                          setValue(
                            "estadoDocente",
                            item === "ACTIVO" ? "activo" : "inactivo"
                          );
                        }}
                        style={optionStyle(form.estado === item)}
                      >
                        <ThemedText
                          style={[
                            styles.optionText,
                            {
                              color:
                                form.estado === item
                                  ? theme.colors.primaryForeground
                                  : theme.colors.text,
                            },
                          ]}
                        >
                          {item}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View
              style={[
                styles.footer,
                { flexDirection: isMobile ? "column" : "row" },
              ]}
            >
              <Pressable
                onPress={onClose}
                disabled={saving}
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: theme.colors.input,
                    borderColor: theme.colors.border,
                    width: isMobile ? "100%" : 170,
                  },
                ]}
              >
                <ThemedText style={[styles.cancelText, { color: theme.colors.text }]}>
                  Cancelar
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={validateAndSave}
                disabled={saving}
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: saving
                      ? theme.colors.disabled
                      : isValid
                      ? theme.colors.primary
                      : theme.colors.destructive,
                  },
                ]}
              >
                {saving ? (
                  <ActivityIndicator color={theme.colors.primaryForeground} />
                ) : (
                  <>
                    <Ionicons
                      name={isValid ? "save-outline" : "alert-circle-outline"}
                      size={21}
                      color={theme.colors.primaryForeground}
                    />
                    <ThemedText
                      style={[
                        styles.saveText,
                        { color: theme.colors.primaryForeground },
                      ]}
                    >
                      {isValid ? "Guardar docente" : "Ver errores"}
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <DatePickerModal
        visible={datePickerVisible}
        value={form.fecha_nac}
        onClose={() => setDatePickerVisible(false)}
        onChange={(date) => {
          touchField("fecha_nac");
          setValue("fecha_nac", date);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "100%",
    maxWidth: 980,
    maxHeight: "92%",
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 27,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },
  closeButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
  },
  errorSummary: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 2,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: "900",
  },
  summaryItem: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  scrollArea: {
    maxHeight: 440,
    paddingRight: 8,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  block: {
    gap: 12,
    marginBottom: 20,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "flex-start",
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "900",
  },
  helper: {
    fontSize: 11,
    fontWeight: "700",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 14,
    outlineStyle: "none" as any,
  },
  dateButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "800",
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  errorText: {
    fontSize: 11,
    fontWeight: "800",
  },
  okText: {
    fontSize: 11,
    fontWeight: "800",
  },
  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 12,
    fontWeight: "900",
  },
  footer: {
    gap: 12,
  },
  cancelButton: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "900",
  },
  saveButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveText: {
    fontSize: 15,
    fontWeight: "900",
  },
});