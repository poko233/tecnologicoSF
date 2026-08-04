export interface GrupoMateriaDocente {
  id_grupo_materia_docente: number;
  grupo: string;
  paralelo: string | null;
  turno: string;
  gestion: string;
  materia: string;
  carreras: string[];
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

// ─── NUEVOS TIPOS PARA ELEMENTOS EVALUATIVOS ───
export interface ElementoEvaluativo {
  id: number;
  id_elemento_competencia: number;
  nombre: string;
  puntaje_maximo: number | null;
  estado: "activo" | "inactivo";
  created_at: string;
  updated_at: string;
}

// ─── NUEVA ESTRUCTURA DE LA PLANILLA ───
export interface EVPlanilla {
  id: number;
  nombre: string;
  puntaje_maximo: number | string | null;
}
export interface ECPlanilla {
  id: number;
  nombre: string;
  evs: EVPlanilla[];
}

export interface NotaEV {
  id_elemento_evaluativo: number;
  puntaje: number | null;
}

export interface EstudianteECNotas {
  id_elemento_competencia: number;
  puntaje: number;
  evs: NotaEV[];
}

export interface EstudiantePlanilla {
  id_inscripcion: number;
  id_usuario: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nota_asistencia: number;
  nota_final: number | null;
  segunda_instancia_nota?: number | null;
  ecs: EstudianteECNotas[];
}

export interface PlanillaData {
  grupo: { nombre: string; gestion: string };
  materia: { nombre: string; nota_aprobacion: number };
  ecs: ECPlanilla[];
  estudiantes: EstudiantePlanilla[];
}

// ─── PAYLOAD PARA GUARDAR ───
export interface EVPayload {
  id_elemento_evaluativo: number;
  puntaje: number;
  observaciones?: string | null;
}

export interface ECPayload {
  id_elemento_competencia: number;
  puntaje: number;
  observaciones?: string | null;
  evs: EVPayload[];
}

export interface NotaGuardar {
  id_inscripcion: number;
  nota_asistencia: number;
  nota_final: number;
  estado: "Aprobado" | "Reprobado" | "Abandono";
  observaciones?: string | null;
  ecs: ECPayload[];
  segunda_instancia_nota?: number | null;
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
