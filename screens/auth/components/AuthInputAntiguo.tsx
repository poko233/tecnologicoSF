/* eslint-disable react/display-name */
// screens/auth/components/AuthInputAntiguo.tsx
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
  onSubmitEditing?: () => void;
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
    onSubmitEditing,
  }: AuthInputProps) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const labelFloated = useSharedValue(value ? 1 : 0);
    const borderColorProgress = useSharedValue(0);
    const translateX = useSharedValue(0);

    useEffect(() => {
      if (value) {
        labelFloated.value = withTiming(1, { duration: 150 });
      } else if (!isFocused) {
        labelFloated.value = withTiming(0, { duration: 150 });
      }
    }, [value, isFocused, labelFloated]);

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
      labelFloated.value = withTiming(1, { duration: 150 });
    }, [labelFloated]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      if (!value) {
        labelFloated.value = withTiming(0, { duration: 150 });
      }
      onBlur?.();
    }, [value, labelFloated, onBlur]);

    const labelStyle = useAnimatedStyle(() => ({
      top: withTiming(labelFloated.value > 0.5 ? -20 : 20, { duration: 200 }),
      fontSize: withTiming(labelFloated.value > 0.5 ? 12 : 16, {
        duration: 150,
      }),
      color: withTiming(
        isFocused
          ? theme.colors.primary
          : error
            ? theme.colors.destructive
            : theme.colors.muted,
        { duration: 200 },
      ),
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

    // Log al pulsar Enter
    const handleSubmitEditing = () => {
      if (onSubmitEditing) {
        onSubmitEditing();
      }
    };

    return (
      <View style={{ marginBottom: 16, width: "100%" }}>
        <View style={{ position: "relative", marginTop: 12 }}>
          <Animated.Text
            style={[
              labelStyle,
              {
                position: "absolute",
                left: 16,
                zIndex: 10,
                fontWeight: "500",
                paddingHorizontal: 4,
              },
            ]}
            pointerEvents="none"
          >
            {label}
          </Animated.Text>

          <Animated.View
            style={[
              borderStyle,
              {
                borderWidth: 1.5,
                borderRadius: 12,
              },
            ]}
          >
            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  paddingVertical: 4,
                  color: theme.colors.text,
                  outline: "none",
                  borderWidth: 0,
                  backgroundColor: "transparent",
                }}
                value={value}
                onChangeText={onChangeText}
                onFocus={handleFocus}
                onBlur={handleBlur}
                secureTextEntry={effectiveSecure}
                placeholder={isFocused ? placeholder : undefined}
                placeholderTextColor={theme.colors.muted}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                maxLength={maxLength}
                onSubmitEditing={handleSubmitEditing}
                returnKeyType="send"
              />
              {secureTextEntry && (
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ paddingLeft: 12 }}
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
        </View>

        <Animated.Text
          style={[
            errorAnimatedStyle,
            {
              color: theme.colors.destructive,
              fontSize: 12,
              marginTop: 6,
              marginLeft: 12,
            },
          ]}
        >
          {error || " "}
        </Animated.Text>
      </View>
    );
  },
);
