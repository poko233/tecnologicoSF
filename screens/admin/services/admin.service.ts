import { httpClient } from "../../../http/httpClient";
import {
    AdminFormulario,
    PermissionMatrixResponse,
} from "../types/admin.types";

const mockForms: AdminFormulario[] = [
  {
    id: 1,
    moduleId: 1,
    moduleName: "Usuarios",
    name: "Listado de usuarios",
    description: "Gestión principal de usuarios del sistema",
    route: "/usuarios",
    componentKey: "UsersListScreen",
    icon: "people-outline",
    order: 1,
  },
  {
    id: 2,
    moduleId: 1,
    moduleName: "Usuarios",
    name: "Formulario de usuario",
    description: "Alta y edición de usuarios",
    route: "/usuarios/formulario",
    componentKey: "UserFormScreen",
    icon: "person-add-outline",
    order: 2,
  },
  {
    id: 3,
    moduleId: 2,
    moduleName: "Académico",
    name: "Listado de estudiantes",
    description: "Consulta de estudiantes",
    route: "/estudiantes",
    componentKey: "StudentsScreen",
    icon: "school-outline",
    order: 1,
  },
];

export const adminService = {
  async getFormularios(): Promise<AdminFormulario[]> {
    try {
      const res = await httpClient.getAuth<{ data: AdminFormulario[] }>(
        "/api/formularios",
        "Error al cargar formularios",
      );
      return res.data ?? [];
    } catch {
      return mockForms;
    }
  },

  async getPermissionMatrix(roleId: number): Promise<PermissionMatrixResponse> {
    try {
      const res = await httpClient.getAuth<{ data: PermissionMatrixResponse }>(
        `/api/permisos/matriz?role_id=${roleId}`,
        "Error al cargar matriz de permisos",
      );
      return res.data;
    } catch {
      return {
        roleId,
        rows: mockForms.map((f) => ({
          formId: f.id,
          formName: f.name,
          moduleName: f.moduleName,
          actions: {
            view: true,
            create: roleId === 1,
            update: roleId === 1,
            delete: roleId === 1,
          },
        })),
      };
    }
  },

  savePermissionMatrix(roleId: number, rows: PermissionMatrixResponse["rows"]) {
    return httpClient.putAuth<{ success: boolean }>(
      "/api/permisos/matriz",
      { role_id: roleId, rows },
      "Error al guardar permisos",
    );
  },
};
