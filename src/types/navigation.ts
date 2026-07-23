// Tipos de navegación — MangaTools
// Define las rutas y parámetros de pantalla

export type ScreenName = 'Welcome' | 'Login' | 'Home' | 'Catalog' | 'Reader' | 'Profile';

export interface RootStackParamList {
  Welcome: undefined;
  Login: undefined;
  Home: undefined;
  Catalog: { genre?: string } | undefined;
  Reader: { chapterId: string; mangaId: string };
  Profile: undefined;
}

export type ScreenRoute = keyof RootStackParamList;
