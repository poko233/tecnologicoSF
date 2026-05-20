// FilterDropdown.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";

interface FilterDropdownProps {
  label: string;
  value: string | number;
  options: { label: string; value: string | number }[];
  onChange: (value: any) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<View>(null);
  const selected = options.find((o) => o.value === value);

  const handleOpen = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setPos({ top: y + height + 4, left: x, width });
      setOpen(true);
    });
  };

  return (
    <View style={{ minWidth: 140 }}>
      <Text
        style={{
          fontSize: 12,
          marginBottom: 4,
          fontWeight: "500",
          color: theme.colors.textSecondary,
        }}
      >
        {label}
      </Text>

      <Pressable
        ref={triggerRef}
        onPress={handleOpen}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.card,
          gap: 8,
        }}
      >
        <Text
          style={{
            color: theme.colors.primary,
            fontWeight: "500",
            fontSize: 14,
          }}
        >
          {selected?.label ?? "Todos"}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={14}
          color={theme.colors.textSecondary}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)}>
          <View
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              width: Math.max(pos.width, 160),
              backgroundColor: theme.colors.card,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.colors.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 8,
              overflow: "hidden",
              maxHeight: 280,
            }}
          >
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {options.map((opt, i) => (
                <Pressable
                  key={String(opt.value)}
                  onPress={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor:
                      value === opt.value
                        ? theme.colors.primary + "15"
                        : theme.colors.card,
                    borderBottomWidth: i < options.length - 1 ? 1 : 0,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: value === opt.value ? "600" : "400",
                      color:
                        value === opt.value
                          ? theme.colors.primary
                          : theme.colors.text,
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
