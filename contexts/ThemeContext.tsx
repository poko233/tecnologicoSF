import React, { createContext, useCallback, useState } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { themes } from "../theme/themes";
import { AppTheme, ThemeName } from "../theme/types";

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: themes.light,
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeName, setThemeName] = useState<ThemeName>("light");

  const theme = themes[themeName];

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeName((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value = { theme, setTheme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      <Animated.View
        key={themeName}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={{ flex: 1 }}
      >
        {children}
      </Animated.View>
    </ThemeContext.Provider>
  );
};
