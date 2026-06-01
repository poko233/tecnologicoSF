// screens/asistencia/components/ListModeView.tsx
import { useTheme } from "@/theme/useTheme";
import { ArrowDown, ArrowUp } from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { LocalAttendanceState } from "../hooks/useAsistencia";
import { AsistenciaTipo, EstudiantesResponse } from "../types/asistencia.types";
import { StudentRow } from "./StudentRow";

type SortOrder = "asc" | "desc";

interface Props {
  estudiantesData: EstudiantesResponse;
  selectedHorarioId: number | null;
  localState: LocalAttendanceState;
  onUpdateLocal: (
    idInscripcion: number,
    tipo: AsistenciaTipo | null,
    observacion?: string,
  ) => void;
  searchQuery: string;
  sortOrder: SortOrder;
  onSortToggle: () => void;
}

export function ListModeView({
  estudiantesData,
  selectedHorarioId,
  localState,
  onUpdateLocal,
  searchQuery,
  sortOrder,
  onSortToggle,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const listRef = useRef<FlatList>(null);

  const getApellido = (nombreCompleto: string) => {
    const partes = nombreCompleto.trim().split(/\s+/);
    if (partes.length === 0) return "";
    return partes[partes.length - 1].toLowerCase();
  };

  const sortedAndFiltered = useMemo(() => {
    const filtered = searchQuery.trim()
      ? estudiantesData.estudiantes.filter((e) =>
          e.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : estudiantesData.estudiantes;

    const sorted = [...filtered].sort((a, b) => {
      const apellidoA = getApellido(a.nombre_completo);
      const apellidoB = getApellido(b.nombre_completo);
      if (apellidoA < apellidoB) return sortOrder === "asc" ? -1 : 1;
      if (apellidoA > apellidoB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [estudiantesData.estudiantes, searchQuery, sortOrder]);

  // LA CABECERA AHORA VIVE AQUÍ ADENTRO
  const renderHeader = useCallback(
    () => (
      <View
        style={[
          styles.headerRow,
          {
            borderBottomColor: c.border,
            backgroundColor: c.backgroundSecondary,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          },
        ]}
      >
        <Pressable
          onPress={onSortToggle}
          style={[
            styles.headerCell,
            {
              flex: 2,
              paddingLeft: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            },
          ]}
        >
          <Text style={[styles.headerText, { color: c.textSecondary }]}>
            Estudiante
          </Text>
          {sortOrder === "asc" ? (
            <ArrowUp size={12} color={c.textSecondary} />
          ) : (
            <ArrowDown size={12} color={c.textSecondary} />
          )}
        </Pressable>
        <View style={[styles.headerCell, { flex: 2, alignItems: "center" }]}>
          <Text style={[styles.headerText, { color: c.textSecondary }]}>
            Estado
          </Text>
        </View>
        <View style={[styles.headerCell, { flex: 3, paddingRight: 16 }]}>
          <Text style={[styles.headerText, { color: c.textSecondary }]}>
            Observación
          </Text>
        </View>
      </View>
    ),
    [c, sortOrder, onSortToggle],
  );

  const renderItem = useCallback(
    ({
      item,
      index,
    }: {
      item: (typeof estudiantesData.estudiantes)[0];
      index: number;
    }) => {
      const asistenciaHoy = item.asistencias_hoy.find(
        (a) =>
          a.idHorario === selectedHorarioId ||
          (!a.idHorario && !selectedHorarioId),
      );
      const local = localState[item.id_inscripcion];
      const currentStatus =
        local?.tipo ?? asistenciaHoy?.asistencia?.tipo ?? null;
      const currentObs =
        local?.observacion ?? asistenciaHoy?.asistencia?.observacion ?? "";

      return (
        /* AQUÍ ESTÁ LA MAGIA: Solo al primer elemento (index === 0) le damos 
           un margen superior para que el tooltip tenga espacio de respirar */
        <View style={{ marginTop: index === 0 ? 7 : 0 }}>
          <StudentRow
            estudiante={item}
            selectedHorarioId={selectedHorarioId}
            currentStatus={currentStatus}
            currentObservacion={currentObs}
            onStatusChange={(tipo) => onUpdateLocal(item.id_inscripcion, tipo)}
            onObservacionChange={(text) =>
              onUpdateLocal(item.id_inscripcion, null, text)
            }
            index={index}
          />
        </View>
      );
    },
    [selectedHorarioId, localState, onUpdateLocal],
  );

  if (estudiantesData.estudiantes.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: c.card }]}>
        <Text style={{ color: c.textSecondary, fontSize: 16 }}>
          No hay estudiantes inscritos en este grupo.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={[
          styles.tableContainer,
          {
            backgroundColor: c.card,
            borderColor: c.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 3,
            // Quitamos el overflow: visible de aquí para que reviva el scroll
          },
        ]}
      >
        <FlatList
          ref={listRef}
          data={sortedAndFiltered}
          keyExtractor={(item) => item.id_inscripcion.toString()}
          /* EL TRUCO MAESTRO: La cabecera adentro de la lista y pegajosa */
          ListHeaderComponent={renderHeader}
          stickyHeaderIndices={[0]}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          initialNumToRender={20}
          windowSize={10}
          removeClippedSubviews={false} // Mantener en false para que los tooltips no desaparezcan raramente
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tableContainer: {
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  headerCell: {
    justifyContent: "center",
  },
  headerText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  listContent: {
    paddingBottom: 20,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    borderRadius: 12,
  },
});
