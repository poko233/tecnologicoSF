import { useTheme } from "@/theme/useTheme";
import { QrCode, ShieldCheck } from "lucide-react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
    tabPressAnimation,
    useTabTransition,
} from "../animations/qr.animations";
import { ScanMode } from "../types/qr.types";

interface Props {
  mode: ScanMode;
  onModeChange: (mode: ScanMode) => void;
}

export const ModeTabs: React.FC<Props> = ({ mode, onModeChange }) => {
  const { theme } = useTheme();
  const transition = useTabTransition();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.card + "CC" }]}
    >
      <MotiPressable
        style={styles.tab}
        onPress={() => onModeChange("asistencia")}
        animate={tabPressAnimation}
      >
        <View style={styles.tabContent}>
          <QrCode
            size={20}
            color={
              mode === "asistencia"
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  mode === "asistencia"
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                fontWeight: mode === "asistencia" ? "700" : "500",
              },
            ]}
          >
            Asistencia
          </Text>
        </View>
        {mode === "asistencia" && (
          <MotiView
            from={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={transition}
            style={[
              styles.indicator,
              { backgroundColor: theme.colors.primary },
            ]}
          />
        )}
      </MotiPressable>

      <MotiPressable
        style={styles.tab}
        onPress={() => onModeChange("acceso")}
        animate={tabPressAnimation}
      >
        <View style={styles.tabContent}>
          <ShieldCheck
            size={20}
            color={
              mode === "acceso"
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  mode === "acceso"
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                fontWeight: mode === "acceso" ? "700" : "500",
              },
            ]}
          >
            Control Acceso
          </Text>
        </View>
        {mode === "acceso" && (
          <MotiView
            from={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={transition}
            style={[
              styles.indicator,
              { backgroundColor: theme.colors.primary },
            ]}
          />
        )}
      </MotiPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 16,
    backdropFilter: "blur(10px)",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  indicator: {
    position: "absolute",
    bottom: 2,
    height: 3,
    width: "70%",
    borderRadius: 3,
  },
});
