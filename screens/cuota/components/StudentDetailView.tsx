import React, { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import { useTheme } from "../../../theme/useTheme";
import { usePlanPagos } from "../hooks/usePlanPagos";
import { cuotaService } from "../services/cuota.service";
import { Estudiante } from "../types/cuota.types";
import { ContactInfoCard } from "./ContactInfoCard";
import { CuotasListCard } from "./CuotasListCard";
import { MatriculaCard } from "./MatriculaCard";
import { PlanPagosCard } from "./PlanPagosCard";
import { PlanPagosModal } from "./PlanPagosModal";
import { StudentProfileHeader } from "./StudentProfileHeader";
interface StudentDetailViewProps {
  student: Estudiante;
  detail: any; // datos iniciales del backend
}

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  student,
  detail,
}) => {
  const { theme } = useTheme();
  const [currentDetail, setCurrentDetail] = useState(detail);
  const [refreshing, setRefreshing] = useState(false);

  const { estudiante, carrera, plan_pago, cuotas } = currentDetail;
  const {
    planes,
    loading: loadingPlanes,
    selectedPlan,
    setSelectedPlan,
    modalVisible,
    setModalVisible,
    crearPlan,
    eliminarPlan,
  } = usePlanPagos(student.id);
  const refreshDetail = async () => {
    setRefreshing(true);
    try {
      const newDetail = await cuotaService.getStudentDetail(student.id);
      setCurrentDetail(newDetail);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo actualizar los datos",
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshDetail}
          tintColor={theme.colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
      style={{ backgroundColor: theme.colors.background }}
    >
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          maxWidth: 1400,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <StudentProfileHeader student={estudiante} carrera={carrera?.nombre} />

        <View style={{ marginTop: 24, gap: 24 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 20 }}>
            <View style={{ flex: 1, minWidth: 250 }}>
              <MatriculaCard
                student={estudiante}
                onMatriculaGenerada={refreshDetail}
              />
            </View>
            <View style={{ flex: 1, minWidth: 250 }}>
              <PlanPagosCard
                planes={planes}
                onPress={() => setModalVisible(true)}
              />
            </View>
            <View style={{ flex: 1, minWidth: 250 }}>
              <CuotasListCard cuotas={cuotas} planPago={plan_pago} />
            </View>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 20 }}>
            <View style={{ flex: 1, minWidth: 250 }}>
              <ContactInfoCard student={estudiante} />
            </View>
          </View>
        </View>
      </View>
      <PlanPagosModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        estudianteId={student.id}
        matriculaActual={estudiante.matricula}
        estudianteNombre={student.nombreCompleto}
        planes={planes}
        loading={loadingPlanes}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        onEliminar={eliminarPlan}
        onCrear={crearPlan}
      />
    </ScrollView>
  );
};
