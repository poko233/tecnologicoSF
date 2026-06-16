// screens/auth/LoginScreen.tsx
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Platform, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useEmpresa } from "../../contexts/EmpresaContext";
import { useTheme } from "../../theme/useTheme";
import { AuthInput } from "./components/AuthInputAntiguo";
import { SubmitButton } from "./components/SubmitButtonAntiguo";
import { useLoginForm } from "./hooks/useLoginForm";

export default function LoginScreen() {
  const { theme } = useTheme();
  const { empresa } = useEmpresa();
  console.log("BANER:", empresa?.BANER_INICIO);
  const {
    form,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    submitting,
    serverError,
    canSubmit,
  } = useLoginForm();

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
        {/* ── Banner institucional de fondo ── */}
        {empresa?.BANER_INICIO && (
          <Image
            source={{ uri: empresa.BANER_INICIO }}
            style={{
              position: "absolute",
              width: "70%",
              height: "80%",
              opacity: 0.12,
            }}
            contentFit="contain"
            blurRadius={2}
          />
        )}

        {/* ── Formulario ── */}
        <View
          className="w-full max-w-md rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700"
          style={{
            backgroundColor: theme.dark
              ? "rgba(31,41,55,0.9)"
              : "rgba(255,255,255,0.9)",
          }}
        >
          <Animated.View entering={FadeInDown.duration(400).springify()}>
            <Text
              style={{ color: theme.colors.text }}
              className="text-3xl font-extrabold mb-2"
            >
              Iniciar sesión
            </Text>

            <Text
              style={{ color: theme.colors.muted }}
              className="text-sm mb-8"
            >
              Bienvenido de nuevo. Ingresa tus credenciales.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(100).duration(400).springify()}
          >
            <AuthInput
              label="Usuario, CI o Email"
              value={form.usuario}
              onChangeText={handleChange("usuario")}
              onBlur={handleBlur("usuario")}
              error={errors.usuario}
              autoCapitalize="none"
              maxLength={40}
              onSubmitEditing={handleSubmit}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(200).duration(400).springify()}
          >
            <AuthInput
              label="Contraseña"
              value={form.password}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              error={errors.password}
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={handleSubmit}
            />
          </Animated.View>

          {serverError && (
            <Animated.View entering={FadeInUp.duration(200)}>
              <Text
                style={{ color: theme.colors.destructive }}
                className="text-sm mb-4"
              >
                {serverError}
              </Text>
            </Animated.View>
          )}

          <Animated.View
            entering={FadeInUp.delay(300).duration(400).springify()}
          >
            <SubmitButton
              title="Ingresar"
              onPress={handleSubmit}
              loading={submitting}
              disabled={!canSubmit}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(400).duration(400).springify()}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 24,
            }}
          >
            {/*
            <Text style={{ color: theme.colors.muted }}>
              ¿No tienes cuenta?{"   "}
            </Text>
            <Text
              style={{ color: theme.colors.primary }}
              className="font-bold"
              onPress={() => router.push("/register")}
            >
              Regístrate
            </Text>*/}
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(500).duration(400).springify()}
            style={{
              alignItems: "center",
              marginTop: 18,
            }}
          >
            <Text
              style={{ color: theme.colors.primary }}
              className="font-bold"
              onPress={() => router.push("/forgot-password")}
            >
              ¿Olvidaste tu contraseña?
            </Text>
          </Animated.View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}