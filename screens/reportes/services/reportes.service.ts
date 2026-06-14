import { httpClient } from "@http";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

async function descargarConAuth(path: string, formato: "xlsx" | "pdf", nombre: string) {
  const accept = formato === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  console.log("PATH:", path);
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
    const file = new File(Paths.document, `${nombre}.${formato}`);
    file.write(new Uint8Array(arrayBuffer));
    await Sharing.shareAsync(file.uri);
  }

  Toast.show({ type: "success", text1: "Descargado", text2: `Archivo ${formato.toUpperCase()} listo` });
}

export interface FiltroOpciones {
  carreras: { idCarrera: number; nombreCarrera: string; codigo: string }[];
  gestiones: string[];
  turnos: string[];
}

export const reportesService = {

  obtenerFiltros: async (): Promise<FiltroOpciones> => {
    const res = await httpClient.getAuth<{ data: FiltroOpciones }>(
      "/api/reportes/calificaciones/filtros",
      "Error al cargar filtros"
    );
    return res.data;
  },

  descargarArchivo: (
    formato: "xlsx" | "pdf",
    idCarrera?: number,
    gestion?: string,
    turno?: string
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

  obtenerCarreras: async (): Promise<{ idCarrera: number; nombreCarrera: string; codigo: string }[]> => {
    const res = await httpClient.getAuth<{ data: { carreras: any[] } }>(
      "/api/reportes/inscritos-carrera/filtros",
      "Error al cargar carreras"
    );
    return res.data.carreras;
  },

  descargarInscritos: (
    formato: "xlsx" | "pdf",
    idCarrera?: number,
    fechaInicio?: string,
    fechaFin?: string
  ) => {
    const partes: string[] = [];
    if (idCarrera) partes.push(`idCarrera=${idCarrera}`);
    if (fechaInicio) partes.push(`fechaInicio=${fechaInicio}`);
    if (fechaFin) partes.push(`fechaFin=${fechaFin}`);
    const path = `/api/reportes/inscritos-carrera/${formato}?${partes.join("&")}`;
    return descargarConAuth(path, formato, "inscritos-carrera");
  },

  // ── LISTA OFICIAL POR GRUPO ──────────────────────────────
  obtenerGrupos: async (): Promise<any[]> => {
    const res = await httpClient.getAuth<{ data: { grupos: any[] } }>(
      "/api/reportes/lista-grupo/filtros",
      "Error al cargar grupos"
    );
    return res.data.grupos;
  },

  descargarListaGrupo: (
    formato: "xlsx" | "pdf",
    idGrupoMateriaDocente?: number
  ) => {
    const partes: string[] = [];
    if (idGrupoMateriaDocente) partes.push(`idGrupoMateriaDocente=${idGrupoMateriaDocente}`);
    const path = `/api/reportes/lista-grupo/${formato}?${partes.join("&")}`;
    return descargarConAuth(path, formato, "lista-grupo");
  },
};