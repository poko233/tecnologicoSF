import { DocumentoEstudiante, EstudianteUsuario } from "../types/estudiante.types";
import {
  normalizarBusqueda,
  obtenerCarrerasEstudiante,
  obtenerCarrerasTexto,
  obtenerFechaInscripcion,
  obtenerMatricula,
  obtenerNivelesDeCarreraEstudiante,
  obtenerNivelesTexto,
  obtenerPromocionActual,
  obtenerReferencia,
  obtenerRoles,
  obtenerTiposCarreraEstudiante,
  obtenerTiposCarreraTexto,
} from "./estudiante.helpers";

export type EstadoDocumentacionFiltro = "" | "completos" | "faltantes";

export type FiltrosEstudiantes = {
  tipo: string;
  idCarrera: string;
  nivel: string;
  documentos: EstadoDocumentacionFiltro;
};

export type OrdenEstudiantes =
  | "inscripcion_desc"
  | "inscripcion_asc"
  | "alfabetico";

export const ORDEN_ESTUDIANTES_OPTIONS: Array<{
  value: OrdenEstudiantes;
  label: string;
}> = [
  { value: "inscripcion_desc", label: "Inscripción más reciente" },
  { value: "inscripcion_asc", label: "Inscripción más antigua" },
  { value: "alfabetico", label: "Alfabético A-Z" },
];

export const DOCUMENTACION_ESTUDIANTES_OPTIONS: Array<{
  value: EstadoDocumentacionFiltro;
  label: string;
}> = [
  { value: "", label: "Todos" },
  { value: "completos", label: "Documentación completa" },
  { value: "faltantes", label: "Con documentos faltantes" },
];

type DocumentoRequerido = {
  tipos: string[];
  nombres: string[];
};

const DOCUMENTOS_REQUERIDOS: DocumentoRequerido[] = [
  {
    tipos: ["carnet_identidad", "documento_identidad", "ci"],
    nombres: [
      "carnet de identidad",
      "carnet identidad",
      "fotocopia de carnet",
      "fotocopia carnet",
      "documento de identidad",
      "documento identidad",
      "ci",
      "carnet",
    ],
  },
  {
    tipos: ["certificado_nacimiento"],
    nombres: [
      "certificado de nacimiento",
      "certificado nacimiento",
      "nacimiento",
    ],
  },
  {
    tipos: ["titulo_bachiller", "titulo_de_bachiller"],
    nombres: [
      "titulo de bachiller",
      "titulo bachiller",
      "bachiller",
      "diploma de bachiller",
      "fotocopia legalizada",
    ],
  },
];

function normalizarTexto(value?: string | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\-.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizarTipo(value?: string | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function documentoEntregado(documento: DocumentoEstudiante): boolean {
  const estado = normalizarTexto(documento.estadoDocumento);
  const tieneArchivo = Boolean(
    String(documento.archivoUrl || documento.ubicacionArchivo || "").trim(),
  );

  if (["debe", "faltante", "pendiente", "rechazado", "0"].includes(estado)) {
    return false;
  }

  if (
    ["entregado", "presentado", "aprobado", "activo", "1"].includes(estado)
  ) {
    return true;
  }

  return tieneArchivo;
}

function documentoCoincide(
  documento: DocumentoEstudiante,
  requerido: DocumentoRequerido,
): boolean {
  if (!documentoEntregado(documento)) return false;

  const tipo = normalizarTipo(documento.tipo);

  if (tipo) {
    return requerido.tipos.map(normalizarTipo).includes(tipo);
  }

  const nombre = normalizarTexto(documento.nombreDocumento);

  return Boolean(nombre) && requerido.nombres.map(normalizarTexto).includes(nombre);
}

export function obtenerResumenDocumentacion(estudiante: EstudianteUsuario): {
  presentados: number;
  faltantes: number;
  total: number;
  completo: boolean;
} {
  const documentos = Array.isArray(estudiante.documentos)
    ? estudiante.documentos
    : [];

  const presentados = DOCUMENTOS_REQUERIDOS.filter((requerido) =>
    documentos.some((documento) => documentoCoincide(documento, requerido)),
  ).length;

  const total = DOCUMENTOS_REQUERIDOS.length;
  const faltantes = Math.max(0, total - presentados);

  return {
    presentados,
    faltantes,
    total,
    completo: faltantes === 0,
  };
}

export function obtenerDocumentacionEstudiantesLabel(
  estado: EstadoDocumentacionFiltro,
): string {
  return (
    DOCUMENTACION_ESTUDIANTES_OPTIONS.find((item) => item.value === estado)
      ?.label ?? "Todos"
  );
}

function ordenarTexto(a: string, b: string): number {
  return a.localeCompare(b, "es", {
    numeric: true,
    sensitivity: "base",
    ignorePunctuation: true,
  });
}

function obtenerNombreParaOrden(estudiante: EstudianteUsuario): string {
  return [
    estudiante.apellidoPaterno,
    estudiante.apellidoMaterno,
    estudiante.nombres,
    estudiante.ci,
  ]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

function parsearFechaInscripcion(estudiante: EstudianteUsuario): number {
  const raw = String(
    estudiante.fechaInscripcion || estudiante.created_at || "",
  ).trim();

  if (!raw) return Number(estudiante.id || 0);

  const iso = raw.includes("T")
    ? raw.split("T")[0]
    : raw.includes(" ")
      ? raw.split(" ")[0]
      : raw;

  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [year, month, day] = iso.split("-").map(Number);
    const timestamp = new Date(year, month - 1, day).getTime();

    if (Number.isFinite(timestamp)) return timestamp;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(iso)) {
    const [day, month, year] = iso.split("/").map(Number);
    const timestamp = new Date(year, month - 1, day).getTime();

    if (Number.isFinite(timestamp)) return timestamp;
  }

  const timestamp = Date.parse(raw);

  return Number.isFinite(timestamp)
    ? timestamp
    : Number(estudiante.id || 0);
}

function construirTextoBusqueda(estudiante: EstudianteUsuario): string {
  const referencia = obtenerReferencia(estudiante);
  const promocion = obtenerPromocionActual(estudiante);
  const matricula = obtenerMatricula(estudiante);
  const fechaInscripcion = obtenerFechaInscripcion(estudiante);
  const resumenDocumentacion = obtenerResumenDocumentacion(estudiante);

  return normalizarBusqueda(
    [
      estudiante.usuario,
      estudiante.ci,
      estudiante.nombres,
      estudiante.apellidoPaterno,
      estudiante.apellidoMaterno,
      estudiante.email,
      estudiante.telefono,
      estudiante.celular,
      estudiante.estado,
      estudiante.expedido,
      promocion,
      matricula,
      fechaInscripcion,
      obtenerRoles(estudiante),
      obtenerTiposCarreraTexto(estudiante),
      obtenerCarrerasTexto(estudiante),
      obtenerNivelesTexto(estudiante),
      referencia?.nombreContactoReferencia,
      referencia?.parentesco,
      referencia?.numeroReferencia,
      resumenDocumentacion.completo
        ? "documentacion completa"
        : "documentos faltantes",
      `${resumenDocumentacion.presentados} de ${resumenDocumentacion.total}`,
    ].join(" "),
  );
}

export function obtenerOrdenEstudiantesLabel(
  orden: OrdenEstudiantes,
): string {
  return (
    ORDEN_ESTUDIANTES_OPTIONS.find((item) => item.value === orden)?.label ??
    "Inscripción más reciente"
  );
}

export function filtrarYOrdenarEstudiantes(
  estudiantes: EstudianteUsuario[],
  filtros: FiltrosEstudiantes,
  busqueda: string,
  orden: OrdenEstudiantes,
): EstudianteUsuario[] {
  const termino = normalizarBusqueda(busqueda);

  const filtrados = estudiantes.filter((estudiante) => {
    const carreras = obtenerCarrerasEstudiante(estudiante);
    const tipos = obtenerTiposCarreraEstudiante(estudiante);
    const niveles = obtenerNivelesDeCarreraEstudiante(
      estudiante,
      filtros.idCarrera,
    );
    const resumenDocumentacion = obtenerResumenDocumentacion(estudiante);

    const cumpleTipo = !filtros.tipo || tipos.includes(filtros.tipo);

    const cumpleCarrera =
      !filtros.idCarrera ||
      carreras.some(
        (carrera: any) =>
          String(carrera.idCarrera) === String(filtros.idCarrera),
      );

    const cumpleNivel =
      !filtros.nivel || niveles.includes(filtros.nivel);

    const cumpleDocumentacion =
      !filtros.documentos ||
      (filtros.documentos === "completos" && resumenDocumentacion.completo) ||
      (filtros.documentos === "faltantes" && !resumenDocumentacion.completo);

    if (
      !cumpleTipo ||
      !cumpleCarrera ||
      !cumpleNivel ||
      !cumpleDocumentacion
    ) {
      return false;
    }

    if (!termino) return true;

    return construirTextoBusqueda(estudiante).includes(termino);
  });

  return [...filtrados].sort((a, b) => {
    if (orden === "alfabetico") {
      const comparacion = ordenarTexto(
        obtenerNombreParaOrden(a),
        obtenerNombreParaOrden(b),
      );

      return comparacion !== 0
        ? comparacion
        : Number(a.id) - Number(b.id);
    }

    const fechaA = parsearFechaInscripcion(a);
    const fechaB = parsearFechaInscripcion(b);

    if (fechaA !== fechaB) {
      return orden === "inscripcion_asc"
        ? fechaA - fechaB
        : fechaB - fechaA;
    }

    return orden === "inscripcion_asc"
      ? Number(a.id) - Number(b.id)
      : Number(b.id) - Number(a.id);
  });
}