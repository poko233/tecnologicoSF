import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import {
    AsignacionDocente,
    Docente,
    Materia,
} from "../types/asignacionDocente.types";
import EmptyState from "./EmptyState";

type Props = {
  materia: Materia | null;
  docentes: Docente[];
  asignacionesMateria: AsignacionDocente[];
  idDocenteSeleccionado: number | null;
  saving: boolean;
  onOpenDocenteModal: () => void;
  onLimpiar: () => void;
};

function getMateriaNombre(materia: Materia) {
  return materia.nombreMateria ?? materia.nombre ?? `Materia ${materia.idMateria}`;
}

function getMateriaCodigo(materia: Materia) {
  return materia.codigo ?? materia.sigla ?? "Sin código";
}

function getNombreCompletoDocente(docente?: Docente) {
  if (!docente) return "Seleccionar docente";

  const usuario = docente.usuario;

  const nombre = `${usuario?.nombres ?? ""} ${usuario?.apellidoPaterno ?? ""} ${
    usuario?.apellidoMaterno ?? ""
  }`.trim();

  return nombre || `Docente ${docente.idDocente}`;
}

function getInfoDocente(docente?: Docente) {
  if (!docente) return "Toca aquí para elegir el docente responsable";

  const abreviatura =
    docente.abreviaturaProfesional ?? docente.abreviaturaProfesion ?? "";

  const profesion = docente.profesion ?? "Sin profesión";
  const ci = docente.usuario?.ci ?? "-";
  const titulo = abreviatura ? `${abreviatura}. ${profesion}` : profesion;

  return `CI: ${ci} · ${titulo}`;
}

export default function AsignacionPanel({
  materia,
  docentes,
  asignacionesMateria,
  idDocenteSeleccionado,
  saving,
  onOpenDocenteModal,
  onLimpiar,
}: Props) {
  const { theme } = useTheme();

  const docenteSeleccionado = docentes.find(
    (docente) => docente.idDocente === idDocenteSeleccionado
  );

  const tieneDocente = !!idDocenteSeleccionado;

  if (!materia) {
    return (
      <View
        style={[
          styles.panel,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <EmptyState
          icon="book-outline"
          title="Selecciona una materia"
          subtitle="Primero elige una materia. Luego asigna un docente y marca grupos."
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: theme.colors.primarySubtle },
          ]}
        >
          <Ionicons name="book-outline" size={24} color={theme.colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>
            {getMateriaNombre(materia)}
          </ThemedText>

          <ThemedText
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            {getMateriaCodigo(materia)}
            {materia.semestre ? ` · Semestre ${materia.semestre}` : ""}
          </ThemedText>
        </View>

        {asignacionesMateria.length > 0 && (
          <Pressable
            onPress={onLimpiar}
            disabled={saving}
            style={[
              styles.clearButton,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons name="trash-outline" size={17} color={theme.colors.text} />
            <ThemedText style={[styles.clearText, { color: theme.colors.text }]}>
              Limpiar
            </ThemedText>
          </Pressable>
        )}
      </View>

      <View
        style={[
          styles.helpBox,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={theme.colors.info}
        />
        <ThemedText style={[styles.helpText, { color: theme.colors.textSecondary }]}>
          Paso 1: selecciona el docente responsable. Luego en la sección de
          grupos marca dónde dictará la materia.
        </ThemedText>
      </View>

      <Pressable
        onPress={onOpenDocenteModal}
        style={[
          styles.selector,
          {
            backgroundColor: theme.colors.input,
            borderColor: tieneDocente ? theme.colors.primary : theme.colors.inputBorder,
          },
        ]}
      >
        <View
          style={[
            styles.selectorIcon,
            {
              backgroundColor: tieneDocente
                ? theme.colors.primary
                : theme.colors.primarySubtle,
            },
          ]}
        >
          <Ionicons
            name={tieneDocente ? "person" : "person-outline"}
            size={24}
            color={tieneDocente ? theme.colors.primaryForeground : theme.colors.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.selectorTitle, { color: theme.colors.text }]}>
            {getNombreCompletoDocente(docenteSeleccionado)}
          </ThemedText>

          <ThemedText
            style={[styles.selectorHint, { color: theme.colors.textSecondary }]}
          >
            {getInfoDocente(docenteSeleccionado)}
          </ThemedText>
        </View>

        <View
          style={[
            styles.chevronBox,
            { backgroundColor: theme.colors.primarySubtle },
          ]}
        >
          <Ionicons name="chevron-down" size={22} color={theme.colors.primary} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 16,
    minHeight: 230,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: "600",
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  clearText: {
    fontSize: 13,
    fontWeight: "800",
  },
  helpBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 9,
  },
  helpText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  selector: {
    borderWidth: 1.5,
    borderRadius: 20,
    minHeight: 86,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectorIcon: {
    width: 54,
    height: 54,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  selectorHint: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: "600",
  },
  chevronBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});