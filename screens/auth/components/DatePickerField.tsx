// screens/auth/components/DatePickerField.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../theme/useTheme";

const MESES = [
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
const MESES_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function fmtShort(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${parseInt(d)} ${MESES_SHORT[parseInt(m) - 1]} ${y}`;
}

function toIso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function todayInBolivia(): Date {
  const now = new Date();
  const offsetMs = -4 * 60 * 60 * 1000;
  const localTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(localTime + offsetMs);
}

function minBirthDate(): Date {
  const t = todayInBolivia();
  t.setFullYear(t.getFullYear() - 150);
  return t;
}

function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface DatePickerFieldProps {
  value: Date | null;
  onChange: (dateString: string) => void;
  error?: string;
  label: string;
}

export const DatePickerField = ({
  value,
  onChange,
  error,
  label,
}: DatePickerFieldProps) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    const d = value || todayInBolivia();
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = value || todayInBolivia();
    return d.getMonth();
  });
  const [tempDate, setTempDate] = useState<string>(
    value ? dateToIso(value) : "",
  );
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const [editingYear, setEditingYear] = useState(false);
  const [yearInput, setYearInput] = useState(String(viewYear));

  const today = todayInBolivia();
  const todayIso = dateToIso(today);
  const minDate = minBirthDate();
  const minIso = dateToIso(minDate);

  function open() {
    setTempDate(value ? dateToIso(value) : "");
    const d = value || today;
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setYearInput(String(d.getFullYear()));
    setShowMonthGrid(false);
    setEditingYear(false);
    setVisible(true);
  }

  function onDayPress(iso: string) {
    if (iso < minIso || iso > todayIso) return;
    setTempDate(iso);
    // Marcamos el campo como tocado inmediatamente para habilitar el botón
    onChange(iso);
    setVisible(false);
  }

  function confirm() {
    if (tempDate) {
      onChange(tempDate);
    }
    setVisible(false);
  }

  function applyYear() {
    const y = parseInt(yearInput);
    if (!isNaN(y) && y >= minDate.getFullYear() && y <= today.getFullYear()) {
      setViewYear(y);
    }
    setEditingYear(false);
  }

  // Construir grid de 6 filas fijas
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const firstDow = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalCells = 42; // 6 filas * 7 días
  const days: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array(totalCells - firstDow - daysInMonth).fill(null),
  ];

  function dayStyle(iso: string) {
    const isSelected = iso === tempDate;
    const isToday = iso === todayIso;
    const isOutOfRange = iso < minIso || iso > todayIso;
    if (isSelected)
      return {
        bg: theme.colors.primary,
        text: theme.colors.primaryForeground,
        radius: 20,
      };
    if (isToday)
      return { bg: "transparent", text: theme.colors.primary, radius: 20 };
    if (isOutOfRange)
      return {
        bg: "transparent",
        text: theme.colors.muted,
        radius: 8,
        disabled: true,
      };
    return { bg: "transparent", text: theme.colors.text, radius: 8 };
  }

  const selectedDisplay = value ? fmtShort(dateToIso(value)) : "";

  return (
    <>
      <TouchableOpacity
        onPress={open}
        className="border rounded-xl bg-background-secondary px-4 py-3"
        style={{
          borderColor: error ? theme.colors.destructive : theme.colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={theme.colors.primary}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: value ? theme.colors.text : theme.colors.muted,
            }}
          >
            {value ? selectedDisplay : label}
          </Text>
        </View>
      </TouchableOpacity>
      {error ? (
        <Text
          style={{
            color: theme.colors.destructive,
            fontSize: 12,
            marginTop: 4,
            marginLeft: 8,
          }}
        >
          {error}
        </Text>
      ) : null}

      <Modal visible={visible} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={{
              backgroundColor: theme.colors.card ?? theme.colors.background,
              borderRadius: 24,
              padding: 20,
              width: 350,
              elevation: 12,
            }}
            onPress={() => {}}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: theme.colors.text,
                }}
              >
                Seleccionar fecha
              </Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: theme.colors.backgroundSecondary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: theme.colors.muted, fontSize: 13 }}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Fecha seleccionada */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: 10,
                padding: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: tempDate ? theme.colors.primary : theme.colors.muted,
                }}
              >
                {tempDate ? fmtShort(tempDate) : "—"}
              </Text>
            </View>

            {/* Navegación mes/año */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11);
                    setViewYear((y) => y - 1);
                  } else setViewMonth((m) => m - 1);
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: theme.colors.backgroundSecondary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: theme.colors.primary, fontSize: 18 }}>
                  ‹
                </Text>
              </TouchableOpacity>

              <View
                style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
              >
                <TouchableOpacity
                  onPress={() => setShowMonthGrid(!showMonthGrid)}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: theme.colors.text,
                    }}
                  >
                    {MESES[viewMonth]}
                  </Text>
                </TouchableOpacity>
                {editingYear ? (
                  <TextInput
                    value={yearInput}
                    onChangeText={setYearInput}
                    onSubmitEditing={applyYear}
                    onBlur={applyYear}
                    keyboardType="numeric"
                    maxLength={4}
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: theme.colors.text,
                      borderBottomWidth: 1,
                      borderColor: theme.colors.primary,
                      paddingHorizontal: 4,
                      width: 60,
                      textAlign: "center",
                    }}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setEditingYear(true);
                      setYearInput(String(viewYear));
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: theme.colors.text,
                      }}
                    >
                      {viewYear}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0);
                    setViewYear((y) => y + 1);
                  } else setViewMonth((m) => m + 1);
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: theme.colors.backgroundSecondary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: theme.colors.primary, fontSize: 18 }}>
                  ›
                </Text>
              </TouchableOpacity>
            </View>

            {/* Grid de meses */}
            {showMonthGrid && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                {MESES.map((mes, idx) => (
                  <TouchableOpacity
                    key={mes}
                    onPress={() => {
                      setViewMonth(idx);
                      setShowMonthGrid(false);
                    }}
                    style={{
                      width: "25%",
                      paddingVertical: 8,
                      alignItems: "center",
                      backgroundColor:
                        idx === viewMonth
                          ? theme.colors.primary
                          : "transparent",
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color:
                          idx === viewMonth
                            ? theme.colors.primaryForeground
                            : theme.colors.text,
                      }}
                    >
                      {MESES_SHORT[idx]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Días de la semana */}
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((d) => (
                <Text
                  key={d}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: "700",
                    color: theme.colors.muted,
                  }}
                >
                  {d}
                </Text>
              ))}
            </View>

            {/* Grid de días (altura fija) */}
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", minHeight: 216 }}
            >
              {days.map((day, i) => {
                if (!day)
                  return (
                    <View
                      key={`e-${i}`}
                      style={{ width: "14.28%", height: 36 }}
                    />
                  );
                const iso = toIso(viewYear, viewMonth, day);
                const s = dayStyle(iso);
                return (
                  <TouchableOpacity
                    key={iso}
                    onPress={() => onDayPress(iso)}
                    disabled={s.disabled}
                    style={{
                      width: "14.28%",
                      height: 36,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: s.radius,
                        backgroundColor: s.bg,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: s.radius === 20 ? "700" : "400",
                          color: s.text,
                        }}
                      >
                        {day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Botones */}
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
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: theme.colors.border,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: theme.colors.muted, fontWeight: "600" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirm}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: tempDate
                    ? theme.colors.primary
                    : theme.colors.border,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: tempDate
                      ? theme.colors.primaryForeground
                      : theme.colors.muted,
                    fontWeight: "700",
                  }}
                >
                  Aplicar
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
