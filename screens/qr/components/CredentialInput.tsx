import { useTheme } from "@/theme/useTheme";
import {
  ArrowRight,
  Clock,
  CreditCard,
  Headphones,
  QrCode,
  Shield,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { InputMode } from "../types/qr.types";

interface Props {
  onVerify: (mode: InputMode, value: string) => void;
  loading?: boolean;
}

export const CredentialInput: React.FC<Props> = ({ onVerify, loading }) => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<InputMode>("qr");
  const [value, setValue] = useState("");
  const inputRef = useRef<TextInput>(null);
  const containerWidth = useSharedValue(0);
  const toggleWidth = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    setValue("");
    translateX.value = withSpring(
      mode === "qr" ? 0 : containerWidth.value / 2,
      {
        damping: 20,
        stiffness: 200,
      },
    );
  }, [mode]);

  useEffect(() => {
    if (Platform.OS === "web") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleToggle = (newMode: InputMode) => {
    if (newMode === mode) return;
    setMode(newMode);
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed && !loading) {
      onVerify(mode, trimmed);
    }
  };

  return (
    <View
      style={[
        styles.glassCard,
        {
          backgroundColor: theme.colors.card + "B3",
          borderColor: theme.colors.border + "80",
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      {/* Toggle QR/CI */}
      <View
        style={[
          styles.toggleContainer,
          { backgroundColor: theme.colors.backgroundSecondary },
        ]}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          containerWidth.value = w;
          toggleWidth.value = (w - 8) / 2;
          translateX.value = mode === "qr" ? 0 : w / 2;
        }}
      >
        <Animated.View
          style={[
            styles.indicator,
            animatedStyle,
            {
              width: toggleWidth.value > 0 ? toggleWidth.value : "48%",
              backgroundColor: theme.colors.card,
              shadowColor: theme.colors.shadow,
            },
          ]}
        />
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => handleToggle("qr")}
          activeOpacity={0.8}
        >
          <QrCode
            size={18}
            color={
              mode === "qr" ? theme.colors.primary : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.toggleText,
              {
                color:
                  mode === "qr"
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                fontWeight: mode === "qr" ? "700" : "600",
              },
            ]}
          >
            Código QR
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => handleToggle("ci")}
          activeOpacity={0.8}
        >
          <CreditCard
            size={18}
            color={
              mode === "ci" ? theme.colors.primary : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.toggleText,
              {
                color:
                  mode === "ci"
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                fontWeight: mode === "ci" ? "700" : "600",
              },
            ]}
          >
            Cédula (CI)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input */}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.input + "80",
          },
        ]}
      >
        <View style={styles.iconContainer}>
          {mode === "qr" ? (
            <QrCode size={28} color={theme.colors.primary} />
          ) : (
            <CreditCard size={28} color={theme.colors.primary} />
          )}
        </View>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { color: theme.colors.text },
            Platform.OS === "web" && ({ outlineStyle: "none" } as any),
          ]}
          placeholder={
            mode === "qr"
              ? "Escanee el código QR..."
              : "Ingrese Cédula de Identidad..."
          }
          placeholderTextColor={theme.colors.textTertiary}
          value={value}
          onChangeText={setValue}
          autoCapitalize="none"
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[
            styles.validateBtn,
            {
              backgroundColor: theme.colors.primary,
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={loading || !value.trim()}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.primaryForeground}
            />
          ) : (
            <>
              <Text
                style={[
                  styles.validateText,
                  { color: theme.colors.primaryForeground },
                ]}
              >
                VALIDAR
              </Text>
              <ArrowRight size={18} color={theme.colors.primaryForeground} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Ayuda */}
      <View style={styles.helpRow}>
        <View style={styles.helpItem}>
          <Shield size={14} color={theme.colors.success} />
          <Text
            style={[styles.helpText, { color: theme.colors.textSecondary }]}
          >
            Acceso Seguro
          </Text>
        </View>
        <View style={styles.helpItem}>
          <Clock size={14} color={theme.colors.info} />
          <Text
            style={[styles.helpText, { color: theme.colors.textSecondary }]}
          >
            Tiempo Real
          </Text>
        </View>
        <View style={styles.helpItem}>
          <Headphones size={14} color={theme.colors.warning} />
          <Text
            style={[styles.helpText, { color: theme.colors.textSecondary }]}
          >
            Soporte TI
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    gap: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 99,
    padding: 4,
    position: "relative",
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
    overflow: "hidden",
  },
  indicator: {
    position: "absolute",
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 99,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 0,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 99,
    zIndex: 1,
  },
  toggleText: {
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 2,
    paddingLeft: 16,
    paddingRight: 8,
    height: 64,
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "500",
    height: "100%",
    minWidth: 0, // evita que el input empuje al botón fuera
  },
  validateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 120,
    flexShrink: 0,
  },
  validateText: {
    fontSize: 14,
    fontWeight: "700",
  },
  helpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    flexWrap: "wrap",
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  helpText: {
    fontSize: 12,
  },
});
