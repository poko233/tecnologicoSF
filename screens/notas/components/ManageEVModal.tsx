import { Toaster } from "@/components/Toaster";
import { useTheme } from "@/theme/useTheme";
import { Edit, Plus, Trash2, X } from "lucide-react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { modalTiming } from "../animations/notas.animations";
import { useElementosEvaluativos } from "../hooks/useElementosEvaluativos";
import { ElementoEvaluativo } from "../types/notas.types";
import { ConfirmStatusModal } from "./ConfirmStatusModal";

interface Props {
  visible: boolean;
  ec: { id: number; nombre: string } | null;
  onClose: () => void;
}

export function ManageEVModal({ visible, ec, onClose }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { activos, inactivos, loading, cargar, crear, actualizar, reset } =
    useElementosEvaluativos(ec?.id ?? null);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPuntaje, setNewPuntaje] = useState("");
  const [editingEV, setEditingEV] = useState<ElementoEvaluativo | null>(null);
  const [togglingEV, setTogglingEV] = useState<ElementoEvaluativo | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [togglingLoading, setTogglingLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const fetchStarted = useRef(false);

  // Al abrir o cambiar de EC: reset, iniciar carga y marcar bandera
  React.useEffect(() => {
    if (visible && ec) {
      reset();
      setInitialLoad(true);
      fetchStarted.current = true;
      cargar();
      setShowCreate(false);
      setNewName("");
      setNewPuntaje("");
    }
  }, [visible, ec?.id]);

  // Cuando loading termine, desactivar initialLoad
  React.useEffect(() => {
    if (!loading && fetchStarted.current) {
      setInitialLoad(false);
      fetchStarted.current = false;
    }
  }, [loading]);

  const handleClose = () => {
    reset();
    setInitialLoad(true);
    onClose();
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const ok = await crear(
      newName.trim(),
      newPuntaje ? Number(newPuntaje) : undefined,
    );
    setCreating(false);
    if (ok) {
      setNewName("");
      setNewPuntaje("");
      setShowCreate(false);
    }
  };

  const handleEdit = async (
    id: number,
    nombre: string,
    puntaje_maximo?: number,
  ) => {
    setEditing(true);
    const ok = await actualizar(id, { nombre, puntaje_maximo });
    setEditing(false);
    if (ok) setEditingEV(null);
  };

  const handleToggle = async (ev: ElementoEvaluativo) => {
    setTogglingLoading(true);
    const nuevoEstado = ev.estado === "activo" ? "inactivo" : "activo";
    const ok = await actualizar(ev.id, { estado: nuevoEstado });
    setTogglingLoading(false);
    if (ok) setTogglingEV(null);
  };

  const filterNumberInput = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setter(cleaned);
  };

  // Validación extra: el puntaje es obligatorio y debe ser un número >= 0
  const isPuntajeValid = (value: string) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  };

  if (!ec) return null;

  const mostrarEstadoVacio =
    !loading && activos.length === 0 && inactivos.length === 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <MotiView
          style={[
            styles.modal,
            {
              backgroundColor: c.modal,
              borderColor: c.border,
              shadowColor: "#000",
            },
          ]}
          {...modalTiming}
        >
          {/* Cabecera */}
          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: c.text }]}>{ec.nombre}</Text>
              <Text style={[styles.subtitle, { color: c.textSecondary }]}>
                Gestión de Elementos Evaluativos
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={24} color={c.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Contenido scrollable */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.scrollContent}
          >
            {initialLoad || loading ? (
              <ActivityIndicator
                size="small"
                color={c.primary}
                style={{ marginVertical: 40 }}
              />
            ) : mostrarEstadoVacio && !showCreate ? (
              <View style={styles.emptyState}>
                <View
                  style={[
                    styles.emptyIcon,
                    { backgroundColor: c.accent + "20" },
                  ]}
                >
                  <Plus size={32} color={c.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: c.text }]}>
                  Sin elementos evaluativos
                </Text>
                <Text
                  style={[styles.emptySubtitle, { color: c.textSecondary }]}
                >
                  Crea el primer elemento evaluativo para comenzar.
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCreate(true)}
                  style={[styles.emptyAddBtn, { backgroundColor: c.primary }]}
                >
                  <Text
                    style={{
                      color: c.primaryForeground,
                      fontWeight: "600",
                    }}
                  >
                    AÑADIR
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {!loading && activos.length > 0 && (
                  <Text
                    style={[styles.sectionTitle, { color: c.textSecondary }]}
                  >
                    Activos
                  </Text>
                )}
                {activos.map((ev) => (
                  <View
                    key={ev.id}
                    style={[
                      styles.evItem,
                      { borderColor: c.border, backgroundColor: c.card },
                    ]}
                  >
                    <View style={styles.evInfo}>
                      <Text
                        style={[styles.evName, { color: c.text }]}
                        numberOfLines={1}
                      >
                        {ev.nombre}
                      </Text>
                      {ev.puntaje_maximo !== null && (
                        <Text
                          style={[styles.evPuntaje, { color: c.textSecondary }]}
                        >
                          Máx: {ev.puntaje_maximo} pts
                        </Text>
                      )}
                    </View>
                    <View style={styles.evActions}>
                      <MotiPressable
                        onPress={() => setEditingEV(ev)}
                        style={styles.actionBtn}
                        animate={({ pressed }) => ({
                          scale: pressed ? 0.85 : 1,
                        })}
                      >
                        <Edit size={18} color={c.primary} />
                      </MotiPressable>
                      <MotiPressable
                        onPress={() => setTogglingEV(ev)}
                        style={styles.actionBtn}
                        animate={({ pressed }) => ({
                          scale: pressed ? 0.85 : 1,
                        })}
                      >
                        <Trash2 size={18} color={c.destructive} />
                      </MotiPressable>
                    </View>
                  </View>
                ))}

                {/* Botón dashed para mostrar el formulario de creación */}
                {!showCreate && (
                  <MotiPressable
                    onPress={() => setShowCreate(true)}
                    style={[styles.addButton, { borderColor: c.border }]}
                    animate={({ pressed }) => ({ scale: pressed ? 0.97 : 1 })}
                  >
                    <Plus size={20} color={c.primary} />
                    <Text style={[styles.addButtonText, { color: c.primary }]}>
                      Añadir Elemento Evaluativo
                    </Text>
                  </MotiPressable>
                )}

                {/* Formulario de creación (puntaje obligatorio) */}
                {showCreate && (
                  <View style={[styles.createForm, { borderColor: c.border }]}>
                    <TextInput
                      style={[
                        styles.input,
                        { borderColor: c.inputBorder, color: c.text },
                      ]}
                      placeholder="Nombre; ej: Examen 1, Tarea 2, etc."
                      placeholderTextColor={c.textMuted}
                      value={newName}
                      onChangeText={setNewName}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        { borderColor: c.inputBorder, color: c.text },
                      ]}
                      placeholder="Puntaje (referencial); ej: 20, 100, etc."
                      placeholderTextColor={c.textMuted}
                      value={newPuntaje}
                      onChangeText={(text) =>
                        filterNumberInput(text, setNewPuntaje)
                      }
                      keyboardType="decimal-pad"
                    />
                    <View style={styles.formActions}>
                      <TouchableOpacity
                        onPress={() => setShowCreate(false)}
                        style={styles.cancelBtn}
                      >
                        <Text style={{ color: c.text }}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleCreate}
                        disabled={
                          creating ||
                          !newName.trim() ||
                          !isPuntajeValid(newPuntaje)
                        }
                        style={[
                          styles.saveBtn,
                          {
                            backgroundColor: c.primary,
                            opacity:
                              creating ||
                              !newName.trim() ||
                              !isPuntajeValid(newPuntaje)
                                ? 0.6
                                : 1,
                          },
                        ]}
                      >
                        {creating ? (
                          <ActivityIndicator
                            size="small"
                            color={c.primaryForeground}
                          />
                        ) : (
                          <Text
                            style={{
                              color: c.primaryForeground,
                              fontWeight: "600",
                            }}
                          >
                            Guardar
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Inactivos */}
                {inactivos.length > 0 && (
                  <View style={{ marginTop: 24 }}>
                    <Text
                      style={[styles.sectionTitle, { color: c.textSecondary }]}
                    >
                      Historial / Inactivos
                    </Text>
                    {inactivos.map((ev) => (
                      <View
                        key={ev.id}
                        style={[
                          styles.evItem,
                          styles.inactiveItem,
                          {
                            borderColor: c.border,
                            backgroundColor: c.backgroundSecondary,
                          },
                        ]}
                      >
                        <View style={styles.evInfo}>
                          <Text
                            style={[
                              styles.evName,
                              {
                                color: c.textSecondary,
                                textDecorationLine: "line-through",
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {ev.nombre}
                          </Text>
                        </View>
                        <MotiPressable
                          onPress={() => setTogglingEV(ev)}
                          style={styles.actionBtn}
                          animate={({ pressed }) => ({
                            scale: pressed ? 0.85 : 1,
                          })}
                        >
                          <Edit size={18} color={c.primary} />
                        </MotiPressable>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Pie */}
          <View style={[styles.footer, { borderTopColor: c.border }]}>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.closeModalBtn, { borderColor: c.border }]}
            >
              <Text style={{ color: c.text, fontWeight: "600" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* Submodal de edición (puntaje obligatorio) */}
        {editingEV && (
          <EditEVModal
            visible={true}
            ev={editingEV}
            loading={editing}
            onClose={() => setEditingEV(null)}
            onConfirm={handleEdit}
          />
        )}

        {/* Confirmación toggle */}
        <ConfirmStatusModal
          visible={togglingEV !== null}
          title={
            togglingEV?.estado === "activo" ? "Desactivar EV" : "Reactivar EV"
          }
          message={
            togglingEV?.estado === "activo"
              ? "¿Deseas desactivar este elemento evaluativo? Se moverá a inactivos."
              : "¿Deseas reactivar este elemento evaluativo?"
          }
          confirmLabel={
            togglingEV?.estado === "activo" ? "DESACTIVAR" : "REACTIVAR"
          }
          isDestructive={togglingEV?.estado === "activo"}
          isLoading={togglingLoading}
          onCancel={() => setTogglingEV(null)}
          onConfirm={() => handleToggle(togglingEV!)}
        />
      </KeyboardAvoidingView>
      <Toaster />
    </Modal>
  );
}

// ---------- SUBCOMPONENTE EditEVModal (puntaje obligatorio) ----------
function EditEVModal({
  visible,
  ev,
  loading,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  ev: ElementoEvaluativo;
  loading: boolean;
  onClose: () => void;
  onConfirm: (id: number, nombre: string, puntaje_maximo?: number) => void;
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [nombre, setNombre] = useState(ev.nombre);
  const [puntaje, setPuntaje] = useState(ev.puntaje_maximo?.toString() ?? "");

  const filterNumberInput = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setter(cleaned);
  };

  const isPuntajeValid = (value: string) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.editOverlay}>
        <View
          style={[
            styles.editModal,
            { backgroundColor: c.modal, borderColor: c.border },
          ]}
        >
          <Text style={[styles.editTitle, { color: c.text }]}>Editar EV</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: c.inputBorder, color: c.text },
            ]}
            value={nombre}
            onChangeText={setNombre}
          />
          <TextInput
            style={[
              styles.input,
              { borderColor: c.inputBorder, color: c.text },
            ]}
            value={puntaje}
            onChangeText={(text) => filterNumberInput(text, setPuntaje)}
            keyboardType="decimal-pad"
            placeholder="Puntaje máximo"
          />
          <View style={styles.formActions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={{ color: c.text }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                onConfirm(
                  ev.id,
                  nombre.trim(),
                  puntaje ? Number(puntaje) : undefined,
                )
              }
              disabled={loading || !nombre.trim() || !isPuntajeValid(puntaje)}
              style={[
                styles.saveBtn,
                {
                  backgroundColor: c.primary,
                  opacity:
                    loading || !nombre.trim() || !isPuntajeValid(puntaje)
                      ? 0.6
                      : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={c.primaryForeground} />
              ) : (
                <Text
                  style={{
                    color: c.primaryForeground,
                    fontWeight: "600",
                  }}
                >
                  Guardar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 24,
  },
  modal: {
    width: "90%",
    maxWidth: 700,
    height: "85%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  closeBtn: {
    padding: 8,
    marginLeft: 16,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  evItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  evInfo: {
    flex: 1,
    marginRight: 12,
  },
  evName: {
    fontSize: 15,
    fontWeight: "600",
  },
  evPuntaje: {
    fontSize: 12,
    marginTop: 2,
  },
  evActions: {
    flexDirection: "row",
    gap: 4,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
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
  createForm: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  inactiveItem: {
    opacity: 0.6,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  closeModalBtn: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  editOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 24,
  },
  editModal: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  emptyState: {
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
  emptyAddBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
});
