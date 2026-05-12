// screens/auth/RegisterScreen.tsx
import { router } from "expo-router";
import React from "react";
import { Platform, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useResponsive } from "../../hooks/useResponsive";
import { useTheme } from "../../theme/useTheme";
import { AuthInput } from "./components/AuthInput";
import { GenderSelector } from "./components/GenderSelector";
import { SubmitButton } from "./components/SubmitButton";
import { useRegisterForm } from "./hooks/useRegisterForm";
import type { RegisterRequest } from "./types/auth.types";

const textFields: {
  field: keyof RegisterRequest;
  label: string;
  autoCapitalize?: "none" | "sentences" | "words";
  maxLength?: number;
  keyboardType?: "default" | "email-address" | "numeric";
  secureTextEntry?: boolean;
}[] = [
  { field: "usuario", label: "Usuario", autoCapitalize: "none", maxLength: 40 },
  { field: "password", label: "Contraseña", secureTextEntry: true },
  { field: "ci", label: "CI", autoCapitalize: "none", maxLength: 12 },
  {
    field: "nombres",
    label: "Nombres",
    autoCapitalize: "words",
    maxLength: 40,
  },
  {
    field: "apellidos",
    label: "Apellidos",
    autoCapitalize: "words",
    maxLength: 40,
  },
  {
    field: "fecha_nac",
    label: "Fecha nac. (YYYY-MM-DD)",
    autoCapitalize: "none",
  },
  {
    field: "email",
    label: "Email (opcional)",
    autoCapitalize: "none",
    maxLength: 80,
    keyboardType: "email-address",
  },
  {
    field: "telefono",
    label: "Teléfono (opcional)",
    keyboardType: "numeric",
    maxLength: 10,
  },
  {
    field: "celular",
    label: "Celular (opcional)",
    keyboardType: "numeric",
    maxLength: 10,
  },
];

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { width } = useResponsive();
  const isTwoColumns = width >= 640; // breakpoint para dos columnas

  const {
    form,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    submitting,
    serverError,
    canSubmit,
  } = useRegisterForm();

  const handleGenderSelect = (val: "MASCULINO" | "FEMENINO") => {
    handleChange("genero")(val);
  };

  // Separar campos en dos columnas si es necesario
  const leftFields = isTwoColumns
    ? textFields.slice(0, Math.ceil(textFields.length / 2))
    : textFields;
  const rightFields = isTwoColumns
    ? textFields.slice(Math.ceil(textFields.length / 2))
    : [];

  const renderField = (
    item: (typeof textFields)[0],
    index: number,
    columnOffset = 0,
  ) => (
    <Animated.View
      key={item.field}
      entering={FadeInUp.delay(150 + (index + columnOffset) * 50)
        .duration(400)
        .springify()}
    >
      <AuthInput
        label={item.label}
        value={form[item.field]}
        onChangeText={handleChange(item.field)}
        onBlur={handleBlur(item.field)}
        error={errors[item.field]}
        secureTextEntry={item.secureTextEntry}
        keyboardType={item.keyboardType ?? "default"}
        autoCapitalize={item.autoCapitalize ?? "sentences"}
        maxLength={item.maxLength}
      />
    </Animated.View>
  );

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={Platform.OS === "ios" ? 40 : 60}
    >
      <View
        style={{ backgroundColor: theme.colors.background }}
        className="flex-1 justify-center items-center px-6 py-10"
      >
        {/* Tarjeta flotante */}
        <View
          className={`w-full ${
            isTwoColumns ? "max-w-3xl" : "max-w-md"
          } bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700`}
          style={{
            backgroundColor: theme.dark
              ? "rgba(31,41,55,0.9)"
              : "rgba(255,255,255,0.9)",
          }}
        >
          <Animated.View entering={FadeInDown.duration(400).springify()}>
            <Text
              style={{ color: theme.colors.text }}
              className="text-3xl font-extrabold mb-2 text-center"
            >
              Crear cuenta
            </Text>
            <Text
              style={{ color: theme.colors.muted }}
              className="text-sm mb-8 text-center"
            >
              Completa todos los campos para registrarte.
            </Text>
          </Animated.View>

          {isTwoColumns ? (
            <View className="flex-row gap-4">
              <View className="flex-1">
                {leftFields.map((item, i) => renderField(item, i, 0))}
              </View>
              <View className="flex-1">
                {rightFields.map((item, i) =>
                  renderField(item, i, leftFields.length),
                )}
              </View>
            </View>
          ) : (
            leftFields.map((item, i) => renderField(item, i, 0))
          )}

          <Animated.View
            entering={FadeInUp.delay(150 + textFields.length * 50)
              .duration(400)
              .springify()}
          >
            <GenderSelector
              value={form.genero}
              onSelect={handleGenderSelect}
              error={errors.genero}
            />
          </Animated.View>

          {serverError && (
            <Animated.View entering={FadeInUp.duration(200)}>
              <Text
                style={{ color: theme.colors.destructive }}
                className="text-sm mb-4 text-center"
              >
                {serverError}
              </Text>
            </Animated.View>
          )}

          <Animated.View
            entering={FadeInUp.delay(200 + textFields.length * 50)
              .duration(400)
              .springify()}
          >
            <SubmitButton
              title="Registrarse"
              onPress={handleSubmit}
              loading={submitting}
              disabled={!canSubmit}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(250 + textFields.length * 50)
              .duration(400)
              .springify()}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 24,
            }}
          >
            <Text style={{ color: theme.colors.muted }}>
              ¿Ya tienes cuenta?{" "}
            </Text>
            <Text
              style={{ color: theme.colors.primary }}
              className="font-bold"
              onPress={() => router.back()}
            >
              Inicia sesión
            </Text>
          </Animated.View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
