export type ThemeName = "light" | "dark" | "rose" | "ocean";

export interface Colors {
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  border: string;
  input: string;
  destructive: string;
  success: string;
  warning: string;
  muted: string;
  card: string;
  shadow: string;
  gradient: string[];
}

export interface AppTheme {
  name: ThemeName;
  dark: boolean;
  colors: Colors;
}
