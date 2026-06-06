import { useMemo } from "react";

export function useNotasCalculations(
  ecScores: (number | null)[],
  notaAsistencia: number,
) {
  const resultado = useMemo(() => {
    const validScores = ecScores.filter((s): s is number => s !== null);
    if (validScores.length === 0) {
      return { notaFinal: 0, estado: "Reprobado" as const };
    }
    const promedio =
      validScores.reduce((sum, s) => sum + s, 0) / validScores.length;
    const notaAcademica = promedio * 0.9;
    const notaFinal = Math.min(notaAcademica + notaAsistencia, 100);
    const notaFinalRedondeada = Math.round(notaFinal * 100) / 100;
    const estado =
      notaFinalRedondeada >= 51
        ? ("Aprobado" as const)
        : ("Reprobado" as const);
    return { notaFinal: notaFinalRedondeada, estado };
  }, [ecScores, notaAsistencia]);

  return resultado;
}
