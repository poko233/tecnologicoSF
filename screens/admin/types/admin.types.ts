export type PermissionAction = "view" | "create" | "update" | "delete";

export interface AdminFormulario {
  id: number;
  formulario: string;
  ruta: string;
  descripcion: string | null;
  moduleId?: number;
  moduleName?: string;
  name?: string;
  route?: string;
  componentKey?: string;
  icon?: string | null;
  order?: number;
}

export interface CreateFormularioPayload {
  formulario: string;
  ruta: string;
  descripcion?: string;
}

export interface AdminModuloOption {
  id: number;
  modulo: string;
  descripcion?: string | null;
}

export interface AdminRolOption {
  id: number;
  rol: string;
  descripcion?: string | null;
}

export interface FormularioModuloAssignment {
  id_formulario: number;
  id_modulo: number;
  formulario?: string;
  modulo?: string;
}

export interface CreateFormularioModuloPayload {
  id_formulario: number;
  id_modulo: number;
}


export interface ModuloRolAssignment {
  id:               number;
  id_rol:           number;
  id_modulo:        number;
  nombre_rol:       string;
  nombre_modulo:    string;
  icono_modulo:     string;
  descripcion_modulo?: string | null;
  created_at?:      string;
  modulo?: string;
  rol?:   string;
}

export interface CreateModuloRolPayload {
  id_modulo: number;
  id_rol:    number;
}

export interface PermissionMatrixItem {
  formId: number;
  formName: string;
  moduleName: string;
  actions: Record<PermissionAction, boolean>;
}

export interface PermissionMatrixResponse {
  roleId: number;
  rows: PermissionMatrixItem[];
}