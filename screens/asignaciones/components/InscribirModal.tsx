import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import {
  CarreraEstudiante,
  Estudiante,
  MateriaBloqueadaPrerequisito,
  MateriaPendienteAnterior,
  MateriaSemestreUno,
  TurnoInscripcion,
} from "../types/asignaciones.types";

type Props = {
  visible: boolean;
  estudiante: Estudiante | null;
  carreras: CarreraEstudiante[];
  materias: MateriaSemestreUno[];
  materiasPendientesAnteriores: MateriaPendienteAnterior[];
  materiasBloqueadasPrerequisito: MateriaBloqueadaPrerequisito[];
  loading: boolean;
  loadingMaterias: boolean;
  inscribiendo: boolean;
  onClose: () => void;
  onSelectCarrera: (idCarrera: number) => void | Promise<void>;
  onConfirm: (
    idCarrera: number,
    turno: TurnoInscripcion,
  ) => void | Promise<void>;
};

type PasoModal = "carrera" | "inscripcion";

const TURNOS: TurnoInscripcion[] = ["Mañana", "Tarde", "Noche"];

function normalizarTurno(turno?: string | null): TurnoInscripcion | "" {
  const value = String(turno ?? "").trim().toLowerCase();

  if (value === "mañana" || value === "manana") return "Mañana";
  if (value === "tarde") return "Tarde";
  if (value === "noche") return "Noche";

  return "";
}

function nombreCompleto(estudiante: Estudiante | null) {
  if (!estudiante) return "";

  return `${estudiante.nombres ?? ""} ${estudiante.apellidoPaterno ?? ""} ${
    estudiante.apellidoMaterno ?? ""
  }`
    .replace(/\s+/g, " ")
    .trim();
}

export default function InscribirModal({
  visible,
  estudiante,
  carreras,
  materias,
  materiasPendientesAnteriores,
  materiasBloqueadasPrerequisito,
  loading,
  loadingMaterias,
  inscribiendo,
  onClose,
  onSelectCarrera,
  onConfirm,
}: Props) {
  const { theme } = useTheme();

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const modalBg = isDark ? "#111827" : theme.colors.card;

  const softBg = isDark
    ? "rgba(255,255,255,0.045)"
    : "rgba(15,23,42,0.035)";

  const softBgStrong = isDark
    ? "rgba(255,255,255,0.075)"
    : "rgba(15,23,42,0.055)";

  const border = isDark
    ? "rgba(255,255,255,0.11)"
    : "rgba(15,23,42,0.11)";

  const [paso, setPaso] = useState<PasoModal>("carrera");
  const [carreraSeleccionada, setCarreraSeleccionada] =
    useState<CarreraEstudiante | null>(null);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<
    TurnoInscripcion | ""
  >("");

  useEffect(() => {
    if (!visible) return;

    setPaso("carrera");
    setCarreraSeleccionada(null);
    setTurnoSeleccionado("");
  }, [visible]);

  const cargandoDatos = loading || !estudiante;

  const pendientesAnteriores = Array.isArray(materiasPendientesAnteriores)
    ? materiasPendientesAnteriores
    : [];

  const bloqueadasPrerequisito = Array.isArray(materiasBloqueadasPrerequisito)
    ? materiasBloqueadasPrerequisito
    : [];

  const materiasConGrupoDelTurno = useMemo(() => {
    return materias.map((materia) => {
      const gruposDisponibles = Array.isArray(materia.gruposDisponibles)
        ? materia.gruposDisponibles
        : materia.grupoSeleccionado
          ? [materia.grupoSeleccionado]
          : [];

      const grupoSeleccionado = turnoSeleccionado
        ? gruposDisponibles.find(
            (grupo) => normalizarTurno(grupo.turno) === turnoSeleccionado,
          ) ?? null
        : null;

      return {
        ...materia,
        gruposDisponibles,
        grupoSeleccionado,
      };
    });
  }, [materias, turnoSeleccionado]);

  const materiasYaInscritas = materiasConGrupoDelTurno.filter(
    (materia) => materia.yaInscrito,
  );

  const materiasPendientes = materiasConGrupoDelTurno.filter(
    (materia) => !materia.yaInscrito && materia.grupoSeleccionado !== null,
  );

  const puedeInscribir =
    carreraSeleccionada !== null &&
    turnoSeleccionado !== "" &&
    materiasPendientes.length > 0 &&
    !loadingMaterias &&
    !inscribiendo;

  const seleccionarCarrera = async (carrera: CarreraEstudiante) => {
    if (inscribiendo) return;

    setCarreraSeleccionada(carrera);
    setTurnoSeleccionado("");
    setPaso("inscripcion");

    await onSelectCarrera(carrera.idCarrera);
  };

  const volverACarreras = () => {
    if (loadingMaterias || inscribiendo) return;

    setPaso("carrera");
    setCarreraSeleccionada(null);
    setTurnoSeleccionado("");
  };

  const confirmarInscripcion = async () => {
    if (!carreraSeleccionada || !turnoSeleccionado || !puedeInscribir) return;

    await onConfirm(carreraSeleccionada.idCarrera, turnoSeleccionado);
  };

  const getIconoTurno = (
    turno: TurnoInscripcion,
  ): keyof typeof Ionicons.glyphMap => {
    if (turno === "Mañana") return "sunny-outline";
    if (turno === "Tarde") return "partly-sunny-outline";
    return "moon-outline";
  };

  const getMateriaStatus = (materia: MateriaSemestreUno) => {
    if (materia.yaInscrito) {
      return {
        status: "Inscrita",
        color: "#22C55E",
      };
    }

    if (materia.estadoAcademico === "reprobada") {
      return {
        status: "Reprobada",
        color: "#EF4444",
      };
    }

    if (materia.estadoAcademico === "abandono") {
      return {
        status: "Abandono",
        color: "#F59E0B",
      };
    }

    if (materia.estadoAcademico === "pendiente") {
      return {
        status: "Pendiente",
        color: "#F59E0B",
      };
    }

    return {
      status: "Disponible",
      color: theme.colors.primary,
    };
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={inscribiendo ? undefined : onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: modalBg,
              borderColor: border,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(239,68,68,0.18)"
                      : "#FEE2E2",
                  },
                ]}
              >
                <Ionicons name="cube-outline" size={25} color="#EF4444" />
              </View>

              <View style={styles.headerText}>
                <ThemedText style={[styles.title, { color: strongText }]}>
                  Inscribir materias
                </ThemedText>

                <ThemedText
                  numberOfLines={1}
                  style={[styles.studentName, { color: mutedText }]}
                >
                  {cargandoDatos
                    ? "Preparando datos..."
                    : nombreCompleto(estudiante)}
                </ThemedText>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              disabled={inscribiendo}
              style={({ pressed }) => [
                styles.closeBtn,
                {
                  backgroundColor: softBgStrong,
                  opacity: pressed || inscribiendo ? 0.75 : 1,
                },
              ]}
            >
              <Ionicons name="close" size={25} color={strongText} />
            </Pressable>
          </View>

          {cargandoDatos ? (
            <View style={styles.loadingBox}>
              <View
                style={[
                  styles.loadingCircle,
                  { backgroundColor: softBgStrong },
                ]}
              >
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>

              <ThemedText style={[styles.loadingTitle, { color: strongText }]}>
                Cargando datos
              </ThemedText>

              <ThemedText
                style={[styles.loadingSubtitle, { color: mutedText }]}
              >
                Espere un momento...
              </ThemedText>
            </View>
          ) : paso === "carrera" ? (
            <View style={styles.body}>
              <View
                style={[
                  styles.stepInfo,
                  {
                    backgroundColor: softBg,
                    borderColor: border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.stepIcon,
                    {
                      backgroundColor: isDark
                        ? "rgba(59,130,246,0.18)"
                        : "#DBEAFE",
                    },
                  ]}
                >
                  <Ionicons
                    name="school-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>

                <View style={styles.stepInfoText}>
                  <ThemedText
                    style={[styles.stepInfoTitle, { color: strongText }]}
                  >
                    Seleccione una carrera
                  </ThemedText>

                  <ThemedText
                    style={[styles.stepInfoSubtitle, { color: mutedText }]}
                  >
                    Primero elija la carrera para cargar las materias
                    disponibles del estudiante.
                  </ThemedText>
                </View>
              </View>

              <ScrollView
                style={styles.carrerasList}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator
              >
                {carreras.length === 0 ? (
                  <View
                    style={[
                      styles.emptyState,
                      {
                        backgroundColor: softBg,
                        borderColor: border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="school-outline"
                      size={42}
                      color={theme.colors.primary}
                    />

                    <ThemedText
                      style={[styles.emptyTitle, { color: strongText }]}
                    >
                      No tiene carreras asignadas
                    </ThemedText>

                    <ThemedText
                      style={[styles.emptyText, { color: mutedText }]}
                    >
                      El estudiante no cuenta con una carrera registrada.
                    </ThemedText>
                  </View>
                ) : (
                  carreras.map((carrera) => (
                    <Pressable
                      key={carrera.idCarrera}
                      disabled={inscribiendo}
                      onPress={() => seleccionarCarrera(carrera)}
                      style={({ pressed }) => [
                        styles.carreraCard,
                        {
                          backgroundColor: softBg,
                          borderColor: border,
                          opacity: pressed || inscribiendo ? 0.75 : 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.carreraIcon,
                          {
                            backgroundColor: isDark
                              ? "rgba(59,130,246,0.18)"
                              : "#DBEAFE",
                          },
                        ]}
                      >
                        <Ionicons
                          name="book-outline"
                          size={22}
                          color={theme.colors.primary}
                        />
                      </View>

                      <View style={styles.carreraContent}>
                        <ThemedText
                          numberOfLines={2}
                          style={[styles.carreraTitle, { color: strongText }]}
                        >
                          {carrera.nombreCarrera}
                        </ThemedText>

                        <ThemedText
                          numberOfLines={1}
                          style={[
                            styles.carreraSubtitle,
                            { color: mutedText },
                          ]}
                        >
                          Código: {carrera.codigo ?? "Sin código"} · Régimen:{" "}
                          {carrera.regimen ?? "Sin régimen"}
                        </ThemedText>
                      </View>

                      <View style={styles.carreraAction}>
                        <ThemedText
                          style={[
                            styles.carreraActionText,
                            { color: theme.colors.primary },
                          ]}
                        >
                          Elegir
                        </ThemedText>

                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={theme.colors.primary}
                        />
                      </View>
                    </Pressable>
                  ))
                )}
              </ScrollView>

              <View style={[styles.footer, { borderTopColor: border }]}>
                <Pressable
                  onPress={onClose}
                  disabled={inscribiendo}
                  style={({ pressed }) => [
                    styles.cancelBtn,
                    {
                      borderColor: border,
                      backgroundColor: softBg,
                      opacity: pressed || inscribiendo ? 0.75 : 1,
                    },
                  ]}
                >
                  <ThemedText
                    style={[styles.cancelText, { color: strongText }]}
                  >
                    Cancelar
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.body}>
              <View
                style={[
                  styles.carreraSeleccionadaBox,
                  {
                    backgroundColor: softBg,
                    borderColor: border,
                  },
                ]}
              >
                <View style={styles.carreraSeleccionadaLeft}>
                  <View
                    style={[
                      styles.carreraSeleccionadaIcon,
                      {
                        backgroundColor: isDark
                          ? "rgba(239,68,68,0.18)"
                          : "#FEE2E2",
                      },
                    ]}
                  >
                    <Ionicons name="cube-outline" size={20} color="#EF4444" />
                  </View>

                  <View style={styles.carreraSeleccionadaText}>
                    <ThemedText
                      numberOfLines={1}
                      style={[
                        styles.carreraSeleccionadaLabel,
                        { color: mutedText },
                      ]}
                    >
                      Carrera seleccionada
                    </ThemedText>

                    <ThemedText
                      numberOfLines={1}
                      style={[
                        styles.carreraSeleccionadaNombre,
                        { color: strongText },
                      ]}
                    >
                      {carreraSeleccionada?.nombreCarrera}
                    </ThemedText>
                  </View>
                </View>

                <Pressable
                  onPress={volverACarreras}
                  disabled={loadingMaterias || inscribiendo}
                  style={({ pressed }) => [
                    styles.cambiarCarreraBtn,
                    {
                      borderColor: border,
                      backgroundColor: softBgStrong,
                      opacity:
                        pressed || loadingMaterias || inscribiendo ? 0.75 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name="swap-horizontal-outline"
                    size={18}
                    color={strongText}
                  />

                  <ThemedText
                    style={[styles.cambiarCarreraText, { color: strongText }]}
                  >
                    Cambiar
                  </ThemedText>
                </Pressable>
              </View>

              {loadingMaterias ? (
                <View style={styles.loadingBox}>
                  <View
                    style={[
                      styles.loadingCircle,
                      { backgroundColor: softBgStrong },
                    ]}
                  >
                    <ActivityIndicator
                      size="large"
                      color={theme.colors.primary}
                    />
                  </View>

                  <ThemedText
                    style={[styles.loadingTitle, { color: strongText }]}
                  >
                    Cargando materias
                  </ThemedText>

                  <ThemedText
                    style={[styles.loadingSubtitle, { color: mutedText }]}
                  >
                    Buscando grupos disponibles para esta carrera...
                  </ThemedText>
                </View>
              ) : (
                <>
                  <ScrollView
                    style={styles.contentScroll}
                    contentContainerStyle={styles.contentScrollContent}
                    showsVerticalScrollIndicator
                    nestedScrollEnabled
                  >
                    {pendientesAnteriores.length > 0 && (
                      <WarningBox
                        title="Tiene materias pendientes anteriores"
                        text="Puede avanzar e inscribirse al nivel seleccionado, pero todavía debe aprobar estas materias anteriores."
                        strongText={strongText}
                        mutedText={mutedText}
                        isDark={isDark}
                      >
                        {pendientesAnteriores.map((materia) => (
                          <MateriaPendienteAnteriorCard
                            key={`pendiente-anterior-${materia.idMateria}`}
                            materia={materia}
                            strongText={strongText}
                            mutedText={mutedText}
                            backgroundColor={softBgStrong}
                            borderColor={border}
                          />
                        ))}
                      </WarningBox>
                    )}

                    {bloqueadasPrerequisito.length > 0 && (
                      <WarningBox
                        title="Materias bloqueadas por prerequisito"
                        text="Estas materias no se inscribirán hasta que el estudiante apruebe su prerequisito."
                        strongText={strongText}
                        mutedText={mutedText}
                        isDark={isDark}
                      >
                        {bloqueadasPrerequisito.map((materia) => (
                          <MateriaBloqueadaCard
                            key={`bloqueada-${materia.idMateria}`}
                            materia={materia}
                            strongText={strongText}
                            mutedText={mutedText}
                            backgroundColor={softBgStrong}
                            borderColor={border}
                          />
                        ))}
                      </WarningBox>
                    )}

                    <View
                      style={[
                        styles.turnoCompactContainer,
                        {
                          backgroundColor: softBg,
                          borderColor: border,
                        },
                      ]}
                    >
                      <View style={styles.turnoCompactHeader}>
                        <View
                          style={[
                            styles.turnoIcon,
                            {
                              backgroundColor: isDark
                                ? "rgba(239,68,68,0.18)"
                                : "#FEE2E2",
                            },
                          ]}
                        >
                          <Ionicons
                            name="time-outline"
                            size={19}
                            color="#EF4444"
                          />
                        </View>

                        <View style={styles.turnoHeaderText}>
                          <ThemedText
                            style={[styles.turnoTitle, { color: strongText }]}
                          >
                            Turno de inscripción
                          </ThemedText>

                          <ThemedText
                            style={[
                              styles.turnoSubtitle,
                              { color: mutedText },
                            ]}
                          >
                            Seleccione el turno en el que cursará el estudiante.
                          </ThemedText>
                        </View>
                      </View>

                      <View style={styles.turnosRow}>
                        {TURNOS.map((turno) => {
                          const seleccionado = turnoSeleccionado === turno;

                          return (
                            <Pressable
                              key={turno}
                              disabled={inscribiendo}
                              onPress={() => setTurnoSeleccionado(turno)}
                              style={({ pressed }) => [
                                styles.turnoButtonCompact,
                                {
                                  backgroundColor: seleccionado
                                    ? "#EF4444"
                                    : softBgStrong,
                                  borderColor: seleccionado ? "#EF4444" : border,
                                  opacity: pressed || inscribiendo ? 0.76 : 1,
                                },
                              ]}
                            >
                              <Ionicons
                                name={getIconoTurno(turno)}
                                size={18}
                                color={seleccionado ? "#FFFFFF" : mutedText}
                              />

                              <ThemedText
                                style={[
                                  styles.turnoButtonText,
                                  {
                                    color: seleccionado
                                      ? "#FFFFFF"
                                      : strongText,
                                  },
                                ]}
                              >
                                {turno}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.materiasTopRow}>
                      <View style={styles.materiasTopText}>
                        <ThemedText
                          style={[styles.sectionTitle, { color: strongText }]}
                        >
                          Materias que se van a inscribir
                        </ThemedText>

                        <ThemedText
                          style={[
                            styles.materiasInfoText,
                            { color: mutedText },
                          ]}
                        >
                          {turnoSeleccionado
                            ? `Grupos activos disponibles para el turno ${turnoSeleccionado}.`
                            : "Seleccione un turno para ver las materias disponibles."}
                        </ThemedText>
                      </View>

                      <View style={styles.resumenChips}>
                        <View
                          style={[
                            styles.resumenChip,
                            {
                              backgroundColor: isDark
                                ? "rgba(239,68,68,0.18)"
                                : "#FEE2E2",
                            },
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.resumenChipNumber,
                              { color: "#EF4444" },
                            ]}
                          >
                            {turnoSeleccionado ? materiasPendientes.length : 0}
                          </ThemedText>

                          <ThemedText
                            style={[
                              styles.resumenChipLabel,
                              { color: "#EF4444" },
                            ]}
                          >
                            Pendientes
                          </ThemedText>
                        </View>

                        <View
                          style={[
                            styles.resumenChip,
                            {
                              backgroundColor: isDark
                                ? "rgba(34,197,94,0.16)"
                                : "#DCFCE7",
                            },
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.resumenChipNumber,
                              { color: "#22C55E" },
                            ]}
                          >
                            {materiasYaInscritas.length}
                          </ThemedText>

                          <ThemedText
                            style={[
                              styles.resumenChipLabel,
                              { color: "#22C55E" },
                            ]}
                          >
                            Inscritas
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    <View style={styles.materiasContainer}>
                      {!turnoSeleccionado ? (
                        <View
                          style={[
                            styles.emptyState,
                            {
                              backgroundColor: softBg,
                              borderColor: border,
                            },
                          ]}
                        >
                          <Ionicons
                            name="time-outline"
                            size={38}
                            color="#EF4444"
                          />

                          <ThemedText
                            style={[styles.emptyTitle, { color: strongText }]}
                          >
                            Seleccione un turno
                          </ThemedText>

                          <ThemedText
                            style={[styles.emptyText, { color: mutedText }]}
                          >
                            Debe seleccionar Mañana, Tarde o Noche antes de
                            continuar.
                          </ThemedText>
                        </View>
                      ) : materiasPendientes.length === 0 ? (
                        <View
                          style={[
                            styles.emptyState,
                            {
                              backgroundColor: softBg,
                              borderColor: border,
                            },
                          ]}
                        >
                          <Ionicons
                            name="alert-circle-outline"
                            size={38}
                            color="#F59E0B"
                          />

                          <ThemedText
                            style={[styles.emptyTitle, { color: strongText }]}
                          >
                            No hay materias disponibles
                          </ThemedText>

                          <ThemedText
                            style={[styles.emptyText, { color: mutedText }]}
                          >
                            No existen grupos activos con cupos para el turno
                            seleccionado o las materias ya están inscritas.
                          </ThemedText>
                        </View>
                      ) : (
                        materiasPendientes.map((materia) => {
                          const estado = getMateriaStatus(materia);

                          return (
                            <MateriaCard
                              key={`${materia.idCarrera}-${materia.idMateria}`}
                              materia={materia}
                              status={estado.status}
                              statusColor={estado.color}
                              backgroundColor={softBg}
                              borderColor={border}
                              strongText={strongText}
                              mutedText={mutedText}
                            />
                          );
                        })
                      )}

                      {materiasYaInscritas.length > 0 && (
                        <>
                          <View style={styles.inscritasMiniHeader}>
                            <ThemedText
                              style={[
                                styles.inscritasMiniTitle,
                                { color: strongText },
                              ]}
                            >
                              Materias ya inscritas
                            </ThemedText>
                          </View>

                          {materiasYaInscritas.map((materia) => (
                            <MateriaCard
                              key={`inscrita-${materia.idCarrera}-${materia.idMateria}`}
                              materia={materia}
                              status="Inscrita"
                              statusColor="#22C55E"
                              backgroundColor={softBg}
                              borderColor={border}
                              strongText={strongText}
                              mutedText={mutedText}
                            />
                          ))}
                        </>
                      )}
                    </View>
                  </ScrollView>

                  <View style={[styles.footer, { borderTopColor: border }]}>
                    <Pressable
                      onPress={volverACarreras}
                      disabled={loadingMaterias || inscribiendo}
                      style={({ pressed }) => [
                        styles.cancelBtn,
                        {
                          borderColor: border,
                          backgroundColor: softBg,
                          opacity:
                            pressed || loadingMaterias || inscribiendo
                              ? 0.75
                              : 1,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[styles.cancelText, { color: strongText }]}
                      >
                        Volver
                      </ThemedText>
                    </Pressable>

                    <Pressable
                      onPress={confirmarInscripcion}
                      disabled={!puedeInscribir}
                      style={({ pressed }) => [
                        styles.confirmBtn,
                        {
                          backgroundColor: puedeInscribir
                            ? "#EF4444"
                            : isDark
                              ? "rgba(255,255,255,0.12)"
                              : "#CBD5E1",
                          opacity: pressed ? 0.82 : 1,
                        },
                      ]}
                    >
                      {inscribiendo ? (
                        <>
                          <ActivityIndicator color="#FFFFFF" />

                          <ThemedText style={styles.confirmText}>
                            Inscribiendo...
                          </ThemedText>
                        </>
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark-circle"
                            size={19}
                            color="#FFFFFF"
                          />

                          <ThemedText style={styles.confirmText}>
                            Aceptar e inscribir
                          </ThemedText>
                        </>
                      )}
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function WarningBox({
  title,
  text,
  strongText,
  mutedText,
  isDark,
  children,
}: {
  title: string;
  text: string;
  strongText: string;
  mutedText: string;
  isDark: boolean;
  children: ReactNode;
}) {
  return (
    <View
      style={[
        styles.warningBox,
        {
          backgroundColor: isDark ? "rgba(245,158,11,0.12)" : "#FFFBEB",
          borderColor: isDark ? "rgba(245,158,11,0.34)" : "#FDE68A",
        },
      ]}
    >
      <View style={styles.warningIcon}>
        <Ionicons name="warning-outline" size={22} color="#F59E0B" />
      </View>

      <View style={styles.warningContent}>
        <ThemedText style={[styles.warningTitle, { color: strongText }]}>
          {title}
        </ThemedText>

        <ThemedText style={[styles.warningText, { color: mutedText }]}>
          {text}
        </ThemedText>

        <View style={styles.previousList}>{children}</View>
      </View>
    </View>
  );
}

function MateriaPendienteAnteriorCard({
  materia,
  strongText,
  mutedText,
  backgroundColor,
  borderColor,
}: {
  materia: MateriaPendienteAnterior;
  strongText: string;
  mutedText: string;
  backgroundColor: string;
  borderColor: string;
}) {
  const nota =
    materia.notaFinalHistorial !== null &&
    materia.notaFinalHistorial !== undefined
      ? `Nota: ${materia.notaFinalHistorial}`
      : "Sin nota final";

  const estado = materia.estadoNotaHistorial ?? "Pendiente";

  return (
    <View
      style={[
        styles.previousCard,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <View style={styles.previousIcon}>
        <Ionicons name="alert-circle-outline" size={17} color="#F59E0B" />
      </View>

      <View style={styles.previousContent}>
        <ThemedText
          numberOfLines={1}
          style={[styles.previousTitle, { color: strongText }]}
        >
          {materia.nombreMateria}
        </ThemedText>

        <ThemedText
          numberOfLines={1}
          style={[styles.previousText, { color: mutedText }]}
        >
          {materia.codigoMateria} · Nivel {materia.semestre} · {estado} · {nota}
        </ThemedText>
      </View>
    </View>
  );
}

function MateriaBloqueadaCard({
  materia,
  strongText,
  mutedText,
  backgroundColor,
  borderColor,
}: {
  materia: MateriaBloqueadaPrerequisito;
  strongText: string;
  mutedText: string;
  backgroundColor: string;
  borderColor: string;
}) {
  return (
    <View
      style={[
        styles.previousCard,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <View style={styles.previousIconDanger}>
        <Ionicons name="lock-closed-outline" size={17} color="#EF4444" />
      </View>

      <View style={styles.previousContent}>
        <ThemedText
          numberOfLines={1}
          style={[styles.previousTitle, { color: strongText }]}
        >
          {materia.nombreMateria}
        </ThemedText>

        <ThemedText
          numberOfLines={2}
          style={[styles.previousText, { color: mutedText }]}
        >
          Requiere aprobar: {materia.nombrePrerequisito ?? "Prerequisito"}{" "}
          {materia.codigoPrerequisito
            ? `(${materia.codigoPrerequisito})`
            : ""}
        </ThemedText>
      </View>
    </View>
  );
}

function MateriaCard({
  materia,
  status,
  statusColor,
  backgroundColor,
  borderColor,
  strongText,
  mutedText,
}: {
  materia: MateriaSemestreUno;
  status: string;
  statusColor: string;
  backgroundColor: string;
  borderColor: string;
  strongText: string;
  mutedText: string;
}) {
  const grupo = materia.grupoSeleccionado;

  return (
    <View
      style={[
        styles.materiaCard,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <View
        style={[
          styles.materiaIcon,
          {
            backgroundColor: `${statusColor}22`,
          },
        ]}
      >
        <Ionicons
          name={
            status === "Inscrita" ? "checkmark-done-outline" : "book-outline"
          }
          size={21}
          color={statusColor}
        />
      </View>

      <View style={styles.materiaContent}>
        <ThemedText
          numberOfLines={2}
          style={[styles.materiaTitle, { color: strongText }]}
        >
          {materia.nombreMateria}
        </ThemedText>

        <ThemedText
          numberOfLines={2}
          style={[styles.materiaSubtitle, { color: mutedText }]}
        >
          {materia.codigoMateria} · {materia.nombreCarrera}
        </ThemedText>

        {materia.notaFinalHistorial !== null &&
          materia.notaFinalHistorial !== undefined && (
            <ThemedText
              numberOfLines={1}
              style={[styles.historialText, { color: mutedText }]}
            >
              Última nota: {materia.notaFinalHistorial} ·{" "}
              {materia.estadoNotaHistorial}
            </ThemedText>
          )}

        {grupo && (
          <View style={styles.groupInfo}>
            <View style={styles.groupChip}>
              <Ionicons name="people-outline" size={13} color={mutedText} />

              <ThemedText
                numberOfLines={1}
                style={[styles.groupText, { color: mutedText }]}
              >
                {grupo.nombreGrupo}
              </ThemedText>
            </View>

            <View style={styles.groupChip}>
              <Ionicons name="albums-outline" size={13} color={mutedText} />

              <ThemedText style={[styles.groupText, { color: mutedText }]}>
                Paralelo {grupo.paralelo}
              </ThemedText>
            </View>

            <View style={styles.groupChip}>
              <Ionicons name="time-outline" size={13} color={mutedText} />

              <ThemedText style={[styles.groupText, { color: mutedText }]}>
                {grupo.turno}
              </ThemedText>
            </View>

            <View style={styles.groupChip}>
              <Ionicons
                name="people-circle-outline"
                size={13}
                color={mutedText}
              />

              <ThemedText style={[styles.groupText, { color: mutedText }]}>
                Cupos: {grupo.cupos}
              </ThemedText>
            </View>
          </View>
        )}
      </View>

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: `${statusColor}22`,
          },
        ]}
      >
        <ThemedText style={[styles.statusText, { color: statusColor }]}>
          {status}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.78)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  modal: {
    width: "100%",
    maxWidth: 1420,
    height: "92%",
    maxHeight: 920,
    borderRadius: 28,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.34,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 16,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    minWidth: 0,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  studentName: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingBox: {
    flex: 1,
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  loadingCircle: {
    width: 70,
    height: 70,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  loadingTitle: {
    fontSize: 17,
    fontWeight: "900",
  },
  loadingSubtitle: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  stepInfo: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 11,
    alignItems: "center",
    marginBottom: 14,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  stepInfoText: {
    flex: 1,
    minWidth: 0,
  },
  stepInfoTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  stepInfoSubtitle: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: "700",
    lineHeight: 18,
  },
  carrerasList: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingBottom: 14,
  },
  carreraCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  carreraIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  carreraContent: {
    flex: 1,
    minWidth: 0,
  },
  carreraTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  carreraSubtitle: {
    marginTop: 4,
    fontSize: 12.5,
    fontWeight: "700",
  },
  carreraAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  carreraActionText: {
    fontSize: 13,
    fontWeight: "900",
  },
  carreraSeleccionadaBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  carreraSeleccionadaLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  carreraSeleccionadaIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  carreraSeleccionadaText: {
    flex: 1,
    minWidth: 0,
  },
  carreraSeleccionadaLabel: {
    fontSize: 11.5,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  carreraSeleccionadaNombre: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "900",
  },
  cambiarCarreraBtn: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  cambiarCarreraText: {
    fontSize: 12,
    fontWeight: "900",
  },
  contentScroll: {
    flex: 1,
    minHeight: 0,
  },
  contentScrollContent: {
    paddingBottom: 18,
  },
  warningBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    flexDirection: "row",
    gap: 11,
    marginBottom: 12,
  },
  warningIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "rgba(245,158,11,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  warningContent: {
    flex: 1,
    minWidth: 0,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  warningText: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: "800",
    lineHeight: 18,
  },
  previousList: {
    marginTop: 10,
    gap: 8,
  },
  previousCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  previousIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "rgba(245,158,11,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  previousIconDanger: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  previousContent: {
    flex: 1,
    minWidth: 0,
  },
  previousTitle: {
    fontSize: 13,
    fontWeight: "900",
  },
  previousText: {
    marginTop: 2,
    fontSize: 11.7,
    fontWeight: "800",
  },
  turnoCompactContainer: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    marginBottom: 12,
  },
  turnoCompactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  turnoHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  turnoIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  turnoTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  turnoSubtitle: {
    marginTop: 2,
    fontSize: 12.5,
    fontWeight: "800",
    lineHeight: 17,
  },
  turnosRow: {
    flexDirection: "row",
    gap: 9,
    flexWrap: "wrap",
  },
  turnoButtonCompact: {
    flex: 1,
    minWidth: 125,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  turnoButtonText: {
    fontSize: 13,
    fontWeight: "900",
  },
  materiasTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  materiasTopText: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  materiasInfoText: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: "800",
  },
  resumenChips: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  resumenChip: {
    minWidth: 84,
    minHeight: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  resumenChipNumber: {
    fontSize: 17,
    fontWeight: "900",
  },
  resumenChipLabel: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  materiasContainer: {
    paddingBottom: 4,
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    marginBottom: 10,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 19,
  },
  inscritasMiniHeader: {
    marginTop: 12,
    marginBottom: 8,
  },
  inscritasMiniTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  materiaCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  materiaIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  materiaContent: {
    flex: 1,
    minWidth: 0,
  },
  materiaTitle: {
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 21,
  },
  materiaSubtitle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  historialText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
  },
  groupInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 9,
  },
  groupChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: 240,
  },
  groupText: {
    fontSize: 12,
    fontWeight: "800",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "900",
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },
  cancelBtn: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "900",
  },
  confirmBtn: {
    minHeight: 46,
    borderRadius: 15,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});