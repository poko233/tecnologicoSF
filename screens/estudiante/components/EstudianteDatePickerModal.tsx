import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

type Props = {
  visible: boolean;
  value: string;
  title?: string;
  onClose: () => void;
  onChange: (date: string) => void;
};

const MONTHS = [
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

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

function parseDate(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export default function EstudianteDatePickerModal({
  visible,
  value,
  title = "Fecha de nacimiento",
  onClose,
  onChange,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const today = new Date();
  const selectedDate = parseDate(value);

  const [pickerMonth, setPickerMonth] = useState(
    selectedDate?.getMonth() ?? today.getMonth(),
  );

  const [pickerYear, setPickerYear] = useState(
    selectedDate?.getFullYear() ?? today.getFullYear(),
  );

  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const parsed = parseDate(value);

    setPickerMonth(parsed?.getMonth() ?? today.getMonth());
    setPickerYear(parsed?.getFullYear() ?? today.getFullYear());
  }, [visible, value]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(pickerYear, pickerMonth, 1);
    const lastDay = new Date(pickerYear, pickerMonth + 1, 0);

    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days: (number | null)[] = [];

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(day);
    }

    return days;
  }, [pickerMonth, pickerYear]);

  const changeMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (pickerMonth === 0) {
        setPickerMonth(11);
        setPickerYear((prev) => prev - 1);
      } else {
        setPickerMonth((prev) => prev - 1);
      }

      return;
    }

    if (pickerMonth === 11) {
      setPickerMonth(0);
      setPickerYear((prev) => prev + 1);
    } else {
      setPickerMonth((prev) => prev + 1);
    }
  };

  const selectDate = (day: number) => {
    const date = new Date(pickerYear, pickerMonth, day);

    if (date > today) return;

    onChange(toDateInput(date));
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.modal,
              {
                backgroundColor: colors.modal,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.header}>
              <Pressable
                onPress={() => changeMonth("prev")}
                style={[
                  styles.navButton,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={colors.text}
                />
              </Pressable>

              <View style={styles.center}>
                <Pressable
                  onPress={() => setMonthPickerVisible(true)}
                  style={[
                    styles.selectButton,
                    {
                      backgroundColor: colors.input,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[styles.selectText, { color: colors.text }]}
                  >
                    {MONTHS[pickerMonth]}
                  </ThemedText>

                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={colors.text}
                  />
                </Pressable>

                <Pressable
                  onPress={() => setYearPickerVisible(true)}
                  style={[
                    styles.selectButton,
                    {
                      backgroundColor: colors.input,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[styles.selectText, { color: colors.text }]}
                  >
                    {pickerYear}
                  </ThemedText>

                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={colors.text}
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={() => changeMonth("next")}
                style={[
                  styles.navButton,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={colors.text}
                />
              </Pressable>
            </View>

            <ThemedText
              style={[styles.subtitle, { color: colors.textSecondary }]}
            >
              {title}
            </ThemedText>

            <View style={styles.weekRow}>
              {WEEK_DAYS.map((day, index) => (
                <ThemedText
                  key={`${day}-${index}`}
                  style={[styles.weekDay, { color: colors.textSecondary }]}
                >
                  {day}
                </ThemedText>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const currentDate = new Date(pickerYear, pickerMonth, day);
                const disabled = currentDate > today;

                const active =
                  selectedDate?.getFullYear() === pickerYear &&
                  selectedDate?.getMonth() === pickerMonth &&
                  selectedDate?.getDate() === day;

                return (
                  <Pressable
                    key={day}
                    disabled={disabled}
                    onPress={() => selectDate(day)}
                    style={[
                      styles.dayCell,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : disabled
                            ? colors.disabled || colors.border
                            : colors.input,
                        opacity: disabled ? 0.45 : 1,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.dayText,
                        {
                          color: active
                            ? colors.primaryForeground
                            : disabled
                              ? colors.disabledForeground || colors.textMuted
                              : colors.text,
                        },
                      ]}
                    >
                      {day}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.cancelButton,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                },
              ]}
            >
              <ThemedText style={[styles.cancelText, { color: colors.text }]}>
                Cancelar
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <PickerModal
        visible={monthPickerVisible}
        title="Seleccionar mes"
        onClose={() => setMonthPickerVisible(false)}
      >
        <View style={styles.monthGrid}>
          {MONTHS.map((month, index) => {
            const active = pickerMonth === index;

            return (
              <Pressable
                key={month}
                onPress={() => {
                  setPickerMonth(index);
                  setMonthPickerVisible(false);
                }}
                style={[
                  styles.monthOption,
                  {
                    backgroundColor: active ? colors.primary : colors.input,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.monthText,
                    {
                      color: active
                        ? colors.primaryForeground
                        : colors.text,
                    },
                  ]}
                >
                  {month}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </PickerModal>

      <PickerModal
        visible={yearPickerVisible}
        title="Seleccionar año"
        onClose={() => setYearPickerVisible(false)}
      >
        <ScrollView
          style={styles.yearScroll}
          showsVerticalScrollIndicator
          persistentScrollbar
        >
          <View style={styles.yearGrid}>
            {Array.from(
              { length: 91 },
              (_, index) => today.getFullYear() - index,
            ).map((year) => {
              const active = pickerYear === year;

              return (
                <Pressable
                  key={year}
                  onPress={() => {
                    setPickerYear(year);
                    setYearPickerVisible(false);
                  }}
                  style={[
                    styles.yearOption,
                    {
                      backgroundColor: active ? colors.primary : colors.input,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.yearText,
                      {
                        color: active
                          ? colors.primaryForeground
                          : colors.text,
                      },
                    ]}
                  >
                    {year}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </PickerModal>
    </>
  );
}

function PickerModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.smallModal,
            {
              backgroundColor: colors.modal,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.pickerHeader}>
            <ThemedText style={[styles.pickerTitle, { color: colors.text }]}>
              {title}
            </ThemedText>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          {children}

          <Pressable
            onPress={onClose}
            style={[
              styles.closeBottomButton,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
              },
            ]}
          >
            <ThemedText
              style={[styles.closeBottomText, { color: colors.text }]}
            >
              Cerrar
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "100%",
    maxWidth: 430,
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    gap: 14,
  },
  smallModal: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "88%",
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  navButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectButton: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  selectText: {
    fontSize: 16,
    fontWeight: "900",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 13,
    marginTop: -6,
    fontWeight: "600",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekDay: {
    width: 42,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "900",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dayCell: {
    width: 50,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "900",
  },
  cancelButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "900",
  },
  pickerTitle: {
    flex: 1,
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingRight: 8,
    paddingBottom: 8,
  },
  monthOption: {
    width: "31%",
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  monthText: {
    fontSize: 13,
    fontWeight: "900",
  },
  yearScroll: {
    maxHeight: 380,
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingRight: 8,
    paddingBottom: 8,
  },
  yearOption: {
    width: "31%",
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  yearText: {
    fontSize: 15,
    fontWeight: "900",
  },
  closeBottomButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBottomText: {
    fontSize: 15,
    fontWeight: "900",
  },
});