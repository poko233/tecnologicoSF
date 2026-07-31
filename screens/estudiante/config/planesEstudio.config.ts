/**
 * Orden visual de los planes de estudio.
 *
 * IMPORTANTE:
 * - Este archivo NO modifica la base de datos.
 * - Solo determina el orden en el que se muestran las materias dentro del
 *   Historial académico y Asignaciones.
 * - El orden se resuelve por carrera + nivel + código de materia.
 * - Las materias que no estén configuradas permanecen visibles y se colocan
 *   al final del nivel, ordenadas por código y nombre.
 */

export type PlanEstudiosConfigurado = {
  /** Nombre interno únicamente para facilitar el mantenimiento. */
  key: string;

  /**
   * Nombres o códigos con los que la carrera puede llegar desde el backend.
   * La comparación ignora mayúsculas, tildes, espacios y signos.
   */
  aliases: string[];

  /**
   * Nivel académico y códigos en el orden exacto del plan.
   * Para régimen anual: 1 = primer año, 2 = segundo año, etc.
   * Para régimen semestral: 1 = primer semestre, 2 = segundo semestre, etc.
   */
  niveles: Record<number, string[]>;
};

export const PLANES_ESTUDIO_CONFIG: PlanEstudiosConfigurado[] = [
  {
    key: "LABORATORIO_DENTAL",
    aliases: [
      "Laboratorio Dental",
      "Carrera Laboratorio Dental",
      "LABORATORIO_DENTAL",
    ],
    niveles: {
      1: [
        "PSB-101",
        "MFB-102",
        "SBV-103",
        "LMD-104",
        "ADE-105",
        "PPR-106",
        "PPR-107",
      ],
      2: [
        "PFI-201",
        "PFI-202",
        "CCO-203",
        "ORT-204",
        "CED-205",
        "PRL-206",
      ],
    },
  },
  {
    key: "LABORATORIO_CLINICO",
    aliases: [
      "Laboratorio Clínico",
      "Laboratorio Clinico",
      "Carrera Laboratorio Clínico",
      "LABORATORIO_CLINICO",
    ],
    niveles: {
      1: [
        "PSB-101",
        "MFB-102",
        "SBV-103",
        "FNB-104",
        "EMR-105",
        "EBH-106",
        "EBH-107",
        "EXS-108",
        "QSB-109",
        "PIS-110",
      ],
      2: [
        "EGO-201",
        "ECP-202",
        "PBB-203",
        "PBB-204",
        "PPP-205",
      ],
    },
  },
  {
    key: "NUTRICION",
    aliases: ["Nutrición", "Nutricion", "Carrera Nutrición", "NUTRICION"],
    niveles: {
      1: [
        "PSB-101",
        "MFB-102",
        "SBV-103",
        "EAN-104",
        "ENC-105",
        "HIA-106",
        "BBA-107",
        "PPI-108",
      ],
      2: ["NBI-201", "TED-202", "NBI-203", "DIB-204", "PPP-205"],
    },
  },
  {
    key: "COMERCIO_INTERNACIONAL_ADMINISTRACION_ADUANERA",
    aliases: [
      "Comercio Internacional y Administración Aduanera",
      "Comercio Internacional y Administracion Aduanera",
      "Administración Aduanera",
      "Administracion Aduanera",
      "Aduanas",
      "COMERCIO_INTERNACIONAL_ADMINISTRACION_ADUANERA",
    ],
    niveles: {
      1: [
        "RDA-101",
        "MCA-102",
        "IEN-103",
        "GCT-104",
        "TEI-105",
        "COG-106",
        "MEG-107",
        "DGP-108",
        "ESD-109",
      ],
      2: [
        "PSA-201",
        "CAM-202",
        "LTI-203",
        "NIN-204",
        "INM-205",
        "CDC-206",
        "MIH-207",
        "EMI-208",
      ],
      3: [
        "TMG-301",
        "OPA-302",
        "DFI-303",
        "INT-304",
        "ADE-305",
        "PEF-306",
        "TDS-307",
      ],
    },
  },
  {
    key: "ENFERMERIA",
    aliases: ["Enfermería", "Enfermeria", "Carrera Enfermería", "ENFERMERIA"],
    niveles: {
      1: [
        "PSB-101",
        "PAU-102",
        "ECS-103",
        "TPB-104",
        "SSR-105",
        "AIM-106",
      ],
      2: ["SAB-201", "VIG-202", "MTR-203", "IAP-204", "PPP-209"],
    },
  },
  {
    key: "OPTICA_OFTALMICA",
    aliases: [
      "Óptica Oftálmica",
      "Optica Oftalmica",
      "Carrera Óptica Oftálmica",
      "OPTICA_OFTALMICA",
    ],
    niveles: {
      1: [
        "PSB-101",
        "MFB-102",
        "SBV-103",
        "OPF-104",
        "OPG-105",
        "IAF-106",
        "OFI-107",
        "OPO-108",
        "LAB-109",
        "PPP-110",
      ],
      2: [
        "LAB-201",
        "LDC-202",
        "LAB-203",
        "ITB-204",
        "PSV-205",
        "ETP-206",
        "TGO-207",
        "PPP-208",
      ],
    },
  },
  {
    key: "FISIOTERAPIA",
    aliases: ["Fisioterapia", "Carrera Fisioterapia", "FISIOTERAPIA"],
    niveles: {
      1: ["ANA-101", "FIG-102", "BIF-103", "REP-104", "PSI-105", "PAR-106"],
      2: ["ANA-201", "FGE-202", "BIM-203", "KNS-204", "SEK-205", "SPV-206"],
      3: ["FAT-301", "PAG-302", "BIM-303", "KIF-304", "MAG-305", "FSP-306"],
      4: ["FAC-401", "MEC-402", "REU-403", "KID-404", "FIP-405", "NUD-406"],
      5: ["FED-501", "REI-502", "FIG-503", "ELE-504", "NEF-505", "ESA-506"],
      6: ["FAN-601", "IDO-602", "TEA-603", "ELE-604", "TEO-605", "PPP-606"],
    },
  },
  {
    key: "OPTOMETRIA",
    aliases: ["Optometría", "Optometria", "Carrera Optometría", "OPTOMETRIA"],
    niveles: {
      1: [
        "PSB-101",
        "MFB-102",
        "SBV-103",
        "QBO-104",
        "OPF-105",
        "OFG-106",
        "AFO-107",
        "CFI-108",
        "OPO-109",
        "YBB-110",
      ],
      2: [
        "MGO-201",
        "CON-202",
        "SPO-203",
        "BFO-204",
        "VBI-205",
        "CON-206",
        "ETP-207",
        "PPP-208",
      ],
      3: [
        "PCO-301",
        "FAR-302",
        "SPO-303",
        "PCO-304",
        "EVI-305",
        "ICO-306",
        "IOS-307",
        "PPP-308",
      ],
    },
  },
  {
    key: "PARVULARIO",
    aliases: [
      "Parvulario",
      "Educación Parvularia",
      "Educacion Parvularia",
      "Carrera Parvulario",
      "PARVULARIO",
    ],
    niveles: {
      1: ["EDP-100", "EDP-110", "AS-105", "EDP-120", "INA-105", "EDP-104"],
      2: ["EDP-210", "EDP-101", "EDP-200", "IDO-101", "INA-102", "EDP-205"],
      3: ["EDP-310", "EDP-230", "EDP-330", "EDP-360", "EDP-370", "EDP-301"],
      4: ["EDP-405", "EDP-480", "EDP-410", "EDP-420", "EDP-440", "EDP-401"],
      5: ["EDP-507", "EDP-510", "PAU-104", "EDP-500", "EDP-550", "EDP-501"],
      6: ["EDP-608", "EDP-602", "EDP-301", "EDP-600", "EDU-109", "EDP-601"],
    },
  },
];

/** Materias no registradas en el archivo quedan al final del nivel. */
export const ORDEN_PLAN_NO_CONFIGURADO = 9999;
