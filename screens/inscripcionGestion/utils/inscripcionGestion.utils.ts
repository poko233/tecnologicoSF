import { CarreraIG, GestionIG } from "../types/inscripcionGestion.types";

export type EstadoCarreraGestionIG =
  | "asignada"
  | "parcial"
  | "seleccionada"
  | "disponible"
  | "bloqueada"
  | "sin-grupos";

export function textoGestionIG(gestion: GestionIG): string {
  const anio = gestion.anio ? ` ${gestion.anio}` : "";
  const periodo = gestion.periodo ? ` · ${gestion.periodo}` : "";

  return `${gestion.nombre}${anio}${periodo}`;
}

export function estadoColorKeyIG(estado?: string | null) {
  const value = String(estado ?? "").toLowerCase();

  if (value === "activo") return "green";
  if (value === "cerrado") return "red";

  return "yellow";
}

export function carreraDisponibleParaAsignarIG(carrera: CarreraIG): boolean {
  return (
    carrera.disponible === true &&
    Number(carrera.gruposParaMover ?? 0) > 0 &&
    !carrera.asignadaAOtraGestion
  );
}

export function carreraPerteneceGestionIG(carrera: CarreraIG): boolean {
  return carrera.asignadaAEstaGestion === true;
}

export function carreraTieneCambiosPendientesIG(carrera: CarreraIG): boolean {
  return carreraDisponibleParaAsignarIG(carrera);
}

export function motivoBloqueoCarreraIG(carrera: CarreraIG): string {
  if (carrera.asignadaAOtraGestion) {
    return carrera.gestionAsignadaTexto
      ? `Pertenece a ${carrera.gestionAsignadaTexto}`
      : "Pertenece a otra gestión activa";
  }

  if (carrera.asignacionCompleta) {
    return "Ya pertenece completamente a esta gestión";
  }

  if (carrera.asignacionParcial) {
    return carrera.motivoNoDisponible || "Pertenece parcialmente a esta gestión";
  }

  if (Number(carrera.materiasActivas ?? 0) <= 0) {
    return "Sin materias activas";
  }

  if (Number(carrera.gruposActivos ?? 0) <= 0) {
    return "Sin grupos activos";
  }

  return carrera.motivoNoDisponible || "No disponible";
}

export function estadoCarreraGestionIG(
  carrera: CarreraIG,
  seleccionada: boolean,
): EstadoCarreraGestionIG {
  if (carrera.asignacionCompleta) return "asignada";
  if (carrera.asignacionParcial) return "parcial";
  if (carrera.asignadaAOtraGestion) return "bloqueada";
  if (seleccionada) return "seleccionada";
  if (carreraDisponibleParaAsignarIG(carrera)) return "disponible";

  return "sin-grupos";
}

export function textoEstadoCarreraGestionIG(
  estado: EstadoCarreraGestionIG,
): string {
  switch (estado) {
    case "asignada":
      return "Asignada";
    case "parcial":
      return "Se completará";
    case "seleccionada":
      return "Por asignar";
    case "disponible":
      return "Disponible";
    case "bloqueada":
      return "Otra gestión";
    default:
      return "No disponible";
  }
}
