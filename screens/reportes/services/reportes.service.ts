import { httpClient } from "@http";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";
// ✅ AÑADIDAS LAS IMPORTACIONES DE TIPOS QUE FALTABAN
import {
  InscritosDownloadParams,
  InscritosFiltrosResponse,
  PagosDownloadParams,
  PagosFiltrosResponse,
} from "../types/reportes.types";

// ─── HELPER DE DESCARGA (SIN CAMBIOS) ──────────────────────
async function descargarConAuth(
  path: string,
  formato: "xlsx" | "pdf",
  nombre: string,
) {
  const accept =
    formato === "pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const res = await httpClient._rawFetch(path, accept);

  if (Platform.OS === "web") {
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nombre}.${formato}`;
    a.click();
    window.URL.revokeObjectURL(url);
  } else {
    const arrayBuffer = await res.arrayBuffer();
    const file = new File(Paths.document!, `${nombre}.${formato}`);
    file.write(new Uint8Array(arrayBuffer));
    await Sharing.shareAsync(file.uri);
  }

  Toast.show({
    type: "success",
    text1: "Descargado",
    text2: `Archivo ${formato.toUpperCase()} listo`,
  });
}

// ─── BUILDER DE QUERY (SIN CAMBIOS) ──────────────────────
function buildQueryString(params: Record<string, any>): string {
  const parts: string[] = [];
  for (const key in params) {
    if (params[key] === undefined || params[key] === null || params[key] === "")
      continue;
    const value = params[key];
    if (Array.isArray(value)) {
      value.forEach((v) => parts.push(`${key}[]=${encodeURIComponent(v)}`));
    } else if (typeof value === "boolean") {
      parts.push(`${key}=${value ? "1" : "0"}`);
    } else {
      parts.push(`${key}=${encodeURIComponent(value)}`);
    }
  }
  return parts.length ? "?" + parts.join("&") : "";
}

// ─── SERVICIOS EXISTENTES ──────────────────────────────────
export interface FiltroOpciones {
  carreras: { idCarrera: number; nombreCarrera: string; codigo: string }[];
  gestiones: string[];
  turnos: string[];
}

export const reportesService = {
  obtenerFiltros: async (): Promise<FiltroOpciones> => {
    const res = await httpClient.getAuth<{ data: FiltroOpciones }>(
      "/api/reportes/calificaciones/filtros",
      "Error al cargar filtros",
    );
    return res.data;
  },

  descargarArchivo: (
    formato: "xlsx" | "pdf",
    idCarrera?: number,
    gestion?: string,
    turno?: string,
  ) => {
    const partes: string[] = [];
    if (idCarrera) partes.push(`idCarrera=${idCarrera}`);
    if (gestion) partes.push(`gestion=${gestion}`);
    if (turno) partes.push(`turno=${turno}`);
    const path = `/api/reportes/calificaciones/${formato}?${partes.join("&")}`;
    return descargarConAuth(path, formato, "calificaciones");
  },
  descargarXlsx: (idCarrera?: number, gestion?: string, turno?: string) =>
    reportesService.descargarArchivo("xlsx", idCarrera, gestion, turno),
  descargarPdf: (idCarrera?: number, gestion?: string, turno?: string) =>
    reportesService.descargarArchivo("pdf", idCarrera, gestion, turno),
  obtenerCarreras: async () => {
    const res = await httpClient.getAuth<{ data: { carreras: any[] } }>(
      "/api/reportes/inscritos-carrera/filtros",
      "Error al cargar carreras",
    );
    return res.data.carreras;
  },

  // ─── NUEVOS MÉTODOS PARA INSCRITOS (BACKEND REFACTORIZADO) ─────
  obtenerFiltrosInscritos: async (): Promise<InscritosFiltrosResponse> => {
    const res = await httpClient.getAuth<{ data: InscritosFiltrosResponse }>(
      "/api/reportes/inscritos-carrera/filtros",
      "Error al cargar filtros",
    );
    return res.data;
  },

  descargarInscritos: (params: InscritosDownloadParams) => {
    const { formato, ...filters } = params;
    const query = buildQueryString(filters);
    const path = `/api/reportes/inscritos-carrera/${formato}${query}`;
    return descargarConAuth(path, formato, "inscritos-carrera");
  },

  // ─── LISTA OFICIAL POR GRUPO (SIN MODIFICAR) ──────────
  obtenerGrupos: async (): Promise<any[]> => {
    const res = await httpClient.getAuth<{ data: { grupos: any[] } }>(
      "/api/reportes/lista-grupo/filtros",
      "Error al cargar grupos",
    );
    return res.data.grupos;
  },

  descargarListaGrupo: (
    formato: "xlsx" | "pdf",
    idGrupoMateriaDocente?: number,
  ) => {
    const partes: string[] = [];
    if (idGrupoMateriaDocente)
      partes.push(`idGrupoMateriaDocente=${idGrupoMateriaDocente}`);
    const path = `/api/reportes/lista-grupo/${formato}?${partes.join("&")}`;
    return descargarConAuth(path, formato, "lista-grupo");
  },

  // ─── NUEVOS MÉTODOS PARA REPORTE DE PAGOS ──────────────
  obtenerFiltrosPagos: async (
    search: string = "",
    page: number = 1,
    signal?: AbortSignal,
  ): Promise<PagosFiltrosResponse> => {
    const res = await httpClient.getAuth<{ data: PagosFiltrosResponse }>(
      `/api/reportes/pagos/filtros?search=${encodeURIComponent(search)}&page=${page}`,
      "Error al cargar filtros de pagos",
      signal, // ✅ Pasamos la señal al httpClient
    );
    return res.data;
  },

  buscarEstudiantes: async (
    search: string = "",
    page: number = 1,
    perPage: number = 15,
    signal?: AbortSignal,
  ): Promise<any> => {
    const res = await httpClient.getAuth<any>(
      `/api/cuota/search?search=${encodeURIComponent(search)}&page=${page}&per_page=${perPage}`,
      "Error al buscar estudiantes",
      signal, // ✅ Pasamos la señal al httpClient
    );
    return res;
  },

  descargarPagos: async (params: PagosDownloadParams) => {
    const { formato, ...filters } = params;
    const query = buildQueryString(filters);
    const path = `/api/reportes/pagos/${formato}${query}`;
    return descargarConAuth(path, formato, "reporte-pagos");
  },
};
