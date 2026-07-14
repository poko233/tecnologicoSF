import { Estudiante } from "../types/asignaciones.types";

export type CarreraFiltro = {
  idCarrera: number | string;
  nombreCarrera: string;
  codigo?: string | null;
  regimen?: string | null;
  tipo?: string | null;
  nivelesAcademicos?: Array<string | number | null | undefined>;
  niveles?: Array<string | number | null | undefined>;
};

export type NivelPorCarrera = {
  idCarrera?: number | string | null;
  nombreCarrera?: string | null;
  regimen?: string | null;
  tipo?: string | null;
  tipoNivel?: string | null;
  niveles?: Array<string | number | null | undefined>;
};

export type EstudianteTabla = Estudiante & {
  matricula?: string | null;
  fechaInscripcion?: string | null;
  anioInscripcion?: string | number | null;
  yaInscrito?: boolean | number | string | null;

  carreras?: CarreraFiltro[];
  nivelesAcademicos?: Array<string | number | null | undefined>;
  nivelesPorCarrera?: NivelPorCarrera[];
  tipoCarrera?: string | null;
  regimenCarrera?: string | null;
};

export function estaInscrito(valor: EstudianteTabla["yaInscrito"]): boolean {
  return valor === true || valor === 1 || valor === "1";
}

export function limpiarTexto(value?: string | number | null): string {
  return String(value ?? "").trim();
}

export function ordenarTexto(a: string, b: string): number {
  return a.localeCompare(b, "es", {
    numeric: true,
    sensitivity: "base",
  });
}

export function normalizarTipoCarrera(tipo?: string | null): string {
  const value = limpiarTexto(tipo).toUpperCase();

  if (value.includes("CURSO")) return "CURSO";
  if (value.includes("CARRERA")) return "CARRERA";

  return value || "";
}

export function obtenerTipoCarreraLabel(tipo?: string | null): string {
  const value = normalizarTipoCarrera(tipo);

  if (value === "CURSO") return "Curso";
  if (value === "CARRERA") return "Carrera";

  return "Sin tipo";
}

export function normalizarRegimen(regimen?: string | null): string {
  const value = limpiarTexto(regimen).toUpperCase();

  if (value.includes("ANUAL")) return "ANUAL";
  if (value.includes("MENSUAL")) return "MENSUAL";

  return "SEMESTRAL";
}

export function obtenerLabelNivelPorRegimen(regimen?: string | null): string {
  const value = normalizarRegimen(regimen);

  if (value === "ANUAL") return "Año";
  if (value === "MENSUAL") return "Mes";

  return "Semestre";
}

export function obtenerNivelTexto(
  carrera?: CarreraFiltro | null,
  nivel?: string | number | null,
): string {
  if (nivel === null || nivel === undefined || nivel === "") {
    return "Sin nivel";
  }

  return `${obtenerLabelNivelPorRegimen(carrera?.regimen)} ${nivel}`;
}

export function obtenerNivelesCarrera(
  carrera?: CarreraFiltro | null,
): number[] {
  if (!carrera) return [];

  const source = Array.isArray(carrera.nivelesAcademicos)
    ? carrera.nivelesAcademicos
    : Array.isArray(carrera.niveles)
      ? carrera.niveles
      : [];

  const niveles = source
    .map((nivel) => Number(nivel))
    .filter((nivel) => Number.isFinite(nivel) && nivel > 0);

  return Array.from(new Set(niveles)).sort((a, b) => a - b);
}

export function obtenerIniciales(nombreCompleto: string): string {
  const nombre = limpiarTexto(nombreCompleto).replace(/\s+/g, " ");

  if (!nombre) return "E";

  const partes = nombre.split(" ").filter(Boolean);

  if (partes.length === 1) {
    return partes[0].charAt(0).toUpperCase();
  }

  return `${partes[0].charAt(0)}${partes[1].charAt(0)}`.toUpperCase();
}

export function nombreCompleto(estudiante: EstudianteTabla): string {
  return `${estudiante.nombres ?? ""} ${estudiante.apellidoPaterno ?? ""} ${
    estudiante.apellidoMaterno ?? ""
  }`
    .replace(/\s+/g, " ")
    .trim();
}

export function formatearFecha(fecha?: string | null): string {
  if (!fecha) return "Sin fecha";

  const limpia = String(fecha).includes("T")
    ? String(fecha).split("T")[0]
    : String(fecha).includes(" ")
      ? String(fecha).split(" ")[0]
      : String(fecha);

  if (!limpia.includes("-")) return limpia;

  const [year, month, day] = limpia.split("-");

  if (!year || !month || !day) return limpia;

  return `${day}/${month}/${year}`;
}

export function obtenerAnioInscripcion(estudiante: EstudianteTabla): string {
  if (estudiante.anioInscripcion) {
    return String(estudiante.anioInscripcion);
  }

  const rawCreatedAt = (estudiante as any).created_at;
  const rawFecha = estudiante.fechaInscripcion;

  if (rawCreatedAt) {
    return String(rawCreatedAt).slice(0, 4);
  }

  if (rawFecha) {
    return String(rawFecha).slice(0, 4);
  }

  return "—";
}

export function obtenerCarrerasEstudiante(
  estudiante: EstudianteTabla,
): CarreraFiltro[] {
  const raw = estudiante as any;

  const carreras: CarreraFiltro[] = Array.isArray(raw.carreras)
    ? raw.carreras
        .map((carrera: any): CarreraFiltro => ({
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
          nivelesAcademicos: Array.isArray(carrera?.nivelesAcademicos)
            ? carrera.nivelesAcademicos
            : [],
        }))
        .filter((carrera: CarreraFiltro) => {
          return limpiarTexto(carrera.idCarrera) && carrera.nombreCarrera;
        })
    : [];

  const idCarreraDirecta = limpiarTexto(
    raw.idCarrera || raw.carrera?.idCarrera || raw.id_carrera,
  );

  const carreraDirecta = limpiarTexto(
    raw.carreraNombre ||
      raw.nombreCarrera ||
      raw.carrera ||
      raw.carrera_nombre ||
      raw.carrera?.nombreCarrera ||
      raw.carrera?.nombre,
  );

  const regimenDirecto = limpiarTexto(
    raw.regimenCarrera || raw.carrera?.regimen,
  );

  const tipoDirecto = limpiarTexto(raw.tipoCarrera || raw.carrera?.tipo);

  if (idCarreraDirecta && carreraDirecta) {
    carreras.push({
      idCarrera: idCarreraDirecta,
      nombreCarrera: carreraDirecta,
      codigo: "",
      regimen: regimenDirecto,
      tipo: tipoDirecto,
    });
  }

  const map = new Map<string, CarreraFiltro>();

  carreras.forEach((carrera) => {
    const key = String(carrera.idCarrera);

    if (!map.has(key)) {
      map.set(key, carrera);
    }
  });

  return Array.from(map.values());
}

export function obtenerNivelesDeCarreraEstudiante(
  estudiante: EstudianteTabla,
  idCarrera?: string | number | null,
): string[] {
  const raw = estudiante as any;

  if (!idCarrera) {
    const niveles: string[] = Array.isArray(raw.nivelesAcademicos)
      ? raw.nivelesAcademicos
          .map((nivel: string | number | null | undefined) =>
            limpiarTexto(nivel),
          )
          .filter(Boolean)
      : [];

    return Array.from(new Set<string>(niveles));
  }

  const nivelesPorCarrera: NivelPorCarrera[] = Array.isArray(
    raw.nivelesPorCarrera,
  )
    ? raw.nivelesPorCarrera
    : [];

  const encontrado = nivelesPorCarrera.find((item) => {
    return String(item?.idCarrera ?? "") === String(idCarrera);
  });

  if (!encontrado) return [];

  const niveles: string[] = Array.isArray(encontrado.niveles)
    ? encontrado.niveles
        .map((nivel) => limpiarTexto(nivel))
        .filter(Boolean)
    : [];

  return Array.from(new Set<string>(niveles));
}

export function obtenerNivelesTexto(
  estudiante: EstudianteTabla,
  idCarrera?: string | number | null,
): string {
  const niveles = obtenerNivelesDeCarreraEstudiante(estudiante, idCarrera);

  return niveles.length > 0 ? niveles.join(", ") : "Sin nivel";
}

export function uniqueCarreras(carreras: CarreraFiltro[]): CarreraFiltro[] {
  const map = new Map<string, CarreraFiltro>();

  carreras.forEach((carrera) => {
    const key = String(carrera.idCarrera);

    if (!map.has(key)) {
      map.set(key, carrera);
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    ordenarTexto(a.nombreCarrera, b.nombreCarrera),
  );
}

export function uniqueSorted(
  values: Array<string | number | null | undefined>,
): string[] {
  const limpios = values.map((value) => limpiarTexto(value)).filter(Boolean);

  return Array.from(new Set<string>(limpios)).sort(ordenarTexto);
}