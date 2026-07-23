// Paleta de colores — MangaTools
// Dark mode theme con identidad visual japonesa/manga

export const Colors = {
  // Fondos
  backgroundPrimary: '#121212',
  backgroundSecondary: '#1E1E2E',

  // Acentos
  accentPrimary: '#FF4757', // Rojo japonés
  accentSecondary: '#2ED573', // Verde
  accentTertiary: '#70A1FF', // Azul

  // Texto
  textPrimary: '#FFFFFF',
  textSecondary: '#A4B0BE',

  // Superficies / Cards
  surfacePrimary: '#2F3542',
  surfaceSecondary: '#252632',

  // Bordes y feedback
  error: '#FF4757',
  success: '#2ED573',
  border: '#3D4454',
  borderError: '#FF4757',

  // Botones
  buttonPrimary: '#FF4757',
  buttonDisabled: '#555B6E',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
} as const;

export type ColorKey = keyof typeof Colors;
