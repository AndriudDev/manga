// Tipos de navegación — MangaTools
// Define las rutas y parámetros de pantalla

export type ScreenName = 'Welcome' | 'Login' | 'Register' | 'Home' | 'Catalog' | 'Reader' | 'Profile';

export interface RootStackParamList {
  [key: string]: object | undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Catalog: { genre?: string } | undefined;
  Reader: { chapterId: string; mangaId: string };
  Profile: undefined;
}

export type ScreenRoute = keyof RootStackParamList;
