# MangaTools

**Aplicación móvil de catálogo y lectura de manga — construida con React Native (Expo) y Arnés Agéntico.**

MangaTools es una aplicación móvil orientada a fanáticos del manga y los cómics. Permite explorar un catálogo de series, coleccionar títulos favoritos y gestionar una biblioteca personal de lectura. La interfaz implementa dark mode con estética japonesa/manga: fondos oscuros, acentos rojos vibrantes y una paleta de colores centralizada que evoca el estilo visual del medium.

**Público objetivo:** Lectores de manga y cómics que buscan una experiencia de catálogo y organización en su dispositivo móvil.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Framework** | React Native | `0.86.0` |
| **SDK** | Expo | SDK `57` |
| **Lenguaje** | TypeScript (modo estricto) | `~6.0.3` |
| **Navegación** | React Navigation (Native Stack) | `7.x` |
| **Íconos** | `@expo/vector-icons` (Ionicons) | `15.x` |

### Decisiones técnicas

- **TypeScript estricto** (`"strict": true` en `tsconfig.json`): prohíbe el uso de `any`; todas las Props de componentes y estados de formularios requieren interfaces explícitas.
- **Estilos con `StyleSheet`**: se utiliza el sistema de estilos nativo de React Native — sin librerías externas de CSS-in-JS.
- **Tokens de diseño centralizados**: toda la paleta de colores se define en `src/theme/colors.ts` como un objeto `as const`. Los componentes importan tokens de este archivo, nunca valores hardcodeados.
- **Gestión de estado local**: se utilizan React Hooks (`useState`) para el estado de formularios, validaciones y navegación.
- **Navegación con React Navigation v7**: `@react-navigation/native-stack` para transiciones nativas entre pantallas con tipado fuerte de rutas.

---

## Estructura del Proyecto

El proyecto sigue una **arquitectura modular** dentro de `src/`, separando responsabilidades en carpetas con un propósito claro:

```
manga/
├── src/
│   ├── screens/              # Pantallas de la app
│   │   ├── AppNavigator.tsx  #   Stack Navigator (rutas y transiciones)
│   │   ├── WelcomeScreen.tsx #   Pantalla de bienvenida
│   │   └── LoginScreen.tsx   #   Formulario de login con validación
│   ├── theme/
│   │   └── colors.ts         # Paleta de colores (tokens de diseño)
│   ├── types/
│   │   └── navigation.ts     # Tipos de rutas y parámetros de pantalla
│   └── components/           # Componentes reutilizables (próximamente)
├── .agent/                   # Arnés Agéntico — skills y contexto para IA
│   ├── skills/
│   │   ├── UI_STYLING.md     #   Reglas de diseño visual
│   │   └── FORM_VALIDATION.md#   Reglas de validación de formularios
│   └── context/
│       └── context7_manga_app.md # Arquitectura y estado del proyecto
├── .claude/
│   └── settings.json         # Configuración del agente Claude
├── assets/                   # Íconos y assets estáticos de Expo
├── App.tsx                   # Punto de entrada — importa AppNavigator
├── index.ts                  # Registro de la app con Expo
├── app.json                  # Configuración de Expo SDK
├── tsconfig.json             # Configuración de TypeScript (strict)
├── package.json              # Dependencias y scripts
├── mcp.json                  # Configuración del servidor MCP
├── AGENTS.md                 # Reglas del Arnés Agéntico
├── CLAUDE.md                 # Referencia a AGENTS.md
└── README.md                 # Este archivo
```

---

## Arnés Agéntico (Agentic Harness)

El proyecto integra un **arnés agéntico**: un conjunto de reglas, contexto y herramientas que guían a modelos de IA (como Claude) para que generen código consistente, tipado y alineado con la identidad visual de la app.

### Reglas en `AGENTS.md`

El archivo `AGENTS.md` (raíz del proyecto) define las reglas que todo agente de IA debe seguir:

- **Stack obligatorio**: React Native + Expo + TypeScript estricto.
- **Identidad visual**: paleta de colores dark mode, estética manga, textos en español.
- **Arquitectura**: componentes en `src/components/`, pantallas en `src/screens/`, temas en `src/theme/`, tipos en `src/types/`.
- **Validación visual**: el formulario de login debe validar campos vacíos con bordes de error y mensajes explícitos.
- **Comportamiento del agente**: explicar la solución antes de generar código; escribir código limpio, modular y tipado.

### Bitácora del Agente (`AGENT_LOG.md`)

El archivo `AGENT_LOG.md` (raíz) sirve como **bitácora de auditoría** donde el agente registra cada cambio realizado en el proyecto: archivos creados, modificaciones aplicadas, dependencias instaladas y decisiones de diseño tomadas. Permite trazabilidad completa del proceso de desarrollo asistido por IA.

### Protocolo MCP (Model Context Protocol)

El proyecto configura un **servidor MCP** en `mcp.json` para que los agentes de IA tengan acceso directo al sistema de archivos del proyecto:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "<ruta-del-proyecto>"
      ]
    }
  }
}
```

**Servidores configurados:**

| Servidor | Paquete | Propósito |
|---|---|---|
| `filesystem` | `@modelcontextprotocol/server-filesystem` | Lectura y escritura de archivos del proyecto |

El agente utiliza este servidor para leer estructura de archivos, verificar contenido existente y escribir nuevos componentes sin necesidad de herramientas externas.

### Context7 — Inyección de Contexto Técnico

**Context7** (`npx context7`) es una herramienta que inyecta documentación técnica actualizada directamente en el contexto del modelo de IA. Esto garantiza que el agente genere código compatible con las versiones exactas de las dependencias del proyecto.

- **Archivo de contexto**: `.agent/context/context7_manga_app.md`
- **Contenido**: arquitectura del proyecto, constraints técnicos, patrones de diseño y guidelines para el agente.
- **Uso**: al iniciar una sesión, el agente consulta Context7 para obtener documentación actualizada de Expo SDK 57, React Navigation v7 y React 19 antes de generar código.

### Skills del Agente

Archivos de conocimiento especializado en `.agent/skills/`:

| Skill | Archivo | Uso |
|---|---|---|
| **UI Styling** | `UI_STYLING.md` | Token de colores, estándares de botones e inputs |
| **Form Validation** | `FORM_VALIDATION.md` | Estados de formulario, reglas de validación, feedback visual |

---

## Flujo de Pantallas e Interacción

La navegación de la app está gobernada por `AppNavigator.tsx`, que define un **stack de navegación nativo** con React Navigation.

### Diagrama de flujo

```
┌─────────────────┐         ┌─────────────────────┐
│                 │  Click  │                     │
│  WelcomeScreen  │ ──────► │    LoginScreen      │
│                 │ "Iniciar│                     │
│  • Título       │  Sesión"│  • Correo/Usuario   │
│  • Eslogan      │         │  • Contraseña       │
│  • Ícono manga  │         │  • Botón Ingresar   │
│  • Botón login  │ ◄────── │  • Botón Volver     │
│                 │  Volver │  • Validación       │
└─────────────────┘         └─────────────────────┘
```

### Descripción del flujo

1. **WelcomeScreen** (`src/screens/WelcomeScreen.tsx`): pantalla de aterrizaje con identidad visual de MangaTools. Muestra el título, eslogan, una composición gráfica con ícono de libro y estrellas decorativas, y un botón "Iniciar Sesión".

2. **Navegación**: al presionar "Iniciar Sesión", `AppNavigator` ejecuta `navigation.navigate('Login')` con animación `slide_from_right`.

3. **LoginScreen** (`src/screens/LoginScreen.tsx`): formulario con dos campos (correo/usuario y contraseña) y dos botones (Ingresar y Volver).

   - **Validación**: al presionar "Ingresar" con campos vacíos, los inputs muestran borde rojo (`#FF4757`) y un mensaje de error debajo.
   - **Feedback en tiempo real**: al escribir en un campo con error, el mensaje se limpia automáticamente.
   - **Simulación de éxito**: con datos válidos, se muestra un spinner de carga durante 1.5 segundos, luego una pantalla de éxito con ícono verde de verificación y el mensaje "¡Bienvenido a MangaTools!".
   - **Botón Volver**: ejecuta `navigation.goBack()` para regresar a WelcomeScreen.

4. **Tipado de navegación**: las rutas y parámetros están definidos en `src/types/navigation.ts` como `RootStackParamList`, garantizando que las llamadas a `navigate()` estén validadas por TypeScript en tiempo de compilación.

---

## Instrucciones de Instalación y Ejecución

### Prerrequisitos

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 9
- [Expo Go](https://expo.dev/go) (app en tu dispositivo móvil) o un emulador Android/iOS
- Opcionalmente: [Expo CLI](https://docs.expo.dev/get-started/installation/) global (`npm install -g expo-cli`)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd manga

# 2. Instalar dependencias
npm install

# 3. Levantar el servidor de desarrollo
npx expo start
```

### Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de Expo (equivale a `expo start`) |
| `npm run android` | Abre directamente en emulador/dispositivo Android |
| `npm run ios` | Abre directamente en emulador/dispositivo iOS |
| `npm run web` | Ejecuta la versión web de la app |

### Escanear con Expo Go

Al ejecutar `npx expo start`, se muestra un código QR en terminal. Escanéalo con la app **Expo Go** (Android/iOS) para ver la app en tu dispositivo.

---

## Prompts Utilizados (Desarrollo Asistido por IA)

El siguiente registro documenta los prompts exactos ingresados por el equipo para generar cada componente del proyecto mediante asistencia de IA. Cada prompt fue diseñado para entregar instrucciones precisas, y la IA respondió generando código tipado, modular y alineado con las reglas de `AGENTS.md`.

### Prompt 1 — Tema y tipos base

```
Hola. Revisa el archivo AGENTS.md. Por favor crea la carpeta src/theme con un archivo colors.ts
que exporte la paleta de colores definida para la app de manga. Además, crea
src/types/navigation.ts para los tipos de estados de pantalla.
```

**Resultado:** se creó `src/theme/colors.ts` con la paleta de colores dark mode (tokens `as const`) y `src/types/navigation.ts` con la interfaz `RootStackParamList` tipando las 6 rutas de la app.

### Prompt 2 — Pantalla de Bienvenida (Welcome Screen)

```
Crea el componente src/screens/WelcomeScreen.tsx y sus componentes asociados si son necesarios.
Debe tener la identidad visual de nuestra app de Manga (MangaTools): título atractivo, eslogan,
un ícono o composición gráfica relativa a manga/cómics, y un botón destacado para
"Iniciar Sesión" que cambie de pantalla.
```

**Resultado:** se creó `WelcomeScreen.tsx` con composición gráfica (ícono book + estrellas decorativas), título "MangaTools" con accent rojo, eslogan, botón de login y navegación a LoginScreen. También se generaron `AppNavigator.tsx` (stack navigation) y se actualizó `App.tsx`.

### Prompt 3 — Pantalla de Login Interactiva

```
Crea src/screens/LoginScreen.tsx. Debe incluir campos para Usuario/Correo y Contraseña,
botón de "Ingresar" y un botón para "Volver". Debe tener validaciones visuales:
si presiono Ingresar con campos vacíos, debe mostrar los campos con borde rojo y un
mensaje de error. Si coloco datos, debe simular el éxito con un mensaje o alerta visual.
```

**Resultado:** se reescribió `LoginScreen.tsx` con formulario completo: dos inputs con íconos, validación en tiempo real (borde rojo + mensaje de error), toggle de visibilidad de contraseña, spinner de carga y pantalla de éxito con ícono verde y mensaje de bienvenida.

### Prompt 4 — Documentación del Proyecto (README)

```
Por favor, genera un archivo README.md completo, profesional y perfectamente estructurado
para este proyecto de aplicación móvil en React Native (Expo) con temática Manga/MangaTools.
El README debe contener las siguientes secciones: título y descripción general, stack tecnológico,
estructura del proyecto, constitución del Arnés Agéntico (AGENTS.md, MCP, Context7),
flujo de pantallas e instrucciones de instalación. Asegúrate de formatear el texto con
títulos claros, listas, bloques de código explicativos y un tono técnico y profesional.
```

**Resultado:** se generó este archivo `README.md` con 8 secciones estructuradas, diagrama ASCII de flujo de pantallas, tabla de dependencias con versiones exactas y documentación completa del arnés agéntico.

---

## Licencia

Proyecto académico — Instituto San Sebastián, 6to Trimestre, Aplicaciones Móviles.
