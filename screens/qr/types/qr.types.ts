// Tipos basados en las respuestas esperadas del backend

export interface DecryptResponse {
  user: {
    id: number;
    nombre_completo: string;
    foto: string | null;
    tipo: "Estudiante" | "Docente" | "Administrativo";
    carrera: string | null;
    turno: string | null;
  };
}

export interface AsistenciaResponse {
  message: string;
  asistencia: {
    estudiante: string;
    materia: string;
    grupo: string;
    fecha: string;
    hora: string;
    tipo: string;
  };
}

export interface VerifyAccessResponse {
  alerta: {
    color: "verde" | "amarillo" | "naranja" | "rojo";
    mensaje: string;
    descripcion: string;
  };
  usuario: {
    id: number;
    nombre_completo: string;
    foto: string | null;
    tipo: "Estudiante" | "Docente" | "Administrativo";
    carrera: string | null;
    turno: string | null;
    cuotas_pendientes: number | null;
    observaciones_activas: string[] | null;
  };
  registro_id: number;
}

export type ScanMode = "asistencia" | "acceso";
