import { useTheme } from '@theme';
import { Text, TextInput, View } from 'react-native';

export function MiniInput({
  label, value, onChangeText, keyboardType, placeholder, style,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'numeric';
  placeholder?: string;
  style?: any;
}) {
  const { theme } = useTheme();
  return (
    <View style={[{ flex: 1, gap: 5 }, style]}>
      <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.3 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        keyboardType={keyboardType}
        style={{
          height: 42, borderRadius: 10, borderWidth: 1,
          borderColor: theme.colors.inputBorder,
          backgroundColor: theme.colors.input,
          color: theme.colors.text,
          paddingHorizontal: 12, fontWeight: '700',
        }}
      />
    </View>
  );
}