// screens/qr/components/QrCameraView.tsx
import { useTheme } from "@/theme/useTheme";
import {
    BlurMask,
    Canvas,
    Group,
    Line,
    Paint,
    Rect,
    RoundedRect,
    useClock,
    vec,
} from "@shopify/react-native-skia";
import { BarcodeScanningResult, CameraView } from "expo-camera";
import React from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import { SCAN_LINE_DURATION } from "../animations/qr.animations";

interface Props {
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
  isActive: boolean;
}

const SCAN_AREA_SIZE = 260;

// ─── Componente principal ───
export const QrCameraView: React.FC<Props> = ({
  onBarcodeScanned,
  isActive,
}) => {
  if (!isActive) return null;

  // En móvil usamos Skia, en web usamos Reanimated
  if (Platform.OS === "web") {
    return <QrCameraViewWeb onBarcodeScanned={onBarcodeScanned} />;
  }

  return <QrCameraViewNative onBarcodeScanned={onBarcodeScanned} />;
};

// ─────────────────────────────────────────────
// VERSIÓN MÓVIL (Skia)
// ─────────────────────────────────────────────
const QrCameraViewNative: React.FC<{
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
}> = ({ onBarcodeScanned }) => {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={onBarcodeScanned}
      />
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Fondo oscuro con blur */}
        <Group>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            color="rgba(0,0,0,0.65)"
          >
            <Paint>
              <BlurMask blur={1} />
            </Paint>
          </Rect>
        </Group>
        {/* Área transparente */}
        <RoundedRect
          x={(width - SCAN_AREA_SIZE) / 2}
          y={(height - SCAN_AREA_SIZE) / 2 - 40}
          width={SCAN_AREA_SIZE}
          height={SCAN_AREA_SIZE}
          r={24}
          color="transparent"
          blendMode="clear"
        />
        {/* Borde del área */}
        <RoundedRect
          x={(width - SCAN_AREA_SIZE) / 2}
          y={(height - SCAN_AREA_SIZE) / 2 - 40}
          width={SCAN_AREA_SIZE}
          height={SCAN_AREA_SIZE}
          r={24}
          color={theme.colors.primary}
          style="stroke"
          strokeWidth={2}
        />
        {/* Esquinas decorativas */}
        <CornerDecorators
          width={width}
          height={height}
          color={theme.colors.primary}
        />
        {/* Línea de escaneo animada */}
        <ScanLineNative
          width={width}
          height={height}
          color={theme.colors.primary}
        />
      </Canvas>
    </View>
  );
};

/* ─── Esquinas (Skia) ─── */
const CornerDecorators: React.FC<{
  width: number;
  height: number;
  color: string;
}> = ({ width, height, color }) => {
  const size = SCAN_AREA_SIZE;
  const x = (width - size) / 2;
  const y = (height - size) / 2 - 40;
  const len = 30;

  return (
    <Group>
      {/* Superior izquierda */}
      <Line
        p1={vec(x, y + 8)}
        p2={vec(x, y + len)}
        color={color}
        strokeWidth={3}
      />
      <Line
        p1={vec(x + 8, y)}
        p2={vec(x + len, y)}
        color={color}
        strokeWidth={3}
      />
      {/* Superior derecha */}
      <Line
        p1={vec(x + size - len, y)}
        p2={vec(x + size - 8, y)}
        color={color}
        strokeWidth={3}
      />
      <Line
        p1={vec(x + size, y + 8)}
        p2={vec(x + size, y + len)}
        color={color}
        strokeWidth={3}
      />
      {/* Inferior izquierda */}
      <Line
        p1={vec(x, y + size - 8)}
        p2={vec(x, y + size - len)}
        color={color}
        strokeWidth={3}
      />
      <Line
        p1={vec(x + 8, y + size)}
        p2={vec(x + len, y + size)}
        color={color}
        strokeWidth={3}
      />
      {/* Inferior derecha */}
      <Line
        p1={vec(x + size - len, y + size)}
        p2={vec(x + size - 8, y + size)}
        color={color}
        strokeWidth={3}
      />
      <Line
        p1={vec(x + size, y + size - 8)}
        p2={vec(x + size, y + size - len)}
        color={color}
        strokeWidth={3}
      />
    </Group>
  );
};

/* ─── Línea de escaneo (Skia) ─── */
const ScanLineNative: React.FC<{
  width: number;
  height: number;
  color: string;
}> = ({ width, height, color }) => {
  const clock = useClock();
  const y = useDerivedValue(() => {
    const top = (height - SCAN_AREA_SIZE) / 2 - 40;
    const bottom = top + SCAN_AREA_SIZE;
    const t = (clock.value % SCAN_LINE_DURATION) / SCAN_LINE_DURATION;
    return interpolate(t, [0, 1], [top + 10, bottom - 10]);
  });

  const x = (width - SCAN_AREA_SIZE) / 2 + 20;

  return (
    <Group>
      <Line
        p1={vec(x, y.value)}
        p2={vec(x + SCAN_AREA_SIZE - 40, y.value)}
        color={color}
        strokeWidth={2}
        opacity={0.8}
      />
    </Group>
  );
};

// ─────────────────────────────────────────────
// VERSIÓN WEB (Reanimated)
// ─────────────────────────────────────────────
const QrCameraViewWeb: React.FC<{
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
}> = ({ onBarcodeScanned }) => {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const scanLineY = useSharedValue(0);

  // Animación continua de la línea
  React.useEffect(() => {
    scanLineY.value = withRepeat(
      withTiming(1, { duration: SCAN_LINE_DURATION }),
      -1,
      true,
    );
  }, []);

  const lineStyle = useAnimatedStyle(() => {
    const top = (height - SCAN_AREA_SIZE) / 2 - 40;
    const bottom = top + SCAN_AREA_SIZE;
    const translateY = interpolate(
      scanLineY.value,
      [0, 1],
      [10, SCAN_AREA_SIZE - 10],
    );
    return {
      position: "absolute",
      left: (width - SCAN_AREA_SIZE) / 2 + 20,
      top: top,
      width: SCAN_AREA_SIZE - 40,
      height: 2,
      backgroundColor: theme.colors.primary,
      transform: [{ translateY }],
      opacity: 0.8,
    };
  });

  const areaLeft = (width - SCAN_AREA_SIZE) / 2;
  const areaTop = (height - SCAN_AREA_SIZE) / 2 - 40;

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={onBarcodeScanned}
      />
      {/* Overlay oscuro */}
      <View style={styles.darkOverlay} />
      {/* Borde del área de escaneo */}
      <View
        style={[
          styles.scanAreaBorder,
          {
            left: areaLeft,
            top: areaTop,
            width: SCAN_AREA_SIZE,
            height: SCAN_AREA_SIZE,
            borderColor: theme.colors.primary,
          },
        ]}
      />
      {/* Esquinas decorativas (simuladas con View) */}
      <CornerWeb
        left={areaLeft}
        top={areaTop}
        size={SCAN_AREA_SIZE}
        color={theme.colors.primary}
      />
      {/* Línea animada */}
      <Animated.View style={lineStyle} />
    </View>
  );
};

/* ─── Esquinas en web (Views con bordes) ─── */
const CornerWeb: React.FC<{
  left: number;
  top: number;
  size: number;
  color: string;
}> = ({ left, top, size, color }) => {
  const len = 30;
  const cornerStyle = (x: number, y: number, rot: string) => ({
    position: "absolute" as const,
    left: x,
    top: y,
    width: len,
    height: len,
    borderColor: color,
    borderTopWidth: rot.includes("top") ? 3 : 0,
    borderBottomWidth: rot.includes("bottom") ? 3 : 0,
    borderLeftWidth: rot.includes("left") ? 3 : 0,
    borderRightWidth: rot.includes("right") ? 3 : 0,
  });

  return (
    <>
      {/* Sup. izq. */}
      <View style={cornerStyle(left, top, "top-left")} />
      {/* Sup. der. */}
      <View style={cornerStyle(left + size - len, top, "top-right")} />
      {/* Inf. izq. */}
      <View style={cornerStyle(left, top + size - len, "bottom-left")} />
      {/* Inf. der. */}
      <View
        style={cornerStyle(left + size - len, top + size - len, "bottom-right")}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  camera: {
    flex: 1,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  scanAreaBorder: {
    position: "absolute",
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
});
