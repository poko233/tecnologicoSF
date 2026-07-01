import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

type Props = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
};

const COLOR_ERROR = "#EF4444";

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const dias = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDate(date: Date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function parseDate(value: string) {
  const parts = value.split("/");

  if (parts.length !== 3) {
    return null;
  }

  const day = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const year = Number(parts[2]);

  if (!day || month < 0 || !year) {
    return null;
  }

  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function calculateAge(date: Date) {
  const today = new Date();

  let age = today.getFullYear() - date.getFullYear();

  const passed =
    today.getMonth() > date.getMonth() ||
    (today.getMonth() === date.getMonth() &&
      today.getDate() >= date.getDate());

  if (!passed) {
    age--;
  }

  return age;
}

function isWhite(value: string) {
  return ["#fff", "#FFF", "#ffffff", "#FFFFFF", "white"].includes(value);
}

export default function FormDateInput({
  label,
  placeholder = "dd/mm/aaaa",
  value,
  onChangeText,
  error,
  required = false,
}: Props) {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();

  const isMobile = width < 560;
  const isSmallHeight = height < 760;
  const tieneError = Boolean(error);

  const today = useMemo(() => {
    const fecha = new Date();

    fecha.setHours(0, 0, 0, 0);

    return fecha;
  }, []);

  const currentYear = today.getFullYear();

  const initialDate = useMemo(() => {
    return parseDate(value) ?? today;
  }, [value, today]);

  const [open, setOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);

  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    parseDate(value),
  );

  useEffect(() => {
    const fecha = parseDate(value);

    setSelectedDate(fecha);

    const fechaParaVista = fecha ?? today;

    setViewMonth(fechaParaVista.getMonth());
    setViewYear(fechaParaVista.getFullYear());
  }, [value, today]);

  const activeTextColor = isWhite(theme.colors.primary)
    ? "#111827"
    : "#FFFFFF";

  const colorBorde = tieneError ? COLOR_ERROR : theme.colors.border;
  const colorEtiqueta = tieneError ? COLOR_ERROR : theme.colors.text;

  const age = selectedDate ? calculateAge(selectedDate) : null;

  const years = useMemo(() => {
    const list: number[] = [];

    for (let year = currentYear; year >= currentYear - 120; year--) {
      list.push(year);
    }

    return list;
  }, [currentYear]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);

    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    const daysArray: (Date | null)[] = [];

    for (let i = 0; i < startDay; i++) {
      daysArray.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      daysArray.push(new Date(viewYear, viewMonth, day));
    }

    while (daysArray.length < 42) {
      daysArray.push(null);
    }

    return daysArray;
  }, [viewMonth, viewYear]);

  const closePickers = () => {
    setMonthPickerOpen(false);
    setYearPickerOpen(false);
  };

  const abrirCalendario = () => {
    const fechaActual = parseDate(value);

    setSelectedDate(fechaActual);

    const fechaParaVista = fechaActual ?? today;

    setViewMonth(fechaParaVista.getMonth());
    setViewYear(fechaParaVista.getFullYear());

    closePickers();
    setOpen(true);
  };

  const handleSelectYear = (year: number) => {
    setViewYear(year);
    setYearPickerOpen(false);
  };

  const handleSelectMonth = (month: number) => {
    setViewMonth(month);
    setMonthPickerOpen(false);
  };

  const prevMonth = () => {
    closePickers();

    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
      return;
    }

    setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    closePickers();

    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
      return;
    }

    setViewMonth(viewMonth + 1);
  };

  const handleApply = () => {
    if (!selectedDate) {
      return;
    }

    onChangeText(formatDate(selectedDate));
    setOpen(false);
  };

  const dayCellHeight = isMobile || isSmallHeight ? 34 : 40;
  const calendarHeight = dayCellHeight * 6;

  return (
    <View style={{ flex: 1 }}>
      <ThemedText
        style={{
          fontSize: 12,
          marginBottom: 8,
          fontWeight: "900",
          color: colorEtiqueta,
        }}
      >
        {label}
        {required ? " *" : ""}
      </ThemedText>

      <Pressable onPress={abrirCalendario}>
        <View
          style={{
            height: 54,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colorBorde,
            backgroundColor: theme.colors.background,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
          }}
        >
          <TextInput
            editable={false}
            pointerEvents="none"
            placeholder={placeholder}
            placeholderTextColor={theme.colors.muted}
            value={value}
            style={{
              flex: 1,
              height: "100%",
              color: theme.colors.text,
              fontSize: 15,
              fontWeight: "800",
              outlineStyle: "none" as any,
            }}
          />

          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: tieneError
                ? "rgba(239,68,68,0.12)"
                : theme.colors.card,
              borderWidth: 1,
              borderColor: tieneError
                ? "rgba(239,68,68,0.65)"
                : theme.colors.border,
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={tieneError ? COLOR_ERROR : theme.colors.text}
            />
          </View>
        </View>
      </Pressable>

      {tieneError && (
        <ThemedText
          style={{
            color: COLOR_ERROR,
            fontSize: 12,
            marginTop: 6,
            fontWeight: "800",
          }}
        >
          {error}
        </ThemedText>
      )}

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.72)",
            justifyContent: "center",
            alignItems: "center",
            padding: isMobile ? 10 : 18,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 520,
              maxHeight: "94%",
              backgroundColor: theme.colors.card,
              borderRadius: 26,
              borderWidth: 1,
              borderColor: theme.colors.border,
              shadowColor: "#000",
              shadowOpacity: 0.35,
              shadowRadius: 30,
              elevation: 14,
              overflow: "hidden",
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: isMobile ? 14 : 20,
                paddingBottom: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{
                      fontSize: isMobile ? 20 : 24,
                      fontWeight: "900",
                      color: theme.colors.text,
                    }}
                  >
                    Fecha de nacimiento
                  </ThemedText>

                  <ThemedText
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      fontWeight: "700",
                      color: theme.colors.muted,
                    }}
                  >
                    Selecciona día, mes y año.
                  </ThemedText>
                </View>

                <Pressable
                  onPress={() => setOpen(false)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.colors.background,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Ionicons name="close" size={22} color={theme.colors.text} />
                </Pressable>
              </View>

              <View
                style={{
                  backgroundColor: theme.colors.background,
                  borderRadius: 20,
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "center",
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{
                      color: theme.colors.muted,
                      fontWeight: "900",
                      fontSize: 10,
                      marginBottom: 4,
                    }}
                  >
                    FECHA SELECCIONADA
                  </ThemedText>

                  <ThemedText
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      fontSize: isMobile ? 18 : 22,
                    }}
                  >
                    {selectedDate ? formatDate(selectedDate) : "Sin fecha"}
                  </ThemedText>
                </View>

                <View
                  style={{
                    paddingVertical: 9,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    backgroundColor: theme.colors.primary,
                    alignSelf: isMobile ? "flex-start" : "center",
                  }}
                >
                  <ThemedText
                    style={{
                      color: activeTextColor,
                      fontWeight: "900",
                      fontSize: 13,
                    }}
                  >
                    {age !== null ? `${age} años` : "-- años"}
                  </ThemedText>
                </View>
              </View>

              <View
                style={{
                  zIndex: 50,
                  flexDirection: isMobile ? "column" : "row",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Pressable
                    onPress={() => {
                      setMonthPickerOpen(!monthPickerOpen);
                      setYearPickerOpen(false);
                    }}
                    style={{
                      height: 46,
                      borderRadius: 15,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 12,
                    }}
                  >
                    <ThemedText
                      style={{
                        color: theme.colors.text,
                        fontWeight: "900",
                        fontSize: 13,
                      }}
                    >
                      {meses[viewMonth]}
                    </ThemedText>

                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={theme.colors.text}
                    />
                  </Pressable>

                  {monthPickerOpen && (
                    <View
                      style={{
                        marginTop: 8,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 16,
                        overflow: "hidden",
                        backgroundColor: theme.colors.card,
                      }}
                    >
                      <ScrollView style={{ maxHeight: 190 }}>
                        {meses.map((mes, index) => {
                          const active = index === viewMonth;

                          return (
                            <Pressable
                              key={mes}
                              onPress={() => handleSelectMonth(index)}
                              style={{
                                paddingVertical: 12,
                                paddingHorizontal: 14,
                                backgroundColor: active
                                  ? theme.colors.primary
                                  : theme.colors.card,
                                borderBottomWidth: 1,
                                borderBottomColor: theme.colors.border,
                              }}
                            >
                              <ThemedText
                                style={{
                                  color: active
                                    ? activeTextColor
                                    : theme.colors.text,
                                  fontWeight: "900",
                                  fontSize: 13,
                                }}
                              >
                                {mes}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Pressable
                    onPress={() => {
                      setYearPickerOpen(!yearPickerOpen);
                      setMonthPickerOpen(false);
                    }}
                    style={{
                      height: 46,
                      borderRadius: 15,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 12,
                    }}
                  >
                    <ThemedText
                      style={{
                        color: theme.colors.text,
                        fontWeight: "900",
                        fontSize: 13,
                      }}
                    >
                      {viewYear}
                    </ThemedText>

                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={theme.colors.text}
                    />
                  </Pressable>

                  {yearPickerOpen && (
                    <View
                      style={{
                        marginTop: 8,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 16,
                        overflow: "hidden",
                        backgroundColor: theme.colors.card,
                      }}
                    >
                      <ScrollView style={{ maxHeight: 190 }}>
                        {years.map((year) => {
                          const active = year === viewYear;

                          return (
                            <Pressable
                              key={year}
                              onPress={() => handleSelectYear(year)}
                              style={{
                                paddingVertical: 12,
                                paddingHorizontal: 14,
                                backgroundColor: active
                                  ? theme.colors.primary
                                  : theme.colors.card,
                                borderBottomWidth: 1,
                                borderBottomColor: theme.colors.border,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <ThemedText
                                style={{
                                  color: active
                                    ? activeTextColor
                                    : theme.colors.text,
                                  fontWeight: "900",
                                }}
                              >
                                {year}
                              </ThemedText>

                              {active && (
                                <Ionicons
                                  name="checkmark-circle"
                                  size={18}
                                  color={activeTextColor}
                                />
                              )}
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              <View
                style={{
                  backgroundColor: theme.colors.background,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  padding: isMobile ? 10 : 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Pressable
                    onPress={prevMonth}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 13,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: theme.colors.card,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color={theme.colors.text}
                    />
                  </Pressable>

                  <ThemedText
                    numberOfLines={1}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: isMobile ? 15 : 18,
                      fontWeight: "900",
                      color: theme.colors.text,
                      paddingHorizontal: 8,
                    }}
                  >
                    {meses[viewMonth]} {viewYear}
                  </ThemedText>

                  <Pressable
                    onPress={nextMonth}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 13,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: theme.colors.card,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.text}
                    />
                  </Pressable>
                </View>

                <View style={{ flexDirection: "row", marginBottom: 6 }}>
                  {dias.map((dia) => (
                    <ThemedText
                      key={dia}
                      style={{
                        width: `${100 / 7}%`,
                        textAlign: "center",
                        fontWeight: "900",
                        color: theme.colors.muted,
                        fontSize: 11,
                      }}
                    >
                      {dia}
                    </ThemedText>
                  ))}
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    height: calendarHeight,
                  }}
                >
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return (
                        <View
                          key={`empty-${index}`}
                          style={{
                            width: `${100 / 7}%`,
                            height: dayCellHeight,
                          }}
                        />
                      );
                    }

                    const active = selectedDate
                      ? isSameDate(date, selectedDate)
                      : false;

                    const isToday = isSameDate(date, today);

                    return (
                      <Pressable
                        key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                        onPress={() => {
                          closePickers();
                          setSelectedDate(date);
                        }}
                        style={{
                          width: `${100 / 7}%`,
                          height: dayCellHeight,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            width: isMobile ? 30 : 34,
                            height: isMobile ? 30 : 34,
                            borderRadius: 999,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: active
                              ? theme.colors.primary
                              : isToday
                                ? theme.colors.card
                                : "transparent",
                            borderWidth: isToday && !active ? 1 : 0,
                            borderColor: theme.colors.border,
                          }}
                        >
                          <ThemedText
                            style={{
                              color: active
                                ? activeTextColor
                                : theme.colors.text,
                              fontWeight: active || isToday ? "900" : "700",
                              fontSize: 12,
                            }}
                          >
                            {date.getDate()}
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                paddingHorizontal: isMobile ? 14 : 20,
                paddingVertical: 14,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
                backgroundColor: theme.colors.card,
              }}
            >
              <Pressable
                onPress={() => setOpen(false)}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme.colors.background,
                  flexDirection: "row",
                  gap: 6,
                }}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={17}
                  color={theme.colors.text}
                />

                <ThemedText
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    fontSize: 12,
                  }}
                >
                  Cancelar
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={handleApply}
                disabled={!selectedDate}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 15,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme.colors.primary,
                  opacity: !selectedDate ? 0.55 : 1,
                  flexDirection: "row",
                  gap: 6,
                  borderWidth: 1,
                  borderColor: theme.colors.primary,
                }}
              >
                <ThemedText
                  style={{
                    color: activeTextColor,
                    fontWeight: "900",
                    fontSize: 12,
                  }}
                >
                  Aplicar
                </ThemedText>

                <Ionicons
                  name="checkmark-circle"
                  size={17}
                  color={activeTextColor}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}