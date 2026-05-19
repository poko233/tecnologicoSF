import { View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

type Props = {
  title: string;
  danger?: boolean;
};

export default function SectionTitle({ title, danger = false }: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: 18,
        marginTop: 8,
      }}
    >
      <ThemedText
        style={{
          color: danger ? "#d90429" : theme.colors.text,
          fontWeight: "800",
          fontSize: 14,
        }}
      >
        {title}
      </ThemedText>
    </View>
  );
}