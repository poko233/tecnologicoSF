export type PermissionAction = "view" | "create" | "update" | "delete";

export interface AdminFormulario {
  id: number;
  moduleId: number;
  moduleName: string;
  name: string;
  description: string | null;
  route: string;
  componentKey: string;
  icon?: string | null;
  order: number;
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
