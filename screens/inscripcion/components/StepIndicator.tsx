import { Pressable, View } from "react-native";
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

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
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
              gap: 14,
            }}
          >
            <Pressable
              disabled={!enabled}
              onPress={() => onStepPress?.(step.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                opacity: enabled ? 1 : 0.45,
              }}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor:
                    active || completed
                      ? theme.colors.primary
                      : theme.colors.secondary,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: active ? 3 : 0,
                  borderColor: theme.colors.border,
                }}
              >
                <ThemedText
                  style={{
                    color: "#fff",
                    fontWeight: "900",
                    fontSize: 18,
                  }}
                >
                  {completed ? "✓" : step.id}
                </ThemedText>
              </View>

              <ThemedText
                style={{
                  fontSize: 16,
                  fontWeight: "900",
                  color: theme.colors.text,
                }}
              >
                {step.label}
              </ThemedText>
            </Pressable>

            {index < steps.length - 1 && (
              <View
                style={{
                  width: 110,
                  height: 1,
                  backgroundColor: theme.colors.border,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}