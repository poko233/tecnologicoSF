import {
  ORDEN_PLAN_NO_CONFIGURADO,
  PLANES_ESTUDIO_CONFIG,
  PlanEstudiosConfigurado,
} from "../config/planesEstudio.config";
import {
  EstadoMateriaHistorialEstudiante,
  EstudianteUsuario,
  MateriaHistorialEstudiante,
} from "../types/estudiante.types";

function limpiarTexto(value?: string | number | null) {
  return String(value ?? "").trim();
}

function unique(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
}

export function nombreCompleto(estudiante: EstudianteUsuario | null) {
  if (!estudiante) return "Estudiante";

  return `${estudiante.nombres || ""} ${estudiante.apellidoPaterno || ""} ${
    estudiante.apellidoMaterno || ""
  }`.trim();
}

export function obtenerIniciales(estudiante: EstudianteUsuario) {
  const nombre = nombreCompleto(estudiante);

  if (!nombre || nombre === "Estudiante") return "E";

  const partes = nombre.split(" ").filter(Boolean);

  if (partes.length === 1) {
    return partes[0].charAt(0).toUpperCase();
  }

  return `${partes[0].charAt(0)}${partes[1].charAt(0)}`.toUpperCase();
}

export function obtenerReferencia(estudiante: EstudianteUsuario | null) {
  if (!estudiante) return null;

  const raw =
    estudiante.numeroReferencias ?? estudiante.numero_referencias ?? null;

  return Array.isArray(raw) ? raw[0] : raw;
}

export function obtenerRoles(estudiante: EstudianteUsuario) {
  return (
    estudiante.roles
      ?.map((rol) => rol.rol)
      .filter(Boolean)
      .join(", ") || "Estudiante"
  );
}

export function formatearFecha(fecha?: string | null) {
  if (!fecha) return "No registrado";

  const soloFecha = fecha.includes("T")
    ? fecha.split("T")[0]
    : fecha.includes(" ")
      ? fecha.split(" ")[0]
      : fecha;

  const partes = soloFecha.split("-");

  if (partes.length !== 3) return soloFecha;

  const [year, month, day] = partes;

  return `${day}/${month}/${year}`;
}

export function obtenerPromocionActual(estudiante: EstudianteUsuario | null) {
  if (!estudiante) return "";

  const promocionDirecta = estudiante.observacionPromociones?.trim();

  if (promocionDirecta) {
    return promocionDirecta;
  }

  const primeraPromocion = estudiante.promociones?.[0]?.descripcion?.trim();

  return primeraPromocion || "";
}

export function obtenerMatricula(estudiante: EstudianteUsuario | null) {
  if (!estudiante) return "Sin matrícula";

  return estudiante.matricula && String(estudiante.matricula).trim() !== ""
    ? String(estudiante.matricula)
    : "Sin matrícula";
}

export function obtenerFechaInscripcion(estudiante: EstudianteUsuario | null) {
  return formatearFecha(
    estudiante?.fechaInscripcion || estudiante?.created_at || null,
  );
}

export function normalizarRegimen(regimen?: string | null) {
  const value = limpiarTexto(regimen).toUpperCase();

  if (value.includes("ANUAL")) return "ANUAL";
  if (value.includes("MENSUAL")) return "MENSUAL";

  return "SEMESTRAL";
}

export function obtenerLabelNivelPorRegimen(regimen?: string | null) {
  const value = normalizarRegimen(regimen);

  if (value === "ANUAL") return "Año";
  if (value === "MENSUAL") return "Mes";

  return "Semestre";
}

export function normalizarTipoCarrera(tipo?: string | null) {
  const value = limpiarTexto(tipo).toUpperCase();

  if (value.includes("CURSO")) return "CURSO";
  if (value.includes("CARRERA")) return "CARRERA";

  return value || "SIN TIPO";
}

export function obtenerTipoCarreraLabel(tipo?: string | null) {
  const normalizado = normalizarTipoCarrera(tipo);

  if (normalizado === "CURSO") return "Curso";
  if (normalizado === "CARRERA") return "Carrera";

  return "Sin tipo";
}

export function obtenerCarrerasEstudiante(estudiante: EstudianteUsuario) {
  const raw = estudiante as any;

  const carrerasArray = Array.isArray(raw.carreras)
    ? raw.carreras
        .map((carrera: any) => ({
          idCarrera:
            carrera?.idCarrera !== undefined && carrera?.idCarrera !== null
              ? String(carrera.idCarrera)
              : "",
          nombreCarrera: limpiarTexto(
            carrera?.nombreCarrera ||
              carrera?.nombre ||
              carrera?.carrera ||
              carrera?.nombre_carrera,
          ),
          codigo: limpiarTexto(carrera?.codigo),
          regimen: limpiarTexto(carrera?.regimen),
          tipo: limpiarTexto(carrera?.tipo || carrera?.tipoCarrera),
        }))
        .filter((carrera: any) => carrera.idCarrera && carrera.nombreCarrera)
    : [];

  const carreraDirecta = limpiarTexto(
    raw.carreraNombre ||
      raw.nombreCarrera ||
      raw.carrera ||
      raw.carrera_nombre ||
      raw.carrera?.nombreCarrera ||
      raw.carrera?.nombre,
  );

  const idCarreraDirecta = limpiarTexto(
    raw.idCarrera || raw.carrera?.idCarrera,
  );

  const regimenDirecto = limpiarTexto(
    raw.regimenCarrera || raw.carrera?.regimen,
  );

  const tipoDirecto = limpiarTexto(raw.tipoCarrera || raw.carrera?.tipo);

  if (carreraDirecta && idCarreraDirecta) {
    carrerasArray.push({
      idCarrera: idCarreraDirecta,
      nombreCarrera: carreraDirecta,
      codigo: "",
      regimen: regimenDirecto,
      tipo: tipoDirecto,
    });
  }

  const map = new Map<string, any>();

  carrerasArray.forEach((carrera: any) => {
    if (!map.has(carrera.idCarrera)) {
      map.set(carrera.idCarrera, carrera);
    }
  });

  return Array.from(map.values());
}

export function obtenerCarrerasTexto(estudiante: EstudianteUsuario) {
  const carreras = obtenerCarrerasEstudiante(estudiante).map(
    (carrera: any) => carrera.nombreCarrera,
  );

  return carreras.length > 0 ? unique(carreras).join(", ") : "Sin carrera";
}

export function obtenerTiposCarreraEstudiante(estudiante: EstudianteUsuario) {
  const tipos = obtenerCarrerasEstudiante(estudiante)
    .map((carrera: any) => normalizarTipoCarrera(carrera.tipo))
    .filter((tipo) => tipo && tipo !== "SIN TIPO");

  return unique(tipos);
}

export function obtenerTiposCarreraTexto(estudiante: EstudianteUsuario) {
  const tipos = obtenerTiposCarreraEstudiante(estudiante).map((tipo) =>
    obtenerTipoCarreraLabel(tipo),
  );

  return tipos.length > 0 ? unique(tipos).join(", ") : "Sin tipo";
}

export function obtenerNivelesDeCarreraEstudiante(
  estudiante: EstudianteUsuario,
  idCarrera?: string,
) {
  const raw = estudiante as any;

  if (!idCarrera) {
    const niveles = Array.isArray(raw.nivelesAcademicos)
      ? raw.nivelesAcademicos.map((nivel: any) => limpiarTexto(nivel))
      : [];

    return unique(niveles);
  }

  const nivelesPorCarrera = Array.isArray(raw.nivelesPorCarrera)
    ? raw.nivelesPorCarrera
    : [];

  const encontrado = nivelesPorCarrera.find((item: any) => {
    return String(item?.idCarrera ?? "") === String(idCarrera);
  });

  if (!encontrado) return [];

  const niveles = Array.isArray(encontrado.niveles)
    ? encontrado.niveles.map((nivel: any) => limpiarTexto(nivel))
    : [];

  return unique(niveles);
}

export function obtenerNivelesTexto(estudiante: EstudianteUsuario) {
  const niveles = obtenerNivelesDeCarreraEstudiante(estudiante);

  return niveles.length > 0 ? niveles.join(", ") : "Sin nivel";
}

export function esEstadoActivo(estado?: string | null) {
  return String(estado || "").toUpperCase() === "ACTIVO";
}

export function normalizarEstado(estado?: string | null) {
  const value = String(estado || "").toUpperCase();

  if (value === "ACTIVO") return "ACTIVO";
  if (value === "INACTIVO") return "INACTIVO";

  return "SIN ESTADO";
}

export function formatearNotaFinal(nota?: number | string | null) {
  if (nota === null || nota === undefined || nota === "") {
    return "Sin nota";
  }

  const numero = Number(nota);

  if (Number.isNaN(numero)) {
    return String(nota);
  }

  return Number.isInteger(numero) ? String(numero) : numero.toFixed(2);
}

export function obtenerEstadoMateriaLabel(
  estado?: EstadoMateriaHistorialEstudiante | string | null,
) {
  const value = String(estado || "").toUpperCase();

  if (value === "APROBADO") return "Aprobado";
  if (value === "REPROBADO") return "Reprobado";
  if (value === "INSCRITO") return "Inscrito";
  if (value === "PENDIENTE") return "Pendiente";

  return "Sin estado";
}

const ORDINALES: Record<number, string> = {
  1: "Primer",
  2: "Segundo",
  3: "Tercer",
  4: "Cuarto",
  5: "Quinto",
  6: "Sexto",
  7: "Séptimo",
  8: "Octavo",
  9: "Noveno",
  10: "Décimo",
};

export function obtenerLabelNivelHistorialEstudiante(
  nivel: number,
  regimen?: string | null,
) {
  const numero = Number(nivel || 0);
  const prefijo = ORDINALES[numero] || `${numero}.`;
  const tipoNivel = obtenerLabelNivelPorRegimen(regimen);

  return `${prefijo} ${tipoNivel}`;
}


/**
 * Normaliza nombres y códigos para que el orden funcione aunque el backend
 * devuelva tildes, espacios, guiones o mayúsculas diferentes.
 */
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

function obtenerPlanMateria(
  materia: MateriaHistorialEstudiante,
): PlanEstudiosConfigurado | null {
  return (
    PLANES_ESTUDIO_CONFIG.find((plan) =>
      carreraCoincideConPlan(
        plan,
        materia.nombreCarrera,
        materia.codigoCarrera,
      ),
    ) ?? null
  );
}

/**
 * Devuelve la posición visual de la materia en el plan configurado.
 *
 * 1. Intenta coincidir por el código completo.
 * 2. Como respaldo, utiliza el número final del código cuando es único dentro
 *    del nivel. Esto soporta pequeñas diferencias históricas de prefijo.
 * 3. Si no existe configuración, devuelve 9999 y la materia permanece visible
 *    al final del nivel.
 */
export function obtenerOrdenMateriaPlan(
  materia: MateriaHistorialEstudiante,
): number {
  const plan = obtenerPlanMateria(materia);

  if (!plan) return ORDEN_PLAN_NO_CONFIGURADO;

  const nivel = Number(materia.nivel || 0);
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

  const numeroMateria = extraerNumeroCodigoMateria(materia.codigoMateria);

  if (numeroMateria) {
    const coincidenciasPorNumero = codigosNivel
      .map((codigo, index) => ({
        index,
        numero: extraerNumeroCodigoMateria(codigo),
      }))
      .filter((item) => item.numero === numeroMateria);

    if (coincidenciasPorNumero.length === 1) {
      return coincidenciasPorNumero[0].index + 1;
    }
  }

  return ORDEN_PLAN_NO_CONFIGURADO;
}

function compararMateriasPorPlan(
  a: MateriaHistorialEstudiante,
  b: MateriaHistorialEstudiante,
): number {
  const ordenA = obtenerOrdenMateriaPlan(a);
  const ordenB = obtenerOrdenMateriaPlan(b);

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

export type HistorialEstudianteNivelAgrupado = {
  nivel: number;
  label: string;
  materias: MateriaHistorialEstudiante[];
};

export type HistorialEstudianteCarreraAgrupada = {
  idCarrera: number;
  nombreCarrera: string;
  codigoCarrera?: string | null;
  regimen?: string | null;
  tipoCarrera?: string | null;
  niveles: HistorialEstudianteNivelAgrupado[];
};

export function agruparHistorialEstudiantePorCarreraNivel(
  materias: MateriaHistorialEstudiante[],
): HistorialEstudianteCarreraAgrupada[] {
  const carrerasMap = new Map<number, HistorialEstudianteCarreraAgrupada>();

  materias.forEach((materia) => {
    const idCarrera = Number(materia.idCarrera);

    if (!carrerasMap.has(idCarrera)) {
      carrerasMap.set(idCarrera, {
        idCarrera,
        nombreCarrera: materia.nombreCarrera,
        codigoCarrera: materia.codigoCarrera,
        regimen: materia.regimen,
        tipoCarrera: materia.tipoCarrera,
        niveles: [],
      });
    }

    const carrera = carrerasMap.get(idCarrera)!;
    const nivelMateria = Number(materia.nivel || 0);

    let nivel = carrera.niveles.find((item) => item.nivel === nivelMateria);

    if (!nivel) {
      nivel = {
        nivel: nivelMateria,
        label: obtenerLabelNivelHistorialEstudiante(
          nivelMateria,
          materia.regimen,
        ),
        materias: [],
      };

      carrera.niveles.push(nivel);
    }

    nivel.materias.push(materia);
  });

  return Array.from(carrerasMap.values()).map((carrera) => ({
    ...carrera,
    niveles: [...carrera.niveles]
      .sort((a, b) => a.nivel - b.nivel)
      .map((nivel) => ({
        ...nivel,
        /*
         * Se ordena una copia para no modificar los arreglos originales que
         * también utilizan los filtros, resúmenes y detalles del historial.
         */
        materias: [...nivel.materias].sort(compararMateriasPorPlan),
      })),
  }));
}

export function normalizarBusqueda(value?: string | number | null) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}