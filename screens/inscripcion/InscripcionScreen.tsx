import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../components/ThemedText";
import { BASE_URL, httpClient } from "../../http/httpClient";
import { useTheme } from "../../theme/useTheme";

import FormDateInput from "./components/FormDateInput";
import FormInput from "./components/FormInput";
import FormSelect from "./components/FormSelect";
import NavigationButtons from "./components/NavigationButtons";
import PasoCuotas from "./components/PasoCuotas";
import PasoDocumentacion from "./components/PasoDocumentacion";
import PasoFinalizar from "./components/PasoFinalizar";
import ReferenceSection from "./components/ReferenceSection";
import StepIndicator from "./components/StepIndicator";

import { useInscripcionForm } from "./hooks/useInscripcionForm";

import {
  DepartamentoBolivia,
  Genero,
  InscripcionErrors,
} from "./types/inscripcion.types";

type DocumentoLocal = {
  nombreDocumento: string;
  archivoNombre: string | null;
  previewUri: string | null;
  mimeType: string | null;
};

type ReferenciaEstudiante = {
  idNumeroReferencia?: number;
  idUsuario?: number;
  nombreContactoReferencia?: string;
  parentesco?: string;
  numeroReferencia?: string;
  created_at?: string;
  updated_at?: string;
};

type EstudianteContinuar = {
  id: number;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  genero: string;
  expedido: string;
  fecha_nac: string;
  email: string;
  direccion: string;
  celular: string;
  numero_referencias?: ReferenciaEstudiante[];
  numeroReferencias?: ReferenciaEstudiante[];
};

const expedidoReverse: Record<string, DepartamentoBolivia> = {
  LPZ: "La Paz",
  CBBA: "Cochabamba",
  OR: "Oruro",
  PT: "Potosí",
  TJ: "Tarija",
  SCZ: "Santa Cruz",
  BN: "Beni",
  PD: "Pando",
  CH: "Chuquisaca",
  QR: "Cochabamba",
  EXT: "Cochabamba",
};

const generoReverse: Record<string, Genero> = {
  MASCULINO: "Masculino",
  FEMENINO: "Femenino",
};

export default function InscripcionScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 900;
  const { theme } = useTheme();

  const {
    form,
    updateField,
    step,
    setStep,
    resetForm,
  } = useInscripcionForm();

  const [idEstudiante, setIdEstudiante] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [errors, setErrors] = useState<InscripcionErrors>({});

  const [documentosLocales, setDocumentosLocales] = useState<
    Record<string, DocumentoLocal>
  >({});

  const [modalContinuarVisible, setModalContinuarVisible] = useState(false);
  const [loadingContinuar, setLoadingContinuar] = useState(false);
  const [busquedaContinuar, setBusquedaContinuar] = useState("");
  const [estudiantesContinuar, setEstudiantesContinuar] = useState<
    EstudianteContinuar[]
  >([]);

  const timeoutCarnet = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutCorreo = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [checkingCarnet, setCheckingCarnet] = useState(false);
  const [checkingCorreo, setCheckingCorreo] = useState(false);

  const limpiarInscripcion = () => {
    resetForm();
    setErrors({});
    setIdEstudiante(null);
    setMaxStepReached(1);
    setDocumentosLocales({});
    setBusquedaContinuar("");
    setEstudiantesContinuar([]);
  };

  const colorSecundario =
    (theme.colors as any).textSecondary ??
    (theme.colors as any).muted ??
    "#94A3B8";

  const updateFieldWithValidation = (
    field: keyof typeof form,
    value: any
  ) => {
    updateField(field, value);

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const fechaBackendAFrontend = (fecha?: string | null) => {
    if (!fecha) return "";

    const limpia = fecha.split("T")[0];
    const [year, month, day] = limpia.split("-");

    if (!year || !month || !day) return "";

    return `${day}/${month}/${year}`;
  };

  const normalizarArchivoUrl = (ubicacionArchivo: string | null) => {
    if (!ubicacionArchivo) return null;

    if (ubicacionArchivo.startsWith("http")) {
      return ubicacionArchivo;
    }

    return `${BASE_URL}/${ubicacionArchivo}`.replace(/([^:]\/)\/+/g, "$1");
  };

  const cargarDocumentosEstudiante = async (idUsuario: number) => {
    try {
      const response = await httpClient.getAuth<{
        documentos: {
          idDocumentoEstudiante: number;
          nombreDocumento: string;
          ubicacionArchivo: string | null;
          estadoDocumento: string;
          idUsuario: number;
        }[];
      }>(`/api/estudiantes/${idUsuario}/documentos-inscripcion`);

      const documentosMap: Record<string, DocumentoLocal> = {};

      (response.documentos ?? []).forEach((doc) => {
        const archivo = doc.ubicacionArchivo ?? null;
        const archivoNombre = archivo ? archivo.split("/").pop() ?? null : null;

        if (!doc.nombreDocumento) return;

        documentosMap[doc.nombreDocumento] = {
          nombreDocumento: doc.nombreDocumento,
          archivoNombre,
          previewUri: normalizarArchivoUrl(archivo),
          mimeType: null,
        };
      });

      setDocumentosLocales(documentosMap);
    } catch (error) {
      console.error(error);
      setDocumentosLocales({});
    }
  };

  const abrirContinuarInscripcion = async () => {
    try {
      setModalContinuarVisible(true);
      setLoadingContinuar(true);

      const response = await httpClient.getAuth<{
        estudiantes: EstudianteContinuar[];
      }>("/api/estudiantes/continuar-inscripcion");

      setEstudiantesContinuar(response.estudiantes ?? []);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.message ??
          "No se pudieron cargar los estudiantes pendientes.",
      });
    } finally {
      setLoadingContinuar(false);
    }
  };

const seleccionarEstudianteContinuar = async (
  estudiante: EstudianteContinuar
) => {
  const referencias =
    estudiante.numeroReferencias ??
    estudiante.numero_referencias ??
    [];

  const referencia = referencias.length > 0 ? referencias[0] : null;

  updateField("apellidoPaterno", estudiante.apellidoPaterno ?? "");
  updateField("apellidoMaterno", estudiante.apellidoMaterno ?? "");
  updateField("nombres", estudiante.nombres ?? "");
  updateField("carnet", estudiante.ci ?? "");
  updateField("email", estudiante.email ?? "");
  updateField("celular", estudiante.celular ?? "");
  updateField("direccion", estudiante.direccion ?? "");

  updateField(
    "fechaNacimiento",
    fechaBackendAFrontend(estudiante.fecha_nac)
  );

  updateField(
    "expedidoEn",
    expedidoReverse[estudiante.expedido] ?? "Cochabamba"
  );

  updateField(
    "genero",
    generoReverse[estudiante.genero] ?? "Masculino"
  );

  updateField(
    "referenciaNombre",
    referencia?.nombreContactoReferencia ?? ""
  );

  updateField(
    "referenciaParentesco",
    referencia?.parentesco ?? ""
  );

  updateField(
    "referenciaNumero",
    referencia?.numeroReferencia ?? ""
  );

  setIdEstudiante(estudiante.id);
  setErrors({});
  setMaxStepReached(2);
  setStep(2);
  setModalContinuarVisible(false);

  await cargarDocumentosEstudiante(estudiante.id);

  Toast.show({
    type: "success",
    text1: "Inscripción cargada",
    text2: referencia
      ? "Datos cargados correctamente."
      : "El estudiante no tiene contacto de referencia registrado.",
  });
};

  const estudiantesFiltrados = useMemo(() => {
    const textoBusqueda = busquedaContinuar.trim().toLowerCase();

    if (!textoBusqueda) return estudiantesContinuar;

    return estudiantesContinuar.filter((estudiante) => {
      const texto = `${estudiante.nombres} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno} ${estudiante.ci} ${estudiante.email}`.toLowerCase();

      return texto.includes(textoBusqueda);
    });
  }, [busquedaContinuar, estudiantesContinuar]);

  const validarFormulario = () => {
    const nuevosErrores: InscripcionErrors = {};

    if (!form.apellidoPaterno.trim()) {
      nuevosErrores.apellidoPaterno = "Ingrese el apellido paterno";
    }

    if (!form.nombres.trim()) {
      nuevosErrores.nombres = "Ingrese los nombres";
    }

    if (!form.carnet.trim()) {
      nuevosErrores.carnet = "Ingrese el número de carnet";
    } else if (form.carnet.length < 5) {
      nuevosErrores.carnet = "Carnet inválido";
    }

    if (!form.email.trim()) {
      nuevosErrores.email = "Ingrese el correo electrónico";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nuevosErrores.email = "Correo electrónico inválido";
    }

    if (!form.fechaNacimiento.trim()) {
      nuevosErrores.fechaNacimiento = "Seleccione una fecha";
    }

    if (!form.direccion.trim()) {
      nuevosErrores.direccion = "Ingrese la dirección";
    }

    if (!form.celular.trim()) {
      nuevosErrores.celular = "Ingrese el celular";
    } else if (form.celular.length !== 8) {
      nuevosErrores.celular = "El celular debe tener 8 dígitos";
    }

    if (!form.referenciaNombre.trim()) {
      nuevosErrores.referenciaNombre = "Ingrese el nombre de referencia";
    }

    if (!form.referenciaParentesco.trim()) {
      nuevosErrores.referenciaParentesco = "Ingrese el parentesco";
    }

    if (!form.referenciaNumero.trim()) {
      nuevosErrores.referenciaNumero = "Ingrese el número de referencia";
    } else if (form.referenciaNumero.length !== 8) {
      nuevosErrores.referenciaNumero = "El número debe tener 8 dígitos";
    }

    setErrors(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarEstudiante = async () => {
    try {
      const valido = validarFormulario();

      if (!valido) {
        Toast.show({
          type: "error",
          text1: "Formulario inválido",
          text2: "Corrige los campos marcados.",
        });

        return;
      }

      if (errors.carnet || errors.email || checkingCarnet || checkingCorreo) {
        Toast.show({
          type: "error",
          text1: "Validaciones pendientes",
          text2: "Verifica los datos antes de continuar.",
        });

        return;
      }

      setGuardando(true);

      const [day, month, year] = form.fechaNacimiento.split("/");

      const expedidoMap: Record<DepartamentoBolivia, string> = {
        "La Paz": "LPZ",
        Cochabamba: "CBBA",
        Oruro: "OR",
        Potosí: "PT",
        Tarija: "TJ",
        "Santa Cruz": "SCZ",
        Beni: "BN",
        Pando: "PD",
        Chuquisaca: "CH",
      };

      const generoMap: Record<Genero, string> = {
        Masculino: "MASCULINO",
        Femenino: "FEMENINO",
      };

      const payload = {
        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: form.apellidoMaterno?.trim() ?? "",
        nombres: form.nombres.trim(),
        carnet: form.carnet.replace(/\D/g, ""),
        email: form.email.trim().toLowerCase(),
        celular: form.celular.replace(/\D/g, "").replace(/^591/, ""),
        direccion: form.direccion.trim(),
        referenciaNombre: form.referenciaNombre.trim(),
        referenciaParentesco: form.referenciaParentesco.trim(),
        referenciaNumero: form.referenciaNumero.replace(/\D/g, ""),
        fechaNacimiento: `${year}-${month}-${day}`,
        expedidoEn: expedidoMap[form.expedidoEn],
        genero: generoMap[form.genero],
      };

      const response = idEstudiante
        ? await httpClient.putAuth<{
            estudiante: {
              id?: number;
              idUsuario?: number;
            };
          }>(`/api/estudiantes/${idEstudiante}`, payload)
        : await httpClient.postAuth<{
            estudiante: {
              id?: number;
              idUsuario?: number;
            };
          }>("/api/estudiantes", payload);

      const estudianteId =
        response.estudiante.id ??
        response.estudiante.idUsuario ??
        idEstudiante;

      if (!estudianteId) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "El backend no devolvió el ID.",
        });

        return;
      }

      setIdEstudiante(estudianteId);
      setMaxStepReached((prev) => Math.max(prev, 2));
      setStep(2);

      Toast.show({
        type: "success",
        text1: idEstudiante
          ? "Estudiante actualizado"
          : "Estudiante registrado",
        text2: idEstudiante
          ? "Los datos fueron actualizados correctamente."
          : "Ahora gestiona las cuotas.",
      });
    } catch (error: any) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.message ??
          "No se pudo guardar al estudiante.",
      });
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    if (!form.carnet || form.carnet.length < 5) {
      return;
    }

    if (timeoutCarnet.current) {
      clearTimeout(timeoutCarnet.current);
    }

    timeoutCarnet.current = setTimeout(async () => {
      try {
        setCheckingCarnet(true);

        const response = await httpClient.postAuth<{
          carnetExiste: boolean;
        }>("/api/estudiantes/verificar-datos", {
          carnet: form.carnet,
          idUsuario: idEstudiante,
        });

        setErrors((prev) => ({
          ...prev,
          carnet: response.carnetExiste
            ? "Este carnet ya está registrado"
            : undefined,
        }));
      } catch (error) {
        console.error(error);
      } finally {
        setCheckingCarnet(false);
      }
    }, 700);

    return () => {
      if (timeoutCarnet.current) {
        clearTimeout(timeoutCarnet.current);
      }
    };
  }, [form.carnet, idEstudiante]);

  useEffect(() => {
    if (
      !form.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      return;
    }

    if (timeoutCorreo.current) {
      clearTimeout(timeoutCorreo.current);
    }

    timeoutCorreo.current = setTimeout(async () => {
      try {
        setCheckingCorreo(true);

        const response = await httpClient.postAuth<{
          correoExiste: boolean;
        }>("/api/estudiantes/verificar-datos", {
          email: form.email,
          idUsuario: idEstudiante,
        });

        setErrors((prev) => ({
          ...prev,
          email: response.correoExiste
            ? "Este correo ya está registrado"
            : undefined,
        }));
      } catch (error) {
        console.error(error);
      } finally {
        setCheckingCorreo(false);
      }
    }, 700);

    return () => {
      if (timeoutCorreo.current) {
        clearTimeout(timeoutCorreo.current);
      }
    };
  }, [form.email, idEstudiante]);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
      contentContainerStyle={{
        padding: isMobile ? 16 : 34,
        paddingBottom: 50,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <ThemedText
          style={{
            fontSize: isMobile ? 28 : 38,
            fontWeight: "900",
            color: theme.colors.text,
          }}
        >
          {step === 1 && "Datos del Estudiante"}
          {step === 2 && "Gestion de Cuotas"}
          {step === 3 && "Carga de Documentos"}
          {step === 4 && "Inscripción Finalizada"}
        </ThemedText>

        <StepIndicator
          currentStep={step}
          maxStepReached={maxStepReached}
          onStepPress={(selectedStep) => {
            if (selectedStep <= maxStepReached) {
              setStep(selectedStep);
            }
          }}
        />
      </View>

      {step === 1 && (
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 24,
            padding: isMobile ? 18 : 32,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View
            style={{
              alignItems: isMobile ? "stretch" : "flex-end",
              marginBottom: 24,
            }}
          >
            <Pressable
              onPress={abrirContinuarInscripcion}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 18,
                paddingVertical: 13,
                borderRadius: 14,
              }}
            >
              <Ionicons
                name="play-forward-outline"
                size={18}
                color="#FFFFFF"
              />

              <ThemedText
                style={{
                  color: "#FFFFFF",
                  fontWeight: "900",
                }}
              >
                Continuar Inscripción
              </ThemedText>
            </Pressable>
          </View>

          <View style={{ gap: 22 }}>
            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                gap: 18,
              }}
            >
              <FormInput
                required
                label="APELLIDO PATERNO"
                placeholder="Escriba su primer apellido"
                value={form.apellidoPaterno}
                error={errors.apellidoPaterno}
                onChangeText={(text) =>
                  updateFieldWithValidation("apellidoPaterno", text)
                }
              />

             <FormInput
  label="APELLIDO MATERNO"
  placeholder="Escriba su segundo apellido"
  value={form.apellidoMaterno}
  error={errors.apellidoMaterno}
  onChangeText={(text) =>
    updateFieldWithValidation("apellidoMaterno", text)
  }
/>

              <FormInput
                required
                label="NOMBRES"
                placeholder="Sus nombres completos"
                value={form.nombres}
                error={errors.nombres}
                onChangeText={(text) =>
                  updateFieldWithValidation("nombres", text)
                }
              />
            </View>

            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                gap: 18,
              }}
            >
              <FormInput
                required
                label="NÚMERO DE CARNET"
                placeholder="0000000"
                value={form.carnet}
                error={
                  checkingCarnet
                    ? "Verificando carnet..."
                    : errors.carnet
                }
                success={
                  !checkingCarnet &&
                  !errors.carnet &&
                  form.carnet.length >= 5
                    ? "Carnet disponible"
                    : undefined
                }
                loading={checkingCarnet}
                keyboardType="numeric"
                onlyNumbers
                maxLength={12}
                onChangeText={(text) =>
                  updateFieldWithValidation("carnet", text)
                }
              />

              <FormSelect
                label="EXPEDIDO EN"
                value={form.expedidoEn}
                options={[
                  "La Paz",
                  "Cochabamba",
                  "Santa Cruz",
                  "Oruro",
                  "Potosí",
                  "Chuquisaca",
                  "Tarija",
                  "Beni",
                  "Pando",
                ]}
                onChange={(value) =>
                  updateField("expedidoEn", value as DepartamentoBolivia)
                }
              />

              <FormSelect
                label="GÉNERO"
                value={form.genero}
                options={["Masculino", "Femenino"]}
                onChange={(value) =>
                  updateField("genero", value as Genero)
                }
              />
            </View>

            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                gap: 18,
              }}
            >
              <FormInput
                required
                label="CORREO ELECTRÓNICO"
                placeholder="correo@gmail.com"
                value={form.email}
                error={
                  checkingCorreo
                    ? "Verificando correo..."
                    : errors.email
                }
                success={
                  !checkingCorreo &&
                  !errors.email &&
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
                    ? "Correo disponible"
                    : undefined
                }
                loading={checkingCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(text) =>
                  updateFieldWithValidation("email", text)
                }
              />

              <FormDateInput
                label="FECHA DE NACIMIENTO"
                value={form.fechaNacimiento}
                onChangeText={(text) =>
                  updateFieldWithValidation("fechaNacimiento", text)
                }
              />
            </View>

            <FormInput
              required
              label="DIRECCIÓN SEGÚN CARNET"
              placeholder="Calle, número, zona..."
              value={form.direccion}
              error={errors.direccion}
              onChangeText={(text) =>
                updateFieldWithValidation("direccion", text)
              }
            />

            <FormInput
              required
              label="CELULAR PRINCIPAL"
              placeholder="63066882"
              value={form.celular}
              error={errors.celular}
              keyboardType="phone-pad"
              onlyNumbers
              maxLength={8}
              onChangeText={(text) =>
                updateFieldWithValidation("celular", text)
              }
            />

            <ReferenceSection
              isMobile={isMobile}
              form={form}
              errors={errors}
              updateField={updateFieldWithValidation}
            />

            <NavigationButtons
              onNext={guardarEstudiante}
              loading={guardando}
            />
          </View>
        </View>
      )}

      {step === 2 && idEstudiante && (
        <PasoCuotas
          idEstudiante={idEstudiante}
          onFinish={() => {
            setMaxStepReached((prev) => Math.max(prev, 3));
            setStep(3);
          }}
        />
      )}

      {step === 3 && idEstudiante && (
        <PasoDocumentacion
          idUsuario={idEstudiante}
          documentosLocales={documentosLocales}
          setDocumentosLocales={setDocumentosLocales}
          onBack={() => setStep(2)}
          onFinish={() => {
            setMaxStepReached((prev) => Math.max(prev, 4));
            setStep(4);
          }}
        />
      )}

      {step === 4 && idEstudiante && (
        <PasoFinalizar
          idUsuario={idEstudiante}
          onDashboard={limpiarInscripcion}
          onResetForm={limpiarInscripcion}
        />
      )}

      <Modal
        visible={modalContinuarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalContinuarVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.65)",
            justifyContent: "center",
            padding: isMobile ? 14 : 28,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: isMobile ? 16 : 22,
              maxHeight: "86%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={{
                    fontSize: isMobile ? 20 : 24,
                    fontWeight: "900",
                    color: theme.colors.text,
                  }}
                >
                  Continuar Inscripción
                </ThemedText>

                <ThemedText
                  style={{
                    color: colorSecundario,
                    marginTop: 4,
                    lineHeight: 20,
                  }}
                >
                  Se muestran estudiantes sin cuotas asignadas y sin carrera
                  registrada.
                </ThemedText>
              </View>

              <Pressable
                onPress={() => setModalContinuarVisible(false)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.colors.background,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>

            <TextInput
              placeholder="Buscar por nombre, carnet o correo..."
              placeholderTextColor={colorSecundario}
              value={busquedaContinuar}
              onChangeText={setBusquedaContinuar}
              style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 16,
                outlineStyle: "none" as any,
              }}
            />

            {loadingContinuar ? (
              <View
                style={{
                  paddingVertical: 36,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator
                  color={theme.colors.primary}
                  size="large"
                />

                <ThemedText
                  style={{
                    color: colorSecundario,
                    marginTop: 12,
                  }}
                >
                  Cargando estudiantes...
                </ThemedText>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {estudiantesFiltrados.length === 0 ? (
                  <View
                    style={{
                      padding: 28,
                      borderRadius: 18,
                      backgroundColor: theme.colors.background,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="folder-open-outline"
                      size={34}
                      color={colorSecundario}
                    />

                    <ThemedText
                      style={{
                        color: colorSecundario,
                        textAlign: "center",
                        marginTop: 10,
                        fontWeight: "700",
                      }}
                    >
                      No hay estudiantes pendientes para continuar.
                    </ThemedText>
                  </View>
                ) : (
                  estudiantesFiltrados.map((estudiante) => (
                    <Pressable
                      key={estudiante.id}
                      onPress={() =>
                        seleccionarEstudianteContinuar(estudiante)
                      }
                      style={{
                        padding: 16,
                        borderRadius: 18,
                        backgroundColor: theme.colors.background,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: isMobile ? "column" : "row",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <ThemedText
                            style={{
                              fontSize: 16,
                              fontWeight: "900",
                              color: theme.colors.text,
                            }}
                          >
                            {estudiante.apellidoPaterno}{" "}
                            {estudiante.apellidoMaterno} {estudiante.nombres}
                          </ThemedText>

                          <ThemedText
                            style={{
                              color: colorSecundario,
                              marginTop: 5,
                            }}
                          >
                            CI: {estudiante.ci}
                          </ThemedText>

                          <ThemedText
                            style={{
                              color: colorSecundario,
                              marginTop: 2,
                            }}
                          >
                            {estudiante.email}
                          </ThemedText>
                        </View>

                        <View
                          style={{
                            alignSelf: isMobile ? "flex-start" : "center",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            backgroundColor: theme.colors.primary,
                            paddingHorizontal: 12,
                            paddingVertical: 9,
                            borderRadius: 12,
                          }}
                        >
                          <ThemedText
                            style={{
                              color: "#FFFFFF",
                              fontWeight: "900",
                            }}
                          >
                            Continuar
                          </ThemedText>

                          <Ionicons
                            name="arrow-forward"
                            size={16}
                            color="#FFFFFF"
                          />
                        </View>
                      </View>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}