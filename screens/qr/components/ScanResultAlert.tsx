import { useTheme } from "@/theme/useTheme";
import * as Haptics from "expo-haptics";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  alertColors,
  alertSpring,
  AUTO_DISMISS_SECONDS,
} from "../animations/qr.animations";

interface Props {
  visible: boolean;
  title: string;
  subtitle?: string;
  type: "success" | "warning" | "error" | "info";
  onDismiss: () => void;
}

export const ScanResultAlert: React.FC<Props> = ({
  visible,
  title,
  subtitle,
  type,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const [secondsLeft, setSecondsLeft] = useState(AUTO_DISMISS_SECONDS);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (visible) {
      setSecondsLeft(AUTO_DISMISS_SECONDS);
      // Auto-dismiss al llegar a 0
      timerRef.current = window.setTimeout(() => {
        onDismiss();
      }, AUTO_DISMISS_SECONDS * 1000);
      // Actualizar contador cada segundo
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [visible, onDismiss]);

  useEffect(() => {
    if (visible && type === "success") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (visible && type === "error") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [visible, type]);

  const colorSet = {
    success: alertColors.verde[0],
    warning: alertColors.amarillo[0],
    error: alertColors.rojo[0],
    info: theme.colors.info,
  };

  const icons = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle,
    info: Info,
  };

  const IconComponent = icons[type] || Info;

  const handleClose = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ opacity: 0, translateY: 50, scale: 0.9 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          exit={{ opacity: 0, translateY: -20, scale: 0.95 }}
          transition={alertSpring}
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.card,
              borderLeftColor: colorSet[type],
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <View style={styles.row}>
            <IconComponent size={28} color={colorSet[type]} />
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={[
                    styles.subtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {subtitle}
                </Text>
              )}
              <Text
                style={[
                  styles.countdown,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Cerrando en {secondsLeft}s
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={8}>
              <X size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </MotiView>
      )}
    </AnimatePresence>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 6,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  countdown: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },
});
