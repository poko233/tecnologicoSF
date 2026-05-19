import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

type Props = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
};

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
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
  if (parts.length !== 3) return null;

  const day = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const year = Number(parts[2]);

  if (!day || month < 0 || !year) return null;

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

  if (!passed) age--;

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
}: Props) {
  const { theme } = useTheme();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentYear = today.getFullYear();

  const maxBirthDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  maxBirthDate.setHours(0, 0, 0, 0);

  const parsedValue = parseDate(value);

  const initialDate =
    parsedValue && parsedValue <= maxBirthDate
      ? parsedValue
      : maxBirthDate;

  const [open, setOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);

  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(parsedValue);

  const activeTextColor = isWhite(theme.colors.primary) ? "#111827" : "#FFFFFF";

  const age = selectedDate ? calculateAge(selectedDate) : null;
  const canApply = selectedDate !== null && selectedDate <= maxBirthDate;
  const isUnderAge = selectedDate !== null && !canApply;

  const years = useMemo(() => {
    const list: number[] = [];

    for (let year = currentYear - 18; year >= currentYear - 100; year--) {
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

    return daysArray;
  }, [viewMonth, viewYear]);

  const closePickers = () => {
    setMonthPickerOpen(false);
    setYearPickerOpen(false);
  };

  const handleSelectYear = (year: number) => {
    setViewYear(year);
    setYearPickerOpen(false);

    if (new Date(year, viewMonth, 1) > maxBirthDate) {
      setViewMonth(maxBirthDate.getMonth());
    }
  };

  const handleSelectMonth = (month: number) => {
    if (new Date(viewYear, month, 1) > maxBirthDate) return;

    setViewMonth(month);
    setMonthPickerOpen(false);
  };

  const prevMonth = () => {
    closePickers();

    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    closePickers();

    const next = new Date(viewYear, viewMonth + 1, 1);
    if (next > maxBirthDate) return;

    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleApply = () => {
    if (!canApply || !selectedDate) return;

    onChangeText(formatDate(selectedDate));
    setOpen(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ThemedText
        style={{
          fontSize: 12,
          marginBottom: 8,
          fontWeight: "800",
          color: theme.colors.text,
        }}
      >
        {label}
      </ThemedText>

      <Pressable onPress={() => setOpen(true)}>
        <View
          style={{
            height: 52,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.border,
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
              outlineStyle: "none" as any,
            }}
          />

          <Ionicons
            name="calendar-outline"
            size={20}
            color={theme.colors.text}
          />
        </View>
      </Pressable>

      <Modal transparent visible={open} animationType="fade">
        <Pressable
          onPress={closePickers}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.65)",
            justifyContent: "center",
            alignItems: "center",
            padding: 18,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 470,
              maxHeight: "96%",
              backgroundColor: theme.colors.card,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 20,
              shadowColor: "#000",
              shadowOpacity: 0.35,
              shadowRadius: 30,
              elevation: 14,
              overflow: "visible",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={{
                    fontSize: 24,
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
                  Solo mayores de 17 años
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
                borderRadius: 18,
                paddingVertical: 14,
                paddingHorizontal: 14,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isUnderAge ? "#EF4444" : theme.colors.border,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
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
                  SELECCIONADA
                </ThemedText>

                <ThemedText
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    fontSize: 20,
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
                  backgroundColor: isUnderAge
                    ? "#EF4444"
                    : theme.colors.primary,
                }}
              >
                <ThemedText
                  style={{
                    color: isUnderAge ? "#FFFFFF" : activeTextColor,
                    fontWeight: "900",
                    fontSize: 13,
                  }}
                >
                  {age !== null ? `${age} años` : "-- años"}
                </ThemedText>
              </View>
            </View>

            {isUnderAge && (
              <ThemedText
                style={{
                  color: "#EF4444",
                  fontWeight: "800",
                  fontSize: 12,
                  marginBottom: 10,
                }}
              >
                Debe tener 18 años o más.
              </ThemedText>
            )}

            <View
              style={{
                position: "relative",
                zIndex: 50,
                flexDirection: "row",
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
                    height: 44,
                    borderRadius: 14,
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
                      position: "absolute",
                      top: 50,
                      left: 0,
                      right: 0,
                      zIndex: 999,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: 16,
                      overflow: "hidden",
                      backgroundColor: theme.colors.card,
                      elevation: 20,
                    }}
                  >
                    <ScrollView style={{ maxHeight: 220 }}>
                      {meses.map((mes, index) => {
                        const disabled =
                          new Date(viewYear, index, 1) > maxBirthDate;
                        const active = index === viewMonth;

                        return (
                          <Pressable
                            key={mes}
                            disabled={disabled}
                            onPress={() => handleSelectMonth(index)}
                            style={{
                              paddingVertical: 12,
                              paddingHorizontal: 14,
                              backgroundColor: active
                                ? theme.colors.primary
                                : theme.colors.card,
                              opacity: disabled ? 0.35 : 1,
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
                    height: 44,
                    borderRadius: 14,
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
                      position: "absolute",
                      top: 50,
                      left: 0,
                      right: 0,
                      zIndex: 999,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: 16,
                      overflow: "hidden",
                      backgroundColor: theme.colors.card,
                      elevation: 20,
                    }}
                  >
                    <ScrollView style={{ maxHeight: 220 }}>
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
                borderRadius: 18,
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: 12,
                zIndex: 1,
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
                  style={{
                    fontSize: 18,
                    fontWeight: "900",
                    color: theme.colors.text,
                  }}
                >
                  {meses[viewMonth]} {viewYear}
                </ThemedText>

                <Pressable
                  onPress={nextMonth}
                  disabled={new Date(viewYear, viewMonth + 1, 1) > maxBirthDate}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 13,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.colors.card,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    opacity:
                      new Date(viewYear, viewMonth + 1, 1) > maxBirthDate
                        ? 0.35
                        : 1,
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
                      flex: 1,
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

              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return (
                      <View
                        key={`empty-${index}`}
                        style={{
                          width: `${100 / 7}%`,
                          height: 34,
                        }}
                      />
                    );
                  }

                  const disabled = date > maxBirthDate;
                  const active = selectedDate
                    ? isSameDate(date, selectedDate)
                    : false;

                  return (
                    <Pressable
                      key={date.toISOString()}
                      disabled={disabled}
                      onPress={() => {
                        closePickers();
                        setSelectedDate(date);
                      }}
                      style={{
                        width: `${100 / 7}%`,
                        height: 34,
                        justifyContent: "center",
                        alignItems: "center",
                        opacity: disabled ? 0.25 : 1,
                      }}
                    >
                      <View
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 999,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: active
                            ? theme.colors.primary
                            : "transparent",
                        }}
                      >
                        <ThemedText
                          style={{
                            color: active
                              ? activeTextColor
                              : theme.colors.text,
                            fontWeight: active ? "900" : "700",
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

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 16,
                paddingTop: 14,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
              }}
            >
              <Pressable
                onPress={() => setOpen(false)}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme.colors.card,
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
                disabled={!canApply}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 14,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme.colors.primary,
                  opacity: !canApply ? 0.55 : 1,
                  flexDirection: "row",
                  gap: 6,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
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
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}