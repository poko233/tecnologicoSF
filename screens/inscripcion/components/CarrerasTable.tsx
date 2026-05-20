import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { Carrera } from "../types/inscripcion.types";

type Props = {
  carreras: Carrera[];
  loading: boolean;
  onVerMaterias: (carrera: Carrera) => void;
};

export default function CarrerasTable({
  carreras,
  loading,
  onVerMaterias,
}: Props) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: "center", gap: 12 }}>
        <ActivityIndicator color={theme.colors.primary} />
        <ThemedText>Cargando carreras...</ThemedText>
      </View>
    );
  }

  if (carreras.length === 0) {
    return (
      <View
        style={{
          padding: 30,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 16,
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ThemedText style={{ fontWeight: "900", fontSize: 16 }}>
          No hay carreras disponibles
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      style={{
        maxHeight: 430,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: theme.colors.background,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={{
          minWidth: 980,
        }}
      >
        <View style={{ minWidth: 980 }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: theme.colors.secondary,
              paddingVertical: 16,
              paddingHorizontal: 18,
            }}
          >
            <HeaderCell width={220} text="NOMBRE" />
            <HeaderCell width={140} text="CÓDIGO" />
            <HeaderCell width={140} text="DURACIÓN" />
            <HeaderCell width={170} text="CARGA HORARIA" />
            <HeaderCell width={140} text="COSTO" />
            <HeaderCell width={160} text="ACCIÓN" />
          </View>

          <ScrollView
            showsVerticalScrollIndicator
            style={{
              maxHeight: 360,
            }}
          >
            {carreras.map((carrera) => (
              <View
                key={carrera.idCarrera}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 18,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.border,
                }}
              >
                <BodyCell width={220}>
                  <ThemedText style={{ fontWeight: "900" }}>
                    {carrera.nombreCarrera}
                  </ThemedText>
                </BodyCell>

                <BodyCell width={140}>
                  <ThemedText style={{ fontWeight: "700" }}>
                    {carrera.codigo}
                  </ThemedText>
                </BodyCell>

                <BodyCell width={140}>
                  <ThemedText style={{ fontWeight: "700" }}>
                    {carrera.duracionMeses
                      ? `${carrera.duracionMeses} meses`
                      : "-"}
                  </ThemedText>
                </BodyCell>

                <BodyCell width={170}>
                  <ThemedText style={{ fontWeight: "700" }}>
                    {carrera.cargaHoraria ?? "-"}
                  </ThemedText>
                </BodyCell>

                <BodyCell width={140}>
                  <ThemedText style={{ fontWeight: "700" }}>
                    Bs. {Number(carrera.costo ?? 0).toFixed(2)}
                  </ThemedText>
                </BodyCell>

                <BodyCell width={160}>
                  <Pressable
                    onPress={() => onVerMaterias(carrera)}
                    style={{
                      backgroundColor: theme.colors.primary,
                      borderRadius: 12,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      alignItems: "center",
                    }}
                  >
                    <ThemedText style={{ color: "#fff", fontWeight: "900" }}>
                      Ver materias
                    </ThemedText>
                  </Pressable>
                </BodyCell>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

function HeaderCell({ text, width }: { text: string; width: number }) {
  return (
    <View style={{ width }}>
      <ThemedText style={{ fontSize: 13, fontWeight: "900" }}>
        {text}
      </ThemedText>
    </View>
  );
}

function BodyCell({
  children,
  width,
}: {
  children: React.ReactNode;
  width: number;
}) {
  return (
    <View
      style={{
        width,
        paddingRight: 14,
      }}
    >
      {children}
    </View>
  );
}