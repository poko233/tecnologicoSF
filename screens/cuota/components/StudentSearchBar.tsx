import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Pressable, TextInput } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/useTheme";

interface StudentSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (term: string) => void; // nueva prop
  onFocus?: () => void; // nueva
  placeholder?: string;
  isLoading?: boolean;
  isDropdownOpen?: boolean;
}

export const StudentSearchBar: React.FC<StudentSearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  onFocus,
  placeholder = "Buscar por CI, nombre o matrícula...",
  isLoading = false,
  isDropdownOpen = false,
}) => {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const isFocused = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedBorderColor = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      isFocused.value,
      [0, 1],
      [theme.colors.border, theme.colors.primary],
    ),
    borderWidth: withTiming(isFocused.value ? 2 : 1),
  }));

  const animatedShadow = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
  };

  return (
    <Animated.View style={animatedShadow}>
      <Animated.View
        pointerEvents="auto"
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.colors.backgroundSecondary,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 8,
            gap: 8,
            flexWrap: "nowrap",
          },
          animatedBorderColor,
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => inputRef.current?.focus()}
          style={{ padding: 4 }}
        >
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
          />
        </Pressable>
        <TextInput
          ref={inputRef}
          pointerEvents="auto"
          style={{
            flex: 1,
            flexShrink: 1,
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: theme.colors.text,
            padding: 0,
            minWidth: 0,
          }}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={(e) => onSearch(e.nativeEvent.text)}
          onFocus={() => {
            isFocused.value = withTiming(1, { duration: 200 });
            onFocus?.();
          }}
          onBlur={() => {
            isFocused.value = withTiming(0, { duration: 200 });
          }}
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText("")} style={{ padding: 4 }}>
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.colors.textMuted}
            />
          </Pressable>
        )}
        <Pressable
          onPress={(e) => onSearch(value)}
          disabled={isLoading}
          style={({ pressed }) => ({
            backgroundColor: theme.colors.primary,
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 6,
            opacity: pressed || isLoading ? 0.7 : 1,
            flexShrink: 0,
          })}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.colors.primaryForeground}
          />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};
