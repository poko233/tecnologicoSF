import { useTheme } from "@theme";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import HoraPickerModal from "../components/HoraPickerModal";
import { Grupo, Horario } from "./grupo.types";

interface Props {
  initialData: Grupo | null;
  onSave: (data: Partial<Grupo>) => Promise<void>;
  onCancel: () => void;
}

const TURNOS = ["Mañana", "Tarde", "Noche"];
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

type TimeTarget = {
  index: number;
  key: "horaInicio" | "horaFin";
} | null;

function normalizarHora(value?: string | null) {
  if (!value) return "";

  const texto = String(value).trim();
  const matchHora = texto.match(/(\d{1,2}):(\d{1,2})/);

  if (matchHora) {
    const h = Number(matchHora[1]);
    const m = Number(matchHora[2]);

    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
  }

  return "";
}

function horaValida(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;

  const [h, m] = value.split(":").map(Number);

  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

function horaAMinutos(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function GrupoForm({ initialData, onSave, onCancel }: Props) {
  const { theme } = useTheme();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    codigo: "",
    paralelo: "",
    turno: "Mañana",
    gestion: "",
    cupos: "",
    activo: true,
  });

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [cuposError, setCuposError] = useState("");
  const [horariosError, setHorariosError] = useState("");

  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [timeTarget, setTimeTarget] = useState<TimeTarget>(null);
  const [horaActual, setHoraActual] = useState("08:00");

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre ?? "",
        codigo: initialData.codigo ?? "",
        paralelo: initialData.paralelo ?? "",
        turno: initialData.turno ?? "Mañana",
        gestion: initialData.gestion ?? "",
        cupos: String(initialData.cupos ?? ""),
        activo: initialData.estado === "activo",
      });

      setHorarios(
        (initialData.horarios ?? []).map((h) => ({
          idHorario: h.idHorario,
          dia: h.dia,
          horaInicio: normalizarHora(h.horaInicio),
          horaFin: normalizarHora(h.horaFin),
        }))
      );
    } else {
      setForm({
        nombre: "",
        codigo: "",
        paralelo: "",
        turno: "Mañana",
        gestion: "",
        cupos: "",
        activo: true,
      });

      setHorarios([]);
    }

    setCuposError("");
    setHorariosError("");
  }, [initialData]);

  const set = (key: string) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const inp = [
    styles.input,
    {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.inputBorder,
      color: theme.colors.text,
    },
  ];

  const lbl = [styles.label, { color: theme.colors.text }];

  const addHorario = () =>
    setHorarios((h) => [
      ...h,
      {
        dia: "Lunes",
        horaInicio: "08:00",
        horaFin: "10:00",
      },
    ]);

  const removeHorario = (i: number) =>
    setHorarios((h) => h.filter((_, idx) => idx !== i));

  const setHorario = (i: number, key: keyof Horario, val: string) => {
    setHorarios((h) =>
      h.map((item, idx) =>
        idx === i
          ? {
              ...item,
              [key]: val,
            }
          : item
      )
    );

    setHorariosError("");
  };

  const abrirTimePicker = (index: number, key: "horaInicio" | "horaFin") => {
    setTimeTarget({ index, key });

    const value = horarios[index]?.[key];
    const fallback = key === "horaInicio" ? "08:00" : "10:00";

    setHoraActual(normalizarHora(value) || fallback);
    setTimePickerVisible(true);
  };

  const cerrarTimePicker = () => {
    setTimePickerVisible(false);
    setTimeTarget(null);
  };

  const confirmarHoraPicker = (hora: string) => {
    if (!timeTarget) return;

    setHorario(timeTarget.index, timeTarget.key, normalizarHora(hora));

    setTimePickerVisible(false);
    setTimeTarget(null);
  };

  const validarHorarios = () => {
    for (const horario of horarios) {
      if (!horario.dia) {
        return "Selecciona el día en todos los horarios.";
      }

      if (!horaValida(horario.horaInicio)) {
        return "La hora de inicio debe tener formato HH:mm. Ejemplo: 08:00.";
      }

      if (!horaValida(horario.horaFin)) {
        return "La hora de fin debe tener formato HH:mm. Ejemplo: 10:00.";
      }

      if (horaAMinutos(horario.horaFin) <= horaAMinutos(horario.horaInicio)) {
        return "La hora de fin debe ser mayor a la hora de inicio.";
      }
    }

    return "";
  };

  const handleSave = async () => {
    if (!form.cupos || isNaN(Number(form.cupos)) || Number(form.cupos) <= 0) {
      setCuposError("Los cupos son requeridos y deben ser un número válido.");
      return;
    }

    const errorHorario = validarHorarios();

    if (errorHorario) {
      setHorariosError(errorHorario);
      return;
    }

    setCuposError("");
    setHorariosError("");
    setSaving(true);

    try {
      await onSave({
        nombre: form.nombre,
        codigo: form.codigo,
        turno: form.turno,
        gestion: form.gestion,
        cupos: Number(form.cupos),
        estado: form.activo ? "activo" : "inactivo",
        tipo: "Curso",
        horarios: horarios.map(({ dia, horaInicio, horaFin }) => ({
          dia,
          horaInicio: normalizarHora(horaInicio),
          horaFin: normalizarHora(horaFin),
        })),
        ...(form.paralelo.trim() && { paralelo: form.paralelo }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <Text style={lbl}>Nombre *</Text>
          <TextInput
            style={inp}
            value={form.nombre}
            onChangeText={set("nombre")}
            placeholder="Grupo A"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        <View style={{ width: 12 }} />

        <View style={{ flex: 1 }}>
          <Text style={lbl}>Código *</Text>
          <TextInput
            style={inp}
            value={form.codigo}
            onChangeText={set("codigo")}
            placeholder="GRP-001"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>
      </View>

      <Text style={lbl}>Paralelo</Text>
      <TextInput
        style={inp}
        value={form.paralelo}
        onChangeText={set("paralelo")}
        placeholder="A"
        placeholderTextColor={theme.colors.textMuted}
      />

      <Text style={lbl}>Turno</Text>
      <View style={styles.chipRow}>
        {TURNOS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setForm((f) => ({ ...f, turno: t }))}
            style={[
              styles.chip,
              {
                backgroundColor:
                  form.turno === t
                    ? theme.colors.primary
                    : theme.colors.secondary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={{
                color:
                  form.turno === t
                    ? theme.colors.primaryForeground
                    : theme.colors.text,
                fontSize: 13,
              }}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <Text style={lbl}>Gestión</Text>
          <TextInput
            style={inp}
            value={form.gestion}
            onChangeText={set("gestion")}
            placeholder="2024-I"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        <View style={{ width: 12 }} />

        <View style={{ flex: 1 }}>
          <Text style={lbl}>Cupos *</Text>
          <TextInput
            style={[
              inp,
              cuposError ? { borderColor: theme.colors.destructive } : {},
            ]}
            value={form.cupos}
            onChangeText={(v) => {
              set("cupos")(v);
              setCuposError("");
            }}
            keyboardType="numeric"
            placeholder="30"
            placeholderTextColor={theme.colors.textMuted}
          />

          {cuposError ? (
            <Text
              style={{
                color: theme.colors.destructive,
                fontSize: 11,
                marginTop: 3,
              }}
            >
              {cuposError}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={[styles.horarioSection, { borderColor: theme.colors.border }]}>
        <View style={styles.horarioHeader}>
          <Text style={[styles.horarioTitle, { color: theme.colors.primary }]}>
            🕐 Horarios de Clase
          </Text>

          <Pressable onPress={addHorario} style={styles.addBtn}>
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              ⊕ Agregar Horario
            </Text>
          </Pressable>
        </View>

        {horariosError ? (
          <Text
            style={{
              color: theme.colors.destructive,
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            {horariosError}
          </Text>
        ) : null}

        {horarios.length === 0 && (
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 13,
              textAlign: "center",
              paddingVertical: 10,
            }}
          >
            Sin horarios. Toca "Agregar Horario".
          </Text>
        )}

        {horarios.map((h, i) => (
          <View
            key={i}
            style={[
              styles.horarioRow,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.backgroundSecondary,
              },
            ]}
          >
            <View style={{ flex: 2 }}>
              <Text
                style={[styles.horarioLabel, { color: theme.colors.textMuted }]}
              >
                Día
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 4 }}>
                  {DIAS.map((d) => (
                    <Pressable
                      key={d}
                      onPress={() => setHorario(i, "dia", d)}
                      style={[
                        styles.diaChip,
                        {
                          backgroundColor:
                            h.dia === d
                              ? theme.colors.primary
                              : theme.colors.secondary,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color:
                            h.dia === d
                              ? theme.colors.primaryForeground
                              : theme.colors.text,
                        }}
                      >
                        {d.slice(0, 3)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text
                style={[styles.horarioLabel, { color: theme.colors.textMuted }]}
              >
                Inicio
              </Text>

              <Pressable
                onPress={() => abrirTimePicker(i, "horaInicio")}
                style={[
                  styles.timeButton,
                  {
                    borderColor: theme.colors.inputBorder,
                    backgroundColor: theme.colors.background,
                  },
                ]}
              >
                <Text style={[styles.timeButtonText, { color: theme.colors.text }]}>
                  {normalizarHora(h.horaInicio) || "08:00"}
                </Text>
              </Pressable>
            </View>

            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text
                style={[styles.horarioLabel, { color: theme.colors.textMuted }]}
              >
                Fin
              </Text>

              <Pressable
                onPress={() => abrirTimePicker(i, "horaFin")}
                style={[
                  styles.timeButton,
                  {
                    borderColor: theme.colors.inputBorder,
                    backgroundColor: theme.colors.background,
                  },
                ]}
              >
                <Text style={[styles.timeButtonText, { color: theme.colors.text }]}>
                  {normalizarHora(h.horaFin) || "10:00"}
                </Text>
              </Pressable>
            </View>

            <Pressable onPress={() => removeHorario(i)} style={styles.removeBtn}>
              <Text style={{ color: theme.colors.destructive, fontSize: 18 }}>
                ✕
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.switchRow}>
        <Text style={[lbl, { marginBottom: 0, marginTop: 0 }]}>
          Estado activo
        </Text>

        <Switch
          value={form.activo}
          onValueChange={(v) => setForm((f) => ({ ...f, activo: v }))}
          thumbColor={form.activo ? theme.colors.primary : "#ccc"}
          trackColor={{
            false: "#ddd",
            true: theme.colors.primary + "60",
          }}
        />
      </View>

      <View style={styles.btns}>
        <Pressable
          onPress={onCancel}
          style={[
            styles.btn,
            styles.btnOutline,
            { borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.btnText, { color: theme.colors.text }]}>
            Cancelar
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[
            styles.btn,
            {
              backgroundColor: theme.colors.primary,
              opacity: saving ? 0.7 : 1,
            },
          ]}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.primaryForeground}
            />
          ) : (
            <Text
              style={[
                styles.btnText,
                { color: theme.colors.primaryForeground },
              ]}
            >
              Guardar
            </Text>
          )}
        </Pressable>
      </View>

      <HoraPickerModal
        visible={timePickerVisible}
        value={horaActual}
        onClose={cerrarTimePicker}
        onConfirm={confirmarHoraPicker}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 14,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 11,
    fontSize: 14,
  },

  row2: {
    flexDirection: "row",
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },

  btns: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
    marginBottom: 8,
  },

  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: "center",
  },

  btnOutline: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },

  btnText: {
    fontWeight: "700",
    fontSize: 15,
  },

  horarioSection: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },

  horarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  horarioTitle: {
    fontSize: 13,
    fontWeight: "700",
  },

  addBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  horarioRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },

  horarioLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },

  diaChip: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },

  timeButton: {
    borderWidth: 1,
    borderRadius: 7,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 39,
  },

  timeButtonText: {
    fontSize: 12,
    fontWeight: "800",
  },

  removeBtn: {
    marginLeft: 8,
    marginBottom: 2,
    padding: 4,
  },
});