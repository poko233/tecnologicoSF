import { Platform } from "react-native";

import { httpClient } from "../../../http/httpClient";
import {
    EstudianteDetalleResponse,
    EstudianteForm,
    EstudiantesResponse,
    EstudianteUpdateResponse,
    FotoEstudianteArchivo,
} from "../types/estudiante.types";

export async function obtenerEstudiantes() {
  return httpClient.getAuth<EstudiantesResponse>(
    "/api/estudiantes-usuarios",
    "No se pudieron cargar los estudiantes",
  );
}

export async function obtenerDetalleEstudiante(id: number) {
  return httpClient.getAuth<EstudianteDetalleResponse>(
    `/api/estudiantes-usuarios/${id}`,
    "No se pudo cargar el detalle del estudiante",
  );
}

export async function actualizarEstudiante(id: number, form: EstudianteForm) {
  return httpClient.putAuth<EstudianteUpdateResponse>(
    `/api/estudiantes-usuarios/${id}`,
    form,
    "No se pudo actualizar el estudiante",
  );
}

export async function actualizarFotoEstudiante(
  id: number,
  archivo: FotoEstudianteArchivo,
) {
  const formData = new FormData();

  if (Platform.OS === "web") {
    if (!archivo.file) {
      throw new Error("No se pudo leer la foto seleccionada.");
    }

    formData.append("foto", archivo.file);
  } else {
    formData.append("foto", {
      uri: archivo.uri,
      name: archivo.name || "foto.jpg",
      type: archivo.type || "image/jpeg",
    } as any);
  }

  return httpClient.postFormData<EstudianteUpdateResponse>(
    `/api/estudiantes-usuarios/${id}/foto`,
    formData,
  );
}