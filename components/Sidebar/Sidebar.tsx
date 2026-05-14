import { Ionicons } from "@expo/vector-icons";
import { Href, usePathname, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../theme/useTheme";
import { resolveIcon } from "./iconMap";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarHeader } from "./SidebarHeader";
import { MiFormulario, MiModulo, useMisModulos } from "./useMisModulos";

// Habilitar LayoutAnimation en Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ─────────────────────────────────────────────────────────────
   Sub-item (Formulario)
───────────────────────────────────────────────────────────── */
const FormularioItem: React.FC<{ formulario: MiFormulario }> = ({
  formulario,
}) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const pathname = usePathname();
  const isActive =
    pathname === formulario.ruta || pathname.startsWith(formulario.ruta + "/");
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconName = formulario.icono
    ? resolveIcon(formulario.icono)
    : "document-text-outline";

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={() => router.push(formulario.ruta as Href)}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 180 });
        }}
        style={[
          styles.subItem,
          isActive && { backgroundColor: c.primary + "18" },
        ]}
      >
        {/* línea vertical izquierda */}
        <View
          style={[
            styles.subLine,
            { backgroundColor: isActive ? c.primary : c.border },
          ]}
        />

        <Ionicons
          name={iconName}
          size={15}
          color={isActive ? c.primary : c.textSecondary}
        />
        <Text
          style={[
            styles.subLabel,
            {
              color: isActive ? c.primary : c.textSecondary,
              fontWeight: isActive ? "700" : "500",
            },
          ]}
          numberOfLines={1}
        >
          {formulario.nombre}
        </Text>

        {isActive && (
          <View
            style={[styles.activeIndicator, { backgroundColor: c.primary }]}
          />
        )}
      </Pressable>
    </Animated.View>
  );
};

/* ─────────────────────────────────────────────────────────────
   Módulo item (colapsable si tiene formularios)
───────────────────────────────────────────────────────────── */
const ModuloItem: React.FC<{ modulo: MiModulo }> = ({ modulo }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const pathname = usePathname();

  const hasChildren = modulo.formularios.length > 0;

  // ¿algún sub-item está activo?
  const anyChildActive = modulo.formularios.some(
    (f) => pathname === f.ruta || pathname.startsWith(f.ruta + "/"),
  );

  const [expanded, setExpanded] = useState(anyChildActive);

  const href = `/${modulo.nombre.toLowerCase().replace(/\s+/g, "-")}`;
  const isActive =
    !hasChildren && (pathname === href || pathname.startsWith(href + "/"));

  const scale = useSharedValue(1);
  const chevron = useSharedValue(expanded ? 1 : 0);

  const iconName = resolveIcon(modulo.icono);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevron.value * 180}deg` }],
  }));

  const handlePress = useCallback(() => {
    if (hasChildren) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      chevron.value = withTiming(expanded ? 0 : 1, { duration: 200 });
      setExpanded((v) => !v);
    } else {
      router.push(href as Href);
    }
  }, [hasChildren, expanded, href]);

  const rowActive = isActive || anyChildActive;

  return (
    <View>
      <Animated.View
        style={useAnimatedStyle(() => ({
          transform: [{ scale: scale.value }],
        }))}
      >
        <Pressable
          onPress={handlePress}
          onPressIn={() => {
            scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 12, stiffness: 180 });
          }}
          style={[
            styles.moduleItem,
            rowActive && !hasChildren && { backgroundColor: c.primary },
            rowActive && hasChildren && { backgroundColor: c.primary + "12" },
          ]}
        >
          {/* Ícono con fondo si activo */}
          <View
            style={[
              styles.moduleIconWrap,
              { backgroundColor: rowActive ? c.primary + "20" : c.input },
            ]}
          >
            <Ionicons
              name={iconName}
              size={18}
              color={rowActive ? c.primary : c.textSecondary}
            />
          </View>

          <Text
            style={[
              styles.moduleLabel,
              {
                color: rowActive && !hasChildren ? c.primaryForeground : c.text,
                fontWeight: rowActive ? "700" : "500",
              },
            ]}
            numberOfLines={1}
          >
            {modulo.nombre}
          </Text>

          {/* Chevron animado si tiene hijos */}
          {hasChildren && (
            <Animated.View style={chevronStyle}>
              <Ionicons
                name="chevron-down"
                size={14}
                color={anyChildActive ? c.primary : c.muted}
              />
            </Animated.View>
          )}
        </Pressable>
      </Animated.View>

      {/* Sub-items colapsables */}
      {hasChildren && expanded && (
        <View style={styles.subList}>
          {modulo.formularios.map((f) => (
            <FormularioItem key={f.id} formulario={f} />
          ))}
        </View>
      )}
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────
   Sidebar principal
───────────────────────────────────────────────────────────── */
export const Sidebar = () => {
  const { theme } = useTheme();
  const c = theme.colors;
  const { modulos, loading, error } = useMisModulos();

  return (
    <View
      style={[
        styles.sidebar,
        { backgroundColor: c.card, borderRightColor: c.border },
      ]}
    >
      {/* Logo */}
      <View style={[styles.logoRow, { borderBottomColor: c.border }]}>
        <View style={[styles.logoIcon, { backgroundColor: c.primary }]}>
          <Ionicons name="business" size={16} color={c.primaryForeground} />
        </View>
        <Text style={[styles.logoText, { color: c.text }]} numberOfLines={1}>
          TECNOLOGICOSF
        </Text>
      </View>
      {/* ── HEADER: avatar, nombre, roles ── */}
      <SidebarHeader />
      {/* Nav */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.nav}
      >
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="small" color={c.primary} />
            <Text style={[styles.loadingText, { color: c.textSecondary }]}>
              Cargando…
            </Text>
          </View>
        )}

        {!loading && error && (
          <View
            style={[
              styles.errorBox,
              { backgroundColor: "#FFF1F2", borderColor: "#FECDD3" },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={16} color="#E11D48" />
            <Text style={[styles.errorText, { color: "#E11D48" }]}>
              {error}
            </Text>
          </View>
        )}

        {!loading && !error && modulos.length === 0 && (
          <View style={styles.center}>
            <Ionicons name="grid-outline" size={32} color={c.muted} />
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              Sin módulos asignados
            </Text>
          </View>
        )}

        {!loading &&
          !error &&
          modulos.map((modulo) => (
            <ModuloItem key={modulo.id} modulo={modulo} />
          ))}
      </ScrollView>
      {/* ── FOOTER: logo + logout ── */}
      <SidebarFooter />
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────
   Estilos
───────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    borderRightWidth: 1,
  },

  /* Logo */
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  logoIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
    flexShrink: 1,
  },

  /* Nav */
  nav: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 2,
  },

  /* Módulo */
  moduleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  moduleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleLabel: {
    flex: 1,
    fontSize: 14,
  },

  /* Sub-items */
  subList: {
    marginLeft: 20,
    marginTop: 2,
    marginBottom: 4,
    gap: 1,
  },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  subLine: {
    width: 2,
    height: 14,
    borderRadius: 2,
  },
  subLabel: {
    flex: 1,
    fontSize: 13,
  },
  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  /* Estados */
  center: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: { fontSize: 12 },
  emptyText: { fontSize: 13, textAlign: "center" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    margin: 4,
  },
  errorText: { fontSize: 12, flex: 1 },
});
