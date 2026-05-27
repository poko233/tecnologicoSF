import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import {
    GrupoSeleccionado,
    HorarioGrupo,
} from "../types/inscripcion.types";

type Props = {
  visible: boolean;
  gruposSeleccionados: GrupoSeleccionado[];
  onClose: () => void;
};

const DIAS_ORDEN = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function normalizarDia(dia?: string) {
  if (!dia) return "";
  if (dia === "Miercoles") return "Miércoles";
  if (dia === "Sabado") return "Sábado";
  return dia;
}

function diaCorto(dia: string) {
  const d = normalizarDia(dia);

  if (d === "Miércoles") return "MIÉ";
  if (d === "Sábado") return "SÁB";

  return d.slice(0, 3).toUpperCase();
}

function formatoHora(hora?: string) {
  return hora ? hora.slice(0, 5) : "--:--";
}

function aMinutos(hora?: string) {
  if (!hora) return 0;

  const [h, m] = hora.slice(0, 5).split(":").map(Number);

  return h * 60 + m;
}

function desdeMinutos(minutos: number) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function hayChoque(a: HorarioGrupo, b: HorarioGrupo) {
  if (normalizarDia(a.dia) !== normalizarDia(b.dia)) return false;

  const inicioA = aMinutos(a.horaInicio);
  const finA = aMinutos(a.horaFin);
  const inicioB = aMinutos(b.horaInicio);
  const finB = aMinutos(b.horaFin);

  return inicioA < finB && inicioB < finA;
}

function colorEvento(index: number) {
  const colores = [
    {
      bg: "rgba(59,130,246,0.16)",
      border: "rgba(59,130,246,0.45)",
      text: "#1d4ed8",
      pdfBg: "#dbeafe",
      pdfBorder: "#60a5fa",
      pdfText: "#1d4ed8",
    },
    {
      bg: "rgba(139,92,246,0.16)",
      border: "rgba(139,92,246,0.45)",
      text: "#6d28d9",
      pdfBg: "#ede9fe",
      pdfBorder: "#a78bfa",
      pdfText: "#6d28d9",
    },
    {
      bg: "rgba(16,185,129,0.16)",
      border: "rgba(16,185,129,0.45)",
      text: "#047857",
      pdfBg: "#d1fae5",
      pdfBorder: "#34d399",
      pdfText: "#047857",
    },
    {
      bg: "rgba(245,158,11,0.18)",
      border: "rgba(245,158,11,0.45)",
      text: "#92400e",
      pdfBg: "#fef3c7",
      pdfBorder: "#f59e0b",
      pdfText: "#92400e",
    },
  ];

  return colores[index % colores.length];
}

export default function HorarioSeleccionadoModal({
  visible,
  gruposSeleccionados,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width < 800;

  const eventos = gruposSeleccionados.flatMap((grupo, grupoIndex) =>
    (grupo.horarios ?? []).map((horario) => ({
      grupo,
      horario,
      color: colorEvento(grupoIndex),
    }))
  );

  const choques = eventos.flatMap((actual, index) =>
    eventos
      .slice(index + 1)
      .filter((otro) => hayChoque(actual.horario, otro.horario))
      .map((otro) => ({
        a: actual,
        b: otro,
      }))
  );

  const minutosEventos = eventos.flatMap((item) => [
    aMinutos(item.horario.horaInicio),
    aMinutos(item.horario.horaFin),
  ]);

  const horaInicioMin =
    minutosEventos.length > 0
      ? Math.floor(Math.min(...minutosEventos) / 60) * 60
      : 7 * 60;

  const horaFinMin =
    minutosEventos.length > 0
      ? Math.ceil(Math.max(...minutosEventos) / 60) * 60
      : 21 * 60;

  const rangoMinutos = Math.max(60, horaFinMin - horaInicioMin);

  const horasNecesarias = Array.from(
    {
      length: Math.floor(rangoMinutos / 60) + 1,
    },
    (_, index) => desdeMinutos(horaInicioMin + index * 60)
  );

  const altoHora = isMobile ? 78 : 92;
  const anchoDia = isMobile ? 175 : 220;
  const anchoHora = isMobile ? 66 : 78;

  const generarBloques = (dia: string) => {
    return eventos
      .filter(
        (item) =>
          normalizarDia(item.horario.dia) === normalizarDia(dia)
      )
      .flatMap((item) => {
        const inicio = aMinutos(item.horario.horaInicio);
        const fin = aMinutos(item.horario.horaFin);

        const bloques = [];

        for (let min = inicio; min < fin; min += 60) {
          bloques.push({
            ...item,
            horaInicioBloque: desdeMinutos(min),
            horaFinBloque: desdeMinutos(Math.min(min + 60, fin)),
            top: ((min - horaInicioMin) / 60) * altoHora,
          });
        }

        return bloques;
      });
  };

  const exportarPDF = async () => {
  try {
    if (eventos.length === 0) {
      Alert.alert("Sin horarios", "No hay horarios para exportar.");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Horario seleccionado</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 8mm;
            }

            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body {
              font-family: Arial, sans-serif;
              color: #111827;
              margin: 0;
              padding: 0;
              background: #ffffff;
            }

            h1 {
              font-size: 24px;
              margin: 0;
              font-weight: 900;
            }

            .subtitle {
              color: #6b7280;
              font-size: 12px;
              font-weight: 700;
              margin-top: 4px;
              margin-bottom: 12px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
              border: 1px solid #d1d5db;
            }

            th {
              background: #f3f4f6;
              color: #111827;
              font-size: 11px;
              font-weight: 900;
              padding: 7px;
              border: 1px solid #d1d5db;
              text-align: center;
            }

            td {
              border: 1px solid #d1d5db;
              height: 62px;
              padding: 4px;
              vertical-align: middle;
              text-align: center;
            }

            .hour {
              width: 55px;
              background: #f9fafb;
              color: #6b7280;
              font-size: 11px;
              font-weight: 900;
            }

            .block {
              width: 100%;
              min-height: 48px;
              border-radius: 8px;
              padding: 4px;
              text-align: center;
              font-weight: 800;
            }

            .materia {
              font-size: 10px;
              font-weight: 900;
              margin-bottom: 2px;
            }

            .grupo {
              font-size: 9px;
              color: #374151;
            }

            .hora {
              font-size: 9px;
              font-weight: 900;
              margin-top: 2px;
            }

            .codigo {
              font-size: 8px;
              color: #6b7280;
              margin-top: 2px;
            }
          </style>
        </head>

        <body>
          <h1>Horario seleccionado</h1>
          <div class="subtitle">
            ${gruposSeleccionados.length} grupo(s) seleccionado(s)
          </div>

          <table>
            <thead>
              <tr>
                <th class="hour">Hora</th>
                ${DIAS_ORDEN.map((dia) => `<th>${dia}</th>`).join("")}
              </tr>
            </thead>

            <tbody>
              ${horasNecesarias
                .slice(0, -1)
                .map((hora) => {
                  const horaActual = aMinutos(hora);
                  const horaSiguiente = horaActual + 60;

                  return `
                    <tr>
                      <td class="hour">${hora}</td>

                      ${DIAS_ORDEN.map((dia) => {
                        const bloques = eventos.filter((item) => {
                          const mismoDia =
                            normalizarDia(item.horario.dia) === normalizarDia(dia);

                          const inicio = aMinutos(item.horario.horaInicio);
                          const fin = aMinutos(item.horario.horaFin);

                          return mismoDia && inicio < horaSiguiente && fin > horaActual;
                        });

                        return `
                          <td>
                            ${bloques
                              .map((item) => {
                                const inicioBloque = Math.max(
                                  horaActual,
                                  aMinutos(item.horario.horaInicio)
                                );

                                const finBloque = Math.min(
                                  horaSiguiente,
                                  aMinutos(item.horario.horaFin)
                                );

                                return `
                                  <div
                                    class="block"
                                    style="
                                      background:${item.color.pdfBg};
                                      border:1px solid ${item.color.pdfBorder};
                                      color:${item.color.pdfText};
                                    "
                                  >
                                    <div class="materia">
                                      ${item.grupo.nombreMateria ?? "Materia sin nombre"}
                                    </div>
                                    <div class="grupo">${item.grupo.nombre}</div>
                                    <div class="hora">
                                      ${desdeMinutos(inicioBloque)} - ${desdeMinutos(finBloque)}
                                    </div>
                                    <div class="codigo">
                                      ${item.grupo.codigo ?? "-"} · Paralelo ${item.grupo.paralelo || "-"}
                                    </div>
                                  </div>
                                `;
                              })
                              .join("")}
                          </td>
                        `;
                      }).join("")}
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    if (Platform.OS === "web") {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;

      if (!doc) {
        Alert.alert("Error", "No se pudo preparar el PDF.");
        return;
      }

      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);

      return;
    }

    await Print.printAsync({
      html,
      orientation: Print.Orientation.landscape,
    });
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "No se pudo exportar el horario a PDF.");
  }
};

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              padding: isMobile ? 16 : 26,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <ThemedText
                style={[
                  styles.title,
                  {
                    color: theme.colors.text,
                    fontSize: isMobile ? 26 : 34,
                  },
                ]}
              >
                Horario seleccionado
              </ThemedText>

              <ThemedText
                style={[
                  styles.subtitle,
                  {
                    color: theme.colors.muted,
                  },
                ]}
              >
                {gruposSeleccionados.length} grupo(s) seleccionado(s)
              </ThemedText>
            </View>

            <Pressable
              onPress={exportarPDF}
              disabled={eventos.length === 0}
              style={[
                styles.exportButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                  opacity: eventos.length === 0 ? 0.5 : 1,
                },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={theme.colors.primary}
              />

              <ThemedText
                style={[
                  styles.exportText,
                  {
                    color: theme.colors.primary,
                  },
                ]}
              >
                PDF
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                },
              ]}
            >
              <Ionicons name="close" size={26} color={theme.colors.text} />
            </Pressable>
          </View>

          {choques.length > 0 && (
            <View style={styles.alertBox}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning-outline" size={20} color="#ef4444" />

                <ThemedText style={styles.alertTitle}>
                  Hay choques de horario
                </ThemedText>
              </View>

              {choques.map((choque, index) => (
                <ThemedText
                  key={index}
                  style={[
                    styles.alertText,
                    {
                      color: theme.colors.text,
                    },
                  ]}
                >
                  {choque.a.grupo.nombre} choca con {choque.b.grupo.nombre} el{" "}
                  {normalizarDia(choque.a.horario.dia)} de{" "}
                  {formatoHora(choque.a.horario.horaInicio)} a{" "}
                  {formatoHora(choque.a.horario.horaFin)}
                </ThemedText>
              ))}
            </View>
          )}

          {eventos.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons
                name="calendar-outline"
                size={56}
                color={theme.colors.muted}
              />

              <ThemedText
                style={[
                  styles.emptyTitle,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                No hay horarios para mostrar
              </ThemedText>

              <ThemedText
                style={[
                  styles.emptyText,
                  {
                    color: theme.colors.muted,
                  },
                ]}
              >
                Los grupos seleccionados no tienen horarios asignados.
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              style={{ maxHeight: isMobile ? 430 : 560 }}
              showsVerticalScrollIndicator
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator
                contentContainerStyle={{ paddingBottom: 8 }}
              >
                <View
                  style={[
                    styles.calendar,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                >
                  <View style={styles.calendarHeader}>
                    <View
                      style={[
                        styles.hourHeader,
                        {
                          width: anchoHora,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="time-outline"
                        size={18}
                        color={theme.colors.muted}
                      />
                    </View>

                    {DIAS_ORDEN.map((dia) => (
                      <View
                        key={dia}
                        style={[
                          styles.dayColumnHeader,
                          {
                            width: anchoDia,
                            borderColor: theme.colors.border,
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.dayShort,
                            {
                              color: theme.colors.text,
                            },
                          ]}
                        >
                          {diaCorto(dia)}
                        </ThemedText>

                        <ThemedText
                          style={[
                            styles.dayFull,
                            {
                              color: theme.colors.muted,
                            },
                          ]}
                        >
                          {dia}
                        </ThemedText>
                      </View>
                    ))}
                  </View>

                  <View style={styles.calendarBody}>
                    <View style={{ width: anchoHora }}>
                      {horasNecesarias.map((hora) => (
                        <View
                          key={hora}
                          style={[
                            styles.hourCell,
                            {
                              height: altoHora,
                              borderColor: theme.colors.border,
                            },
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.hourText,
                              {
                                color: theme.colors.muted,
                              },
                            ]}
                          >
                            {hora}
                          </ThemedText>
                        </View>
                      ))}
                    </View>

                    {DIAS_ORDEN.map((dia) => (
                      <View
                        key={dia}
                        style={[
                          styles.dayColumn,
                          {
                            width: anchoDia,
                            borderColor: theme.colors.border,
                          },
                        ]}
                      >
                        {horasNecesarias.map((hora) => (
                          <View
                            key={`${dia}-${hora}`}
                            style={[
                              styles.gridCell,
                              {
                                height: altoHora,
                                borderColor: theme.colors.border,
                              },
                            ]}
                          />
                        ))}

                        {generarBloques(dia).map((item, index) => {
                          const tieneChoque = eventos.some(
                            (otro) =>
                              otro.grupo.idGrupo !== item.grupo.idGrupo &&
                              hayChoque(item.horario, otro.horario)
                          );

                          return (
                            <View
                              key={`${item.grupo.idGrupo}-${item.horario.idHorario}-${item.horaInicioBloque}-${index}`}
                              style={[
                                styles.eventCard,
                                {
                                  top: item.top + 5,
                                  height: altoHora - 10,
                                  left: 8,
                                  right: 8,
                                  backgroundColor: tieneChoque
                                    ? "rgba(239,68,68,0.16)"
                                    : item.color.bg,
                                  borderColor: tieneChoque
                                    ? "#ef4444"
                                    : item.color.border,
                                },
                              ]}
                            >
                              <ThemedText
                                numberOfLines={2}
                                style={[
                                  styles.eventTitle,
                                  {
                                    color: tieneChoque
                                      ? "#991b1b"
                                      : item.color.text,
                                  },
                                ]}
                              >
                                {item.grupo.nombreMateria ??
                                  "Materia sin nombre"}
                              </ThemedText>

                              <ThemedText
                                numberOfLines={1}
                                style={[
                                  styles.eventGroup,
                                  {
                                    color: theme.colors.text,
                                  },
                                ]}
                              >
                                {item.grupo.nombre}
                              </ThemedText>

                              <View style={styles.eventHourRow}>
                                <Ionicons
                                  name="time-outline"
                                  size={12}
                                  color={
                                    tieneChoque ? "#991b1b" : item.color.text
                                  }
                                />

                                <ThemedText
                                  numberOfLines={1}
                                  style={[
                                    styles.eventHour,
                                    {
                                      color: tieneChoque
                                        ? "#991b1b"
                                        : item.color.text,
                                    },
                                  ]}
                                >
                                  {item.horaInicioBloque} -{" "}
                                  {item.horaFinBloque}
                                </ThemedText>
                              </View>

                              <ThemedText
                                numberOfLines={1}
                                style={[
                                  styles.eventCode,
                                  {
                                    color: theme.colors.muted,
                                  },
                                ]}
                              >
                                {item.grupo.codigo} · Paralelo{" "}
                                {item.grupo.paralelo || "-"}
                              </ThemedText>
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  modal: {
    width: "100%",
    maxWidth: 1220,
    maxHeight: "92%",
    borderRadius: 26,
    borderWidth: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },

  title: {
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "800",
  },

  exportButton: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },

  exportText: {
    fontSize: 13,
    fontWeight: "900",
  },

  closeButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  alertBox: {
    borderWidth: 1,
    borderColor: "#ef4444",
    backgroundColor: "rgba(239,68,68,0.10)",
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },

  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  alertTitle: {
    color: "#ef4444",
    fontWeight: "900",
    fontSize: 16,
  },

  alertText: {
    fontSize: 13,
    fontWeight: "700",
  },

  empty: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  calendar: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
    minWidth: 1040,
  },

  calendarHeader: {
    flexDirection: "row",
  },

  hourHeader: {
    height: 74,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  dayColumnHeader: {
    height: 74,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  dayShort: {
    fontSize: 17,
    fontWeight: "900",
  },

  dayFull: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },

  calendarBody: {
    flexDirection: "row",
  },

  hourCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 6,
  },

  hourText: {
    fontSize: 12,
    fontWeight: "900",
  },

  dayColumn: {
    position: "relative",
    borderRightWidth: 1,
  },

  gridCell: {
    borderBottomWidth: 1,
  },

  eventCard: {
    position: "absolute",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
    justifyContent: "center",
  },

  eventTitle: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    textAlign: "center",
  },

  eventGroup: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    textAlign: "center",
    opacity: 0.85,
  },

  eventHourRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    marginTop: 1,
  },

  eventHour: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
  },

  eventCode: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 1,
  },
});