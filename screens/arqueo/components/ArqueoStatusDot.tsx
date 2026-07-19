// screens/arqueo/components/ArqueoStatusDot.tsx
import { Tooltip } from "@/components/Tooltip";
import { useTheme } from "@/theme/useTheme";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useArqueo } from "../hooks/useArqueo";
import ArqueoCloseModal from "./ArqueoCloseModal";
import ArqueoOpenModal from "./ArqueoOpenModal";

interface ArqueoStatusDotProps {
  size?: number;
  borderColor?: string;
}

export const ArqueoStatusDot = ({
  size = 16,
  borderColor,
}: ArqueoStatusDotProps) => {
  const { theme } = useTheme();
  const { activeArqueo } = useArqueo();
  const [openModalVisible, setOpenModalVisible] = useState(false);
  const [closeModalVisible, setCloseModalVisible] = useState(false);

  const isActive = !!activeArqueo;
  const backgroundColor = isActive ? "#10B981" : "#EF4444";

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isActive) {
      setCloseModalVisible(true);
    } else {
      setOpenModalVisible(true);
    }
  };

  const tooltipMessage = isActive
    ? `Turno: ${activeArqueo.turno} - Activo`
    : "Sin turno";

  return (
    <>
      <View style={[styles.container, { bottom: 4, right: 4 }]}>
        {/* Pasamos el onPress al Tooltip, y el círculo ya no está envuelto en otro Pressable */}
        <Tooltip message={tooltipMessage} position="top" onPress={handlePress}>
          <View
            style={[
              styles.dot,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor,
                borderColor: borderColor || theme.colors.card,
                borderWidth: 2.5,
              },
            ]}
          />
        </Tooltip>
      </View>

      <ArqueoOpenModal
        visible={openModalVisible}
        onClose={() => setOpenModalVisible(false)}
        onSuccess={() => setOpenModalVisible(false)}
      />
      <ArqueoCloseModal
        visible={closeModalVisible}
        arqueoId={activeArqueo?.id}
        onClose={() => setCloseModalVisible(false)}
        onSuccess={() => setCloseModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 10,
  },
  dot: {},
});
