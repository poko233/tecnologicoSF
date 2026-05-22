import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

import { Carrera } from "../types/inscripcion.types";

type Props = {
  carreras: Carrera[];

  loading: boolean;

  onVerMaterias: (
    carrera: Carrera
  ) => void;
};

type CellProps = {
  width: number;

  children: React.ReactNode;
};

type HeaderProps = {
  width: number;

  text: string;
};

function HeaderCell({
  width,
  text,
}: HeaderProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        width,

        justifyContent: "center",
      }}
    >
      <ThemedText
        style={{
          fontSize: 14,

          fontWeight: "900",

          color: theme.colors.text,
        }}
      >
        {text}
      </ThemedText>
    </View>
  );
}

function BodyCell({
  width,
  children,
}: CellProps) {
  return (
    <View
      style={{
        width,

        justifyContent: "center",

        paddingRight: 12,
      }}
    >
      {children}
    </View>
  );
}

export default function CarrerasTable({
  carreras,
  loading,
  onVerMaterias,
}: Props) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <View
        style={{
          paddingVertical: 60,

          justifyContent: "center",

          alignItems: "center",

          gap: 14,
        }}
      >
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
        />

        <ThemedText
          style={{
            color: theme.colors.text,

            fontWeight: "700",
          }}
        >
          Cargando carreras...
        </ThemedText>
      </View>
    );
  }

  if (carreras.length === 0) {
    return (
      <View
        style={{
          padding: 30,

          borderWidth: 1,

          borderColor:
            theme.colors.border,

          borderRadius: 18,

          backgroundColor:
            theme.colors.background,

          alignItems: "center",

          justifyContent: "center",
        }}
      >
        <Ionicons
          name="school-outline"
          size={40}
          color={theme.colors.muted}
        />

        <ThemedText
          style={{
            marginTop: 14,

            fontSize: 18,

            fontWeight: "900",

            color: theme.colors.text,
          }}
        >
          No hay carreras disponibles
        </ThemedText>

        <ThemedText
          style={{
            marginTop: 6,

            color: theme.colors.muted,

            textAlign: "center",

            fontWeight: "600",
          }}
        >
          Todavía no existen programas
          académicos registrados.
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      style={{
        maxHeight: 430,

        borderWidth: 1,

        borderColor:
          theme.colors.border,

        borderRadius: 22,

        overflow: "hidden",

        backgroundColor:
          theme.colors.background,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={{
          minWidth: 1120,
        }}
      >
        <View style={{ minWidth: 1120 }}>
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",

              backgroundColor:
                theme.colors.secondary,

              borderBottomWidth: 1,

              borderBottomColor:
                theme.colors.border,

              paddingVertical: 18,

              paddingHorizontal: 20,
            }}
          >
            <HeaderCell
              width={260}
              text="NOMBRE"
            />

            <HeaderCell
              width={150}
              text="CÓDIGO"
            />

            <HeaderCell
              width={160}
              text="DURACIÓN"
            />

            <HeaderCell
              width={190}
              text="CARGA HORARIA"
            />

            <HeaderCell
              width={140}
              text="COSTO"
            />

            <HeaderCell
              width={180}
              text="ACCIÓN"
            />
          </View>

          {/* BODY */}
          <ScrollView
            showsVerticalScrollIndicator
            style={{
              maxHeight: 360,
            }}
          >
            {carreras.map(
              (carrera, index) => (
                <View
                  key={carrera.idCarrera}
                  style={{
                    flexDirection: "row",

                    alignItems: "center",

                    paddingVertical: 18,

                    paddingHorizontal: 20,

                    borderBottomWidth:
                      index ===
                      carreras.length - 1
                        ? 0
                        : 1,

                    borderBottomColor:
                      theme.colors.border,

                    backgroundColor:
                      index % 2 === 0
                        ? theme.colors.background
                        : theme.colors.card,
                  }}
                >
                  <BodyCell width={260}>
                    <ThemedText
                      style={{
                        fontWeight: "900",

                        fontSize: 15,

                        color:
                          theme.colors.text,
                      }}
                    >
                      {
                        carrera.nombreCarrera
                      }
                    </ThemedText>

                    <ThemedText
                      style={{
                        marginTop: 4,

                        fontSize: 12,

                        color:
                          theme.colors.muted,

                        fontWeight: "700",
                      }}
                    >
                      {carrera.tipo}
                    </ThemedText>
                  </BodyCell>

                  <BodyCell width={150}>
                    <ThemedText
                      style={{
                        color:
                          theme.colors.text,

                        fontWeight: "800",
                      }}
                    >
                      {carrera.codigo}
                    </ThemedText>
                  </BodyCell>

                  <BodyCell width={160}>
                    <ThemedText
                      style={{
                        color:
                          theme.colors.text,

                        fontWeight: "700",
                      }}
                    >
                      {carrera.duracionMeses
                        ? `${carrera.duracionMeses} meses`
                        : "-"}
                    </ThemedText>
                  </BodyCell>

                  <BodyCell width={190}>
                    <ThemedText
                      style={{
                        color:
                          theme.colors.text,

                        fontWeight: "700",
                      }}
                    >
                      {carrera.cargaHoraria ||
                        "-"}
                    </ThemedText>
                  </BodyCell>

                  <BodyCell width={140}>
                    <ThemedText
                      style={{
                        color:
                          theme.colors.success,

                        fontWeight: "900",
                      }}
                    >
                      Bs.{" "}
                      {Number(
                        carrera.costo ?? 0
                      ).toFixed(2)}
                    </ThemedText>
                  </BodyCell>

                  <BodyCell width={180}>
                    <Pressable
                      onPress={() =>
                        onVerMaterias(
                          carrera
                        )
                      }
                      style={{
                        height: 44,

                        borderRadius: 14,

                        backgroundColor:
                          theme.colors.primary,

                        justifyContent:
                          "center",

                        alignItems:
                          "center",

                        flexDirection:
                          "row",

                        gap: 8,
                      }}
                    >
                      <Ionicons
                        name="book-outline"
                        size={18}
                        color="#FFFFFF"
                      />

                      <ThemedText
                        style={{
                          color:
                            "#FFFFFF",

                          fontWeight:
                            "900",

                          fontSize: 13,
                        }}
                      >
                        Ver materias
                      </ThemedText>
                    </Pressable>
                  </BodyCell>
                </View>
              )
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}