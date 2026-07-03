import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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
  MateriaSemestreUno,
  TurnoInscripcion,
} from "../types/asignaciones.types";

type Props = {
  visible: boolean;
  estudiante: Estudiante | null;
  carreras: CarreraEstudiante[];
  materias: MateriaSemestreUno[];
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

export default function InscribirModal({
  visible,
  estudiante,
  carreras,
  materias,
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
    if (!visible) {
      return;
    }

    setPaso("carrera");
    setCarreraSeleccionada(null);
    setTurnoSeleccionado("");
  }, [visible]);

  const cargandoDatos = loading || !estudiante;

  const nombre = estudiante
    ? `${estudiante.nombres} ${estudiante.apellidoPaterno} ${
        estudiante.apellidoMaterno ?? ""
      }`.trim()
    : "";

  const materiasYaInscritas = materias.filter(
    (materia) => materia.yaInscrito,
  );

  const materiasPendientesBase = materias.filter(
    (materia) => !materia.yaInscrito,
  );

  const todasMateriasInscritas =
    materias.length > 0 &&
    materiasYaInscritas.length > 0 &&
    materiasPendientesBase.length === 0;

  const materiasConGrupoDelTurno = materias.map((materia) => {
    const gruposDisponibles = Array.isArray(materia.gruposDisponibles)
      ? materia.gruposDisponibles
      : materia.grupoSeleccionado
        ? [materia.grupoSeleccionado]
        : [];

    const grupoSeleccionado = turnoSeleccionado
      ? gruposDisponibles.find(
          (grupo) => grupo.turno === turnoSeleccionado,
        ) ?? null
      : null;

    return {
      ...materia,
      gruposDisponibles,
      grupoSeleccionado,
    };
  });

  const materiasPendientes = materiasConGrupoDelTurno.filter(
    (materia) => !materia.yaInscrito && materia.grupoSeleccionado !== null,
  );

  const puedeInscribir =
    carreraSeleccionada !== null &&
    turnoSeleccionado !== "" &&
    materiasPendientes.length > 0 &&
    !loadingMaterias &&
    !inscribiendo &&
    !todasMateriasInscritas;

  const seleccionarCarrera = async (carrera: CarreraEstudiante) => {
    if (inscribiendo) {
      return;
    }

    setCarreraSeleccionada(carrera);
    setTurnoSeleccionado("");
    setPaso("inscripcion");

    await onSelectCarrera(carrera.idCarrera);
  };

  const volverACarreras = () => {
    if (loadingMaterias || inscribiendo) {
      return;
    }

    setPaso("carrera");
    setCarreraSeleccionada(null);
    setTurnoSeleccionado("");
  };

  const confirmarInscripcion = async () => {
    if (
      !carreraSeleccionada ||
      !turnoSeleccionado ||
      !puedeInscribir
    ) {
      return;
    }

    await onConfirm(carreraSeleccionada.idCarrera, turnoSeleccionado);
  };

  const getIconoTurno = (
    turno: TurnoInscripcion,
  ): keyof typeof Ionicons.glyphMap => {
    if (turno === "Mañana") {
      return "sunny-outline";
    }

    if (turno === "Tarde") {
      return "partly-sunny-outline";
    }

    return "moon-outline";
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
                      ? "rgba(59,130,246,0.18)"
                      : "#DBEAFE",
                  },
                ]}
              >
                <Ionicons
                  name="school-outline"
                  size={25}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.headerText}>
                <ThemedText style={[styles.title, { color: strongText }]}>
                  Inscribir semestre 1
                </ThemedText>

                <ThemedText
                  numberOfLines={1}
                  style={[styles.studentName, { color: mutedText }]}
                >
                  {cargandoDatos ? "Preparando datos..." : nombre}
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
              <Ionicons name="close" size={24} color={strongText} />
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
                    Primero elija la carrera en la que se realizará la
                    inscripción del estudiante.
                  </ThemedText>
                </View>
              </View>

              <ScrollView
                style={styles.carrerasList}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
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
                          Código: {carrera.codigo} · Régimen:{" "}
                          {carrera.regimen}
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
                          ? "rgba(59,130,246,0.18)"
                          : "#DBEAFE",
                      },
                    ]}
                  >
                    <Ionicons
                      name="school-outline"
                      size={20}
                      color={theme.colors.primary}
                    />
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
                        pressed || loadingMaterias || inscribiendo
                          ? 0.75
                          : 1,
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
              ) : todasMateriasInscritas ? (
                <>
                  <View
                    style={[
                      styles.inscripcionCompletaBox,
                      {
                        backgroundColor: isDark
                          ? "rgba(34,197,94,0.10)"
                          : "#F0FDF4",
                        borderColor: isDark
                          ? "rgba(34,197,94,0.28)"
                          : "#BBF7D0",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.inscripcionCompletaIcon,
                        {
                          backgroundColor: isDark
                            ? "rgba(34,197,94,0.18)"
                            : "#DCFCE7",
                        },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-done-outline"
                        size={25}
                        color="#22C55E"
                      />
                    </View>

                    <View style={styles.inscripcionCompletaText}>
                      <ThemedText
                        style={[
                          styles.inscripcionCompletaTitle,
                          { color: strongText },
                        ]}
                      >
                        Inscripción completa
                      </ThemedText>

                      <ThemedText
                        style={[
                          styles.inscripcionCompletaSubtitle,
                          { color: mutedText },
                        ]}
                      >
                        Todas las materias de esta carrera ya fueron inscritas.
                      </ThemedText>
                    </View>

                    <View
                      style={[
                        styles.inscritasCountBadge,
                        {
                          backgroundColor: isDark
                            ? "rgba(34,197,94,0.18)"
                            : "#DCFCE7",
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.inscritasCountText,
                          { color: "#22C55E" },
                        ]}
                      >
                        {materiasYaInscritas.length}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.materiasTopRow}>
                    <View style={styles.materiasTopText}>
                      <ThemedText
                        style={[styles.sectionTitle, { color: strongText }]}
                      >
                        Materias ya inscritas
                      </ThemedText>

                      <ThemedText
                        style={[styles.materiasInfoText, { color: mutedText }]}
                      >
                        Esta carrera ya tiene todas sus materias registradas.
                      </ThemedText>
                    </View>

                    <View
                      style={[
                        styles.countBadge,
                        {
                          backgroundColor: isDark
                            ? "rgba(34,197,94,0.16)"
                            : "#DCFCE7",
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.countBadgeText,
                          { color: "#22C55E" },
                        ]}
                      >
                        {materiasYaInscritas.length}
                      </ThemedText>
                    </View>
                  </View>

                  <ScrollView
                    style={styles.materiasList}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator
                  >
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
                  </ScrollView>
                </>
              ) : (
                <>
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
                      <View style={styles.turnoIcon}>
                        <Ionicons
                          name="time-outline"
                          size={19}
                          color={theme.colors.primary}
                        />
                      </View>

                      <View style={styles.turnoHeaderText}>
                        <ThemedText
                          style={[styles.turnoTitle, { color: strongText }]}
                        >
                          Turno de inscripción
                        </ThemedText>

                        <ThemedText
                          style={[styles.turnoSubtitle, { color: mutedText }]}
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
                                  ? theme.colors.primary
                                  : softBgStrong,
                                borderColor: seleccionado
                                  ? theme.colors.primary
                                  : border,
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
                        numberOfLines={1}
                        style={[styles.materiasInfoText, { color: mutedText }]}
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
                              ? "rgba(59,130,246,0.18)"
                              : "#DBEAFE",
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.resumenChipNumber,
                            { color: theme.colors.primary },
                          ]}
                        >
                          {turnoSeleccionado ? materiasPendientes.length : 0}
                        </ThemedText>

                        <ThemedText
                          style={[
                            styles.resumenChipLabel,
                            { color: theme.colors.primary },
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

                  <ScrollView
                    style={styles.materiasList}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator
                  >
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
                          color={theme.colors.primary}
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
                          seleccionado.
                        </ThemedText>
                      </View>
                    ) : (
                      materiasPendientes.map((materia) => (
                        <MateriaCard
                          key={`${materia.idCarrera}-${materia.idMateria}`}
                          materia={materia}
                          status="Pendiente"
                          statusColor={theme.colors.primary}
                          backgroundColor={softBg}
                          borderColor={border}
                          strongText={strongText}
                          mutedText={mutedText}
                        />
                      ))
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
                  </ScrollView>
                </>
              )}

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

                {!todasMateriasInscritas && !loadingMaterias && (
                  <Pressable
                    onPress={confirmarInscripcion}
                    disabled={!puedeInscribir}
                    style={({ pressed }) => [
                      styles.confirmBtn,
                      {
                        backgroundColor: puedeInscribir
                          ? theme.colors.primary
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
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
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
          name={status === "Inscrita" ? "checkmark-done-outline" : "book-outline"}
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
    backgroundColor: "rgba(2,6,23,0.74)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  modal: {
    width: "100%",
    maxWidth: 1400,
    height: "96%",
    borderRadius: 28,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
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
    gap: 12,
    minWidth: 0,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 27,
    fontWeight: "900",
  },
  studentName: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "800",
  },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingBox: {
    flex: 1,
    minHeight: 300,
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
    padding: 11,
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
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  carreraSeleccionadaText: {
    flex: 1,
    minWidth: 0,
  },
  carreraSeleccionadaLabel: {
    fontSize: 11.5,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  carreraSeleccionadaNombre: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "900",
  },
  cambiarCarreraBtn: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  cambiarCarreraText: {
    fontSize: 12,
    fontWeight: "900",
  },
  turnoCompactContainer: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 11,
    marginBottom: 10,
  },
  turnoCompactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 9,
  },
  turnoHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  turnoIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.13)",
  },
  turnoTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  turnoSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  turnosRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  turnoButtonCompact: {
    flex: 1,
    minWidth: 120,
    minHeight: 42,
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
    fontSize: 19,
    fontWeight: "900",
  },
  materiasInfoText: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: "700",
  },
  resumenChips: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },
  resumenChip: {
    minWidth: 80,
    minHeight: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  resumenChipNumber: {
    fontSize: 16,
    fontWeight: "900",
  },
  resumenChipLabel: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  inscripcionCompletaBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  inscripcionCompletaIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  inscripcionCompletaText: {
    flex: 1,
    minWidth: 0,
  },
  inscripcionCompletaTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  inscripcionCompletaSubtitle: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: "700",
    lineHeight: 18,
  },
  inscritasCountBadge: {
    minWidth: 44,
    height: 38,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  inscritasCountText: {
    fontSize: 16,
    fontWeight: "900",
  },
  materiasList: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingBottom: 10,
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
    fontWeight: "600",
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
    fontWeight: "700",
    lineHeight: 18,
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
    fontWeight: "700",
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
    marginTop: 8,
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
  countBadge: {
  minWidth: 38,
  height: 30,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 10,
},

countBadgeText: {
  fontSize: 13,
  fontWeight: "900",
},
});