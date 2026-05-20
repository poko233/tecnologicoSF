import { httpClient } from "../../../http/httpClient";
import {
  CarreraInscrita,
  Cuota,
  Estudiante,
  PaginatedResponse,
} from "../types/cuota.types";

// Cambia esta URL según tu endpoint real (ej: '/students/search' o '/cuotas/search')
const API_SEARCH_STUDENTS = "/api/cuota/search";
const API_STUDENT_DETAIL = "/api/cuota/estudiante"; // base, luego se añade /{id}

export const cuotaService = {
  searchStudents: (
    searchTerm: string,
    page: number = 1,
    perPage: number = 15,
  ) => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append("search", searchTerm.trim());
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());

    return httpClient.getAuth<PaginatedResponse<Estudiante>>(
      `${API_SEARCH_STUDENTS}?${params.toString()}`,
    );
  },
  getStudentDetail: (studentId: number) => {
    return httpClient.getAuth<any>(`${API_STUDENT_DETAIL}/${studentId}`);
  },
  // Obtener carreras en las que está inscrito un estudiante
  getCarrerasByStudent: (usuarioId: number) => {
    return httpClient.getAuth<CarreraInscrita[]>(
      `/api/estudiantes/${usuarioId}/carreras`,
    );
  },

  // Obtener cuotas de una carrera específica de un estudiante
  getCuotasByCarrera: (usuarioId: number, carreraId: number) => {
    return httpClient.getAuth<Cuota[]>(
      `/api/estudiantes/${usuarioId}/carreras/${carreraId}/cuotas`,
    );
  },
};
