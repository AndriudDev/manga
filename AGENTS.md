# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Arnés Agéntico — App Móvil Manga Reader / Catalog

## 1. Stack Técnico Obligatorio
- **Framework:** React Native con Expo (SDK 51+)
- **Lenguaje:** TypeScript (Modo estricto). Prohibido el uso de `any`.
- **Estilos:** `StyleSheet` nativo de React Native.
- **Iconos:** `@expo/vector-icons` (Lucide o Ionicons).

## 2. Temática e Identidad Visual
- **Temática:** Aplicación móvil de manga y cómics (colección, lectura, catálogo).
- **Nombre de la App:** MangaTools (o el nombre que defina el equipo).
- **Paleta de Colores:**
  - Fondo principal (Dark Mode): `#121212` / `#1E1E2E`
  - Color primario (Accent): `#FF4757` (Rojo/Japonés) o `#FF6B6B`
  - Color secundario: `#2ED573` o `#70A1FF`
  - Texto principal: `#FFFFFF`
  - Texto secundario: `#A4B0BE`
  - Superficies/Cards: `#2F3542` o `#252632`

## 3. Reglas de Código y Arquitectura
- **Estructura de archivos:**
  - `src/components/`: Componentes reutilizables (Botones, Inputs, Cards).
  - `src/screens/`: Pantallas de la app (`WelcomeScreen.tsx`, `LoginScreen.tsx`).
  - `src/theme/`: Constantes de colores, estilos compartidos y tipografía.
  - `src/types/`: Interfaces y tipos de TypeScript.
- **Estricto TypeScript:** Definir interfaces explícitas para Props de componentes y estados de formularios.
- **Manejo de Respuestas Visuales:**
  - El formulario de Login debe validar que los campos no estén vacíos.
  - Mostrar feedback explícito: bordes de error (`#FF4757`), mensajes de validación y un indicador/modal de éxito al simular el ingreso.

## 4. Instrucciones de Comportamiento del Agente
- Explicar brevemente la solución antes de generar el código.
- Escribir código limpio, modular y completamente tipado.
- Mantener los textos de la interfaz gráfica en español.

## System Skills & Context
- **Context File:** Refer to `.claude/context/context7_manga_app.md` for project architecture.
- **UI Skill:** Apply `.claude/skills/UI_STYLING.md` when building or editing components.
- **Validation Skill:** Apply `.claude/skills/FORM_VALIDATION.md` when building forms or login logic.
## Herramientas MCP y Sistema de Archivos
- **MCP Server:** `@modelcontextprotocol/server-filesystem` activo.
- **Regla de Archivos:** Todo nuevo componente o pantalla DEBE crearse dentro de la estructura modular `src/`:
  - Componentes reutilizables: `src/components/`
  - Pantallas: `src/screens/`
  - Estilos y temas: `src/theme/`
  - Tipos TypeScript: `src/types/`