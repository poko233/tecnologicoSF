import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/theme/useTheme";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { ReportModal } from "./components/ReportModal";
import { ReportsGrid } from "./components/ReportsGrid";
import { useReportData } from "./hooks/useReportData";
import { useReportModal } from "./hooks/useReportModal";

export function ReportesScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { isMobile } = useResponsive();
  const { reportCards } = useReportData();  // 👈 Solo reportCards
  const { visible, reportType, open, close, resetType } = useReportModal();

  const handlePrintReport = (id: string) => {
    open(id);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <View style={styles.container}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <Text style={[styles.pageTitle, { color: c.text }]}>
            Módulo de Reportes
          </Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            Genere reportes institucionales con filtros personalizados
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 👈 Sin summaryRow, sin SummaryCard */}

          <View style={styles.gridWrapper}>
            <ReportsGrid reports={reportCards} onPrint={handlePrintReport} />
          </View>
        </ScrollView>
      </View>

      <ReportModal
        visible={visible}
        reportType={reportType}
        onClose={() => {
          close();
          setTimeout(resetType, 350);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  gridWrapper: {
    flex: 1,
  },
});