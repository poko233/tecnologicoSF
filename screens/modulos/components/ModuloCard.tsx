import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { AVAILABLE_ICONS, Modulo } from "../types/modulo.types";

interface ModuloCardProps {
  modulo: Modulo;
  onEdit: (modulo: Modulo) => void;
  onDelete: (id: number) => void;
}

export function ModuloCard({ modulo, onEdit, onDelete }: ModuloCardProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  const iconData = AVAILABLE_ICONS.find((i) => i.key === modulo.icono);
  const ionicon  = (iconData?.ionicon ?? "apps-outline") as any;

  const confirmDelete = () => {
    Alert.alert(
      "Eliminar módulo",
      `¿Seguro que quieres eliminar "${modulo.modulo}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onDelete(modulo.id),
        },
      ]
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      {/* Icono */}
      <View style={styles.iconWrap}>
        <Ionicons name={ionicon} size={24} color={c.text} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.titulo, { color: c.text }]} numberOfLines={1}>
          {modulo.modulo}
        </Text>
        {modulo.descripcion ? (
          <Text style={[styles.desc, { color: c.textSecondary }]} numberOfLines={2}>
            {modulo.descripcion}
          </Text>
        ) : null}
        {modulo.formularios !== undefined && (
          <Text style={[styles.badge, { color: c.muted }]}>
            {modulo.formularios.length} formulario
            {modulo.formularios.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {/* Acciones */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onEdit(modulo)}
          style={[styles.actionBtn, { borderColor: c.border }]}
          hitSlop={8}
        >
          <Ionicons name="pencil-outline" size={16} color={c.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={confirmDelete}
          style={[styles.actionBtn, { borderColor: c.border }]}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={16} color="#F43F5E" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(45,159,142,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontSize: 14,
    fontWeight: "600",
  },
  desc: {
    fontSize: 12,
    lineHeight: 16,
  },
  badge: {
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderWidth: 0.5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});