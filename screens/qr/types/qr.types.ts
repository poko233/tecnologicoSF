export interface VerifyAccessResponse {
  alerta: {
    color: "verde" | "amarillo" | "naranja" | "rojo";
    mensaje: string;
    descripcion: string;
  };
  usuario: {
    id: number;
    nombre_completo: string;
    nombres: string;
    apellido_paterno: string | null;
    apellido_materno: string | null;
    genero: string | null;
    ci: string;
    email: string | null;
    celular: string | null;
    direccion: string | null;
    foto: string | null;
    tipo: "Estudiante" | "Docente" | "Administrativo";
    carrera?: string | null;
    profesion?: string | null;
    cuotas_pendientes: number;
  };
  registro_id: number;
}

export type InputMode = "qr" | "ci";
