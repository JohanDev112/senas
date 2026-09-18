/**
 * Tokens transcritos directo de design/lsm-app-design-exploration.html
 * (seccion "Sistema de diseno"). Si cambia el diseno, se actualiza ahi
 * primero y se refleja aqui -- no al reves.
 */
export const color = {
  bg: "#14111C",
  surface: "#1E1927",
  surface2: "#282133",
  border: "#39303F",
  ink: "#F5EFF7",
  inkMuted: "#B2A5BE",
  accent: "#E4732E",
  accentInk: "#20100A",
  accentSoft: "rgba(228,115,46,0.18)",
  violet: "#9885D6",
  violetSoft: "rgba(152,133,214,0.18)",
  success: "#4FAE7C",
  successSoft: "rgba(79,174,124,0.16)",
  danger: "#E2586B",
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 28,
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
} as const;

export const font = {
  display: "Lexend_600SemiBold",
  displayBold: "Lexend_700Bold",
  body: "Manrope_500Medium",
  bodyRegular: "Manrope_400Regular",
  bodyBold: "Manrope_700Bold",
  bodyExtraBold: "Manrope_800ExtraBold",
} as const;

export const type = {
  display: 28,
  title: 19,
  subtitle: 14.5,
  body: 13,
  caption: 11.5,
  label: 10.5,
} as const;
