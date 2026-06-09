import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../contexts/AuthContext";
import { useMobileDrawer } from "../../../contexts/MobileDrawerContext";
import { useResponsive } from "../../../hooks/useResponsive";
import { useModulesStore } from "../../../store/modulesStore";
import { useTheme } from "../../../theme/useTheme";
import { usePerfilData } from "../hooks/usePerfilData";

export const PerfilHeader = () => {
  const { theme } = useTheme();
  const { isDesktop, isMobile } = useResponsive();
  const { nombreCompleto, roles, foto } = usePerfilData();
  const { logout } = useAuth();
  const router = useRouter();
  const { closeDrawer } = useMobileDrawer();
  const [loading, setLoading] = useState(false);

  const styles = getStyles(theme, isDesktop);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      Toast.show({
        type: "success",
        text1: "Sesión cerrada",
        text2: "Has salido correctamente.",
        visibilityTime: 3000,
      });
      closeDrawer();
      useModulesStore.getState().clearModulos();
      router.replace("/");
    } catch (e) {
      // Si falla, el ProtectedRoute se encargará
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    // Placeholder: funcionalidad en desarrollo
    Toast.show({
      type: "info",
      text1: "Editar perfil",
      text2: "Funcionalidad en desarrollo.",
      visibilityTime: 2000,
    });
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 180 }}
      style={styles.container}
    >
      {/* Portada */}
      <View style={styles.cover}>
        <View style={styles.coverGradient} />
      </View>

      {/* Contenido inferior */}
      <View style={styles.content}>
        {/* Avatar superpuesto */}
        <View style={styles.avatarContainer}>
          {foto ? (
            <Image
              source={{ uri: foto }}
              style={styles.avatar}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
            >
              <Text
                style={[styles.avatarInitial, { color: theme.colors.primary }]}
              >
                {nombreCompleto?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </View>

        {/* Nombre y roles */}
        <View style={styles.info}>
          <Text style={styles.name}>{nombreCompleto}</Text>
          <View style={styles.chipsRow}>
            {roles.map((rol, index) => (
              <View
                key={rol}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      index === 0
                        ? theme.colors.primary + "20"
                        : theme.colors.info + "20",
                    borderColor:
                      index === 0
                        ? theme.colors.primary + "40"
                        : theme.colors.info + "40",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        index === 0 ? theme.colors.primary : theme.colors.info,
                    },
                  ]}
                >
                  {rol}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Botones de acción (visible solo en móvil el de logout) */}
        <View style={styles.actions}>
          {/* Cerrar sesión solo en móvil */}
          {isMobile && (
            <Pressable
              onPress={handleLogout}
              disabled={loading}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor:
                  pressed || loading
                    ? theme.colors.destructive
                    : theme.colors.border,
                backgroundColor:
                  pressed || loading
                    ? theme.colors.destructive + "12"
                    : "transparent",
                opacity: loading ? 0.6 : 1,
              })}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.destructive}
                />
              ) : (
                <>
                  <LogOut size={16} color={theme.colors.destructive} />
                  <Text
                    style={{
                      color: theme.colors.destructive,
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    Cerrar Sesión
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </MotiView>
  );
};

const getStyles = (theme: any, isDesktop: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border + "40",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
      marginBottom: 24,
    },
    cover: {
      height: 100,
      backgroundColor: theme.colors.primary + "15",
    },
    coverGradient: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.primary + "10",
    },
    content: {
      flexDirection: isDesktop ? "row" : "column",
      alignItems: isDesktop ? "flex-end" : "center",
      paddingHorizontal: 20,
      paddingBottom: 20,
      marginTop: -40,
    },
    avatarContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 4,
      borderColor: theme.colors.card,
      overflow: "hidden",
      backgroundColor: theme.colors.background,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
      marginBottom: isDesktop ? 0 : 12,
      marginRight: isDesktop ? 20 : 0,
    },
    avatar: {
      width: "100%",
      height: "100%",
    },
    avatarPlaceholder: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    avatarInitial: {
      fontSize: 36,
      fontWeight: "800",
    },
    info: {
      flex: 1,
      alignItems: isDesktop ? "flex-start" : "center",
      paddingBottom: 8,
    },
    name: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: isDesktop ? "left" : "center",
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      justifyContent: isDesktop ? "flex-start" : "center",
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
    },
    chipText: {
      fontSize: 12,
      fontWeight: "600",
    },
    actions: {
      flexDirection: "row",
      gap: 8,
      marginTop: isDesktop ? 0 : 16,
      alignItems: "center",
    },
  });
