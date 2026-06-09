// utils/roleBasedTabs.ts
export interface TabDefinition {
  name: string; // nombre de archivo en app/(tabs)
  title: string; // etiqueta visible
  icon: string; // nombre de MaterialCommunityIcons
}
const roleTabMap: Record<string, TabDefinition[]> = {
  Estudiante: [
    { name: "perfil", title: "Perfil", icon: "person-outline" },
    { name: "mis-notas", title: "Notas", icon: "document-text-outline" },
    { name: "materias", title: "Materias", icon: "book-outline" },
  ],
  Docente: [
    { name: "perfil", title: "Perfil", icon: "person-outline" },
    { name: "marcado", title: "Marcado", icon: "create-outline" },
  ],
  Personal: [
    { name: "perfil", title: "Perfil", icon: "person-outline" },
    { name: "marcado", title: "Marcado", icon: "create-outline" },
  ],
  Administrador: [
    { name: "perfil", title: "Perfil", icon: "person-outline" },
    { name: "marcado", title: "Marcado", icon: "create-outline" },
  ],
  Rector: [
    { name: "perfil", title: "Perfil", icon: "person-outline" },
    { name: "marcado", title: "Marcado", icon: "create-outline" },
  ],
  "Director Administrativo": [
    { name: "perfil", title: "Perfil", icon: "person-outline" },
    { name: "marcado", title: "Marcado", icon: "create-outline" },
  ],
  "Director Academico": [
    { name: "perfil", title: "Perfil", icon: "person-outline" },
    { name: "marcado", title: "Marcado", icon: "create-outline" },
  ],
  Fundador: [
    { name: "perfil", title: "Perfil", icon: "person-outline" },
    { name: "marcado", title: "Marcado", icon: "create-outline" },
  ],
};

/**
 * Retorna todas las pestañas que corresponden a cualquiera de los roles del usuario.
 * Las pestañas duplicadas (por nombre) se eliminan automáticamente.
 */
export function getTabsForRoles(roles: string[]): TabDefinition[] {
  if (!roles || roles.length === 0) return [];

  const tabsMap = new Map<string, TabDefinition>();

  for (const role of roles) {
    const tabsForRole = roleTabMap[role];
    if (tabsForRole) {
      for (const tab of tabsForRole) {
        if (!tabsMap.has(tab.name)) {
          tabsMap.set(tab.name, tab);
        }
      }
    }
  }

  return Array.from(tabsMap.values());
}
