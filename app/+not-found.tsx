// app/+not-found.tsx
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  DimensionValue,
  Image,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import logoImg from "../assets/images/logo_texto.png";
import { SubmitButton } from "../screens/auth/components/SubmitButton";
import { useTheme } from "../theme/useTheme";

/* ─── Partícula flotante con movimiento orgánico ─── */
const FloatingShape = ({
  size,
  top,
  left,
  color,
  delayMs,
  durationMs,
  amplitudeX = 35,
  amplitudeY = 60,
  rotateAmplitude = 15,
}: {
  size: number;
  top: DimensionValue;
  left: DimensionValue;
  color: string;
  delayMs: number;
  durationMs: number;
  amplitudeX?: number;
  amplitudeY?: number;
  rotateAmplitude?: number;
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delayMs, withTiming(0.7, { duration: 1000 }));

    translateY.value = withRepeat(
      withTiming(-amplitudeY, {
        duration: durationMs,
        easing: Easing.bezier(0.42, 0.0, 0.58, 1.0),
      }),
      -1,
      true,
    );

    translateX.value = withRepeat(
      withTiming(amplitudeX, {
        duration: durationMs * 1.3,
        easing: Easing.bezier(0.42, 0.0, 0.58, 1.0),
      }),
      -1,
      true,
    );

    scale.value = withRepeat(
      withTiming(1.15, {
        duration: durationMs * 0.8,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    rotate.value = withRepeat(
      withTiming(rotateAmplitude, {
        duration: durationMs * 1.1,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* ─── 24 partículas distribuidas por toda la pantalla ─── */}
      {/* Esquina superior izquierda */}
      <FloatingShape
        size={110}
        top="3%"
        left={-30}
        color={theme.colors.primary + "22"}
        delayMs={0}
        durationMs={4000}
        amplitudeX={30}
        amplitudeY={55}
      />
      <FloatingShape
        size={70}
        top="10%"
        left="15%"
        color={theme.colors.primary + "18"}
        delayMs={300}
        durationMs={3500}
        amplitudeX={25}
        amplitudeY={50}
        rotateAmplitude={20}
      />
      {/* Arriba centro */}
      <FloatingShape
        size={90}
        top="5%"
        left="40%"
        color={theme.colors.primary + "15"}
        delayMs={600}
        durationMs={4200}
        amplitudeX={20}
        amplitudeY={45}
      />
      {/* Esquina superior derecha */}
      <FloatingShape
        size={120}
        top="8%"
        left={width - 50}
        color={theme.colors.primary + "20"}
        delayMs={200}
        durationMs={3800}
        amplitudeX={-35}
        amplitudeY={60}
      />
      <FloatingShape
        size={60}
        top="18%"
        left={width - 80}
        color={theme.colors.primary + "25"}
        delayMs={500}
        durationMs={3200}
        amplitudeX={-25}
        amplitudeY={40}
      />
      {/* Centro izquierda */}
      <FloatingShape
        size={80}
        top="40%"
        left={-20}
        color={theme.colors.primary + "12"}
        delayMs={800}
        durationMs={5000}
        amplitudeX={40}
        amplitudeY={30}
      />
      {/* Centro */}
      <FloatingShape
        size={100}
        top="50%"
        left="45%"
        color={theme.colors.primary + "10"}
        delayMs={400}
        durationMs={4600}
        amplitudeX={15}
        amplitudeY={25}
        rotateAmplitude={10}
      />
      {/* Centro derecha */}
      <FloatingShape
        size={75}
        top="55%"
        left={width - 70}
        color={theme.colors.primary + "18"}
        delayMs={700}
        durationMs={3900}
        amplitudeX={-30}
        amplitudeY={35}
      />
      {/* Abajo izquierda */}
      <FloatingShape
        size={130}
        top="70%"
        left={-30}
        color={theme.colors.primary + "20"}
        delayMs={1000}
        durationMs={4400}
        amplitudeX={35}
        amplitudeY={50}
      />
      <FloatingShape
        size={55}
        top="80%"
        left="20%"
        color={theme.colors.primary + "28"}
        delayMs={300}
        durationMs={3400}
        amplitudeX={20}
        amplitudeY={45}
        rotateAmplitude={25}
      />
      {/* Abajo centro */}
      <FloatingShape
        size={95}
        top="75%"
        left="50%"
        color={theme.colors.primary + "15"}
        delayMs={600}
        durationMs={4100}
        amplitudeX={10}
        amplitudeY={55}
      />
      {/* Abajo derecha */}
      <FloatingShape
        size={110}
        top="85%"
        left={width - 60}
        color={theme.colors.primary + "22"}
        delayMs={900}
        durationMs={3700}
        amplitudeX={-40}
        amplitudeY={40}
      />
      <FloatingShape
        size={65}
        top="90%"
        left={width - 100}
        color={theme.colors.primary + "18"}
        delayMs={150}
        durationMs={3300}
        amplitudeX={-20}
        amplitudeY={30}
      />
      {/* Lateral derecho medio */}
      <FloatingShape
        size={85}
        top="30%"
        left={width - 40}
        color={theme.colors.primary + "14"}
        delayMs={750}
        durationMs={4800}
        amplitudeX={-25}
        amplitudeY={50}
        rotateAmplitude={18}
      />

      {/* ── Partículas adicionales para llenar los huecos ── */}
      <FloatingShape
        size={50}
        top="20%"
        left="25%"
        color={theme.colors.primary + "20"}
        delayMs={100}
        durationMs={3000}
        amplitudeX={30}
        amplitudeY={60}
      />
      <FloatingShape
        size={70}
        top="35%"
        left="10%"
        color={theme.colors.primary + "15"}
        delayMs={450}
        durationMs={3600}
        amplitudeX={40}
        amplitudeY={40}
      />
      <FloatingShape
        size={90}
        top="65%"
        left="65%"
        color={theme.colors.primary + "18"}
        delayMs={650}
        durationMs={4000}
        amplitudeX={-20}
        amplitudeY={55}
      />
      <FloatingShape
        size={60}
        top="25%"
        left={width - 90}
        color={theme.colors.primary + "22"}
        delayMs={250}
        durationMs={3100}
        amplitudeX={-35}
        amplitudeY={45}
        rotateAmplitude={30}
      />
      <FloatingShape
        size={100}
        top="60%"
        left="30%"
        color={theme.colors.primary + "14"}
        delayMs={850}
        durationMs={4300}
        amplitudeX={15}
        amplitudeY={50}
      />
      <FloatingShape
        size={45}
        top="45%"
        left="80%"
        color={theme.colors.primary + "25"}
        delayMs={550}
        durationMs={2900}
        amplitudeX={25}
        amplitudeY={35}
      />
      <FloatingShape
        size={80}
        top="95%"
        left="40%"
        color={theme.colors.primary + "16"}
        delayMs={700}
        durationMs={3800}
        amplitudeX={10}
        amplitudeY={40}
      />
      <FloatingShape
        size={55}
        top="15%"
        left="55%"
        color={theme.colors.primary + "20"}
        delayMs={350}
        durationMs={3400}
        amplitudeX={20}
        amplitudeY={45}
        rotateAmplitude={15}
      />
      <FloatingShape
        size={120}
        top="82%"
        left="15%"
        color={theme.colors.primary + "12"}
        delayMs={1100}
        durationMs={4700}
        amplitudeX={30}
        amplitudeY={30}
      />
      <FloatingShape
        size={65}
        top="2%"
        left="75%"
        color={theme.colors.primary + "18"}
        delayMs={180}
        durationMs={3100}
        amplitudeX={-15}
        amplitudeY={50}
      />

      {/* ─── Logo de la empresa ─── */}
      <Animated.View
        entering={FadeIn.duration(600).springify()}
        style={{ marginBottom: 32, alignItems: "center", width: "100%" }}
      >
        <View
          style={{
            width: width * 0.8,
            maxWidth: 350,
            height: 120,
            marginBottom: 16,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={logoImg}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: theme.colors.text,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Página no encontrada
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: theme.colors.muted,
            textAlign: "center",
            marginTop: 12,
            paddingHorizontal: 32,
            lineHeight: 22,
          }}
        >
          La ruta que buscas no existe o fue movida.{"\n"}
          Verifica la dirección o regresa a la anterior página.
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeIn.delay(300).duration(600)}
        style={{
          width: 80,
          height: 3,
          backgroundColor: theme.colors.primary + "40",
          marginBottom: 36,
          alignSelf: "center",
          borderRadius: 2,
        }}
      />

      <Animated.View
        entering={SlideInDown.delay(500).springify().duration(500)}
        style={{ width: 220 }}
      >
        <SubmitButton
          title="Volver"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
          loading={false}
          disabled={false}
        />
      </Animated.View>

      <Animated.Text
        entering={FadeIn.delay(800).duration(400)}
        style={{
          fontSize: 12,
          color: theme.colors.muted,
          marginTop: 32,
          textAlign: "center",
          letterSpacing: 1,
        }}
      >
        ERROR 404
      </Animated.Text>
    </View>
  );
}
