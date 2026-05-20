import { useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";

import { ThemeSelector } from "../../components/ThemeSelector";
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

  const [idEstudiante, setIdEstudiante] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [maxStepReached, setMaxStepReached] = useState(1);

  const [documentosLocales, setDocumentosLocales] = useState<
    Record<string, DocumentoLocal>
  >({});

  const limpiarInscripcion = () => {
    resetForm();
    setIdEstudiante(null);
    setMaxStepReached(1);
    setDocumentosLocales({});
  };

  const guardarEstudiante = async () => {
    try {
      setGuardando(true);

      const [day, month, year] = form.fechaNacimiento.split("/");

      if (!day || !month || !year) {
        Toast.show({
          type: "error",
          text1: "Fecha inválida",
          text2: "Usa el formato día/mes/año.",
        });
        return;
      }

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
        ...form,

        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: form.apellidoMaterno.trim(),
        nombres: form.nombres.trim(),

        carnet: form.carnet.replace(/\D/g, ""),

        celular: form.celular.replace(/\D/g, "").replace(/^591/, ""),

        direccion: form.direccion.trim(),

        referenciaNombre: form.referenciaNombre.trim(),
        referenciaParentesco: form.referenciaParentesco.trim(),
        referenciaNumero: form.referenciaNumero.replace(/\D/g, ""),

        fechaNacimiento: `${year}-${month}-${day}`,

        expedidoEn: expedidoMap[form.expedidoEn],
        genero: generoMap[form.genero],

        gruposSeleccionados: undefined,
      };

      const response = await httpClient.postAuth<{
        estudiante: {
          id?: number;
          idUsuario?: number;
        };
      }>("/api/estudiantes", payload);

      const estudianteId =
        response.estudiante.id ?? response.estudiante.idUsuario;

      if (!estudianteId) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "El backend no devolvió el ID.",
        });
        return;
      }

      setIdEstudiante(estudianteId);
      setMaxStepReached(2);
      setStep(2);

      Toast.show({
        type: "success",
        text1: "Estudiante registrado",
        text2: "Ahora selecciona carrera y grupos.",
      });
    } catch (error) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo registrar al estudiante.",
      });
    } finally {
      setGuardando(false);
    }
  };

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
      <View style={{ marginBottom: 28 }}>
        <ThemeSelector />
      </View>

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
          {step === 2 && "Inscripción Académica"}
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
          <View style={{ gap: 22 }}>
            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                gap: 18,
              }}
            >
              <FormInput
                label="APELLIDO PATERNO"
                placeholder="Escriba su primer apellido"
                value={form.apellidoPaterno}
                onChangeText={(text) =>
                  updateField("apellidoPaterno", text)
                }
              />

              <FormInput
                label="APELLIDO MATERNO"
                placeholder="Escriba su segundo apellido"
                value={form.apellidoMaterno}
                onChangeText={(text) =>
                  updateField("apellidoMaterno", text)
                }
              />

              <FormInput
                label="NOMBRES"
                placeholder="Sus nombres completos"
                value={form.nombres}
                onChangeText={(text) => updateField("nombres", text)}
              />
            </View>

            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                gap: 18,
              }}
            >
              <FormInput
                label="NÚMERO DE CARNET"
                placeholder="0000000"
                value={form.carnet}
                keyboardType="numeric"
                onChangeText={(text) => updateField("carnet", text)}
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
              <FormDateInput
                label="FECHA DE NACIMIENTO"
                value={form.fechaNacimiento}
                onChangeText={(text) =>
                  updateField("fechaNacimiento", text)
                }
              />

              <View style={{ flex: isMobile ? undefined : 2 }}>
                <FormInput
                  label="DIRECCIÓN SEGÚN CARNET"
                  placeholder="Calle, número, zona..."
                  value={form.direccion}
                  onChangeText={(text) => updateField("direccion", text)}
                />
              </View>
            </View>

            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                gap: 18,
              }}
            >
              <FormInput
                label="CELULAR PRINCIPAL"
                placeholder="63066882"
                value={form.celular}
                keyboardType="phone-pad"
                onChangeText={(text) => updateField("celular", text)}
              />
            </View>

            <ReferenceSection
              isMobile={isMobile}
              form={form}
              updateField={updateField}
            />

            <NavigationButtons onNext={guardarEstudiante} loading={guardando} />
          </View>
        </View>
      )}

      {step === 2 && idEstudiante && (
        <PasoAcademico
          idEstudiante={idEstudiante}
          gruposSeleccionados={form.gruposSeleccionados}
          setGruposSeleccionados={setGruposSeleccionados}
          onFinish={() => {
            setMaxStepReached(3);
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
            setMaxStepReached(4);
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
    </ScrollView>
  );
}