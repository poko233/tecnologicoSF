import { AppTheme } from "./types";

export const lightTheme: AppTheme = {
  name: "light",
  dark: false,
  colors: {
    background: "#FFFFFF",
    backgroundSecondary: "#F9FAFB",
    text: "#111827",
    textSecondary: "#4B5563",
    primary: "#111827",
    primaryForeground: "#FFFFFF",
    secondary: "#F3F4F6",
    secondaryForeground: "#111827",
    border: "#E5E7EB",
    input: "#F3F4F6",
    destructive: "#F43F5E",
    success: "#10B981",
    warning: "#F59E0B",
    muted: "#9CA3AF",
    card: "#FFFFFF",
    shadow: "rgba(0,0,0,0.05)",
    gradient: ["#F9FAFB", "#E5E7EB"],
  },
};

export const darkTheme: AppTheme = {
  name: "dark",
  dark: true,
  colors: {
    background: "#111827",
    backgroundSecondary: "#1F2937",
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    primary: "#FFFFFF",
    primaryForeground: "#111827",
    secondary: "#374151",
    secondaryForeground: "#F9FAFB",
    border: "#374151",
    input: "#1F2937",
    destructive: "#F43F5E",
    success: "#10B981",
    warning: "#F59E0B",
    muted: "#6B7280",
    card: "#1F2937",
    shadow: "rgba(0,0,0,0.3)",
    gradient: ["#1F2937", "#111827"],
  },
};

export const roseTheme: AppTheme = {
  name: "rose",
  dark: false,
  colors: {
    background: "#FFF1F2",
    backgroundSecondary: "#FFE4E6",
    text: "#881337",
    textSecondary: "#BE123C",
    primary: "#E11D48",
    primaryForeground: "#FFFFFF",
    secondary: "#FFE4E6",
    secondaryForeground: "#881337",
    border: "#FECDD3",
    input: "#FFE4E6",
    destructive: "#BE123C",
    success: "#10B981",
    warning: "#F59E0B",
    muted: "#FDA4AF",
    card: "#FFFFFF",
    shadow: "rgba(0,0,0,0.05)",
    gradient: ["#FFF1F2", "#FECDD3"],
  },
};
/*
export const oceanTheme: AppTheme = {
  name: "ocean",
  dark: false,
  colors: {
    background: "#E0F2FE",
    backgroundSecondary: "#BAE6FD",
    text: "#0C4A6E",
    textSecondary: "#075985",
    primary: "#0284C7",
    primaryForeground: "#FFFFFF",
    secondary: "#BAE6FD",
    secondaryForeground: "#0C4A6E",
    border: "#7DD3FC",
    input: "#BAE6FD",
    destructive: "#F43F5E",
    success: "#10B981",
    warning: "#F59E0B",
    muted: "#38BDF8",
    card: "#FFFFFF",
    shadow: "rgba(0,0,0,0.05)",
    gradient: ["#E0F2FE", "#BAE6FD"],
  },
};
*/
export const themes: Record<string, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
  rose: roseTheme,
  //  ocean: oceanTheme,
};
