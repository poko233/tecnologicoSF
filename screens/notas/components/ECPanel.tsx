import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/theme/useTheme";
import { Tooltip } from "@components/Tooltip";
import { FolderOpen, Plus } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  slideFromBottomTiming,
  slideFromRightTiming,
} from "../animations/notas.animations";
import { useElementosCompetencia } from "../hooks/useElementosCompetencia";
import { ElementoCompetencia } from "../types/notas.types";
import { ConfirmStatusModal } from "./ConfirmStatusModal";
import { CreateECModal } from "./CreateECModal";
import { ECItem } from "./ECItem";
import { EditECModal } from "./EditECModal";
import { InactiveECSection } from "./InactiveECSection";

interface Props {
  idGrupo: number;
  grupoNombre: string;
  materiaNombre: string;
  onClose: () => void;
  onGoToGrading: () => void;
  visible: boolean;
}

export function ECPanel({
  idGrupo,
  grupoNombre,
  materiaNombre,
  onClose,
  onGoToGrading,
  visible,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { isMobile, width, height } = useResponsive();

  const { activos, inactivos, loading, cargar, crear, actualizar } =
    useElementosCompetencia(idGrupo);
  const [showCreate, setShowCreate] = useState(false);
  const [editingEC, setEditingEC] = useState<ElementoCompetencia | null>(null);
  const [togglingEC, setTogglingEC] = useState<ElementoCompetencia | null>(
    null,
  );
  const [actionType, setActionType] = useState<"activate" | "deactivate">(
    "deactivate",
  );

  // Estados de carga por acción
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [togglingLoading, setTogglingLoading] = useState(false);

  React.useEffect(() => {
    if (idGrupo) cargar();
  }, [idGrupo]);

  const handleToggleStatus = (ec: ElementoCompetencia) => {
    setTogglingEC(ec);
    setActionType(ec.estado === "activo" ? "deactivate" : "activate");
  };

  const handleCreate = async (nombre: string, observaciones?: string) => {
    setCreating(true);
    const ok = await crear(nombre, observaciones);
    setCreating(false);
    if (ok) {
      setShowCreate(false);
    }
  };

  const handleEdit = async (
    id: number,
    nombre: string,
    observaciones?: string,
  ) => {
    setEditing(true);
    const ok = await actualizar(id, { nombre, observaciones });
    setEditing(false);
    if (ok) {
      setEditingEC(null);
    }
  };

  const confirmToggle = async () => {
    if (togglingEC) {
      setTogglingLoading(true);
      const nuevoEstado =
        togglingEC.estado === "activo" ? "inactivo" : "activo";
      const ok = await actualizar(togglingEC.id, { estado: nuevoEstado });
      setTogglingLoading(false);
      if (ok) {
        setTogglingEC(null);
      }
    }
  };

  const panelWidth = isMobile ? width : 400;
  const panelHeight = height;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {visible && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "timing", duration: 200 }}
            style={styles.backdrop}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          </MotiView>
        )}
      </AnimatePresence>

      {/* Panel deslizante (sin overflow hidden para que el tooltip no se recorte) */}
      <AnimatePresence>
        {visible && (
          <MotiView
            from={
              isMobile ? slideFromBottomTiming.from : slideFromRightTiming.from
            }
            animate={
              isMobile
                ? slideFromBottomTiming.animate
                : slideFromRightTiming.animate
            }
            exit={
              isMobile ? slideFromBottomTiming.exit : slideFromRightTiming.exit
            }
            transition={
              isMobile
                ? slideFromBottomTiming.transition
                : slideFromRightTiming.transition
            }
            style={[
              styles.panel,
              {
                width: panelWidth,
                height: panelHeight,
                backgroundColor: c.card,
                borderLeftColor: isMobile ? "transparent" : c.border,
                shadowColor: "#000",
                overflow: "visible", // <-- permite que los tooltips sobresalgan
              },
              isMobile
                ? {
                    bottom: 0,
                    left: 0,
                    right: 0,
                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,
                  }
                : {
                    right: 0,
                    top: 0,
                    borderLeftWidth: 1,
                  },
            ]}
          >
            {/* Cabecera (con overflow visible) */}
            <View
              style={[
                styles.header,
                {
                  borderBottomColor: c.border,
                  backgroundColor: c.card,
                  zIndex: 1, // <-- Asignar prioridad baja
                  elevation: 1, // <-- Prioridad baja para Android
                },
              ]}
            >
              <View style={styles.headerContent}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.breadcrumb, { color: c.primary }]}>
                    {grupoNombre}
                  </Text>
                  <Text style={[styles.title, { color: c.text }]}>
                    {materiaNombre}
                  </Text>
                  <Text style={[styles.subtitle, { color: c.textSecondary }]}>
                    Gestión de Elementos de Competencia
                  </Text>
                </View>
                <MotiPressable
                  onPress={onClose}
                  style={styles.closeBtn}
                  animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
                >
                  <Text
                    style={{
                      color: c.textSecondary,
                      fontSize: 22,
                      lineHeight: 24,
                    }}
                  >
                    ✕
                  </Text>
                </MotiPressable>
              </View>
            </View>
            {/* Contenido scrollable */}
            <ScrollView
              style={[
                styles.scrollArea,
                {
                  zIndex: 10,
                  elevation: 10,
                  // ELIMINAMOS overflow: "visible" de aquí
                },
              ]}
              contentContainerStyle={[
                styles.scrollContent,
                {
                  overflow: "visible", // Lo movemos aquí
                  flexGrow: 1, // Añadimos esto para asegurar que el contenido se expanda
                },
              ]}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={c.primary}
                  style={{ marginVertical: 20 }}
                />
              ) : activos.length === 0 && inactivos.length === 0 ? (
                // ESTADO VACÍO
                <View style={styles.emptyStateContainer}>
                  <View
                    style={[
                      styles.emptyIcon,
                      { backgroundColor: c.accent + "20" },
                    ]}
                  >
                    <Plus size={32} color={c.primary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: c.text }]}>
                    Sin elementos
                  </Text>
                  <Text
                    style={[styles.emptySubtitle, { color: c.textSecondary }]}
                  >
                    Aún no has añadido elementos de competencia a este grupo.
                  </Text>
                  <Pressable
                    onPress={() => setShowCreate(true)}
                    style={[
                      styles.emptyAddButton,
                      { backgroundColor: c.primary },
                    ]}
                  >
                    <Text
                      style={{ color: c.primaryForeground, fontWeight: "600" }}
                    >
                      AÑADIR PRIMERO
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={styles.sectionHeader}>
                    <Text
                      style={[styles.sectionTitle, { color: c.textSecondary }]}
                    >
                      Elementos Activos
                    </Text>
                    <Tooltip
                      message="Los Elementos de Competencia son los criterios que evaluarás para cada estudiante. Define aquí los ítems que compondrán la nota final (Primer examen parcial, Segundo examen parcial, etc.)."
                      position="bottom-right" // Aparecerá justo a la derecha del icono
                    />
                  </View>

                  {activos.map((ec, index) => (
                    <ECItem
                      key={ec.id}
                      ec={ec}
                      index={index}
                      onEdit={setEditingEC}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}

                  {/* Botón Añadir */}
                  <MotiPressable
                    onPress={() => setShowCreate(true)}
                    style={[styles.addButton, { borderColor: c.border }]}
                    animate={({ pressed }) => ({
                      scale: pressed ? 0.97 : 1,
                    })}
                  >
                    <Plus size={20} color={c.primary} />
                    <Text style={[styles.addButtonText, { color: c.primary }]}>
                      Elemento de Competencia
                    </Text>
                  </MotiPressable>

                  {/* Inactivos */}
                  {inactivos.length > 0 && (
                    <View style={{ marginTop: 24 }}>
                      <View style={styles.sectionHeader}>
                        <Text
                          style={[
                            styles.sectionTitle,
                            { color: c.textSecondary },
                          ]}
                        >
                          Historial / Inactivos
                        </Text>
                        <Tooltip
                          message="Estos elementos ya no se usan para calificar. Puedes reactivarlos si vuelves a necesitarlos."
                          position="top"
                        />
                      </View>
                      <InactiveECSection
                        ecs={inactivos}
                        onReactivate={handleToggleStatus}
                      />
                    </View>
                  )}
                </>
              )}
            </ScrollView>
            {/* Pie */}\
            {activos.length !== 0 && !loading && (
              <View
                style={[
                  styles.footer,
                  { borderTopColor: c.border, backgroundColor: c.card },
                ]}
              >
                <MotiPressable
                  onPress={onGoToGrading}
                  style={[styles.gradingButton, { backgroundColor: c.primary }]}
                  animate={({ pressed }) => ({
                    scale: pressed ? 0.96 : 1,
                  })}
                >
                  <FolderOpen size={20} color={c.primaryForeground} />
                  <Text
                    style={[
                      styles.gradingButtonText,
                      { color: c.primaryForeground },
                    ]}
                  >
                    IR A CALIFICAR
                  </Text>
                </MotiPressable>
              </View>
            )}
          </MotiView>
        )}
      </AnimatePresence>

      {/* Modales */}
      <CreateECModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onConfirm={handleCreate}
        isLoading={creating}
      />
      <EditECModal
        visible={editingEC !== null}
        ec={editingEC}
        onClose={() => setEditingEC(null)}
        onConfirm={handleEdit}
        isLoading={editing}
      />
      <ConfirmStatusModal
        visible={togglingEC !== null}
        title={
          actionType === "activate"
            ? "Reactivar Elemento"
            : "Desactivar Elemento"
        }
        message={
          actionType === "activate"
            ? "¿Deseas reactivar este elemento de competencia? Volverá a estar disponible para la calificar a los estudiantes de este grupo."
            : "¿Estás seguro de desactivar este elemento? Se moverá a la lista de inactivos y no se usará para calificar a los estudiantes de este grupo."
        }
        confirmLabel={actionType === "activate" ? "REACTIVAR" : "DESACTIVAR"}
        isDestructive={actionType === "deactivate"}
        isLoading={togglingLoading}
        onCancel={() => setTogglingEC(null)}
        onConfirm={confirmToggle}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 90,
  },
  panel: {
    position: "absolute",
    zIndex: 100,
    elevation: 20,
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    flexDirection: "column",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  breadcrumb: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeBtn: {
    padding: 8,
    marginLeft: 12,
    marginTop: -4,
    borderRadius: 20,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 12,
    gap: 6,
    zIndex: 999,
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    marginTop: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  gradingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
  },
  gradingButtonText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    marginTop: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyAddButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
});
