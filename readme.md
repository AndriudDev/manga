# MangaTools

**Aplicación móvil de gestión de tareas con autenticación — construida con React Native (Expo), TypeScript y arquitectura MVC.**

MangaTools es una aplicación móvil orientada a fanáticos del manga y los cómics: permite **registrarse e iniciar sesión**, y gestionar una **lista de tareas pendientes (To-Do List)** con persistencia local. Cada tarea puede incluir una **fotografía tomada con la cámara del dispositivo** y, opcionalmente, las **coordenadas GPS** del lugar donde fue creada. La interfaz implementa dark mode con estética japonesa/manga: fondos oscuros, acentos rojos vibrantes y una paleta de colores centralizada.

**Público objetivo:** Lectores de manga y cómics que buscan una experiencia de organización en su dispositivo móvil.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Framework** | React Native | `0.86.2` |
| **SDK** | Expo | SDK `57` |
| **Lenguaje** | TypeScript (modo estricto) | `~6.0.3` |
| **Navegación** | React Navigation (Native Stack) | `7.x` |
| **Íconos** | `@expo/vector-icons` (Ionicons) | `15.x` |
| **Persistencia** | `@react-native-async-storage/async-storage` | SDK 57 |
| **Cámara** | `expo-image-picker` | SDK 57 |
| **Ubicación (GPS)** | `expo-location` | SDK 57 |
| **Sistema de archivos** | `expo-file-system` | SDK 57 |
| **Testing** | Jest + `jest-expo` | `~29.7.0` / SDK 57 |

### Decisiones técnicas

- **TypeScript estricto** (`"strict": true` en `tsconfig.json`): prohíbe el uso de `any`; todas las Props de componentes y estados de formularios requieren interfaces explícitas.
- **Arquitectura MVC**: separación en capas — **Modelo** (`src/models/`), **Controlador** (`src/controllers/`) y **Vista** (`src/screens/`). Las vistas nunca acceden directamente al almacenamiento; orquestan todo a través de los controladores.
- **Persistencia con AsyncStorage**: usuarios, sesión activa y tareas se guardan localmente. Las tareas están namespacedas por usuario (`@mangatools/tasks/<correo>`), por lo que cada cuenta tiene su propia lista.
- **Estilos con `StyleSheet`**: sistema de estilos nativo de React Native — sin librerías externas de CSS-in-JS.
- **Tokens de diseño centralizados**: toda la paleta de colores se define en `src/theme/colors.ts` como un objeto `as const`.
- **Navegación con React Navigation v7**: `@react-navigation/native-stack` para transiciones nativas entre pantallas con tipado fuerte de rutas (`src/types/navigation.ts`).
- **Permisos nativos**: cámara, fotos y ubicación configurados vía config plugins de Expo en `app.json`.
- **Pruebas automatizadas de periféricos**: Jest con preset `jest-expo`. Los plugins nativos (`expo-location`, `expo-file-system`) se **mockean** a nivel de módulo para verificar la lógica real de la app ante cada escenario (permiso denegado, GPS apagado, foto inexistente) sin necesidad de dispositivo.

---

## Estructura del Proyecto (MVC)

```
manga/
├── __tests__/                  # Pruebas automatizadas (Jest)
│   ├── LocationTracker.test.ts #   GPS: permiso concedido/denegado/fallo
│   ├── PhotoStore.test.ts      #   Cámara: persistencia y limpieza de fotos
│   └── TaskController.test.ts  #   Orquestación: foto + ubicación + API externa
├── src/
│   ├── models/                 # MODELO — entidades y acceso a datos
│   │   ├── User.ts             #   Entidad de usuario (hash + normalización)
│   │   ├── UserRepository.ts   #   Persistencia de usuarios y sesión (AsyncStorage)
│   │   ├── Task.ts             #   Entidad de tarea (foto + ubicación opcionales)
│   │   ├── TaskRepository.ts   #   CRUD de tareas por usuario (AsyncStorage)
│   │   ├── TaskApi.ts          #   Cliente REST del servicio web externo (sincronización)
│   │   ├── PhotoStore.ts       #   Copiado/borrado de fotos en almacenamiento persistente
│   │   └── LocationTracker.ts  #   Captura de coordenadas GPS (expo-location)
│   ├── controllers/            # CONTROLADOR — lógica de negocio
│   │   ├── AuthController.ts   #   register / login / logout / getCurrentUser
│   │   └── TaskController.ts   #   CRUD de tareas + sync/import con la API externa
│   ├── screens/                # VISTA — pantallas de la app
│   │   ├── AppNavigator.tsx    #   Stack Navigator (rutas y transiciones)
│   │   ├── WelcomeScreen.tsx   #   Pantalla de bienvenida
│   │   ├── LoginScreen.tsx     #   Formulario de login (real, contra AsyncStorage)
│   │   ├── RegisterScreen.tsx  #   Formulario de registro con confirmación
│   │   └── HomeScreen.tsx      #   To-Do List (CRUD + cámara + GPS)
│   ├── theme/
│   │   └── colors.ts           # Paleta de colores (tokens de diseño)
│   └── types/
│       └── navigation.ts       # Tipos de rutas y parámetros de pantalla
├── .agent/                     # Arnés Agéntico — skills y contexto para IA
│   ├── skills/
│   │   ├── UI_STYLING.md       #   Reglas de diseño visual
│   │   └── FORM_VALIDATION.md  #   Reglas de validación de formularios
│   └── context/
│       └── context7_manga_app.md # Contexto técnico del proyecto
├── assets/                     # Íconos y assets estáticos de Expo
├── App.tsx                     # Punto de entrada — inicia sesión y navegación
├── index.ts                    # Registro de la app con Expo
├── app.json                    # Configuración de Expo SDK + plugins (cámara/GPS)
├── tsconfig.json               # Configuración de TypeScript (strict)
├── package.json                # Dependencias y scripts
├── mcp.json                    # Configuración del servidor MCP
├── AGENTS.md                   # Reglas del Arnés Agéntico
├── CLAUDE.md                   # Referencia a AGENTS.md
└── readme.md                   # Este archivo
```

---

## Funcionalidades

### Autenticación (registro e inicio de sesión)

- **Registro** (`RegisterScreen`): nombre, correo, contraseña (mínimo 6 caracteres) y confirmación. Valida formato de correo, coincidencia de contraseñas y correos duplicados.
- **Login** (`LoginScreen`): verifica credenciales contra los usuarios guardados en AsyncStorage con hash de contraseña; muestra errores genéricos de credenciales inválidas.
- **Sesión persistida**: el correo del usuario logueado se guarda en `@mangatools/session`; `HomeScreen` la muestra y permite cerrar sesión.
- **Usuario administrador por defecto**: al iniciar la app se siembra automáticamente el usuario `admin` / `admin` (nombre "Administrador"). Credenciales: **correo `admin`, contraseña `admin`**.

### To-Do List (CRUD)

`HomeScreen` es la pantalla de entrada tras iniciar sesión:

- **Create**: agregar tarea con texto (obligatorio) y **foto y ubicación GPS opcionales**.
- **Read**: lista persistente, separada por usuario.
- **Update**: marcar/desmarcar tarea como completada (checkbox con tachado) y **editar el título** desde el icono de lápiz (modal con guardado).
- **Delete**: eliminar una tarea (y su archivo de foto asociado si existe).

### Fotografía con la cámara

- Botón de cámara en la entrada: captura con la cámara del dispositivo, con vista previa y opción de quitarla antes de crear la tarea.
- Cada tarea puede adjuntar/reemplazar su foto; se muestra como thumbnail y se amplía en un modal a pantalla completa con opción "Quitar foto".
- Las fotos se copian al **directorio de documentos** de la app (`Paths.document/task-photos`) para persistir entre sesiones (las URIs de la cámara viven en caché).

### Coordenadas GPS (opcionales)

- La ubicación es **opcional**: se adjunta a la tarea solo si se captura antes con el botón de ubicación (pin).
- El botón de ubicación (pin) obtiene las coordenadas del dispositivo vía `expo-location`; mientras captura muestra un **spinner** y se deshabilita.
- Si se niega el permiso de ubicación o el GPS falla, la ubicación simplemente **no se adjunta** (la tarea se puede crear igual).
- Cada tarea que tenga coordenadas las muestra (lat, lng) con icono de pin.

### Manejo de permisos (cámara y ubicación)

- Al usar la cámara o la ubicación, la app llama al **permiso nativo del sistema**; si se concede, continúa (abre la cámara o captura las coordenadas).
- Si se niega, muestra el aviso **"Permiso requerido — Se necesita el permiso de {cámara|ubicación} para seguir."** con un botón **"Abrir ajustes"**: Android deja de mostrar el diálogo tras la primera denegación, por lo que el permiso se otorga desde la configuración del sistema (`Linking.openSettings()`).
- La ubicación no es obligatoria: aunque se niegue el permiso o falle el GPS, la tarea se crea igual sin coordenadas.

### Integración con Servicios Web y APIs

`HomeScreen` expone dos acciones de nube (`src/models/TaskApi.ts`), implementadas como integración REST contra `https://jsonplaceholder.typicode.com` (endpoint `/todos`):

- **Sincronizar (subir al servicio web)**: sincroniza la lista local con la API para **almacenar las tareas de forma remota**. Las tareas nuevas se crean (`POST /todos`) y las ya sincronizadas se actualizan (`PUT /todos/:id`) para reflejar su estado. Cada tarea sincronizada guarda su `remoteId` y se persiste localmente.
- **Importar de API**: trae tareas desde la API externa (`GET /todos`) y las **agrega a la lista local** para completarla, evitando duplicados por título (comparación insensible a mayúsculas).
- **Feedback visual**: ambos botones muestran spinner mientras se procesa, se deshabilitan entre sí durante la operación y confirman el resultado (o el error de conexión) mediante un modal/alert.

> **Servicio de prueba**: JSONPlaceholder es una API REST pública de demostración que no persiste los datos entre reinicios del servidor. Para usar un backend real solo hay que cambiar la constante `API_BASE_URL` en `src/models/TaskApi.ts` por la URL del servicio propio.
>
> **Sincronización manual**: tanto "Sincronizar" como "Importar de API" se disparan a mano desde `HomeScreen`. Se descartó deliberadamente un auto-sync en tiempo real (polling/WebSocket) para mantener el control en el usuario y evitar depender de un servidor propio; la consigna permite esta lectura (enumera la sincronización en tiempo real como ejemplo de ampliación de la integración con APIs, no como requisito).

---

## Pruebas Automatizadas (Periféricos + Integración)

Para cumplir el requisito de *"pruebas de funcionalidad de periféricos (captura de imágenes y obtención de ubicación)"*, el proyecto incluye suites de Jest que **mockean los plugins nativos** (`expo-location`, `expo-file-system`) y verifican la lógica real de la app frente a cada escenario — sin dispositivo físico. Esto da cobertura de casos difíciles de reproducir a mano (permiso denegado, GPS apagado, archivo de foto inexistente) de forma rápida y repetible.

| Suite | Escenarios cubiertos |
|---|---|
| `LocationTracker.test.ts` | Permiso concedido → devuelve coordenadas · permiso denegado → `denied` (sin consultar GPS) · GPS agotado → `failed` |
| `PhotoStore.test.ts` | La foto capturada se copia al almacenamiento persistente · se elimina · tolera archivo inexistente (best effort) |
| `TaskController.test.ts` | Tarea con foto + coordenadas GPS · adjuntar/reemplazar/quitar foto (borra el archivo) · **editar título** · eliminar tarea (borra la foto) · importar sin duplicados (dedupe por título) · sync POST/PUT · tolerancia a fallo de red |

**Cómo ejecutarlas**:

```bash
npm test              # corre las 3 suites (19 tests)
npm test -- --watch   # modo watch, re-ejecuta al guardar
```

Resultado esperado: `Test Suites: 3 passed · Tests: 19 passed`.

---

## Flujo de Pantallas e Interacción

```
┌─────────────────┐   Login   ┌─────────────────────┐   Registro   ┌──────────────────┐
│  WelcomeScreen  │ ────────► │    LoginScreen      │ ───────────► │  RegisterScreen  │
│                 │ "Iniciar  │  • Correo + Contra. │              │  • Nombre/Correo  │
│                 │  Sesión"  │  • Botón Ingresar   │              │  • Contra. x2     │
└─────────────────┘           │  • Enlace Registro  │ ◄─────────── │  • Botón Crear    │
                              └──────────┬──────────┘  "Iniciar    └──────────────────┘
                                         │              sesión"
                                 login OK │
                                         ▼
                              ┌──────────────────────────┐
                              │   HomeScreen (To-Do)     │
                              │  • Agregar (texto+foto)  │
                              │  • GPS opcional (pin)    │
                              │  • Lista CRUD persistente│
                              │  • Sincronizar con API   │
                              │  • Importar de API       │
                              │  • Cerrar sesión         │
                              └──────────────────────────┘
```

1. **WelcomeScreen**: pantalla de aterrizaje con identidad visual MangaTools y botón "Iniciar Sesión".
2. **LoginScreen**: login real contra los usuarios de AsyncStorage vía `AuthController.login`. Con credenciales válidas muestra pantalla de éxito y navega a `Home`. Enlace a registro.
3. **RegisterScreen**: crea la cuenta vía `AuthController.register` (valida campos, formato de correo, longitud de contraseña, confirmación y correos duplicados), inicia sesión automáticamente y navega a `Home`.
4. **HomeScreen**: To-Do List con CRUD persistente. El botón **"+"** crea la tarea con texto (obligatorio) y **foto y ubicación opcionales** (la ubicación se adjunta solo si se capturó con el botón de pin). "Cerrar Sesión" limpia la sesión y vuelve a Welcome.
5. **Tipado de navegación**: rutas en `src/types/navigation.ts` como `RootStackParamList`, validando cada `navigate()` en tiempo de compilación.

---

## Instrucciones de Instalación y Ejecución

### Prerrequisitos

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 9
- [Expo Go](https://expo.dev/go) (app en tu dispositivo móvil) o un emulador Android/iOS
- **Importante**: Expo Go solo soporta la última versión de SDK. Si la app reporta "SDK no compatible", **actualizá Expo Go** desde la Play Store / App Store (el proyecto usa SDK 57).

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
| `npm test` | Ejecuta las pruebas automatizadas (Jest) |

### Probar la app

1. Escaneá el QR con **Expo Go** (mismo Wi-Fi que la PC; usá `npx expo start --tunnel` si la red no permite LAN).
2. Ingresá con el usuario sembrado: **correo `admin`, contraseña `admin`** — o registrá una cuenta nueva.
3. Para probar cámara y GPS usá un **dispositivo físico** (los emuladores requieren cámara/ubicación simulada).

---

## Arnés Agéntico (Agentic Harness)

El proyecto integra un **arnés agéntico**: un conjunto de reglas, contexto y herramientas que guían a modelos de IA para que generen código consistente, tipado y alineado con la identidad visual de la app.

### Reglas en `AGENTS.md`

El archivo `AGENTS.md` (raíz del proyecto) define las reglas que todo agente de IA debe seguir:

- **Stack obligatorio**: React Native + Expo + TypeScript estricto, con docs versionadas de Expo SDK 57.
- **Identidad visual**: paleta de colores dark mode, estética manga, textos en español.
- **Arquitectura**: MVC — modelos en `src/models/`, controladores en `src/controllers/`, pantallas en `src/screens/`, temas en `src/theme/`, tipos en `src/types/`.
- **Validación visual**: los formularios validan campos vacíos con bordes de error y mensajes explícitos, más feedback de éxito/error.

### Protocolo MCP (Model Context Protocol)

El proyecto configura un **servidor MCP** en `mcp.json` para que los agentes de IA tengan acceso directo al sistema de archivos del proyecto:

| Servidor | Paquete | Propósito |
|---|---|---|
| `filesystem` | `@modelcontextprotocol/server-filesystem` | Lectura y escritura de archivos del proyecto |

### Context7 — Inyección de Contexto Técnico

**Context7** inyecta documentación técnica actualizada directamente en el contexto del modelo de IA, garantizando código compatible con las versiones exactas de las dependencias (Expo SDK 57, React Navigation v7, React 19).

### Skills del Agente

| Skill | Archivo | Uso |
|---|---|---|
| **UI Styling** | `.agent/skills/UI_STYLING.md` | Token de colores, estándares de botones e inputs |
| **Form Validation** | `.agent/skills/FORM_VALIDATION.md` | Estados de formulario, reglas de validación, feedback visual |

---

## Prompts Utilizados (Desarrollo Asistido por IA)



## Licencia

Proyecto académico — Instituto San Sebastián, 6to Trimestre, Aplicaciones Móviles.