import { View } from "react-native";
import { InscripcionFormData } from "../types/inscripcion.types";
import FormInput from "./FormInput";
import SectionTitle from "./SectionTitle";

type Props = {
  isMobile: boolean;
  form: InscripcionFormData;
  updateField: (field: keyof InscripcionFormData, value: string) => void;
};

export default function ReferenceSection({
  isMobile,
  form,
  updateField,
}: Props) {
  return (
    <>
      <SectionTitle title="CONTACTO DE REFERENCIA" danger />

      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          gap: 16,
        }}
      >
        <FormInput
          label="NOMBRE COMPLETO"
          placeholder="Nombre del contacto"
          value={form.referenciaNombre}
          onChangeText={(text) => updateField("referenciaNombre", text)}
        />

        <FormInput
          label="PARENTESCO"
          placeholder="Ej. Madre, Tío"
          value={form.referenciaParentesco}
          onChangeText={(text) => updateField("referenciaParentesco", text)}
        />

        <FormInput
          label="NÚMERO DE REFERENCIA"
          placeholder="Teléfono"
          value={form.referenciaNumero}
          keyboardType="phone-pad"
          onChangeText={(text) => updateField("referenciaNumero", text)}
        />
      </View>
    </>
  );
}