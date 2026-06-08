import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardTypeOptions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import {
    UsuarioRRHH,
    UsuarioRRHHForm,
} from "../types/recursosHumanos.types";

type Props = {
  visible: boolean;
  usuario: UsuarioRRHH | null;
  guardando: boolean;
  onClose: () => void;
  onSave: (id: number, form: UsuarioRRHHForm) => Promise<boolean>;
};

type InputProps = {
  label: string;
  value: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  colors: any;
  styles: ReturnType<typeof createStyles>;
  onChangeText: (value: string) => void;
};

const expedidos = [
  "LPZ",
  "CBBA",
  "OR",
  "PT",
  "TJ",
  "SCZ",
  "BN",
  "PD",
  "CH",
  "QR",
  "EXT",
];

const generos: UsuarioRRHHForm["genero"][] = ["MASCULINO", "FEMENINO"];
const estados: UsuarioRRHHForm["estado"][] = ["ACTIVO", "INACTIVO"];

function FormInput({
  label,
  value,
  placeholder,
  keyboardType = "default",
  colors,
  styles,
  onChangeText,
}: InputProps) {
  return (
    <View style={styles.inputGroup}>
      <ThemedText style={styles.label}>{label}</ThemedText>

      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        autoCorrect={false}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

export default function UsuarioEditModal({
  visible,
  usuario,
  guardando,
  onClose,
  onSave,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const styles = useMemo(() => createStyles(colors), [colors]);

  const [form, setForm] = useState<UsuarioRRHHForm>({
    usuario: "",
    ci: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    genero: "MASCULINO",
    fecha_nac: "",
    email: "",
    telefono: "",
    celular: "",
    direccion: "",
    expedido: "CBBA",
    estado: "ACTIVO",
  });

  useEffect(() => {
    if (!usuario) return;

    setForm({
      usuario: usuario.usuario || "",
      ci: usuario.ci || "",
      nombres: usuario.nombres || "",
      apellidoPaterno: usuario.apellidoPaterno || "",
      apellidoMaterno: usuario.apellidoMaterno || "",
      genero: usuario.genero || "MASCULINO",
      fecha_nac: usuario.fecha_nac || "",
      email: usuario.email || "",
      telefono: usuario.telefono || "",
      celular: usuario.celular || "",
      direccion: usuario.direccion || "",
      expedido: usuario.expedido || "CBBA",
      estado: usuario.estado || "ACTIVO",
    });
  }, [usuario?.id]);

  const setValue = <K extends keyof UsuarioRRHHForm>(
    key: K,
    value: UsuarioRRHHForm[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const guardar = async () => {
    if (!usuario || guardando) return;

    const ok = await onSave(usuario.id, form);
    if (ok) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.headerTextBox}>
              <ThemedText style={styles.title}>Editar usuario</ThemedText>
              <ThemedText style={styles.subtitle}>
                Modifica los datos personales del usuario.
              </ThemedText>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.grid}>
              <FormInput
                label="Usuario"
                value={form.usuario}
                colors={colors}
                styles={styles}
                onChangeText={(v) => setValue("usuario", v)}
              />

              <FormInput
                label="CI"
                value={form.ci}
                colors={colors}
                styles={styles}
                onChangeText={(v) => setValue("ci", v)}
              />

              <FormInput
                label="Nombres"
                value={form.nombres}
                colors={colors}
                styles={styles}
                onChangeText={(v) => setValue("nombres", v)}
              />

              <FormInput
                label="Apellido paterno"
                value={form.apellidoPaterno}
                colors={colors}
                styles={styles}
                onChangeText={(v) => setValue("apellidoPaterno", v)}
              />

              <FormInput
                label="Apellido materno"
                value={form.apellidoMaterno}
                colors={colors}
                styles={styles}
                onChangeText={(v) => setValue("apellidoMaterno", v)}
              />

              <FormInput
                label="Fecha nacimiento"
                placeholder="YYYY-MM-DD"
                value={form.fecha_nac}
                colors={colors}
                styles={styles}
                onChangeText={(v) => setValue("fecha_nac", v)}
              />

              <FormInput
                label="Email"
                value={form.email}
                keyboardType="email-address"
                colors={colors}
                styles={styles}
                onChangeText={(v) => setValue("email", v)}
              />

              <FormInput
                label="Teléfono"
                value={form.telefono}
                keyboardType="phone-pad"
                colors={colors}
                styles={styles}
                onChangeText={(v) => setValue("telefono", v)}
              />

              <FormInput
                label="Celular"
                value={form.celular}
                keyboardType="phone-pad"
                colors={colors}
                styles={styles}
                onChangeText={(v) => setValue("celular", v)}
              />

              <FormInput
                label="Dirección"
                value={form.direccion}
                colors={colors}
                styles={styles}
                onChangeText={(v) => setValue("direccion", v)}
              />
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.label}>Género</ThemedText>

              <View style={styles.row}>
                {generos.map((g) => {
                  const active = form.genero === g;

                  return (
                    <Pressable
                      key={g}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setValue("genero", g)}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {g}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.label}>Expedido</ThemedText>

              <View style={styles.wrap}>
                {expedidos.map((e) => {
                  const active = form.expedido === e;

                  return (
                    <Pressable
                      key={e}
                      style={[styles.smallChip, active && styles.chipActive]}
                      onPress={() => setValue("expedido", e)}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {e}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.label}>Estado</ThemedText>

              <View style={styles.row}>
                {estados.map((e) => {
                  const active = form.estado === e;

                  return (
                    <Pressable
                      key={e}
                      style={[
                        styles.chip,
                        active && styles.chipActive,
                        e === "INACTIVO" && active && styles.inactiveChip,
                      ]}
                      onPress={() => setValue("estado", e)}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {e}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.cancelBtn, guardando && styles.disabled]}
              onPress={onClose}
              disabled={guardando}
            >
              <ThemedText style={styles.cancelText}>Cancelar</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.saveBtn, guardando && styles.disabled]}
              onPress={guardar}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={18}
                    color={colors.primaryForeground}
                  />
                  <ThemedText style={styles.saveText}>Guardar</ThemedText>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    modal: {
      width: "100%",
      maxWidth: 900,
      maxHeight: "92%",
      backgroundColor: colors.modal,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 8,
    },
    header: {
      padding: 22,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      backgroundColor: colors.card,
    },
    headerTextBox: {
      flex: 1,
    },
    title: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
    },
    subtitle: {
      marginTop: 4,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    closeBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    content: {
      padding: 22,
      gap: 18,
      backgroundColor: colors.modal,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 14,
    },
    inputGroup: {
      flexGrow: 1,
      flexBasis: 250,
      gap: 7,
    },
    label: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
    },
    input: {
      minHeight: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.input,
      color: colors.text,
      paddingHorizontal: 14,
      fontSize: 14,
      outlineStyle: "none" as any,
    },
    section: {
      gap: 9,
      paddingTop: 2,
    },
    row: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap",
    },
    wrap: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
    },
    smallChip: {
      paddingHorizontal: 13,
      paddingVertical: 9,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    inactiveChip: {
      backgroundColor: colors.destructive,
      borderColor: colors.destructive,
    },
    chipText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
    },
    chipTextActive: {
      color: colors.primaryForeground,
    },
    footer: {
      padding: 18,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      backgroundColor: colors.card,
    },
    cancelBtn: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
    },
    cancelText: {
      color: colors.text,
      fontWeight: "800",
    },
    saveBtn: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    saveText: {
      color: colors.primaryForeground,
      fontWeight: "900",
    },
    disabled: {
      opacity: 0.7,
    },
  });
}                         