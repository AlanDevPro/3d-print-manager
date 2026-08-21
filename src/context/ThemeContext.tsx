import React, { createContext, useState } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";
import { ThemeColors, darkPalette, lightPalette } from "../theme/colors";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextProps {
  theme: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: lightPalette,
  mode: "system",
  isDark: false,
  setThemeMode: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  const activeColorScheme =
    mode === "system" ? (deviceColorScheme ?? "light") : mode;

  const isDark = activeColorScheme === "dark";
  const theme = isDark ? darkPalette : lightPalette;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        isDark,
        setThemeMode: setMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
