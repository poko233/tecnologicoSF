// screens/asistencia/components/StatusButtonGroup.tsx
import { Check, Clock, ShieldAlert, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AsistenciaTipo } from "../types/asistencia.types";
import { StatusButton } from "./StatusButton";

interface Props {
  selectedTipo: AsistenciaTipo | null;
  onSelect: (tipo: AsistenciaTipo) => void;
}

const BUTTONS: {
  tipo: AsistenciaTipo;
  Icon: React.ElementType;
  tokenKey: string;
  label: string;
}[] = [
  { tipo: "Presente", Icon: Check, tokenKey: "success", label: "Presente" },
  { tipo: "Falta", Icon: X, tokenKey: "destructive", label: "Falta" },
  { tipo: "Atraso", Icon: Clock, tokenKey: "warning", label: "Atraso" },
  { tipo: "Permiso", Icon: ShieldAlert, tokenKey: "info", label: "Permiso" },
];

export function StatusButtonGroup({ selectedTipo, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {BUTTONS.map((btn) => (
        <StatusButton
          key={btn.tipo}
          tipo={btn.tipo}
          Icon={btn.Icon}
          tokenKey={btn.tokenKey}
          label={btn.label}
          isSelected={selectedTipo === btn.tipo}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
