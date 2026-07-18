/**
 * Raw hex values for JS-side usage where NativeWind `className` can't reach — e.g.
 * `TextInput.placeholderTextColor`, gradients, charts. Keep in sync with src/global.css.
 */
export const colors = {
  ink: "#0a2a38",
  deep: "#0b5a78",
  aqua: "#16a6c2",
  aquaSoft: "#dff1f5",
  foam: "#eef6f8",
  mutedForeground: "#5e7683",
  border: "#e3ecef",
  card: "#ffffff",
  white: "#ffffff",
  destructive: "#e5533c",
  success: "#1b9e77",
  warning: "#c9791a",
} as const;
