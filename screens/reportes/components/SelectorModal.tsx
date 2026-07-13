import { useTheme } from "@/theme/useTheme";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Check, Search, X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SelectorOption } from "../types/reportes.types";

interface SelectorModalProps {
  visible: boolean;
  title: string;
  options: SelectorOption[];
  selectedIds: (number | string)[];
  onToggle: (id: number | string) => void;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
  onApply: () => void;
  onClose: () => void;
  multiple?: boolean;
}

export function SelectorModal({
  visible,
  title,
  options,
  selectedIds,
  onToggle,
  onSelectAll,
  isAllSelected = false,
  onApply,
  onClose,
  multiple = true,
}: SelectorModalProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.subtitle &&
          opt.subtitle.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [options, searchQuery]);

  const handleToggle = useCallback(
    (id: number | string) => {
      Haptics.selectionAsync();
      onToggle(id);
    },
    [onToggle],
  );

  const handleApply = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onApply();
    onClose();
  }, [onApply, onClose]);

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <AnimatePresence>
        {visible && (
          <BlurView
            intensity={20}
            tint="dark"
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod="dimezisBlurView"
          >
            {/* ⭐ CAMBIO CRUCIAL: TouchableOpacity captura los toques fuera de forma 100% confiable */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={onClose}
              style={StyleSheet.absoluteFill}
            >
              <View style={styles.backdrop} pointerEvents="box-none">
                {/* ⭐ ESCUDO INTERIOR: Atrapa cualquier toque dentro del modal */}
                <TouchableWithoutFeedback onPress={() => {}}>
                  <MotiView
                    from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    exit={{ opacity: 0, scale: 0.95, translateY: 10 }}
                    transition={{
                      type: "timing",
                      duration: 300,
                      easing: (t) => t * t * (3 - 2 * t),
                    }}
                    exitTransition={{
                      type: "timing",
                      duration: 180,
                      easing: (t) => t * t,
                    }}
                    style={[styles.modalContainer, { backgroundColor: c.card }]}
                  >
                    <View
                      style={[styles.header, { borderBottomColor: c.border }]}
                    >
                      <Text style={[styles.title, { color: c.text }]}>
                        {title}
                      </Text>
                      <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeBtn}
                      >
                        <X size={20} color={c.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    {/* BUSCADOR CON OUTLINE */}
                    <View
                      style={[
                        styles.searchContainer,
                        { borderBottomColor: c.border },
                      ]}
                    >
                      <Search
                        size={18}
                        color={c.textSecondary}
                        style={styles.searchIcon}
                      />
                      <View style={{ flex: 1 }}>
                        <TextInput
                          placeholder="Buscar..."
                          placeholderTextColor={c.textSecondary}
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                          style={[
                            styles.searchInput,
                            {
                              color: c.text,
                              borderColor: c.border,
                              borderWidth: 1.5,
                              borderRadius: 8,
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              backgroundColor: c.backgroundSecondary,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <FlatList
                      data={filteredOptions}
                      keyExtractor={(item) => String(item.id)}
                      style={{ maxHeight: 280 }}
                      contentContainerStyle={styles.listContent}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                          <TouchableOpacity
                            onPress={() => handleToggle(item.id)}
                            style={[
                              styles.itemRow,
                              { borderBottomColor: c.border },
                            ]}
                          >
                            <View style={styles.itemTextContainer}>
                              <Text
                                style={[styles.itemLabel, { color: c.text }]}
                                numberOfLines={1}
                              >
                                {item.label}
                              </Text>
                              {item.subtitle && (
                                <Text
                                  style={[
                                    styles.itemSubtitle,
                                    { color: c.textSecondary },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {item.subtitle}
                                </Text>
                              )}
                            </View>
                            <View
                              style={[
                                styles.checkbox,
                                {
                                  borderColor: isSelected
                                    ? c.primary
                                    : c.border,
                                  backgroundColor: isSelected
                                    ? c.primary
                                    : "transparent",
                                },
                              ]}
                            >
                              {isSelected && (
                                <Check size={14} color={c.primaryForeground} />
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      }}
                    />

                    <View style={[styles.footer, { borderTopColor: c.border }]}>
                      <TouchableOpacity
                        onPress={onClose}
                        style={styles.cancelBtn}
                      >
                        <Text
                          style={[
                            styles.cancelText,
                            { color: c.textSecondary },
                          ]}
                        >
                          Cancelar
                        </Text>
                      </TouchableOpacity>

                      {/* ⭐ BOTÓN SELECCIONAR TODAS - CORREGIDO PARA GESTIÓN */}
                      {onSelectAll && multiple && (
                        <TouchableOpacity
                          onPress={onSelectAll}
                          style={styles.selectAllBtn}
                        >
                          <Text
                            style={[styles.selectAllText, { color: c.primary }]}
                          >
                            {isAllSelected
                              ? "Deseleccionar todas"
                              : "Seleccionar todas"}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {onSelectAll && !multiple && !isAllSelected && (
                        <TouchableOpacity
                          onPress={onSelectAll}
                          style={styles.selectAllBtn}
                        >
                          <Text
                            style={[styles.selectAllText, { color: c.primary }]}
                          >
                            Todas las gestiones
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={handleApply}
                        style={[
                          styles.applyBtn,
                          { backgroundColor: c.primary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.applyText,
                            { color: c.primaryForeground },
                          ]}
                        >
                          Aplicar ({selectedIds.length})
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </MotiView>
                </TouchableWithoutFeedback>
              </View>
            </TouchableOpacity>
          </BlurView>
        )}
      </AnimatePresence>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  listContent: {
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  itemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  selectAllBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  applyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
