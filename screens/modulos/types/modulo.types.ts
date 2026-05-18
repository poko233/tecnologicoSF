
export interface Modulo {
  id: number;
  modulo: string;
  descripcion: string | null;
  icono: string | null;
  formularios?: Formulario[];
}

export interface Formulario {
  id: number;
  formulario: string;
  descripcion: string | null;
  ruta: string | null;
}


export interface CreateModuloPayload {
  modulo: string;
  descripcion?: string;
  icono?: string;
}

export type UpdateModuloPayload = CreateModuloPayload;


export interface IconOption {
  key: string;
  ionicon: string; 
}

export const AVAILABLE_ICONS: IconOption[] = [
  { key: "home",         ionicon: "home-outline" },
  { key: "settings",     ionicon: "settings-outline" },
  { key: "shield",       ionicon: "shield-checkmark-outline" },
  { key: "cart",         ionicon: "cart-outline" },
  { key: "cube",         ionicon: "cube-outline" },
  { key: "calculator",   ionicon: "calculator-outline" },
  { key: "car",          ionicon: "car-outline" },
  { key: "bar-chart",    ionicon: "bar-chart-outline" },
  { key: "person",       ionicon: "person-outline" },
  { key: "document",     ionicon: "document-text-outline" },
  { key: "star",         ionicon: "star-outline" },
  { key: "notifications",ionicon: "notifications-outline" },
  { key: "wallet",       ionicon: "wallet-outline" },
  { key: "storefront",   ionicon: "storefront-outline" },
  { key: "people",       ionicon: "people-outline" },
  { key: "build",        ionicon: "build-outline" },
];