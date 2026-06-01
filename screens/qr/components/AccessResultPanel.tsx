// screens/qr/components/AccessResultPanel.tsx
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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { VerifyAccessResponse } from "../types/qr.types";

interface Props {
  data: VerifyAccessResponse;
  onDismiss: () => void;
}

const COUNTDOWN_SECONDS = 10;

export const AccessResultPanel: React.FC<Props> = ({ data, onDismiss }) => {
  const { theme } = useTheme();
  const { isDesktop, width, height } = useResponsive();
  const { alerta, usuario } = data;

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
  const panelHeight = height;
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

  const togglePause = () => setPaused((prev) => !prev);
  const secondsDisplay = (timeLeft / 1000).toFixed(1);

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "timing", duration: 200 }}
      style={[
        styles.backdrop,
        isDesktop && { justifyContent: "center", alignItems: "flex-end" },
      ]}
    >
      <BlurView
        intensity={50}
        tint="dark"
        style={StyleSheet.absoluteFill}
        onTouchEnd={onDismiss}
      />

      <MotiView
        from={{
          translateX: isDesktop ? panelWidth : 0,
          translateY: isDesktop ? 0 : panelHeight,
        }}
        animate={{ translateX: 0, translateY: 0 }}
        exit={{
          translateX: isDesktop ? panelWidth : 0,
          translateY: isDesktop ? 0 : panelHeight,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={[
          styles.panel,
          {
            width: panelWidth,
            height: panelHeight,
            backgroundColor: theme.colors.card,
            borderLeftColor: theme.colors.border,
          },
          isDesktop
            ? {
                borderLeftWidth: 0,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }
            : {
                bottom: 0,
                left: 0,
                right: 0,
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
              },
        ]}
      >
        {/* SECCIÓN 1: CABECERA (Fijada en la parte superior) */}
        <PanelHeader
          alerta={alerta}
          statusBg={statusBg}
          StatusIcon={StatusIcon}
          theme={theme}
          onDismiss={onDismiss}
        />

        {/* SECCIÓN 2: CONTENIDO CENTRAL (Se adapta al espacio restante con flex: 1) */}
        <View style={styles.flexibleContent}>
          <ProfileSection
            usuario={usuario}
            statusBg={statusBg}
            StatusIcon={StatusIcon}
            theme={theme}
          />
          <InfoGrid usuario={usuario} theme={theme} />
          <AlertBox
            alerta={alerta}
            usuario={usuario}
            statusBg={statusBg}
            StatusIcon={StatusIcon}
            theme={theme}
          />
        </View>

        {/* SECCIÓN 3: PIE DE PÁGINA (Fijado en la parte inferior) */}
        <PanelFooter
          paused={paused}
          secondsDisplay={secondsDisplay}
          theme={theme}
          onDismiss={onDismiss}
          togglePause={togglePause}
        />
      </MotiView>
    </MotiView>
  );
};

// ==========================================
// SUBCOMPONENTES (Separación de responsabilidades)
// ==========================================

const PanelHeader = ({
  alerta,
  statusBg,
  StatusIcon,
  theme,
  onDismiss,
}: any) => (
  <View style={[styles.statusBanner, { backgroundColor: statusBg }]}>
    <View style={styles.statusLeft}>
      <StatusIcon size={28} color={theme.colors.textInverse} />
      <Text style={[styles.statusText, { color: theme.colors.textInverse }]}>
        {alerta.mensaje}
      </Text>
    </View>
    <TouchableOpacity onPress={onDismiss} hitSlop={8}>
      <X size={22} color={theme.colors.textInverse} />
    </TouchableOpacity>
  </View>
);

const ProfileSection = ({ usuario, statusBg, StatusIcon, theme }: any) => {
  const fallback = "—";
  return (
    <View style={styles.profileSection}>
      <View style={styles.avatarWrapper}>
        <View
          style={[styles.avatarGlow, { backgroundColor: statusBg + "30" }]}
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
            <User size={48} color={theme.colors.textSecondary} />
          </View>
        )}
        <View style={[styles.avatarBadge, { backgroundColor: statusBg }]}>
          <StatusIcon size={14} color={theme.colors.textInverse} />
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
          <Text style={[styles.chipText, { color: theme.colors.primary }]}>
            {usuario.tipo}
          </Text>
        </View>
        {usuario.tipo === "Estudiante" && usuario.carrera && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <GraduationCap size={14} color={theme.colors.textSecondary} />
            <Text
              style={[styles.profession, { color: theme.colors.textSecondary }]}
            >
              {usuario.carrera}
            </Text>
          </View>
        )}
        {usuario.tipo === "Docente" && usuario.profesion && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Briefcase size={14} color={theme.colors.textSecondary} />
            <Text
              style={[styles.profession, { color: theme.colors.textSecondary }]}
            >
              {usuario.profesion}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const InfoGrid = ({ usuario, theme }: any) => {
  const fallback = "—";
  return (
    <View style={styles.infoGrid}>
      <InfoCell
        icon={<IdCard size={16} color={theme.colors.textSecondary} />}
        label="CÉDULA"
        value={usuario.ci || fallback}
        theme={theme}
      />
      <InfoCell
        icon={<Mail size={16} color={theme.colors.textSecondary} />}
        label="CORREO"
        value={usuario.email || fallback}
        theme={theme}
      />
      <InfoCell
        icon={<Phone size={16} color={theme.colors.textSecondary} />}
        label="CELULAR"
        value={usuario.celular || fallback}
        theme={theme}
      />
      <InfoCell
        icon={<MapPin size={16} color={theme.colors.textSecondary} />}
        label="DIRECCIÓN"
        value={usuario.direccion || fallback}
        theme={theme}
      />
      <InfoCell
        icon={<User size={16} color={theme.colors.textSecondary} />}
        label="GÉNERO"
        value={usuario.genero || fallback}
        theme={theme}
      />
      {usuario.tipo === "Estudiante" && (
        <InfoCell
          icon={<CreditCard size={16} color={theme.colors.textSecondary} />}
          label="CUOTAS PEND."
          value={usuario.cuotas_pendientes.toString()}
          theme={theme}
        />
      )}
    </View>
  );
};

const AlertBox = ({ alerta, usuario, statusBg, theme }: any) => (
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
    <View style={[styles.logicIcon, { backgroundColor: statusBg + "20" }]}>
      {usuario.tipo === "Estudiante" ? (
        <CreditCard size={28} color={statusBg} />
      ) : (
        <CheckCircle size={28} color={statusBg} />
      )}
    </View>
    <View style={{ flex: 1 }}>
      <Text
        style={{ fontWeight: "800", fontSize: 14, color: theme.colors.text }}
      >
        {alerta.mensaje}
      </Text>
      <Text
        style={{
          color: theme.colors.textSecondary,
          fontSize: 12,
          marginTop: 2,
        }}
      >
        {alerta.descripcion}
      </Text>
    </View>
    {usuario.tipo === "Estudiante" && usuario.cuotas_pendientes > 0 && (
      <View style={styles.debtCounter}>
        <Text
          style={{
            fontSize: 24,
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
            fontSize: 9,
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
);

const PanelFooter = ({
  paused,
  secondsDisplay,
  theme,
  onDismiss,
  togglePause,
}: any) => (
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
      style={[styles.footerBtn, { backgroundColor: "transparent", gap: 8 }]}
      onPress={togglePause}
    >
      {paused ? (
        <Play size={20} color={theme.colors.textSecondary} />
      ) : (
        <Pause size={20} color={theme.colors.textSecondary} />
      )}
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: theme.colors.textSecondary,
        }}
      >
        Cerrando en {secondsDisplay}s
      </Text>
    </Pressable>
  </View>
);

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
    <Text style={styles.infoLabel}>{label}</Text>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 2,
      }}
    >
      {icon}
      <Text
        style={[styles.infoValue, { color: theme.colors.text }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  </View>
);

// ==========================================
// ESTILOS
// ==========================================

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: "flex-end",
  },
  panel: {
    shadowColor: "#000",
    shadowOffset: { width: -10, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
    flexDirection: "column", // Estructura de columna requerida para Flexbox
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  flexibleContent: {
    flex: 1, // Permite que esta sección ocupe todo el espacio disponible entre la cabecera y el footer
    justifyContent: "space-evenly", // Distribuye los elementos equitativamente
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  profileSection: {
    alignItems: "center",
    gap: 8,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 99,
  },
  avatar: {
    width: 90, // Ligeramente reducido para optimizar espacio vertical
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  profession: {
    fontSize: 12,
    fontWeight: "500",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  infoCell: {
    width: "48%", // Ajuste para distribución en grid 2x3
    borderRadius: 12,
    padding: 10,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  logicAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  logicIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  debtCounter: {
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 16, // Espaciado adecuado para botones de acción inferior
    borderTopWidth: 1,
  },
  footerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
  },
  footerBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
