import { useCallback, useState } from "react";

export type ReportType = string; // id del reporte seleccionado

export function useReportModal() {
  const [visible, setVisible] = useState(false);
  const [reportType, setReportType] = useState<ReportType | null>(null);

  const open = useCallback((type: ReportType) => {
    setReportType(type);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  const resetType = useCallback(() => {
    setReportType(null);
  }, []);

  return { visible, reportType, open, close, resetType };
}
