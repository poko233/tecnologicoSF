// components/DatePickerModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Search, X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Pressable,
  Modal as RNModal,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme } from "../theme/useTheme";
import { ThemedText } from "./ThemedText";

/* ─────────────────── Tipos ─────────────────── */
export type DatePickerMode = "single" | "range" | "year";
export type DatePickerResult =
  | { type: "single"; date: string }
  | { type: "range"; start: string; end: string }
  | { type: "year"; year: number };

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  mode: DatePickerMode;
  onApply: (result: DatePickerResult) => void;
  minDate?: string;
  maxDate?: string;
  initialDate?: string;
  initialRange?: { start: string; end: string };
  initialYear?: number;
}

/* ─────────────────── Constantes ─────────────────── */
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
const rangeYear = 10; // Rango de años hacia atrás y adelante para el modo "year"
/* ─────────────────── Helpers ─────────────────── */
function todayInBoliviaIso(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseIso(iso: string): { year: number; month: number; day: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

function fmtShort(iso: string): string {
  const { year, month, day } = parseIso(iso);
  return `${day} ${MESES_SHORT[month]} ${year}`;
}

function isDateWithinRange(
  iso: string,
  minIso?: string,
  maxIso?: string,
): boolean {
  if (minIso && iso < minIso) return false;
  if (maxIso && iso > maxIso) return false;
  return true;
}

/* ─────────────────── Componente principal ─────────────────── */
export default function DatePickerModal({
  visible,
  onClose,
  mode,
  onApply,
  minDate,
  maxDate,
  initialDate,
  initialRange,
  initialYear,
}: DatePickerModalProps) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const todayIso = todayInBoliviaIso();

  const initDate = initialDate ?? todayIso;
  const { year: initY, month: initM } = parseIso(initDate);
  const [viewYear, setViewYear] = useState(initY);
  const [viewMonth, setViewMonth] = useState(initM);

  const [singleDate, setSingleDate] = useState<string>(initialDate ?? "");
  const [rangeStart, setRangeStart] = useState<string>(
    initialRange?.start ?? "",
  );
  const [rangeEnd, setRangeEnd] = useState<string>(initialRange?.end ?? "");
  const [yearValue, setYearValue] = useState<number>(
    initialYear ?? new Date().getFullYear(),
  );
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const [editingYear, setEditingYear] = useState(false);
  const [yearInput, setYearInput] = useState(String(viewYear));
  const [searchQuery, setSearchQuery] = useState("");

  const yearScrollRef = useRef<ScrollView>(null);

  const handleApply = useCallback(() => {
    if (mode === "single") {
      if (singleDate) onApply({ type: "single", date: singleDate });
    } else if (mode === "range") {
      if (rangeStart && rangeEnd)
        onApply({ type: "range", start: rangeStart, end: rangeEnd });
    } else if (mode === "year") {
      if (yearValue) onApply({ type: "year", year: yearValue });
    }
    onClose();
  }, [mode, singleDate, rangeStart, rangeEnd, yearValue, onApply, onClose]);

  const changeMonth = (delta: number) => {
    let newMonth = viewMonth + delta;
    let newYear = viewYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const selectDay = (day: number) => {
    if (mode === "single" && (editingYear || showMonthGrid)) return;
    const iso = toIso(viewYear, viewMonth, day);
    if (!isDateWithinRange(iso, minDate, maxDate)) return;

    if (mode === "single") {
      setSingleDate(iso);
      return;
    }

    if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(iso);
        setRangeEnd("");
      } else if (!rangeEnd) {
        if (iso < rangeStart) return;
        setRangeEnd(iso);
      } else {
        setRangeStart(iso);
        setRangeEnd("");
      }
    }
  };

  const setThisMonth = () => {
    const now = parseIso(todayIso);
    const startIso = toIso(now.year, now.month, 1);
    const endIso = toIso(now.year, now.month + 1, 0);
    setRangeStart(startIso);
    setRangeEnd(endIso);
    setViewYear(now.year);
    setViewMonth(now.month);
  };

  const setLastMonth = () => {
    const now = parseIso(todayIso);
    let m = now.month - 1,
      y = now.year;
    if (m < 0) {
      m = 11;
      y--;
    }
    const startIso = toIso(y, m, 1);
    const endIso = toIso(y, m + 1, 0);
    setRangeStart(startIso);
    setRangeEnd(endIso);
    setViewYear(y);
    setViewMonth(m);
  };

  const setThisYear = () => {
    const now = parseIso(todayIso);
    const startIso = toIso(now.year, 0, 1);
    const endIso = toIso(now.year, 11, 31);
    setRangeStart(startIso);
    setRangeEnd(endIso);
    setViewYear(now.year);
    setViewMonth(now.month);
  };

  const weeksArray = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const firstDow = firstDay.getDay();
    const startOffset = firstDow === 0 ? 6 : firstDow - 1;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const totalCells = 42;

    const allCells: (number | null)[] = [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
      ...Array(totalCells - startOffset - daysInMonth).fill(null),
    ];

    const weeks = [];
    for (let i = 0; i < allCells.length; i += 7) {
      weeks.push(allCells.slice(i, i + 7));
    }
    return weeks;
  }, [viewYear, viewMonth]);

  const dayStyle = (day: number | null) => {
    if (!day) return {};
    const iso = toIso(viewYear, viewMonth, day);
    const isToday = iso === todayIso;
    const isOutOfRange = !isDateWithinRange(iso, minDate, maxDate);

    let disabled = isOutOfRange;
    let bg = "transparent";
    let text = isToday
      ? theme.colors.primary
      : isOutOfRange
        ? theme.colors.muted
        : theme.colors.text;
    let radius = 8;

    if (mode === "single") {
      const selected = iso === singleDate;
      bg = selected ? theme.colors.primary : "transparent";
      text = selected
        ? theme.colors.primaryForeground
        : isToday
          ? theme.colors.primary
          : isOutOfRange
            ? theme.colors.muted
            : theme.colors.text;
      radius = selected ? 20 : 8;
      disabled = isOutOfRange;
    } else if (mode === "range") {
      const isStart = iso === rangeStart;
      const isEnd = iso === rangeEnd;
      const inRange =
        rangeStart && rangeEnd && iso >= rangeStart && iso <= rangeEnd;
      const isBeforeStart = !!(rangeStart && !rangeEnd && iso < rangeStart);
      disabled = isOutOfRange || isBeforeStart;
      bg =
        isStart || isEnd
          ? theme.colors.primary
          : inRange
            ? theme.colors.primarySubtle
            : "transparent";
      text =
        isStart || isEnd
          ? theme.colors.primaryForeground
          : isToday
            ? theme.colors.primary
            : disabled
              ? theme.colors.muted
              : theme.colors.text;
      radius = isStart || isEnd ? 20 : 8;
    }
    return { bg, text, radius, disabled };
  };

  const renderCalendar = () => (
    <>
      <View style={styles.navRow}>
        <MotiPressable
          onPress={() => changeMonth(-1)}
          animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
        >
          <View
            style={[
              styles.navBtn,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={theme.colors.primary}
            />
          </View>
        </MotiPressable>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Pressable onPress={() => setShowMonthGrid((v) => !v)}>
            <ThemedText style={{ fontSize: 14, fontWeight: "700" }}>
              {MESES[viewMonth]}
            </ThemedText>
          </Pressable>

          {editingYear ? (
            <TextInput
              value={yearInput}
              onChangeText={setYearInput}
              onBlur={() => {
                const y = parseInt(yearInput);
                if (!isNaN(y)) setViewYear(y);
                setEditingYear(false);
              }}
              onSubmitEditing={() => {
                const y = parseInt(yearInput);
                if (!isNaN(y)) setViewYear(y);
                setEditingYear(false);
              }}
              keyboardType="numeric"
              maxLength={4}
              autoFocus
              style={[
                styles.yearInput,
                {
                  color: theme.colors.text,
                  borderBottomColor: theme.colors.primary,
                },
              ]}
            />
          ) : (
            <Pressable
              onPress={() => {
                setEditingYear(true);
                setYearInput(String(viewYear));
              }}
            >
              <ThemedText style={{ fontSize: 14, fontWeight: "700" }}>
                {viewYear}
              </ThemedText>
            </Pressable>
          )}
        </View>

        <MotiPressable
          onPress={() => changeMonth(1)}
          animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
        >
          <View
            style={[
              styles.navBtn,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.primary}
            />
          </View>
        </MotiPressable>
      </View>

      {showMonthGrid && (
        <View style={styles.monthGrid}>
          {MESES.map((mes, idx) => (
            <Pressable
              key={mes}
              onPress={() => {
                setViewMonth(idx);
                setShowMonthGrid(false);
              }}
              style={[
                styles.monthItem,
                {
                  backgroundColor:
                    idx === viewMonth ? theme.colors.primary : "transparent",
                },
              ]}
            >
              <ThemedText
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
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}

      <View style={{ width: "100%" }}>
        <View style={styles.gridRow}>
          {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((d) => (
            <View key={d} style={styles.gridCell}>
              <ThemedText
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: theme.colors.muted,
                }}
              >
                {d}
              </ThemedText>
            </View>
          ))}
        </View>

        {weeksArray.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.gridRow}>
            {week.map((day, dayIndex) => {
              if (day === null)
                return (
                  <View
                    key={`empty-${weekIndex}-${dayIndex}`}
                    style={styles.gridCell}
                  />
                );
              const style = dayStyle(day);
              return (
                <View
                  key={`${viewYear}-${viewMonth}-${day}`}
                  style={styles.gridCell}
                >
                  <MotiPressable
                    onPress={() => selectDay(day)}
                    disabled={style.disabled}
                    animate={({ pressed }) => ({
                      scale: pressed && !style.disabled ? 0.92 : 1,
                    })}
                    style={[
                      styles.dayCircle,
                      { backgroundColor: style.bg, borderRadius: style.radius },
                    ]}
                  >
                    <ThemedText
                      style={{
                        fontSize: 13,
                        fontWeight: style.radius === 20 ? "700" : "400",
                        color: style.text,
                      }}
                    >
                      {day}
                    </ThemedText>
                  </MotiPressable>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </>
  );

  const yearsArray = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startY = minDate
      ? parseInt(minDate.split("-")[0])
      : currentYear - rangeYear;
    const endY = maxDate
      ? parseInt(maxDate.split("-")[0])
      : currentYear + rangeYear;
    return Array.from({ length: endY - startY + 1 }, (_, i) => startY + i);
  }, [minDate, maxDate]);

  const minAllowedYear = yearsArray[0];
  const maxAllowedYear = yearsArray[yearsArray.length - 1];

  const filteredYears = useMemo(() => {
    if (!searchQuery.trim()) return yearsArray;
    return yearsArray.filter((year) => year.toString().includes(searchQuery));
  }, [yearsArray, searchQuery]);

  // Efecto para hacer scroll CENTRADO al año seleccionado SOLO al abrir el modal
  // UNIFICADO: Controla la apertura, limpia la búsqueda, actualiza el año y centra el scroll
  useEffect(() => {
    if (visible) {
      // 1. Determinar cuál es el año objetivo a mostrar
      const targetYear = initialYear !== undefined ? initialYear : yearValue;

      if (initialYear !== undefined) {
        setYearValue(initialYear);
      }

      // 2. Limpiar el buscador para asegurarnos de tener la lista completa de años
      setSearchQuery("");

      // 3. Esperar a que el Modal y el ScrollView completen su Layout (200ms es el tiempo ideal)
      const timer = setTimeout(() => {
        // Usamos 'yearsArray' directamente porque es la lista total y es 100% estable
        const index = yearsArray.indexOf(targetYear);

        if (index !== -1) {
          const row = Math.floor(index / 4); // 4 columnas por fila
          const visibleHeight = 340; // El maxHeight de tu ScrollView
          const ROW_HEIGHT = 48; // Altura real por fila (Texto + Paddings de tus estilos)

          // Calculamos la posición Y exacta para que la fila seleccionada quede perfectamente CENTRADA
          const y = Math.max(
            0,
            row * ROW_HEIGHT - visibleHeight / 2 + ROW_HEIGHT / 2,
          );

          yearScrollRef.current?.scrollTo({
            y,
            animated: false, // 'false' para que aparezca ya posicionado instantáneamente sin parpadeos
          });
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [visible, initialYear, yearsArray]);
  //CORRECCIÓN: Eliminado el useMemo ilegal dentro del .map()
  const renderYearPicker = () => (
    <>
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Search
            size={18}
            color={theme.colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Buscar año..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                color: theme.colors.text,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView
        ref={yearScrollRef}
        style={{ maxHeight: 340 }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.yearGridContainer}
      >
        <View style={styles.yearGrid}>
          {filteredYears.map((year) => {
            const isSelected = year === yearValue;

            return (
              <View key={year} style={styles.yearCell}>
                <Pressable
                  onPress={() => setYearValue(year)}
                  style={({ pressed, hovered }: any) => [
                    styles.yearButton,
                    {
                      // Escala y elevación fluidas según interacción
                      transform: [
                        { scale: pressed ? 0.97 : hovered ? 1.02 : 1 },
                      ],
                      elevation: hovered || pressed ? 6 : 0,
                      // Control perfecto del color de fondo sin bugs de estado
                      backgroundColor: isSelected
                        ? theme.colors.primary
                        : hovered || pressed
                          ? theme.colors.backgroundSecondary
                          : "transparent",
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.yearText,
                      {
                        color: isSelected
                          ? theme.colors.primaryForeground
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {year}
                  </ThemedText>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </>
  );

  return (
    <AnimatePresence>
      {visible && (
        <RNModal transparent visible={visible} onRequestClose={onClose}>
          <BlurView
            intensity={20}
            tint="dark"
            style={[StyleSheet.absoluteFill, styles.backdropWrapper]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

            <MotiView
              from={{ opacity: 0, scale: 0.92, translateY: 30 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.95, translateY: -10 }}
              transition={{ type: "spring", damping: 32, stiffness: 200 }}
              exitTransition={{ type: "timing", duration: 150 }}
              style={[
                styles.modalContainer,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  width: isMobile ? "95%" : 420,
                },
              ]}
            >
              <View
                style={[
                  styles.header,
                  { borderBottomColor: theme.colors.border },
                ]}
              >
                <View>
                  <ThemedText
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: theme.colors.text,
                    }}
                  >
                    {mode === "year" ? "Seleccionar año" : "Seleccionar fecha"}
                  </ThemedText>
                  {mode === "year" && (
                    <ThemedText
                      style={{
                        fontSize: 14,
                        color: theme.colors.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      Rango permitido: {minAllowedYear} — {maxAllowedYear}
                    </ThemedText>
                  )}
                </View>
                <MotiPressable
                  onPress={onClose}
                  animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
                >
                  <View
                    style={[
                      styles.closeBtn,
                      { backgroundColor: theme.colors.backgroundSecondary },
                    ]}
                  >
                    <X size={18} color={theme.colors.muted} />
                  </View>
                </MotiPressable>
              </View>

              {mode !== "year" ? (
                <>
                  {mode === "range" && (
                    <View style={{ paddingHorizontal: 24 }}>
                      <View style={styles.quickRow}>
                        {[
                          ["Este mes", setThisMonth],
                          ["Mes anterior", setLastMonth],
                          ["Este año", setThisYear],
                        ].map(([label, action]) => (
                          <Pressable
                            key={label as string}
                            onPress={action as () => void}
                            style={[
                              styles.quickBtn,
                              { backgroundColor: theme.colors.primarySubtle },
                            ]}
                          >
                            <ThemedText
                              style={{
                                color: theme.colors.primary,
                                fontWeight: "600",
                                fontSize: 12,
                              }}
                            >
                              {label as string}
                            </ThemedText>
                          </Pressable>
                        ))}
                      </View>
                      <View
                        style={[
                          styles.rangeSummary,
                          { backgroundColor: theme.colors.backgroundSecondary },
                        ]}
                      >
                        <View style={{ alignItems: "center" }}>
                          <ThemedText
                            style={{
                              fontSize: 11,
                              color: theme.colors.textSecondary,
                            }}
                          >
                            INICIO
                          </ThemedText>
                          <ThemedText
                            style={{
                              color: theme.colors.primary,
                              fontWeight: "700",
                            }}
                          >
                            {rangeStart ? fmtShort(rangeStart) : "--/--/----"}
                          </ThemedText>
                        </View>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={theme.colors.textSecondary}
                        />
                        <View style={{ alignItems: "center" }}>
                          <ThemedText
                            style={{
                              fontSize: 11,
                              color: theme.colors.textSecondary,
                            }}
                          >
                            FIN
                          </ThemedText>
                          <ThemedText
                            style={{
                              color: theme.colors.primary,
                              fontWeight: "700",
                            }}
                          >
                            {rangeEnd ? fmtShort(rangeEnd) : "--/--/----"}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  )}
                  <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                    {renderCalendar()}
                  </View>
                </>
              ) : (
                <View style={styles.yearContent}>{renderYearPicker()}</View>
              )}

              {/* FOOTER 50% / 50% PERFECTO */}
              <View
                style={[
                  styles.footer,
                  {
                    borderTopColor: theme.colors.border,
                    backgroundColor: theme.colors.backgroundSecondary,
                  },
                ]}
              >
                {mode === "year" ? (
                  <View style={styles.footerYearRow}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Pressable
                        onPress={onClose}
                        style={[
                          styles.yearCancelBtn,
                          { backgroundColor: theme.colors.backgroundTertiary },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.footerBtnText,
                            { color: theme.colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          Cancelar
                        </ThemedText>
                      </Pressable>
                    </View>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <MotiPressable
                        onPress={handleApply}
                        disabled={!yearValue}
                        animate={({ pressed }) => ({
                          scale: pressed ? 0.95 : 1,
                        })}
                        style={[
                          styles.yearApplyBtn,
                          {
                            backgroundColor: theme.colors.primary,
                            opacity: yearValue ? 1 : 0.5,
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.footerBtnText,
                            { color: theme.colors.primaryForeground },
                          ]}
                          numberOfLines={1}
                        >
                          Aplicar Selección
                        </ThemedText>
                      </MotiPressable>
                    </View>
                  </View>
                ) : (
                  <View style={styles.footerRow}>
                    <Pressable onPress={onClose} style={styles.cancelBtn}>
                      <ThemedText
                        style={{
                          color: theme.colors.textSecondary,
                          fontWeight: "600",
                        }}
                      >
                        Cancelar
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={handleApply}
                      style={[
                        styles.applyBtn,
                        {
                          backgroundColor: theme.colors.primary,
                          opacity:
                            (mode === "single" && !singleDate) ||
                            (mode === "range" && (!rangeStart || !rangeEnd))
                              ? 0.5
                              : 1,
                        },
                      ]}
                      disabled={
                        (mode === "single" && !singleDate) ||
                        (mode === "range" && (!rangeStart || !rangeEnd))
                      }
                    >
                      <ThemedText
                        style={{
                          color: theme.colors.primaryForeground,
                          fontWeight: "700",
                        }}
                      >
                        Aplicar
                      </ThemedText>
                    </Pressable>
                  </View>
                )}
              </View>
            </MotiView>
          </BlurView>
        </RNModal>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────── Estilos ─────────────────── */
const styles = StyleSheet.create({
  backdropWrapper: { justifyContent: "center", alignItems: "center" },
  modalContainer: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  quickRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  quickBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  rangeSummary: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 4,
  },
  monthItem: {
    width: "25%",
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  gridRow: { flexDirection: "row" },
  gridCell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  yearInput: {
    fontSize: 14,
    fontWeight: "700",
    borderBottomWidth: 1,
    paddingHorizontal: 4,
    width: 50,
    textAlign: "center",
    minWidth: 50,
  },

  //  ESTILOS MODO YEAR
  yearContent: {
    padding: 24,
  },
  searchContainer: {
    marginBottom: 24,
    position: "relative",
  },
  searchWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: 11,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingLeft: 40,
    paddingRight: 16,
    paddingVertical: 0,
    borderRadius: 12,
    fontSize: 14,
    borderWidth: 0,
  },
  yearGridContainer: {
    paddingBottom: 8,
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  yearCell: {
    width: "25%",
    padding: 6,
  },
  yearButton: {
    alignSelf: "stretch",
    paddingVertical: 8, // ← Paddings verticales añadidos
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  yearText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // PIE DE PÁGINA
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
  footerYearRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  yearCancelBtn: {
    width: "100%", //  Hace que el botón ocupe todo el 50% del recuadro izquierdo
    height: 54, //  Incrementamos la altura (antes 48) para darle más cuerpo
    borderRadius: 16, // Bordes redondeados más modernos acordes al nuevo tamaño
    alignItems: "center",
    justifyContent: "center",
  },
  yearApplyBtn: {
    width: "100%", //  Hace que el botón ocupe todo el 50% del recuadro derecho
    height: 54, //  Incrementamos la altura (antes 48)
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  footerBtnText: {
    fontWeight: "700",
    fontSize: 15, // Subimos a 15 para que el texto no se pierda en el botón más grande
    textAlign: "center",
  },

  // Botones Single/Range
  footerRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  applyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
