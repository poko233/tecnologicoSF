// Tipos basados en el contrato del backend

export interface GrupoMateriaDocente {
  id_grupo_materia_docente: number;
  grupo: string;
  paralelo: string | null;
  turno: string;
  gestion: string;
  materia: string;
  inscritos: number;
}

export interface ElementoCompetencia {
  id: number;
  id_grupo_materia_docente: number;
  nombre: string;
  observaciones: string | null;
  estado: "activo" | "inactivo";
  created_at: string;
  updated_at: string;
}

export interface NotaElementoCompetencia {
  id_elemento_competencia: number;
  puntaje: number | null;
}

export interface EstudiantePlanilla {
  id_inscripcion: number;
  id_usuario: number;
  nombre_completo: string;
  notas_ec: NotaElementoCompetencia[];
  nota_asistencia: number;
}

export interface PlanillaData {
  grupo: {
    nombre: string;
    gestion: string;
  };
  materia: {
    nombre: string;
  };
  elementos_competencia: { id: number; nombre: string }[];
  estudiantes: EstudiantePlanilla[];
}

export interface NotaGuardar {
  id_inscripcion: number;
  nota_asistencia: number;
  nota_final: number;
  estado: "Aprobado" | "Reprobado";
  // Permitimos string, null (del backend) o undefined (opcional)
  observaciones?: string | null;
  ecs: {
    id_elemento_competencia: number;
    puntaje: number;
    // Ajuste aquí también para evitar errores en el array de ECs
    observaciones?: string | null;
  }[];
}

export interface GuardarPayload {
  id_grupo_materia_docente: number;
  notas: NotaGuardar[];
}

export interface GuardarResponse {
  message: string;
  procesados: number;
  errores: string[];
}
