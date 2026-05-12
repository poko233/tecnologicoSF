// screens/auth/components/SubmitButton.tsx
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/useTheme";
import { springConfig } from "../animations/auth.animations";

interface SubmitButtonProps {
  title: string;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}

export const SubmitButton = ({
  title,
  onPress,
  loading,
  disabled,
}: SubmitButtonProps) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.97, springConfig);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const gradientColors: readonly [string, string] = theme.dark
    ? ["#FFFFFF", "#9CA3AF"]
    : ["#111827", "#1F2937"];

  const textColor = theme.dark ? "#111827" : "#FFFFFF";

  return (
    <Animated.View style={[animatedStyle, { width: "100%" }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.85}
        className="w-full"
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className={`rounded-xl py-4 items-center justify-center ${
            disabled || loading ? "opacity-50" : "opacity-100"
          }`}
        >
          {loading ? (
            <ActivityIndicator color={textColor} />
          ) : (
            <Text style={{ color: textColor }} className="font-bold text-base">
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};
