// screens/auth/components/LoginBackground.tsx (actualizado)
import { Platform } from "react-native";
import { SkiaBackground } from "./background/SkiaBackground";
import { WebBackground } from "./background/WebBackground";

export const LoginBackground =
  Platform.OS === "web" ? WebBackground : SkiaBackground;
