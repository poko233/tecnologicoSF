import type {
    PlanEstudiosConfigurado,
} from "../../estudiante/config/planesEstudio.config";
import {
    ORDEN_PLAN_NO_CONFIGURADO,
    PLANES_ESTUDIO_CONFIG,
} from "../../estudiante/config/planesEstudio.config";

/**
 * Estructura mínima necesaria para ordenar materias en Asignaciones.
 * Funciona con MateriaSemestreUno, MateriaPendienteAnterior,
 * InscripcionDetalle y SeleccionMateriaInscripcion.
 */
export type MateriaOrdenableAsignacion = {
  nombreCarrera?: string | null;
  codigoCarrera?: string | null;
  nombreMateria?: string | null;
  codigoMateria?: string | null;
  nivel?: number | string | null;
  semestre?: number | string | null;
};

export type ContextoOrdenPlanAsignacion = {
  nombreCarrera?: string | null;
  codigoCarrera?: string | null;
};

function normalizarClavePlan(value?: string | number | null): string {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

function extraerNumeroCodigoMateria(
  value?: string | number | null,
): string | null {
  const normalizado = normalizarClavePlan(value);
  const coincidencia = normalizado.match(/(\d{2,4})$/);

  return coincidencia?.[1] ?? null;
}

function carreraCoincideConPlan(
  plan: PlanEstudiosConfigurado,
  nombreCarrera?: string | null,
  codigoCarrera?: string | null,
): boolean {
  const identificadores = [nombreCarrera, codigoCarrera]
    .map(normalizarClavePlan)
    .filter(Boolean);

  if (identificadores.length === 0) return false;

  return plan.aliases.some((alias) => {
    const aliasNormalizado = normalizarClavePlan(alias);

    if (!aliasNormalizado) return false;

    return identificadores.some((identificador) => {
      return (
        identificador === aliasNormalizado ||
        identificador.includes(aliasNormalizado) ||
        aliasNormalizado.includes(identificador)
      );
    });
  });
}

function obtenerNivelMateria(materia: MateriaOrdenableAsignacion): number {
  const value = materia.nivel ?? materia.semestre ?? 0;
  const nivel = Number(value);

  return Number.isFinite(nivel) && nivel > 0 ? nivel : 0;
}

function obtenerPlanMateria(
  materia: MateriaOrdenableAsignacion,
  contexto?: ContextoOrdenPlanAsignacion,
): PlanEstudiosConfigurado | null {
  const nombreCarrera =
    materia.nombreCarrera ?? contexto?.nombreCarrera ?? null;
  const codigoCarrera =
    materia.codigoCarrera ?? contexto?.codigoCarrera ?? null;

  return (
    PLANES_ESTUDIO_CONFIG.find((plan) =>
      carreraCoincideConPlan(plan, nombreCarrera, codigoCarrera),
    ) ?? null
  );
}

/**
 * Obtiene la posición de una materia dentro del plan configurado.
 * Las materias no configuradas permanecen visibles al final.
 */
export function obtenerOrdenMateriaAsignacion(
  materia: MateriaOrdenableAsignacion,
  contexto?: ContextoOrdenPlanAsignacion,
): number {
  const plan = obtenerPlanMateria(materia, contexto);

  if (!plan) return ORDEN_PLAN_NO_CONFIGURADO;

  const nivel = obtenerNivelMateria(materia);
  const codigosNivel = plan.niveles[nivel] ?? [];

  if (codigosNivel.length === 0) {
    return ORDEN_PLAN_NO_CONFIGURADO;
  }

  const codigoMateria = normalizarClavePlan(materia.codigoMateria);

  if (codigoMateria) {
    const indiceExacto = codigosNivel.findIndex(
      (codigo) => normalizarClavePlan(codigo) === codigoMateria,
    );

    if (indiceExacto >= 0) {
      return indiceExacto + 1;
    }
  }

  /*
   * Respaldo para códigos históricos con un prefijo distinto, siempre que el
   * número final sea único dentro del mismo nivel del plan.
   */
  const numeroMateria = extraerNumeroCodigoMateria(materia.codigoMateria);

  if (numeroMateria) {
    const coincidencias = codigosNivel
      .map((codigo, index) => ({
        index,
        numero: extraerNumeroCodigoMateria(codigo),
      }))
      .filter((item) => item.numero === numeroMateria);

    if (coincidencias.length === 1) {
      return coincidencias[0].index + 1;
    }
  }

  return ORDEN_PLAN_NO_CONFIGURADO;
}

export function compararMateriasAsignacionPorPlan(
  a: MateriaOrdenableAsignacion,
  b: MateriaOrdenableAsignacion,
  contexto?: ContextoOrdenPlanAsignacion,
): number {
  const nivelA = obtenerNivelMateria(a);
  const nivelB = obtenerNivelMateria(b);

  if (nivelA !== nivelB) {
    return nivelA - nivelB;
  }

  const ordenA = obtenerOrdenMateriaAsignacion(a, contexto);
  const ordenB = obtenerOrdenMateriaAsignacion(b, contexto);

  if (ordenA !== ordenB) {
    return ordenA - ordenB;
  }

  const comparacionCodigo = String(a.codigoMateria ?? "").localeCompare(
    String(b.codigoMateria ?? ""),
    "es",
    {
      numeric: true,
      sensitivity: "base",
    },
  );

  if (comparacionCodigo !== 0) {
    return comparacionCodigo;
  }

  return String(a.nombreMateria ?? "").localeCompare(
    String(b.nombreMateria ?? ""),
    "es",
    {
      numeric: true,
      sensitivity: "base",
    },
  );
}

/**
 * Ordena una copia del arreglo. No altera las materias originales utilizadas
 * por filtros, selección, cupos o guardado.
 */
export function ordenarMateriasAsignacionPorPlan<
  T extends MateriaOrdenableAsignacion,
>(
  materias: T[],
  contexto?: ContextoOrdenPlanAsignacion,
): T[] {
  return [...materias].sort((a, b) =>
    compararMateriasAsignacionPorPlan(a, b, contexto),
  );
}
