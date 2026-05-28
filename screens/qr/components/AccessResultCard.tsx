import { useTheme } from "@/theme/useTheme";
import { Clock, GraduationCap, User } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  alertColors,
  AUTO_DISMISS_SECONDS,
  springConfig,
} from "../animations/qr.animations";
import { VerifyAccessResponse } from "../types/qr.types";

interface Props {
  data: VerifyAccessResponse;
  onDismiss: () => void;
}

export const AccessResultCard: React.FC<Props> = ({ data, onDismiss }) => {
  const { theme } = useTheme();
  const { alerta, usuario } = data;
  const alertColor = alertColors[alerta.color]?.[0] || theme.colors.primary;
  const [secondsLeft, setSecondsLeft] = useState(AUTO_DISMISS_SECONDS);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setSecondsLeft(AUTO_DISMISS_SECONDS);
    timerRef.current = window.setTimeout(() => {
      onDismiss();
    }, AUTO_DISMISS_SECONDS * 1000);
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      timerRef.current = null;
      intervalRef.current = null;
    };
  }, [onDismiss]);

  const handleDismiss = () => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
    onDismiss();
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 60, scale: 0.85 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", ...springConfig }}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          shadowColor: alertColor,
        },
      ]}
    >
      <View style={[styles.header, { backgroundColor: alertColor + "20" }]}>
        <View style={[styles.alertDot, { backgroundColor: alertColor }]} />
        <Text style={[styles.alertTitle, { color: alertColor }]}>
          {alerta.mensaje}
        </Text>
        <Text style={[styles.countdown, { color: theme.colors.textSecondary }]}>
          {secondsLeft}s
        </Text>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.userRow}>
          <User size={18} color={theme.colors.textSecondary} />
          <Text style={[styles.text, { color: theme.colors.text }]}>
            {usuario.nombre_completo}
          </Text>
        </View>
        {usuario.carrera && (
          <View style={styles.userRow}>
            <GraduationCap size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
              {usuario.carrera}
            </Text>
          </View>
        )}
        {usuario.turno && (
          <View style={styles.userRow}>
            <Clock size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
              Turno {usuario.turno}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
        {alerta.descripcion}
      </Text>

      <Text
        onPress={handleDismiss}
        style={[styles.dismiss, { color: theme.colors.primary }]}
      >
        Escanear otro
      </Text>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 24,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
  },
  countdown: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  userInfo: {
    padding: 16,
    gap: 10,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
  },
  desc: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    fontSize: 14,
  },
  dismiss: {
    textAlign: "center",
    padding: 16,
    fontWeight: "700",
    fontSize: 16,
  },
});
