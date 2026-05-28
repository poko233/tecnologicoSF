import { useEffect, useRef, useState } from "react";

import {
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";

import Toast from "react-native-toast-message";

import { ThemedText } from "../../components/ThemedText";
import { httpClient } from "../../http/httpClient";
import { useTheme } from "../../theme/useTheme";

import FormDateInput from "./components/FormDateInput";
import FormInput from "./components/FormInput";
import FormSelect from "./components/FormSelect";
import NavigationButtons from "./components/NavigationButtons";
import PasoAcademico from "./components/PasoAcademico";
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
    setGruposSeleccionados,
  } = useInscripcionForm();

  const [idEstudiante, setIdEstudiante] =
    useState<number | null>(null);

  const [guardando, setGuardando] =
    useState(false);

  const [maxStepReached, setMaxStepReached] =
    useState(1);

  const [errors, setErrors] =
    useState<InscripcionErrors>({});

  const [documentosLocales, setDocumentosLocales] =
    useState<Record<string, DocumentoLocal>>(
      {}
    );

  const timeoutCarnet =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const timeoutCorreo =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const [checkingCarnet, setCheckingCarnet] =
    useState(false);

  const [checkingCorreo, setCheckingCorreo] =
    useState(false);

  const limpiarInscripcion = () => {
    resetForm();

    setErrors({});

    setIdEstudiante(null);

    setMaxStepReached(1);

    setDocumentosLocales({});
  };

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

  const validarFormulario = () => {
    const nuevosErrores: InscripcionErrors =
      {};

    if (!form.apellidoPaterno.trim()) {
      nuevosErrores.apellidoPaterno =
        "Ingrese el apellido paterno";
    }

    if (!form.apellidoMaterno.trim()) {
      nuevosErrores.apellidoMaterno =
        "Ingrese el apellido materno";
    }

    if (!form.nombres.trim()) {
      nuevosErrores.nombres =
        "Ingrese los nombres";
    }

    if (!form.carnet.trim()) {
      nuevosErrores.carnet =
        "Ingrese el número de carnet";
    } else if (form.carnet.length < 5) {
      nuevosErrores.carnet =
        "Carnet inválido";
    }

    if (!form.email.trim()) {
      nuevosErrores.email =
        "Ingrese el correo electrónico";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      nuevosErrores.email =
        "Correo electrónico inválido";
    }

    if (!form.fechaNacimiento.trim()) {
      nuevosErrores.fechaNacimiento =
        "Seleccione una fecha";
    }

    if (!form.direccion.trim()) {
      nuevosErrores.direccion =
        "Ingrese la dirección";
    }

    if (!form.celular.trim()) {
      nuevosErrores.celular =
        "Ingrese el celular";
    } else if (form.celular.length !== 8) {
      nuevosErrores.celular =
        "El celular debe tener 8 dígitos";
    }

    if (!form.referenciaNombre.trim()) {
      nuevosErrores.referenciaNombre =
        "Ingrese el nombre de referencia";
    }

    if (
      !form.referenciaParentesco.trim()
    ) {
      nuevosErrores.referenciaParentesco =
        "Ingrese el parentesco";
    }

    if (!form.referenciaNumero.trim()) {
      nuevosErrores.referenciaNumero =
        "Ingrese el número de referencia";
    } else if (
      form.referenciaNumero.length !== 8
    ) {
      nuevosErrores.referenciaNumero =
        "El número debe tener 8 dígitos";
    }

    setErrors(nuevosErrores);

    return (
      Object.keys(nuevosErrores).length ===
      0
    );
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

      if (
        errors.carnet ||
        errors.email ||
        checkingCarnet ||
        checkingCorreo
      ) {
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
        apellidoMaterno: form.apellidoMaterno.trim(),
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

      setMaxStepReached((prev) =>
        Math.max(prev, 2)
      );

      setStep(2);

      Toast.show({
        type: "success",
        text1: idEstudiante
          ? "Estudiante actualizado"
          : "Estudiante registrado",
        text2: idEstudiante
          ? "Los datos fueron actualizados correctamente."
          : "Ahora selecciona carrera y grupos.",
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
    if (
      !form.carnet ||
      form.carnet.length < 5
    ) {
      return;
    }

    if (timeoutCarnet.current) {
      clearTimeout(timeoutCarnet.current);
    }

    timeoutCarnet.current = setTimeout(
      async () => {
        try {
          setCheckingCarnet(true);

          const response =
            await httpClient.postAuth<{
              carnetExiste: boolean;
            }>(
              "/api/estudiantes/verificar-datos",
              {
                carnet: form.carnet,
                idUsuario: idEstudiante,
              }
            );

          setErrors((prev) => ({
            ...prev,

            carnet:
              response.carnetExiste
                ? "Este carnet ya está registrado"
                : undefined,
          }));
        } catch (error) {
          console.error(error);
        } finally {
          setCheckingCarnet(false);
        }
      },
      700
    );

    return () => {
      if (timeoutCarnet.current) {
        clearTimeout(timeoutCarnet.current);
      }
    };
  }, [form.carnet, idEstudiante]);

  useEffect(() => {
    if (
      !form.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      return;
    }

    if (timeoutCorreo.current) {
      clearTimeout(timeoutCorreo.current);
    }

    timeoutCorreo.current = setTimeout(
      async () => {
        try {
          setCheckingCorreo(true);

          const response =
            await httpClient.postAuth<{
              correoExiste: boolean;
            }>(
              "/api/estudiantes/verificar-datos",
              {
                email: form.email,
                idUsuario: idEstudiante,
              }
            );

          setErrors((prev) => ({
            ...prev,

            email:
              response.correoExiste
                ? "Este correo ya está registrado"
                : undefined,
          }));
        } catch (error) {
          console.error(error);
        } finally {
          setCheckingCorreo(false);
        }
      },
      700
    );

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
        backgroundColor:
          theme.colors.background,
      }}
      contentContainerStyle={{
        padding: isMobile ? 16 : 34,
        paddingBottom: 50,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flexDirection: isMobile
            ? "column"
            : "row",

          justifyContent:
            "space-between",

          alignItems: isMobile
            ? "flex-start"
            : "center",

          gap: 20,

          marginBottom: 30,
        }}
      >
        <ThemedText
          style={{
            fontSize: isMobile
              ? 28
              : 38,

            fontWeight: "900",

            color: theme.colors.text,
          }}
        >
          {step === 1 &&
            "Datos del Estudiante"}

          {step === 2 &&
            "Inscripción Académica"}

          {step === 3 &&
            "Carga de Documentos"}

          {step === 4 &&
            "Inscripción Finalizada"}
        </ThemedText>

        <StepIndicator
          currentStep={step}
          maxStepReached={
            maxStepReached
          }
          onStepPress={(
            selectedStep
          ) => {
            if (
              selectedStep <=
              maxStepReached
            ) {
              setStep(selectedStep);
            }
          }}
        />
      </View>

      {step === 1 && (
        <View
          style={{
            backgroundColor:
              theme.colors.card,

            borderRadius: 24,

            padding: isMobile
              ? 18
              : 32,

            borderWidth: 1,

            borderColor:
              theme.colors.border,
          }}
        >
          <View style={{ gap: 22 }}>
            <View
              style={{
                flexDirection:
                  isMobile
                    ? "column"
                    : "row",

                gap: 18,
              }}
            >
              <FormInput
                required
                label="APELLIDO PATERNO"
                placeholder="Escriba su primer apellido"
                value={
                  form.apellidoPaterno
                }
                error={
                  errors.apellidoPaterno
                }
                onChangeText={(
                  text
                ) =>
                  updateFieldWithValidation(
                    "apellidoPaterno",
                    text
                  )
                }
              />

              <FormInput
                required
                label="APELLIDO MATERNO"
                placeholder="Escriba su segundo apellido"
                value={
                  form.apellidoMaterno
                }
                error={
                  errors.apellidoMaterno
                }
                onChangeText={(
                  text
                ) =>
                  updateFieldWithValidation(
                    "apellidoMaterno",
                    text
                  )
                }
              />

              <FormInput
                required
                label="NOMBRES"
                placeholder="Sus nombres completos"
                value={form.nombres}
                error={errors.nombres}
                onChangeText={(
                  text
                ) =>
                  updateFieldWithValidation(
                    "nombres",
                    text
                  )
                }
              />
            </View>

            <View
              style={{
                flexDirection:
                  isMobile
                    ? "column"
                    : "row",

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
                  form.carnet
                    .length >= 5
                    ? "Carnet disponible"
                    : undefined
                }
                loading={
                  checkingCarnet
                }
                keyboardType="numeric"
                onlyNumbers
                maxLength={15}
                onChangeText={(
                  text
                ) =>
                  updateFieldWithValidation(
                    "carnet",
                    text
                  )
                }
              />

              <FormSelect
                label="EXPEDIDO EN"
                value={
                  form.expedidoEn
                }
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
                onChange={(
                  value
                ) =>
                  updateField(
                    "expedidoEn",
                    value as DepartamentoBolivia
                  )
                }
              />

              <FormSelect
                label="GÉNERO"
                value={form.genero}
                options={[
                  "Masculino",
                  "Femenino",
                ]}
                onChange={(
                  value
                ) =>
                  updateField(
                    "genero",
                    value as Genero
                  )
                }
              />
            </View>

            <View
              style={{
                flexDirection:
                  isMobile
                    ? "column"
                    : "row",

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
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    form.email
                  )
                    ? "Correo disponible"
                    : undefined
                }
                loading={
                  checkingCorreo
                }
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(
                  text
                ) =>
                  updateFieldWithValidation(
                    "email",
                    text
                  )
                }
              />

              <FormDateInput
                label="FECHA DE NACIMIENTO"
                value={
                  form.fechaNacimiento
                }
                onChangeText={(
                  text
                ) =>
                  updateFieldWithValidation(
                    "fechaNacimiento",
                    text
                  )
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
                updateFieldWithValidation(
                  "direccion",
                  text
                )
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
                updateFieldWithValidation(
                  "celular",
                  text
                )
              }
            />

            <ReferenceSection
              isMobile={isMobile}
              form={form}
              errors={errors}
              updateField={
                updateFieldWithValidation
              }
            />

            <NavigationButtons
              onNext={
                guardarEstudiante
              }
              loading={guardando}
            />
          </View>
        </View>
      )}

      {step === 2 &&
        idEstudiante && (
          <PasoAcademico
            idEstudiante={
              idEstudiante
            }
            gruposSeleccionados={
              form.gruposSeleccionados
            }
            setGruposSeleccionados={
              setGruposSeleccionados
            }
            onFinish={() => {
              setMaxStepReached((prev) =>
                Math.max(prev, 3)
              );

              setStep(3);
            }}
          />
        )}

      {step === 3 &&
        idEstudiante && (
          <PasoDocumentacion
            idUsuario={
              idEstudiante
            }
            documentosLocales={
              documentosLocales
            }
            setDocumentosLocales={
              setDocumentosLocales
            }
            onBack={() =>
              setStep(2)
            }
            onFinish={() => {
              setMaxStepReached((prev) =>
                Math.max(prev, 4)
              );

              setStep(4);
            }}
          />
        )}

      {step === 4 &&
        idEstudiante && (
          <PasoFinalizar
            idUsuario={
              idEstudiante
            }
            onDashboard={
              limpiarInscripcion
            }
            onResetForm={
              limpiarInscripcion
            }
          />
        )}
    </ScrollView>
  );
}