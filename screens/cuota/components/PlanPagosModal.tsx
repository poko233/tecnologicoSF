import { Toaster } from "@/components/Toaster";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { Cuota, PlanPago } from "../types/planPago.types";
import { NuevoPlanPagoModal } from "./NuevoPlanPagoModal";

interface PlanPagosModalProps {
  visible: boolean;
  onClose: () => void;
  estudianteId: number;
  matriculaActual: string;
  estudianteNombre: string;
  planes: PlanPago[];
  loading: boolean;
  selectedPlan: PlanPago | null;
  setSelectedPlan: (plan: PlanPago | null) => void;
  onEliminar: (planId: number) => void;
  onCrear: (data: any) => Promise<void>;
}

export const PlanPagosModal: React.FC<PlanPagosModalProps> = ({
  visible,
  onClose,
  estudianteId,
  matriculaActual,
  estudianteNombre,
  planes,
  loading,
  selectedPlan,
  setSelectedPlan,
  onEliminar,
  onCrear,
}) => {
  const { theme } = useTheme();
  const [crearModalVisible, setCrearModalVisible] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<PlanPago | null>(null);

  // Al abrir el modal, seleccionar el primer plan si no hay ninguno seleccionado
  useEffect(() => {
    if (visible && planes.length > 0 && !selectedPlan) {
      setSelectedPlan(planes[0]);
    }
  }, [visible, planes, selectedPlan]);

  const getEstadoText = (estado: string) => {
    if (estado === "Pagado") return "Pagado";
    if (estado === "Debe") return "Pendiente";
    return estado;
  };

  const getEstadoColor = (estado: string) => {
    if (estado === "Pagado") return theme.colors.success;
    if (estado === "Debe") return theme.colors.destructive;
    return theme.colors.textMuted;
  };
  const confirmDelete = (plan: PlanPago) => {
    setPlanToDelete(plan);
  };

  const handleDeleteConfirmed = () => {
    if (planToDelete) {
      onEliminar(planToDelete.id);
      setPlanToDelete(null);
    }
  };
  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 1200,
              maxHeight: "90%",
              backgroundColor: theme.colors.card,
              borderRadius: 24,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
                backgroundColor: theme.colors.backgroundSecondary,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Ionicons
                  name="wallet-outline"
                  size={28}
                  color={theme.colors.primary}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: theme.colors.text,
                  }}
                >
                  Gestión de Planes de Pago - {estudianteNombre}
                </Text>
              </View>
              <Pressable onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textMuted}
                />
              </Pressable>
            </View>

            {/* Body */}
            <View
              style={{
                flexDirection: "row",
                flex: 1,
                minHeight: 400,
                gap: 20,
                padding: 20,
              }}
            >
              {/* Columna izquierda: Lista de planes */}
              <View style={{ flex: 1, gap: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: theme.colors.text,
                    }}
                  >
                    Planes Vigentes
                  </Text>
                  <Pressable
                    onPress={() => setCrearModalVisible(true)}
                    style={({ pressed }) => ({
                      backgroundColor: theme.colors.primary,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Ionicons name="add" size={16} color="white" />
                      <Text
                        style={{
                          color: "white",
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        Nuevo Plan
                      </Text>
                    </View>
                  </Pressable>
                </View>
                {loading ? (
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                  />
                ) : planes.length === 0 ? (
                  <Text
                    style={{
                      color: theme.colors.textSecondary,
                      textAlign: "center",
                      marginTop: 40,
                    }}
                  >
                    No hay planes registrados
                  </Text>
                ) : (
                  <ScrollView style={{ maxHeight: 400 }}>
                    {planes.map((plan) => {
                      const total = plan.resumen?.monto_total || 0;
                      const pagado = plan.resumen?.monto_pagado || 0;
                      const saldo = total - pagado;
                      const isCompleted =
                        plan.resumen?.cuotas_pagadas ===
                        plan.resumen?.total_cuotas;
                      return (
                        <Pressable
                          key={plan.id}
                          onPress={() => setSelectedPlan(plan)}
                          style={({ pressed }) => ({
                            backgroundColor:
                              selectedPlan?.id === plan.id
                                ? theme.colors.primarySubtle
                                : theme.colors.card,
                            borderWidth: selectedPlan?.id === plan.id ? 2 : 1,
                            borderColor:
                              selectedPlan?.id === plan.id
                                ? theme.colors.primary
                                : theme.colors.border,
                            borderRadius: 12,
                            padding: 12,
                            marginBottom: 12,
                            opacity: pressed ? 0.95 : 1,
                          })}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <View>
                              <Text
                                style={{
                                  fontSize: 10,
                                  fontWeight: "bold",
                                  textTransform: "uppercase",
                                  color: isCompleted
                                    ? theme.colors.textMuted
                                    : theme.colors.primary,
                                }}
                              >
                                {isCompleted ? "Completado" : "Activo"}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: "600",
                                  color: theme.colors.text,
                                  marginTop: 2,
                                }}
                              >
                                Gestión {plan.gestion}
                              </Text>
                            </View>
                            <Pressable
                              onPress={() => confirmDelete(plan)}
                              hitSlop={10}
                              style={({ hovered }) => ({
                                opacity:
                                  hovered || Platform.OS !== "web" ? 1 : 0,
                                transition: "opacity 0.2s",
                              })}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={18}
                                color={theme.colors.destructive}
                              />
                            </Pressable>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text style={{ color: theme.colors.textSecondary }}>
                              Total:
                            </Text>
                            <Text
                              style={{
                                fontWeight: "500",
                                color: theme.colors.text,
                              }}
                            >
                              {total.toFixed(2)} Bs.
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text style={{ color: theme.colors.textSecondary }}>
                              Saldo:
                            </Text>
                            <Text
                              style={{
                                fontWeight: "bold",
                                color:
                                  saldo > 0
                                    ? theme.colors.primary
                                    : theme.colors.success,
                              }}
                            >
                              {saldo.toFixed(2)} Bs.
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Columna derecha: Detalle de cuotas del plan seleccionado */}
              <View
                style={{
                  flex: 2,
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                    backgroundColor: theme.colors.card,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Detalle de Cuotas -{" "}
                    {selectedPlan
                      ? `Gestión ${selectedPlan.gestion}`
                      : "Selecciona un plan"}
                  </Text>
                </View>
                <ScrollView style={{ flex: 1, padding: 16 }}>
                  {selectedPlan?.cuotas && selectedPlan.cuotas.length > 0 ? (
                    <View>
                      {/* Cabecera de tabla */}
                      <View
                        style={{
                          flexDirection: "row",
                          paddingBottom: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: theme.colors.border,
                          marginBottom: 12,
                        }}
                      >
                        <Text
                          style={{
                            flex: 2,
                            fontSize: 10,
                            fontWeight: "bold",
                            color: theme.colors.textSecondary,
                            textTransform: "uppercase",
                          }}
                        >
                          Cuota
                        </Text>
                        <Text
                          style={{
                            flex: 2,
                            fontSize: 10,
                            fontWeight: "bold",
                            color: theme.colors.textSecondary,
                            textTransform: "uppercase",
                          }}
                        >
                          Vencimiento
                        </Text>
                        <Text
                          style={{
                            flex: 1.5,
                            fontSize: 10,
                            fontWeight: "bold",
                            color: theme.colors.textSecondary,
                            textTransform: "uppercase",
                            textAlign: "right",
                          }}
                        >
                          Monto
                        </Text>
                        <Text
                          style={{
                            flex: 1.5,
                            fontSize: 10,
                            fontWeight: "bold",
                            color: theme.colors.textSecondary,
                            textTransform: "uppercase",
                            textAlign: "center",
                          }}
                        >
                          Estado
                        </Text>
                      </View>
                      {selectedPlan.cuotas.map((cuota: Cuota, idx: number) => (
                        <View
                          key={cuota.idCuota}
                          style={{
                            flexDirection: "row",
                            paddingVertical: 12,
                            borderBottomWidth:
                              idx === selectedPlan.cuotas!.length - 1 ? 0 : 1,
                            borderBottomColor: theme.colors.border,
                            backgroundColor:
                              cuota.estadoCuota === "Debe"
                                ? theme.colors.destructive + "10"
                                : undefined,
                          }}
                        >
                          <Text
                            style={{
                              flex: 2,
                              fontSize: 14,
                              fontWeight: "500",
                              color: theme.colors.text,
                            }}
                          >
                            {cuota.tipo === "MATRICULA"
                              ? "Matrícula"
                              : `Cuota ${cuota.numeroCuota}`}
                          </Text>
                          <Text
                            style={{
                              flex: 2,
                              fontSize: 14,
                              color: theme.colors.textSecondary,
                            }}
                          >
                            {cuota.fecha_vencimiento
                              ? new Date(
                                  cuota.fecha_vencimiento,
                                ).toLocaleDateString()
                              : "—"}
                          </Text>
                          <Text
                            style={{
                              flex: 1.5,
                              fontSize: 14,
                              fontWeight: "500",
                              color: theme.colors.text,
                              textAlign: "right",
                            }}
                          >
                            {cuota.monto.toFixed(2)} Bs.
                          </Text>
                          <Text
                            style={{
                              flex: 1.5,
                              fontSize: 12,
                              fontWeight: "bold",
                              color: getEstadoColor(cuota.estadoCuota),
                              textAlign: "center",
                            }}
                          >
                            {getEstadoText(cuota.estadoCuota)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text
                      style={{
                        textAlign: "center",
                        color: theme.colors.textSecondary,
                        marginTop: 40,
                      }}
                    >
                      Selecciona un plan para ver sus cuotas
                    </Text>
                  )}
                </ScrollView>
              </View>
            </View>

            {/* Footer */}
            <View
              style={{
                padding: 16,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <Pressable
                onPress={onClose}
                style={({ pressed }) => ({
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                  borderRadius: 8,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: theme.colors.textSecondary }}>
                  Cerrar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
        <Toaster />
        <Modal
          visible={!!planToDelete}
          transparent
          animationType="fade"
          onRequestClose={() => setPlanToDelete(null)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 24,
                padding: 24,
                width: "80%",
                maxWidth: 400,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: theme.colors.text,
                  marginBottom: 12,
                }}
              >
                Confirmar eliminación
              </Text>
              <Text
                style={{ color: theme.colors.textSecondary, marginBottom: 24 }}
              >
                ¿Estás seguro de eliminar este plan de pago? Se eliminarán todas
                las cuotas asociadas y no se podrá recuperar.
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 12,
                }}
              >
                <Pressable
                  onPress={() => setPlanToDelete(null)}
                  style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                >
                  <Text style={{ color: theme.colors.textSecondary }}>
                    Cancelar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleDeleteConfirmed}
                  style={{
                    backgroundColor: theme.colors.destructive,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "600" }}>
                    Eliminar
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </Modal>

      {/* Submodal para crear nuevo plan */}
      <NuevoPlanPagoModal
        visible={crearModalVisible}
        onClose={() => setCrearModalVisible(false)}
        estudianteId={estudianteId}
        matriculaActual={matriculaActual}
        onSubmit={onCrear}
      />
    </>
  );
};
