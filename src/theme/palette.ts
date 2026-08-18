import type { PaletteOptions } from "@mui/material/styles";

/**
 * Tokens are sampled from the supplied dashboard/leads screenshots so
 * individual components never invent hex values.
 */
export const colorTokens = {
  navy950: "#081020",
  navy900: "#0B1220",
  navy850: "#101828",
  navy800: "#141B2A",
  navy750: "#161C2C",
  navy700: "#1A2235",
  navy650: "#1E2532",
  navy600: "#202838",
  navy500: "#2A3550",
  border: "rgba(76, 141, 255, 0.14)",
  borderStrong: "rgba(76, 141, 255, 0.28)",
  primary: "#2060E8",
  primaryBright: "#4C8DFF",
  primaryHover: "#2B6FFF",
  textPrimary: "#E8EEF8",
  textSecondary: "#8B9BB4",
  textMuted: "#6B7A94",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#38BDF8",
  white: "#FFFFFF",
  lightBg: "#F4F6FB",
  lightPaper: "#FFFFFF",
  lightBorder: "rgba(15, 23, 42, 0.10)",
  lightBorderStrong: "rgba(15, 23, 42, 0.18)",
  lightText: "#0F172A",
  lightTextSecondary: "#5B6B82",
  lightTextMuted: "#94A3B8",
  lightHover: "#EEF2F7",
} as const;

const sharedPrimary = {
  main: colorTokens.primary,
  light: colorTokens.primaryBright,
  dark: "#1548B0",
  contrastText: colorTokens.white,
} as const;

export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: sharedPrimary,
  secondary: {
    main: colorTokens.navy500,
    contrastText: colorTokens.textPrimary,
  },
  success: { main: colorTokens.success },
  warning: { main: colorTokens.warning },
  error: { main: colorTokens.error },
  info: { main: colorTokens.info },
  background: {
    default: colorTokens.navy950,
    paper: colorTokens.navy750,
  },
  text: {
    primary: colorTokens.textPrimary,
    secondary: colorTokens.textSecondary,
    disabled: colorTokens.textMuted,
  },
  divider: colorTokens.border,
  chrome: {
    sidebar: colorTokens.navy850,
    sidebarText: colorTokens.textPrimary,
    sidebarMuted: colorTokens.textSecondary,
    sidebarHover: colorTokens.navy700,
    sidebarBorder: colorTokens.border,
    appbar: colorTokens.navy650,
    input: colorTokens.navy850,
    hover: colorTokens.navy700,
    borderStrong: colorTokens.borderStrong,
    signoutBtnHover: colorTokens.error,
  },
};

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: sharedPrimary,
  secondary: {
    main: "#E2E8F0",
    contrastText: colorTokens.lightText,
  },
  success: { main: colorTokens.success },
  warning: { main: colorTokens.warning },
  error: { main: colorTokens.error },
  info: { main: colorTokens.info },
  background: {
    default: colorTokens.lightBg,
    paper: colorTokens.lightPaper,
  },
  text: {
    primary: colorTokens.lightText,
    secondary: colorTokens.lightTextSecondary,
    disabled: colorTokens.lightTextMuted,
  },
  divider: colorTokens.lightBorder,
  /**
   * Light mode keeps the navy rail from the reference screenshots.
   * Only the top bar and workspace flip to white.
   */
  chrome: {
    sidebar: colorTokens.navy850,
    sidebarText: colorTokens.textPrimary,
    sidebarMuted: colorTokens.textSecondary,
    sidebarHover: colorTokens.navy700,
    sidebarBorder: colorTokens.border,
    appbar: colorTokens.lightPaper,
    input: colorTokens.lightPaper,
    hover: colorTokens.lightHover,
    borderStrong: colorTokens.lightBorderStrong,
    signoutBtnHover: colorTokens.error,
  },
};
