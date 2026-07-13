// screens/convalidacion/types/index.ts

export interface Carrera {
  idCarrera: number;
  nombreCarrera: string;
  codigo?: string;
}

export interface Gestion {
  id: number;
  nombre: string;
  anio: number;
  semestre: string;
}

export interface SolicitudConvalidacion {
  id: number;
  codigo: string;
  idUsuario: number;
  idCarreraDestino: number;
  idGestion: number;
  ci: string;
  expedido: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  genero: string;
  fecha_nac: string;
  email?: string;
  telefono?: string;
  celular?: string;
  direccion?: string;
  matricula: string;
  tipo: 'externa' | 'cambio_carrera';
  institucion_origen: string;
  carrera_origen_nombre: string;
  motivo?: string;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface Documento {
  id: number;
  idSolicitud: number;
  tipo: string;
  nombreDocumento: string;
  ubicacionArchivo: string;
  tamanio?: number;
  created_at: string;
}

export interface DocumentoRequerido {
  tipo: string;
  nombre: string;
  descripcion: string;
  obligatorio: boolean;
  accept: string;
  icono: string;
}

export interface MateriaDestino {
  idMateria: number;
  nombreMateria: string;
  codigo?: string;
  semestre: number;
  creditos: number;
}

export interface DetalleConvalidacion {
  id: number;
  idSolicitud: number;
  materia_origen_nombre: string;
  materia_origen_institucion: string;
  nota_origen: number;
  creditos_origen: number;
  idMateriaDestino: number;
  materiaDestino?: MateriaDestino;
  estado: 'Aprobada' | 'Pendiente' | 'Observada';
  observacion?: string;
}

export interface Cuota {
  id: number;
  monto: number;
  cantidad_materias: number;
  arancel_por_materia: number;
  descuento: number;
  estado: string;
  fecha_vencimiento?: string;
}

export interface Pago {
  id: number;
  metodo: 'TRANSFERENCIA' | 'EFECTIVO' | 'QR';
  comprobante?: string;
  fecha_pago: string;
  registrado_por: number;
}

export interface Resolucion {
  detalles: Array<{
    nombre: string;
    creditos: number;
    estado: 'Aprobada' | 'En revisión' | 'Observada';
    observacion?: string;
  }>;
  observacion_resolucion?: string;
  numero_resolucion?: string;
  docente_revisor?: string;
  creditos_incorporados: number;
  materias_acreditadas: number;
}

export interface Paso1FormData {
  ci: string;
  expedido: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  genero: string;
  fecha_nac: Date | null;
  email: string;
  telefono: string;
  celular: string;
  direccion: string;
  matricula: string;
  idCarreraDestino: number | null;
  idGestion: number | null;
  tipo: 'externa' | 'cambio_carrera';
  institucion_origen: string;
  carrera_origen_nombre: string;
  motivo: string;
}
