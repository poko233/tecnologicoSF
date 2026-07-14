import { CarreraIG, GestionIG } from "../types/inscripcionGestion.types";

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

export function carreraDisponibleParaInscribirIG(carrera: CarreraIG): boolean {
  return carrera.disponible === true;
}

export function motivoBloqueoCarreraIG(carrera: CarreraIG): string {
  if (carrera.motivoNoDisponible) {
    return carrera.motivoNoDisponible;
  }

  if (carrera.asignadaAEstaGestion) {
    return "Ya pertenece a esta gestión";
  }

  if (carrera.asignadaAOtraGestion) {
    return `Pertenece a ${carrera.gestionAsignadaTexto ?? "otra gestión"}`;
  }

  if (Number(carrera.totalEstudiantes) <= 0) {
    return "Sin estudiantes";
  }

  if (Number(carrera.materiasDisponiblesGestion) <= 0) {
    return "Sin materias activas en esta gestión";
  }

  if (Number(carrera.gruposDisponiblesGestion) <= 0) {
    return "Sin grupos activos en esta gestión";
  }

  return "No disponible";
}