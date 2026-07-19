import { useTheme } from "@/theme/useTheme";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useRemoteSearch } from "../hooks/useRemoteSearch";

interface RemoteSearchSelectorModalProps<T> {
  visible: boolean;
  title: string;
  fetchItems: (
    search: string,
    page: number,
    signal?: AbortSignal,
  ) => Promise<any>;
  onSelect: (item: T) => void;
  onClose: () => void;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
  placeholder?: string;
}

export function RemoteSearchSelectorModal<T>({
  visible,
  title,
  fetchItems,
  onSelect,
  onClose,
  renderItem,
  keyExtractor,
  placeholder = "Buscar...",
}: RemoteSearchSelectorModalProps<T>) {
  const { theme } = useTheme();
  const c = theme.colors;

  const {
    items,
    loading,
    loadingMore,
    hasNextPage,
    searchQuery,
    setSearchQuery,
    doSearch,
    loadMore,
    abortCurrentRequest,
  } = useRemoteSearch<T>({ fetchItems });

  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    if (
      visible &&
      !initialLoadDoneRef.current &&
      items.length === 0 &&
      !loading
    ) {
      initialLoadDoneRef.current = true;
      doSearch("");
    }
  }, [visible, items.length, loading, doSearch]);

  useEffect(() => {
    if (!visible) {
      initialLoadDoneRef.current = false;
      abortCurrentRequest();
    }
  }, [visible, abortCurrentRequest]);

  const handleSelect = useCallback(
    (item: T) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSelect(item);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleSearch = () => {
    if (searchQuery.trim().length === 0) {
      doSearch(""); // Buscar sin texto muestra todos
    } else {
      doSearch(searchQuery);
    }
  };

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
            <TouchableOpacity
              activeOpacity={1}
              onPress={onClose}
              style={StyleSheet.absoluteFill}
            >
              <View style={styles.backdrop} pointerEvents="box-none">
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

                    <View
                      style={[
                        styles.searchContainer,
                        { borderBottomColor: c.border },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <TextInput
                          placeholder={placeholder}
                          placeholderTextColor={c.textSecondary}
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                          onSubmitEditing={handleSearch}
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
                              flex: 1,
                            },
                          ]}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={handleSearch}
                        style={[
                          styles.searchButton,
                          { backgroundColor: c.primary },
                        ]}
                        disabled={loading}
                      >
                        <Text
                          style={[
                            styles.searchButtonText,
                            { color: c.primaryForeground },
                          ]}
                        >
                          Buscar
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* LISTA CON BOTÓN "CARGAR MÁS" */}
                    {loading && items.length === 0 ? (
                      <View style={styles.centerLoading}>
                        <ActivityIndicator size="large" color={c.primary} />
                        <Text
                          style={[
                            styles.loadingText,
                            { color: c.textSecondary },
                          ]}
                        >
                          Cargando...
                        </Text>
                      </View>
                    ) : (
                      <FlatList
                        data={items}
                        keyExtractor={keyExtractor}
                        style={{ maxHeight: 280 }}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        ListFooterComponent={
                          loadingMore ? (
                            <ActivityIndicator
                              size="small"
                              color={c.primary}
                              style={{ paddingVertical: 16 }}
                            />
                          ) : hasNextPage && items.length > 0 ? (
                            <TouchableOpacity
                              onPress={loadMore}
                              style={[
                                styles.loadMoreBtn,
                                { borderColor: c.border },
                              ]}
                            >
                              <Text
                                style={[styles.loadMoreText, { color: c.text }]}
                              >
                                Cargar más
                              </Text>
                            </TouchableOpacity>
                          ) : items.length > 0 ? (
                            <Text
                              style={[
                                styles.endText,
                                { color: c.textSecondary },
                              ]}
                            >
                              No hay más resultados
                            </Text>
                          ) : null
                        }
                        ListEmptyComponent={
                          <Text
                            style={[
                              styles.emptyText,
                              { color: c.textSecondary },
                            ]}
                          >
                            No se encontraron resultados.
                          </Text>
                        }
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            onPress={() => handleSelect(item)}
                            style={[
                              styles.itemRow,
                              { borderBottomColor: c.border },
                            ]}
                          >
                            {renderItem(item)}
                          </TouchableOpacity>
                        )}
                      />
                    )}
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
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  searchButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  listContent: {
    paddingVertical: 8,
  },
  itemRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  centerLoading: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 40,
  },
  loadMoreBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
    alignSelf: "center",
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "700",
  },
  endText: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 12,
  },
});
