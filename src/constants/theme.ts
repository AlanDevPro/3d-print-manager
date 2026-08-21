import { Platform } from "react-native";

// -----------------------------------------------------------------------------
// 1. Tokens de Tema Obscuro (Usados por HeaderBar, SettingsDrawer y UI Global)
// -----------------------------------------------------------------------------
export const colors = {
  background: "#0F1115",
  surface: "#1A1D23",
  surfaceAlt: "#22262E",
  border: "#2A2E37",
  primary: "#3B82F6",
  primarySoft: "rgba(59, 130, 246, 0.15)",
  text: "#F5F6F8",
  textMuted: "#9AA1AC",
  danger: "#EF4444",
  overlay: "rgba(0, 0, 0, 0.55)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const appBarHeight = 56;
export const drawerWidth = 320;

// -----------------------------------------------------------------------------
// 2. Colores del Sistema (Soporte Light / Dark Mode)
// -----------------------------------------------------------------------------
const tintColorLight = "#0a7ea4";
const tintColorDark = colors.text;

export const Colors = {
  light: {
    text: "#11181C",
    background: "#FFFFFF",
    surface: "#F8F9FA",
    border: "#E5E7EB",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: colors.text,
    background: colors.background,
    surface: colors.surface,
    border: colors.border,
    tint: colors.primary,
    icon: colors.textMuted,
    tabIconDefault: colors.textMuted,
    tabIconSelected: colors.primary,
  },
};

// -----------------------------------------------------------------------------
// 3. Fuentes por Plataforma (Expo System Fonts)
// -----------------------------------------------------------------------------
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
