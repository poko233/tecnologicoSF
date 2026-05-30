import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/theme/useTheme";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import {
  AlertTriangle,
  Ban,
  Briefcase,
  CheckCircle,
  CreditCard,
  GraduationCap,
  IdCard,
  Mail,
  MapPin,
  Pause,
  Phone,
  Play,
  User,
  X,
} from "lucide-react-native";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { alertColors } from "../animations/qr.animations";
import { VerifyAccessResponse } from "../types/qr.types";

interface Props {
  data: VerifyAccessResponse;
  onDismiss: () => void;
}

const COUNTDOWN_SECONDS = 15;

export const AccessResultPanel: React.FC<Props> = ({ data, onDismiss }) => {
  const { theme } = useTheme();
  const { isDesktop, width } = useResponsive();
  const { alerta, usuario } = data;
  const alertColor = alertColors[alerta.color]?.[0] || theme.colors.primary;

  const statusBg =
    alerta.color === "verde"
      ? theme.colors.success
      : alerta.color === "rojo"
        ? theme.colors.destructive
        : alerta.color === "amarillo"
          ? theme.colors.warning
          : theme.colors.info;

  const StatusIcon =
    alerta.color === "verde"
      ? CheckCircle
      : alerta.color === "rojo"
        ? Ban
        : AlertTriangle;

  const panelWidth = isDesktop ? Math.min(600, width * 0.6) : width;
  const fallback = "—";

  // Contador pausable
  const [paused, setPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS * 1000);
  const remainingRef = useRef(timeLeft);
  const intervalRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const start = Date.now();
    const initialRemaining = remainingRef.current;
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const newRemaining = Math.max(0, initialRemaining - elapsed);
      setTimeLeft(newRemaining);
      remainingRef.current = newRemaining;
      if (newRemaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onDismiss();
      }
    }, 100);
  }, [onDismiss]);

  useEffect(() => {
    if (!paused) {
      startTimer();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, startTimer]);

  const togglePause = () => {
    setPaused((prev) => !prev);
  };

  const secondsDisplay = (timeLeft / 1000).toFixed(1);

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "timing", duration: 200 }}
      style={styles.backdrop}
    >
      {/* Fondo con blur en lugar de opacidad */}
      <BlurView
        intensity={50}
        tint="dark"
        style={StyleSheet.absoluteFill}
        onTouchEnd={onDismiss}
      />

      {/* Panel deslizante */}
      <MotiView
        from={{
          translateX: isDesktop ? panelWidth : 0,
          translateY: isDesktop ? 0 : panelWidth,
        }}
        animate={{ translateX: 0, translateY: 0 }}
        exit={{
          translateX: isDesktop ? panelWidth : 0,
          translateY: isDesktop ? 0 : panelWidth,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={[
          styles.panel,
          {
            width: panelWidth,
            backgroundColor: theme.colors.card,
            borderLeftColor: theme.colors.border,
          },
          isDesktop
            ? { right: 0, top: 0, bottom: 0, borderLeftWidth: 1 }
            : {
                bottom: 0,
                left: 0,
                right: 0,
                maxHeight: "90%",
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
              },
        ]}
      >
        {/* Cabecera de estado */}
        <View style={[styles.statusBanner, { backgroundColor: statusBg }]}>
          <View style={styles.statusLeft}>
            <StatusIcon size={32} color={theme.colors.textInverse} />
            <Text
              style={[styles.statusText, { color: theme.colors.textInverse }]}
            >
              {alerta.mensaje}
            </Text>
          </View>
          <TouchableOpacity onPress={onDismiss} hitSlop={8}>
            <X size={24} color={theme.colors.textInverse} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Perfil */}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <View
                style={[
                  styles.avatarGlow,
                  { backgroundColor: statusBg + "30" },
                ]}
              />
              {usuario.foto ? (
                <Image
                  source={{ uri: usuario.foto }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: theme.colors.backgroundSecondary },
                  ]}
                >
                  <User size={64} color={theme.colors.textSecondary} />
                </View>
              )}
              <View style={[styles.avatarBadge, { backgroundColor: statusBg }]}>
                <StatusIcon size={16} color={theme.colors.textInverse} />
              </View>
            </View>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {usuario.nombre_completo || fallback}
            </Text>
            <View style={styles.chipsRow}>
              <View
                style={[
                  styles.chip,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
              >
                <Text
                  style={[styles.chipText, { color: theme.colors.primary }]}
                >
                  {usuario.tipo}
                </Text>
              </View>
              {usuario.tipo === "Estudiante" && usuario.carrera && (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <GraduationCap size={14} color={theme.colors.textSecondary} />
                  <Text
                    style={[
                      styles.profession,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {usuario.carrera}
                  </Text>
                </View>
              )}
              {usuario.tipo === "Docente" && usuario.profesion && (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Briefcase size={14} color={theme.colors.textSecondary} />
                  <Text
                    style={[
                      styles.profession,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {usuario.profesion}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Grid de información */}
          <View style={styles.infoGrid}>
            <InfoCell
              icon={<IdCard size={18} color={theme.colors.textSecondary} />}
              label="CÉDULA"
              value={usuario.ci || fallback}
              theme={theme}
            />
            <InfoCell
              icon={<Mail size={18} color={theme.colors.textSecondary} />}
              label="CORREO"
              value={usuario.email || fallback}
              theme={theme}
            />
            <InfoCell
              icon={<Phone size={18} color={theme.colors.textSecondary} />}
              label="CELULAR"
              value={usuario.celular || fallback}
              theme={theme}
            />
            <InfoCell
              icon={<MapPin size={18} color={theme.colors.textSecondary} />}
              label="DIRECCIÓN"
              value={usuario.direccion || fallback}
              theme={theme}
            />
            <InfoCell
              icon={<User size={18} color={theme.colors.textSecondary} />}
              label="GÉNERO"
              value={usuario.genero || fallback}
              theme={theme}
            />
            {usuario.tipo === "Estudiante" && (
              <InfoCell
                icon={
                  <CreditCard size={18} color={theme.colors.textSecondary} />
                }
                label="CUOTAS PEND."
                value={usuario.cuotas_pendientes.toString()}
                theme={theme}
              />
            )}
          </View>

          {/* Alerta lógica */}
          <View
            style={[
              styles.logicAlert,
              {
                backgroundColor:
                  alerta.color === "verde"
                    ? theme.colors.success + "12"
                    : alerta.color === "rojo"
                      ? theme.colors.destructive + "12"
                      : alerta.color === "amarillo"
                        ? theme.colors.warning + "12"
                        : theme.colors.info + "12",
                borderColor:
                  alerta.color === "verde"
                    ? theme.colors.success + "40"
                    : alerta.color === "rojo"
                      ? theme.colors.destructive + "40"
                      : alerta.color === "amarillo"
                        ? theme.colors.warning + "40"
                        : theme.colors.info + "40",
              },
            ]}
          >
            <View
              style={[styles.logicIcon, { backgroundColor: statusBg + "20" }]}
            >
              {usuario.tipo === "Estudiante" ? (
                <CreditCard size={32} color={statusBg} />
              ) : (
                <CheckCircle size={32} color={statusBg} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontWeight: "800",
                  fontSize: 16,
                  color: theme.colors.text,
                }}
              >
                {alerta.mensaje}
              </Text>
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  marginTop: 4,
                }}
              >
                {alerta.descripcion}
              </Text>
            </View>
            {usuario.tipo === "Estudiante" && usuario.cuotas_pendientes > 0 && (
              <View style={styles.debtCounter}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "900",
                    color:
                      alerta.color === "rojo"
                        ? theme.colors.destructive
                        : theme.colors.warning,
                  }}
                >
                  {usuario.cuotas_pendientes}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color:
                      alerta.color === "rojo"
                        ? theme.colors.destructive
                        : theme.colors.warning,
                    textTransform: "uppercase",
                  }}
                >
                  Cuotas
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer con contador pausable */}
        <View
          style={[
            styles.footer,
            {
              borderTopColor: theme.colors.border,
              backgroundColor: theme.colors.backgroundSecondary,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.footerBtn,
              { backgroundColor: theme.colors.backgroundTertiary },
            ]}
            onPress={onDismiss}
          >
            <Text style={[styles.footerBtnText, { color: theme.colors.text }]}>
              Cerrar
            </Text>
          </TouchableOpacity>

          <Pressable
            style={[
              styles.footerBtn,
              { backgroundColor: "transparent", gap: 8 },
            ]}
            onPress={togglePause}
          >
            {paused ? (
              <Play size={20} color={theme.colors.textSecondary} />
            ) : (
              <Pause size={20} color={theme.colors.textSecondary} />
            )}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: theme.colors.textSecondary,
              }}
            >
              Cerrando en {secondsDisplay}s
            </Text>
          </Pressable>
        </View>
      </MotiView>
    </MotiView>
  );
};

const InfoCell: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: any;
}> = ({ icon, label, value, theme }) => (
  <View
    style={[
      styles.infoCell,
      { backgroundColor: theme.colors.backgroundSecondary },
    ]}
  >
    <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>
      {label}
    </Text>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
      }}
    >
      {icon}
      <Text style={[styles.infoValue, { color: theme.colors.text }]}>
        {value}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: "flex-end",
  },
  panel: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: -10, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  profileSection: {
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarGlow: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 99,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  profession: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoCell: {
    width: "47%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  logicAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
  },
  logicIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  debtCounter: {
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  footerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
  },
  footerBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
