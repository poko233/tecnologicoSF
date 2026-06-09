// screens/asistencia/components/ReporteButton.tsx
import { useTheme } from "@/theme/useTheme";
import { Download, FileSpreadsheet, FileText } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useReporteAsistencia } from "../hooks/useReporteAsistencia";

interface Props {
  idGrupoMateriaDocente: number;
  grupoNombre?: string;
}

export function ReporteButton({ idGrupoMateriaDocente, grupoNombre }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [modalVisible, setModalVisible] = useState(false);
  const { descargarCsv, descargarPdf, loadingCsv, loadingPdf } =
    useReporteAsistencia();

  const isLoading = loadingCsv || loadingPdf;

  const handleCsv = async () => {
    setModalVisible(false);
    await descargarCsv(idGrupoMateriaDocente);
  };

  const handlePdf = async () => {
    setModalVisible(false);
    await descargarPdf(idGrupoMateriaDocente);
  };

  return (
    <>
      {/* Botón principal */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        disabled={isLoading}
        style={[
          styles.btn,
          {
            backgroundColor: isLoading ? c.disabled : c.secondary ?? "#e5e7eb",
            borderColor: c.border,
          },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={c.primary} />
        ) : (
          <Download size={16} color={c.primary} />
        )}
        <Text style={[styles.btnText, { color: c.primary }]}>
          {isLoading ? "Descargando..." : "Reporte"}
        </Text>
      </TouchableOpacity>

      {/* Modal de selección de formato */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.sheet,
              { backgroundColor: c.card ?? c.background, borderColor: c.border },
            ]}
          >
            <Text style={[styles.sheetTitle, { color: c.text }]}>
              Descargar reporte
            </Text>
            {grupoNombre && (
              <Text style={[styles.sheetSubtitle, { color: c.textSecondary }]}>
                {grupoNombre}
              </Text>
            )}

            {/* Opción CSV */}
            <TouchableOpacity
              style={[styles.option, { borderColor: c.border }]}
              onPress={handleCsv}
            >
              <View
                style={[styles.optionIcon, { backgroundColor: "#d1fae5" }]}
              >
                <FileSpreadsheet size={22} color="#065f46" />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: c.text }]}>
                  Excel / CSV
                </Text>
                <Text style={[styles.optionDesc, { color: c.textSecondary }]}>
                  Abre en Excel, Google Sheets, etc.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Opción PDF */}
            <TouchableOpacity
              style={[styles.option, { borderColor: c.border }]}
              onPress={handlePdf}
            >
              <View
                style={[styles.optionIcon, { backgroundColor: "#fee2e2" }]}
              >
                <FileText size={22} color="#991b1b" />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: c.text }]}>
                  PDF
                </Text>
                <Text style={[styles.optionDesc, { color: c.textSecondary }]}>
                  Listo para imprimir o compartir
                </Text>
              </View>
            </TouchableOpacity>

            {/* Cancelar */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancel}
            >
              <Text style={[styles.cancelText, { color: c.textSecondary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
  },
  sheetSubtitle: {
    fontSize: 13,
    marginBottom: 6,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 14,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: "600" },
  optionDesc: { fontSize: 12, marginTop: 2 },
  cancel: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 4,
  },
  cancelText: { fontSize: 14, fontWeight: "500" },
});