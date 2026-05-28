import { useTheme } from "@theme";
import React, { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  value: string;
  onClose: () => void;
  onConfirm: (hora: string) => void;
};

function normalizarHora(value?: string | null) {
  if (!value) return "08:00";

  const match = String(value).match(/(\d{1,2}):(\d{1,2})/);

  if (!match) return "08:00";

  const h = Number(match[1]);
  const m = Number(match[2]);

  if (h < 0 || h > 23 || m < 0 || m > 59) return "08:00";

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function limpiarHora(text: string) {
  const limpio = text.replace(/\D/g, "").slice(0, 2);

  if (limpio === "") return "";

  const numero = Number(limpio);

  if (numero > 23) return "23";

  return limpio;
}

function limpiarMinuto(text: string) {
  const limpio = text.replace(/\D/g, "").slice(0, 2);

  if (limpio === "") return "";

  const numero = Number(limpio);

  if (numero > 59) return "59";

  return limpio;
}

function aumentarTexto(value: string, max: number) {
  const actual = Number(value || 0);
  const nuevo = actual >= max ? 0 : actual + 1;

  return String(nuevo).padStart(2, "0");
}

function bajarTexto(value: string, max: number) {
  const actual = Number(value || 0);
  const nuevo = actual <= 0 ? max : actual - 1;

  return String(nuevo).padStart(2, "0");
}

export default function HoraPickerModal({
  visible,
  value,
  onClose,
  onConfirm,
}: Props) {
  const { theme } = useTheme();

  const [horaTexto, setHoraTexto] = useState("08");
  const [minutoTexto, setMinutoTexto] = useState("00");

  useEffect(() => {
    if (!visible) return;

    const [h, m] = normalizarHora(value).split(":");

    setHoraTexto(h);
    setMinutoTexto(m);
  }, [visible, value]);

  const cerrar = () => {
    onClose();
  };

  const aplicar = () => {
    const h = Number(horaTexto || 0);
    const m = Number(minutoTexto || 0);

    const horaFinal = `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}`;

    onConfirm(horaFinal);
  };

  const previewHora = `${String(Number(horaTexto || 0)).padStart(
    2,
    "0"
  )}:${String(Number(minutoTexto || 0)).padStart(2, "0")}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cerrar}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Elegir hora
              </Text>

              <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                Formato 24 horas. Ejemplo: 19:00.
              </Text>
            </View>

            <Pressable onPress={cerrar}>
              <Text style={[styles.close, { color: theme.colors.textMuted }]}>
                ×
              </Text>
            </Pressable>
          </View>

          <View style={styles.pickerRow}>
            <View style={styles.column}>
              <Pressable
                onPress={() => setHoraTexto((prev) => aumentarTexto(prev, 23))}
              >
                <Text style={[styles.arrow, { color: theme.colors.text }]}>
                  ⌃
                </Text>
              </Pressable>

              <TextInput
                value={horaTexto}
                onChangeText={(text) => setHoraTexto(limpiarHora(text))}
                keyboardType="numeric"
                maxLength={2}
                placeholder="00"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              />

              <Pressable
                onPress={() => setHoraTexto((prev) => bajarTexto(prev, 23))}
              >
                <Text style={[styles.arrow, { color: theme.colors.text }]}>
                  ⌄
                </Text>
              </Pressable>

              <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                Hora
              </Text>
            </View>

            <Text style={[styles.separator, { color: theme.colors.text }]}>
              :
            </Text>

            <View style={styles.column}>
              <Pressable
                onPress={() =>
                  setMinutoTexto((prev) => aumentarTexto(prev, 59))
                }
              >
                <Text style={[styles.arrow, { color: theme.colors.text }]}>
                  ⌃
                </Text>
              </Pressable>

              <TextInput
                value={minutoTexto}
                onChangeText={(text) => setMinutoTexto(limpiarMinuto(text))}
                keyboardType="numeric"
                maxLength={2}
                placeholder="00"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              />

              <Pressable
                onPress={() => setMinutoTexto((prev) => bajarTexto(prev, 59))}
              >
                <Text style={[styles.arrow, { color: theme.colors.text }]}>
                  ⌄
                </Text>
              </Pressable>

              <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                Minuto
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.preview,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.previewText, { color: theme.colors.primary }]}>
              {previewHora}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={cerrar}
              style={[
                styles.button,
                {
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              onPress={aplicar}
              style={[
                styles.button,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: theme.colors.primaryForeground,
                  },
                ]}
              >
                Aplicar hora
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.62)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },

  modal: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
  },

  close: {
    fontSize: 28,
    fontWeight: "700",
  },

  pickerRow: {
    marginTop: 26,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },

  column: {
    alignItems: "center",
    gap: 8,
  },

  arrow: {
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 30,
  },

  input: {
    width: 82,
    height: 62,
    borderWidth: 1,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "900",
    padding: 0,
  },

  separator: {
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 22,
  },

  label: {
    fontSize: 11,
    fontWeight: "800",
  },

  preview: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },

  previewText: {
    fontSize: 28,
    fontWeight: "900",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  button: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    fontWeight: "900",
  },
});