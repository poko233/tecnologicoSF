import { Pressable, View, useWindowDimensions } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

type Props = {
  currentStep: number;
  maxStepReached?: number;
  onStepPress?: (step: number) => void;
};

const steps = [
  { id: 1, label: "Datos" },
  { id: 2, label: "Académico" },
  { id: 3, label: "Documentos" },
  { id: 4, label: "Finalizar" },
];

export default function StepIndicator({
  currentStep,
  maxStepReached = currentStep,
  onStepPress,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width < 700;

  const circleSize = isMobile ? 38 : 44;
  const itemWidth = isMobile ? 68 : 88;
  const lineWidth = isMobile ? 26 : 48;

  return (
    <View
      style={{
        alignSelf: "center",
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card,
        borderRadius: 22,
        paddingVertical: isMobile ? 12 : 16,
        paddingHorizontal: isMobile ? 12 : 20,
        maxWidth: "100%",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {steps.map((step, index) => {
          const active = currentStep === step.id;
          const completed = step.id < currentStep;
          const enabled = step.id <= maxStepReached;

          return (
            <View
              key={step.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Pressable
                disabled={!enabled}
                onPress={() => onStepPress?.(step.id)}
                style={{
                  width: itemWidth,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: enabled ? 1 : 0.45,
                }}
              >
                <View
                  style={{
                    width: circleSize,
                    height: circleSize,
                    borderRadius: 999,
                    backgroundColor:
                      active || completed
                        ? theme.colors.primary
                        : theme.colors.secondary,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: active ? 2 : 0,
                    borderColor: `${theme.colors.primary}35`,
                  }}
                >
                  <ThemedText
                    style={{
                      color: "#fff",
                      fontWeight: "900",
                      fontSize: isMobile ? 13 : 15,
                    }}
                  >
                    {completed ? "✓" : step.id}
                  </ThemedText>
                </View>

                <ThemedText
                  numberOfLines={1}
                  style={{
                    marginTop: 6,
                    fontSize: isMobile ? 11 : 13,
                    fontWeight: active ? "900" : "800",
                    color: active ? theme.colors.primary : theme.colors.text,
                    textAlign: "center",
                  }}
                >
                  {step.label}
                </ThemedText>
              </Pressable>

              {index < steps.length - 1 && (
                <View
                  style={{
                    width: lineWidth,
                    height: 3,
                    borderRadius: 999,
                    backgroundColor: completed
                      ? `${theme.colors.primary}55`
                      : theme.colors.border,
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}