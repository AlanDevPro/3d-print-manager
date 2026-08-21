export const lightPalette = {
  bgPrimary: "#F9FAFB",
  bgSurface: "#FFFFFF",
  bgSecondary: "#F3F4F6",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  primary: "#DC2626",
  primaryLight: "#FEE2E2",
  danger: "#EF4444",
  dangerLight: "#FEF2F2",
  modalOverlay: "rgba(0, 0, 0, 0.5)",
  inputBg: "#FFFFFF",
};

export const darkPalette: typeof lightPalette = {
  bgPrimary: "#0F172A",
  bgSurface: "#1E293B",
  bgSecondary: "#334155",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  border: "#334155",
  borderLight: "#1E293B",
  primary: "#EF4444",
  primaryLight: "#450A0A",
  danger: "#F87171",
  dangerLight: "#450A0A",
  modalOverlay: "rgba(0, 0, 0, 0.75)",
  inputBg: "#0F172A",
};

export type ThemeColors = typeof lightPalette;
