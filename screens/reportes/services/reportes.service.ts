import { httpClient } from "@http";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

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

    const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
    const url = `${BASE_URL}/api/reportes/calificaciones/${formato}?${partes.join("&")}`;

    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      const { Linking } = require("react-native");
      Linking.openURL(url);
    }

    Toast.show({
      type: "success",
      text1: "Descargando",
      text2: `Archivo ${formato.toUpperCase()} generándose...`,
    });
  },

  descargarXlsx: (idCarrera?: number, gestion?: string, turno?: string) =>
    reportesService.descargarArchivo("xlsx", idCarrera, gestion, turno),

  descargarPdf: (idCarrera?: number, gestion?: string, turno?: string) =>
    reportesService.descargarArchivo("pdf", idCarrera, gestion, turno),

  // ── INSCRITOS POR CARRERA ──────────────────────────────────
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

    const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
    const url = `${BASE_URL}/api/reportes/inscritos-carrera/${formato}?${partes.join("&")}`;

    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      const { Linking } = require("react-native");
      Linking.openURL(url);
    }

    Toast.show({
      type: "success",
      text1: "Descargando",
      text2: `Reporte de inscritos generándose...`,
    });
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

    const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
    const url = `${BASE_URL}/api/reportes/lista-grupo/${formato}?${partes.join("&")}`;

    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      const { Linking } = require("react-native");
      Linking.openURL(url);
    }

    Toast.show({
      type: "success",
      text1: "Descargando",
      text2: `Lista de grupo generándose...`,
    });
  },
};