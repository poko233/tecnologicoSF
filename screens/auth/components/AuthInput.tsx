// screens/auth/components/AuthInput.tsx
import { Eye, EyeOff } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/useTheme";
import { errorShakeAnimation } from "../animations/auth.animations";

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  secureTextEntry?: boolean;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words";
  maxLength?: number;
}

export const AuthInput = React.memo(
  ({
    label,
    value,
    onChangeText,
    onBlur,
    error,
    secureTextEntry = false,
    placeholder,
    keyboardType = "default",
    autoCapitalize = "sentences",
    maxLength,
  }: AuthInputProps) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const labelTop = useSharedValue(value ? 1 : 0);
    const borderColorProgress = useSharedValue(0); // 0: default, 1: focused, 2: error
    const translateX = useSharedValue(0);

    useEffect(() => {
      labelTop.value = withTiming(value ? 1 : 0, { duration: 150 });
    }, [value, labelTop]);

    useEffect(() => {
      if (error) {
        borderColorProgress.value = withTiming(2, { duration: 200 });
        errorShakeAnimation(translateX);
      } else if (isFocused) {
        borderColorProgress.value = withTiming(1, { duration: 200 });
      } else {
        borderColorProgress.value = withTiming(0, { duration: 200 });
      }
    }, [error, isFocused, borderColorProgress, translateX]);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      if (!value) labelTop.value = withTiming(1, { duration: 150 });
    }, [value, labelTop]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      if (!value) labelTop.value = withTiming(0, { duration: 150 });
      onBlur?.();
    }, [value, labelTop, onBlur]);

    const labelStyle = useAnimatedStyle(() => ({
      top: labelTop.value * -18,
      fontSize: withTiming(labelTop.value ? 12 : 16, { duration: 150 }),
      color: withTiming(
        isFocused
          ? theme.colors.primary
          : error
            ? theme.colors.destructive
            : theme.colors.muted,
        { duration: 200 },
      ),
      backgroundColor: theme.colors.backgroundSecondary,
    }));

    const borderStyle = useAnimatedStyle(() => {
      const borderColor = interpolateColor(
        borderColorProgress.value,
        [0, 1, 2],
        [theme.colors.border, theme.colors.primary, theme.colors.destructive],
      );
      return {
        borderColor,
        transform: [{ translateX: translateX.value }],
      };
    });

    const errorAnimatedStyle = useAnimatedStyle(() => ({
      opacity: error ? withTiming(1, { duration: 200 }) : withTiming(0),
      transform: [{ translateY: error ? withTiming(0) : withTiming(-4) }],
    }));

    const effectiveSecure = secureTextEntry && !showPassword;

    return (
      <View className="mb-4 w-full">
        <Animated.View
          style={[borderStyle]}
          className="border rounded-xl bg-background-secondary px-4 pb-2 pt-4 relative"
        >
          <Animated.Text
            style={[
              labelStyle,
              {
                position: "absolute",
                left: 16,
                paddingHorizontal: 4,
                zIndex: 10,
                fontWeight: "500",
              },
            ]}
          >
            {label}
          </Animated.Text>
          <View className="flex-row items-center mt-2">
            <TextInput
              className="flex-1 text-base py-1.5"
              style={{ color: theme.colors.text }}
              value={value}
              onChangeText={onChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              secureTextEntry={effectiveSecure}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.muted}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              maxLength={maxLength}
            />
            {secureTextEntry && (
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="pl-2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.colors.muted} />
                ) : (
                  <Eye size={20} color={theme.colors.muted} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
        <Animated.Text
          style={[errorAnimatedStyle, { color: theme.colors.destructive }]}
          className="text-xs mt-1 ml-2"
        >
          {error || " "}
        </Animated.Text>
      </View>
    );
  },
);
