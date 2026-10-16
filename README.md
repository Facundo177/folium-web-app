# Folium Web App — Documentación Técnica Frontend

![Logo de Folium](./public/folium-logo-variants/folium-logotipo-white.png)

## Tabla de Contenidos
1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura y Estructura de Directorios](#3-arquitectura-y-estructura-de-directorios)
4. [Sistema de Enrutamiento, Layouts y Control de Acceso (RBAC)](#4-sistema-de-enrutamiento-layouts-y-control-de-acceso-rbac)
5. [Capa de Red, Servicios API y Autenticación JWT](#5-capa-de-red-servicios-api-y-autenticación-jwt)
6. [Gestión del Estado y Custom Hooks](#6-gestión-del-estado-y-custom-hooks)
7. [Asistente Virtual Contextual (FoliumBot)](#7-asistente-virtual-contextual-foliumbot)
8. [Sistema de Diseño, Tematización y Componentes UI](#8-sistema-de-diseño-tematización-y-componentes-ui)
9. [Módulos Funcionales Principales](#9-módulos-funcionales-principales)
10. [Guía de Instalación, Configuración y Despliegue](#10-guía-de-instalación-configuración-y-despliegue)

---

## 1. Visión General del Proyecto

**Folium** es una aplicación web moderna diseñada para la gestión integral de bibliotecas, colecciones literarias y archivos históricos. Su interfaz está concebida bajo una dirección estética **"Dark Academia" y de archivo curatorial**, combinando tipografía editorial clásica con experiencias interactivas fluidas (como carruseles tridimensionales de portadas, transiciones suaves y paneles de control en tiempo real) y un asistente virtual integrado sensible al rol del usuario.

El proyecto está construido como una **Single Page Application (SPA)** altamente modular y optimizada en el ecosistema **React 19 + Vite 8**, consumiendo una API RESTful desarrollada en **Django / Django REST Framework**.

### Características Principales
* **Catálogo Interactivo y CoverFlow 3D:** Exploración visual mediante un carrusel circular tridimensional y búsqueda instantánea con filtrado multicriterio (texto, categoría/género, editorial y rango de año de publicación).
* **Detalle de Obras y Disponibilidad en Tiempo Real:** Visualización completa de metadatos bibliográficos (ISBN, sinopsis, autores, géneros) junto con el stock físico desglosado por ejemplar y ubicación.
* **Gestión de Inventario y Catalogación (Staff):** Alta de nuevos libros (incluyendo subida de portadas con previsualización y creación en línea de nuevos autores y géneros sin salir del formulario) y registro de ejemplares físicos (`Items`) con códigos de inventario y estado.
* **Control de Préstamos Activos:** Panel para bibliotecarios con cálculo automático de días restantes o demoras, indicadores semánticos de vencimiento y devolución/interrupción inmediata de préstamos.
* **Autenticación JWT Robusta y RBAC:** Control de sesiones mediante Access y Refresh Tokens, renovación transparente en segundo plano ante respuestas `401 Unauthorized` y protección de vistas según el rol (`USER`, `LIBRARIAN`, `ADMIN`).
* **Asistente Virtual Contextual (`FoliumBot`):** Chatbot persistente entre rutas que adapta sus respuestas y sugerencias de navegación según los permisos del usuario activo.
* **Sistema de Temas Dual (Claro / Oscuro):** Paleta curatorial adaptable ("Biblioteca Clásica" en modo claro y "Espresso Profundo & Oro Antiguo" en modo oscuro) gestionada mediante variables CSS nativas de Tailwind v4.

---

## 2. Stack Tecnológico

| Categoría | Tecnología / Librería | Versión | Propósito Principal |
| :--- | :--- | :--- | :--- |
| **Core Framework** | `react` / `react-dom` | `^19.2.8` | Construcción de la interfaz declarativa basada en componentes. |
| **Bundler & Dev Server** | `vite` | `^8.2.2` | Servidor de desarrollo ultrarrápido con HMR y empaquetado para producción. |
| **Enrutamiento** | `react-router-dom` | `^7.18.3` | Gestión de rutas anidadas, layouts persistentes y guardias de navegación. |
| **Estilos y Diseño** | `tailwindcss` / `@tailwindcss/vite` | `^4.3.3` | Utilidades CSS de última generación y sistema de Design Tokens vía `@theme`. |
| **Animaciones** | `framer-motion` | `^13.2.0` | Animaciones declarativas, transiciones de layout e interacciones físicas. |
| **Cliente HTTP** | `axios` | `^1.20.0` | Peticiones RESTful e interceptores para inyección y refresco de tokens JWT. |
| **Autenticación** | `jwt-decode` | `^4.0.0` | Decodificación en cliente del payload JWT (`user_id`, `username`, `rol`). |
| **Asistente Virtual** | `react-chatbot-kit` | `^2.2.2` | Motor conversacional con soporte de widgets interactivos de navegación. |
| **Iconografía** | `lucide-react` / `morphicons` | `^1.51.0` / `^1.7.1` | Iconografía vectorial consistente para controles, estados y navegación. |
| **Calidad de Código** | `eslint` | `^10.9.0` | Linting estático para JavaScript, React Hooks y React Refresh. |
| **Despliegue** | Vercel (`vercel.json`) | — | Hosting en la nube con reglas de reescritura (SPA fallback). |

---

## 3. Arquitectura y Estructura de Directorios

El proyecto aplica una **arquitectura modular basada en responsabilidades**, separando la capa de comunicación con el backend (`api/`), la seguridad y sesión (`auth/`), la lógica de negocio reutilizable (`hooks/`), la presentación (`components/` y `pages/`) y la configuración de tema (`theme/`).

```text
folium-web-app/
├── public/                               # Activos estáticos públicos
│   └── folium-logo-variants/             # Variantes oficiales de isotipo y logotipo (blanco, negro, color)
├── src/                                  # Código fuente principal
│   ├── api/                              # Capa de red y comunicación con el backend Django
│   │   ├── services/                     # Servicios CRUD desacoplados por entidad
│   │   │   ├── authService.js            # Login (POST /token/) y limpieza de sesión
│   │   │   ├── authorService.js          # CRUD de autores (/author/)
│   │   │   ├── bookService.js            # CRUD de libros y portadas (/book/)
│   │   │   ├── genreService.js           # CRUD de géneros literarios (/genre/)
│   │   │   ├── itemService.js            # CRUD de ejemplares físicos (/items/)
│   │   │   ├── loanService.js            # CRUD y devolución de préstamos (/loan/)
│   │   │   └── userService.js            # Registro (/register/), perfil (/me/) y usuarios (/user/)
│   │   ├── adapters.js                   # Transformadores de datos Backend -> Frontend (Adapter Pattern)
│   │   ├── axiosConfig.js                # Instancia Axios e interceptores de autenticación y refresh
│   │   └── constants.js                  # Constantes de dominio (ej. ITEM_STATUS)
│   ├── assets/                           # Recursos gráficos locales e imágenes empaquetadas
│   ├── auth/                             # Módulo de autenticación y autorización
│   │   ├── AuthProvider.jsx              # Contexto global de sesión, decodificación JWT y hook useAuth()
│   │   └── ProtectedRoute.jsx            # Guardia de rutas por autenticación y lista de roles permitidos
│   ├── chatbot/                          # Módulo del asistente virtual FoliumBot
│   │   ├── ActionProvider.js             # Acciones de respuesta del bot y disparo de widgets
│   │   ├── FoliumBot.jsx                 # Componente flotante e inyección dinámica de rol
│   │   ├── MessageParser.js              # Procesador de lenguaje natural y reglas por rol
│   │   ├── NavWidget.jsx                 # Widget interactivo para redirección entre vistas
│   │   └── config.jsx                    # Configuración inicial, estilos y registro de widgets
│   ├── components/                       # Componentes de interfaz organizados por dominio
│   │   ├── BasicUIComponents/            # Primitivas de UI (Toast, GoBackButton, FieldError, ScrollIndicator, SunToMoon)
│   │   ├── BookCatalogComponents/        # Carrusel 3D (BookCoverFlow, BookCard) y contenedor de búsqueda (CatalogSearch)
│   │   ├── BookDetailComponents/         # Portada, cabecera, metadatos (BookInfo), stock (CurrentStock) y reseñas
│   │   ├── CatalogSearchComponents/      # Tarjeta de catálogo (CatalogBookCard) y filtros laterales (FilterSidebar, FilterDrawer)
│   │   ├── FoliumLandingComponents/      # Secciones de la Landing Page (Hero, Navbar, Products, Background)
│   │   ├── InventoryComponents/          # Tabla de inventario (InventoryTable), alta de libro (LoadBookForm) y ejemplar (ItemForm)
│   │   ├── Layouts/                      # Estructuras envolventes (BotLayout, AuthLayout, UserLayout, LibrarianLayout)
│   │   ├── Login&RegisterComponents/     # Formularios de acceso (LoginForm) y creación de cuenta (RegisterForm)
│   │   ├── ProfileComponents/            # Vista y edición del perfil de usuario (UserProfile)
│   │   └── SideBar.jsx                   # Barra lateral responsiva y colapsable con menú adaptativo por rol
│   ├── hooks/                            # Custom Hooks para fetching y estado de dominio
│   │   ├── useBook.js                    # Obtención del detalle de un libro por ID
│   │   ├── useBooks.js                   # Obtención y recarga del listado general de libros
│   │   ├── useGenres.js                  # Obtención y recarga de géneros literarios
│   │   ├── useInventory.js               # Obtención y recarga de ejemplares físicos
│   │   └── useUserProfile.js             # Obtención y actualización del perfil del usuario autenticado
│   ├── pages/                            # Vistas de primer nivel vinculadas al enrutador
│   │   ├── AddAnItem.jsx                 # Página de registro de nuevo ejemplar físico
│   │   ├── BookCatalog.jsx               # Página del catálogo general con CoverFlow y filtros
│   │   ├── BookDetail.jsx                # Página de ficha técnica y stock de un libro
│   │   ├── Error404.jsx                  # Página de ruta no encontrada
│   │   ├── Favourites.jsx                # Página de colección personal de favoritos
│   │   ├── FoliumLanding.jsx             # Página de presentación institucional
│   │   ├── Inventory.jsx                 # Página de gestión de inventario bibliográfico
│   │   ├── LoadBook.jsx                  # Página de catalogación de nuevo libro
│   │   ├── LoansDashboard.jsx            # Página de administración de préstamos activos
│   │   ├── Profile.jsx                   # Página de perfil de usuario
│   │   └── Test.jsx                      # Entorno de pruebas de componentes (solo en modo DEV)
│   ├── theme/                            # Gestión del tema visual (Claro / Oscuro)
│   │   ├── ThemeProvider.jsx             # Contexto de tema, sincronización con localStorage y matchMedia
│   │   └── ThemeToggle.jsx               # Botón conmutador animado Sol/Luna
│   ├── App.css                           # Estilos auxiliares de aplicación
│   ├── App.jsx                           # Definición del árbol de rutas (BrowserRouter)
│   ├── index.css                         # Configuración maestra de Tailwind v4 (@theme), variables CSS y modo oscuro
│   └── main.jsx                          # Punto de entrada del DOM e inyección de Providers globales
├── .env                                  # Variables de entorno locales (no versionado)
├── eslint.config.js                      # Configuración de ESLint (Flat Config)
├── index.html                            # Plantilla HTML raíz
├── package.json                          # Dependencias y scripts de automatización
├── vercel.json                           # Reglas de reescritura para despliegue SPA en Vercel
└── vite.config.js                        # Configuración de Vite y plugins (React + Tailwind v4)
```

---

## 4. Sistema de Enrutamiento, Layouts y Control de Acceso (RBAC)

La navegación está gestionada con `react-router-dom` v7 mediante **rutas anidadas**, **Layouts especializados** y el componente guardia `ProtectedRoute`.

### Jerarquía de Layouts
1. **`BotLayout` (Nivel Raíz):** Envuelve absolutamente todas las rutas de la aplicación. Renderiza el componente `<FoliumBot />` junto con un `<Outlet />`, garantizando que el asistente virtual conserve su estado abierto/cerrado y todo el historial de conversación mientras el usuario navega por distintas pantallas.
2. **`AuthLayout`:** Estructura dedicada para las vistas de autenticación (`/login` y `/register`), presentando un diseño limpio enfocado en credenciales.
3. **`UserLayout`:** Estructura para lectores y vistas generales autenticadas. Incorpora la `<Sidebar />` lateral adaptativa junto al contenedor principal.
4. **`LibrarianLayout`:** Estructura orientada al personal de la biblioteca (`LIBRARIAN` y `ADMIN`), habilitando las herramientas de gestión en la barra lateral.

### Control de Acceso Basado en Roles (`ProtectedRoute`)
El componente `src/auth/ProtectedRoute.jsx` intercepta el acceso a rutas protegidas evaluando el contexto de `useAuth()`:
* **Estado de carga (`isLoading`):** Muestra una pantalla de espera tematizada (`"Cargando archivos..."`).
* **Usuario no autenticado (`!user`):** Redirige automáticamente a `/login`, guardando la ubicación de origen (`state={{ from: location }}`) para restaurar el flujo tras iniciar sesión.
* **Rol insuficiente (`!allowedRoles.includes(user.role)`):** Si el usuario está autenticado pero su rol no figura en `allowedRoles`, es redirigido de forma segura a `/catalog`.

### Mapa Completo de Rutas (`src/App.jsx`)

| Ruta | Componente / Vista | Layout | Acceso / Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `FoliumLanding` | `BotLayout` | Público | Landing page institucional con accesos rápidos. |
| `/login` | `LoginForm` | `BotLayout` > `AuthLayout` | Público | Inicio de sesión mediante credenciales JWT. |
| `/register` | `RegisterForm` | `BotLayout` > `AuthLayout` | Público | Registro de nuevas cuentas de lector. |
| `/test` | `Test` | `BotLayout` | Público (Solo `DEV`) | Sandbox de pruebas habilitado únicamente con `import.meta.env.DEV`. |
| `/catalog` | `BookCatalog` | `BotLayout` > `UserLayout` | `USER`, `LIBRARIAN`, `ADMIN` | Catálogo interactivo con CoverFlow 3D y buscador avanzado. |
| `/book` | *Redirect* | `BotLayout` | `USER`, `LIBRARIAN`, `ADMIN` | Redirige automáticamente a `/user/catalog`. |
| `/book/:id` | `BookDetail` | `BotLayout` | `USER`, `LIBRARIAN`, `ADMIN` | Ficha detallada del libro, disponibilidad de ejemplares y reseñas. |
| `/user` | *Redirect* | `BotLayout` > `UserLayout` | `USER`, `LIBRARIAN`, `ADMIN` | Redirige automáticamente a `/catalog`. |
| `/user/favourites` | `Favourites` | `BotLayout` > `UserLayout` | `USER`, `LIBRARIAN`, `ADMIN` | Colección personal de libros marcados como favoritos. |
| `/user/loans` | *(En construcción)* | `BotLayout` > `UserLayout` | `USER`, `LIBRARIAN`, `ADMIN` | Vista de préstamos activos del lector. |
| `/user/profile` | `Profile` | `BotLayout` > `UserLayout` | `USER`, `LIBRARIAN`, `ADMIN` | Visualización y edición de datos personales del usuario. |
| `/librarian` | *Redirect* | `BotLayout` > `LibrarianLayout` | `LIBRARIAN`, `ADMIN` | Redirige automáticamente a `/librarian/inventory`. |
| `/librarian/catalog` | `BookCatalog` | `BotLayout` > `LibrarianLayout` | `LIBRARIAN`, `ADMIN` | Vista del catálogo general dentro del entorno de bibliotecario. |
| `/librarian/inventory` | `Inventory` | `BotLayout` > `LibrarianLayout` | `LIBRARIAN`, `ADMIN` | Panel y tabla de control de ejemplares físicos y su estado. |
| `/librarian/inventory/newBook` | `LoadBook` | `BotLayout` > `LibrarianLayout` | `LIBRARIAN`, `ADMIN` | Formulario de alta de libros, autores, géneros y portada. |
| `/librarian/inventory/newItem` | `AddAnItem` | `BotLayout` > `LibrarianLayout` | `LIBRARIAN`, `ADMIN` | Formulario de vinculación de un nuevo ejemplar físico a un libro. |
| `/librarian/loans` | `LoansDashboard` | `BotLayout` > `LibrarianLayout` | `LIBRARIAN`, `ADMIN` | Panel de supervisión de préstamos, vencimientos y devoluciones. |
| `*` | `Error404` | `BotLayout` | Público | Página de error 404 para rutas inexistentes. |

---

## 5. Capa de Red, Servicios API y Autenticación JWT

Toda la comunicación con el backend está centralizada en `src/api/`, garantizando el principio **DRY (Don't Repeat Yourself)** y desacoplando los componentes de React de los detalles del protocolo HTTP.

### Configuración de Axios e Interceptores (`src/api/axiosConfig.js`)
Se define una instancia global de Axios configurada con:
* **`baseURL`:** Lee `import.meta.env.VITE_API_BASE_URL` y utiliza `http://localhost:8080/api/v1` como fallback por defecto.
* **`timeout`:** `10000` ms (10 segundos).

#### 1. Request Interceptor
Antes de enviar cualquier petición, verifica si existe `accessToken` en `localStorage` e inyecta automáticamente la cabecera estándar:
```http
Authorization: Bearer <accessToken>
```

#### 2. Response Interceptor y Cola de Refresco Automático
Cuando el backend responde con un estado **`401 Unauthorized`**:
1. Si ya hay una renovación de token en curso (`isRefreshing === true`), las peticiones concurrentes no fallan ni disparan múltiples refrescos: se encolan en `failedQueue` mediante Promesas.
2. La primera petición que detecta el `401` toma el `refreshToken` de `localStorage` y realiza un `POST` a `${baseURL}/token/refresh/`.
3. **Si el refresh tiene éxito:** Se guarda el nuevo `accessToken`, se resuelve toda la cola `failedQueue` reintentando de forma transparente todas las peticiones originales con el nuevo token.
4. **Si el refresh falla o no existe `refreshToken`:** Se rechaza la cola, se limpian `accessToken` y `refreshToken` de `localStorage` y se emite el evento global de ventana `window.dispatchEvent(new Event('auth:logout'))`, cerrando la sesión reactivamente en toda la aplicación.

### Flujo de Autenticación (`src/auth/AuthProvider.jsx`)
* Al iniciar la aplicación, `getUserFromStorage()` busca el `accessToken` en `localStorage` y lo decodifica con `jwtDecode`.
* Extrae la identidad del usuario a partir de los claims del token generado por el backend (`CustomTokenObtainPairSerializer`):
  * `id`: `decoded.user_id`
  * `username`: `decoded.username` (con fallback a `Usuario-${decoded.user_id}`)
  * `role`: `decoded.rol || 'USER'`
* Si el token está corrupto o malformado, limpia el almacenamiento automáticamente.
* Escucha el evento global `auth:logout` para sincronizar el estado `user = null` inmediatamente si el interceptor de Axios invalida la sesión.

### Catálogo de Servicios REST (`src/api/services/`)

| Servicio | Archivo | Endpoint Base | Métodos Expuestos | Notas |
| :--- | :--- | :--- | :--- | :--- |
| **Autenticación** | `authService.js` | `/token/` | `login(username, password)`, `logout()` | Almacena/elimina `accessToken` y `refreshToken` en `localStorage`. |
| **Usuarios y Perfil** | `userService.js` | `/register/`, `/me/`, `/user/` | `register(data)`, `getProfile()`, `updateProfile(data)`, `getAll(params)`, `getById(id)` | `updateProfile` utiliza `PATCH /me/` para actualizaciones parciales. |
| **Libros** | `bookService.js` | `/book/` | `getAll`, `getById`, `create`, `update`, `patch`, `remove` | Soporta configuración `multipart/form-data` en `create`/`update` para portadas. |
| **Autores** | `authorService.js` | `/author/` | `getAll`, `getById`, `create`, `update`, `patch`, `remove` | Permite crear nuevos autores al vuelo durante la carga de libros. |
| **Géneros** | `genreService.js` | `/genre/` | `getAll`, `getById`, `create`, `update`, `patch`, `remove` | Alimenta los filtros del catálogo y el selector de catalogación. |
| **Ejemplares (Items)** | `itemService.js` | `/items/` | `getAll`, `getById`, `create`, `update`, `patch`, `remove` | Gestiona las copias físicas asociadas al ID de un libro. |
| **Préstamos** | `loanService.js` | `/loan/` | `getAll`, `getById`, `create`, `update`, `patch`, `remove` | Utiliza `patch(id, { returned_at })` para registrar devoluciones. |

### Patrón Adaptador (`src/api/adapters.js`) y Constantes (`src/api/constants.js`)
Para evitar acoplar los componentes visuales a los nombres de campos crudos de la base de datos de Django, se utilizan funciones adaptadoras puras:
* **`adaptBook(b)`:** Normaliza un libro crudo convirtiendo el array de objetos `authors` en un string formateado (`"Nombre Apellido, ..."`), extrae los nombres de `genres`, asigna una `category` principal (con fallback a `"Sin género"`), mapea `publication_year` a `year` y `cover_image` a `cover`.
* **`adaptBookDetail(b)`:** Extiende `adaptBook(b)` añadiendo `description`, `items` (ejemplares físicos), `totalItems` (`total_items`) y `availableItems` (`available_items`).
* **`adaptItem(item, booksById)`:** Cruza en memoria un ejemplar físico con el diccionario indexado de libros (`booksById`) para construir una fila enriquecida de inventario con `id`, `code` (`inventory_code`), `status`, `statusLabel` (`status_display`), `location`, `title`, `author`, `isbn`, `genres` y `cover`.
* **`ITEM_STATUS` (`constants.js`):** Enumera los estados válidos de un ejemplar físico: `AVAILABLE`, `LOANED`, `RESERVED`, `DAMAGED`, `LOST`.

---

## 6. Gestión del Estado y Custom Hooks

Folium prescinde de librerías externas complejas de estado global (como Redux), apoyándose en **React Context API** para el estado transversal y **Custom Hooks** para la caché local y el ciclo de vida de las peticiones HTTP.

### Contextos Globales
1. **`AuthProvider` (`src/auth/AuthProvider.jsx`):**
   * **Hook:** `useAuth()`
   * **Expone:** `{ user, login, logout, isLoading }`
2. **`ThemeProvider` (`src/theme/ThemeProvider.jsx`):**
   * **Hook:** `useTheme()`
   * **Expone:** `{ isDarkMode, toggleTheme }`
   * **Comportamiento:** Inicializa el tema leyendo `localStorage` o detectando la preferencia del sistema operativo mediante `window.matchMedia('(prefers-color-scheme: dark)')`, y sincroniza la clase `.dark` en el nodo raíz `<html>` (`document.documentElement`).

### Custom Hooks de Datos (`src/hooks/`)
Todos los hooks de dominio siguen una firma estandarizada que facilita el manejo de estados de carga, errores y re-sincronización bajo demanda (`refetch`):

| Hook | Archivo | Parámetros | Retorno | Uso Principal |
| :--- | :--- | :--- | :--- | :--- |
| **`useBooks`** | `useBooks.js` | `initialParams = {}` | `{ books, isLoading, error, refetch }` | Carga el catálogo general en `BookCatalog` y cruza datos en `Inventory`. |
| **`useBook`** | `useBook.js` | `id` | `{ book, isLoading, error, refetch }` | Obtiene la ficha completa de un volumen específico en `BookDetail`. |
| **`useInventory`** | `useInventory.js` | `initialParams = {}` | `{ items, isLoading, error, refetch }` | Obtiene todos los ejemplares físicos registrados para `Inventory`. |
| **`useGenres`** | `useGenres.js` | `initialParams = {}` | `{ genres, isLoading, error, refetch }` | Alimenta las categorías de `CatalogSearch` y las etiquetas en `LoadBookForm`. |
| **`useUserProfile`** | `useUserProfile.js` | — | `{ profile, setProfile, isLoading, error, refetch }` | Obtiene los datos de `/me/` para la `Sidebar` y la edición en `UserProfile`. |

---

## 7. Asistente Virtual Contextual (`FoliumBot`)

Ubicado en `src/chatbot/`, **FoliumBot** es un asistente conversacional flotante construido sobre `react-chatbot-kit` y adaptado para funcionar con módulos ESM en Vite.

### Arquitectura Conversacional
1. **`FoliumBot.jsx`:**
   * Se posiciona de forma fija en la esquina inferior derecha (`fixed bottom-6 right-6 z-[100]`).
   * Utiliza transiciones CSS (`scale`, `opacity`, `translate-y`) sin desmontar el árbol DOM cuando se cierra, preservando el historial de mensajes durante toda la sesión.
   * Consume `useAuth()` e inyecta dinámicamente el rol actual (`user.role` o `'GUEST'`) dentro de `config.state.userRole`.
2. **`MessageParser.js`:**
   * Normaliza cada mensaje del usuario convirtiéndolo a minúsculas y eliminando tildes/diacríticos mediante `.normalize("NFD").replace(/[\u0300-\u036f]/g, "")`.
   * Evalúa listas de palabras clave en español e inglés y las cruza con `this.state.userRole`:
     * **Consultas Públicas/Generales:** Catálogo/explorar/libros (`handleCatalog`), iniciar sesión (`handleLogin`), registrarse/crear cuenta (`handleRegister`).
     * **Consultas de Lector (`role === 'USER'`):** Favoritos/guardados (`handleFavourites`).
     * **Consultas de Staff (`role === 'LIBRARIAN'`):** Inventario/stock/estante/ubicación (`handleInventory`), administración/dashboard/ajustes (`handleAdmin`).
     * **Fallback (`handleDefault`):** Respuesta orientativa por defecto cuando la consulta no coincide o el rol del usuario no tiene permisos sobre el módulo consultado.
3. **`ActionProvider.js` y `NavWidget.jsx`:**
   * Cada acción genera un mensaje del bot acompañado de un widget interactivo (`NavWidget`) que renderiza un botón de navegación directa hacia la ruta correspondiente (`/catalog`, `/librarian/inventory`, `/user/favourites`, `/login`, `/register`, `/admin/dashboard`).

---

## 8. Sistema de Diseño, Tematización y Componentes UI

El sistema de diseño está definido íntegramente en `src/index.css` aprovechando las directivas `@theme` y `@custom-variant dark` de **Tailwind CSS v4**.

### Tipografía Editorial
* **Encabezados y Displays (`--font-serif`):** [`EB Garamond`](https://fonts.google.com/specimen/EB+Garamond) — aporta carácter literario, clásico y solemne.
* **Cuerpo de Texto, Tablas y Controles (`--font-sans`):** [`Hanken Grotesk`](https://fonts.google.com/specimen/Hanken+Grotesk) — garantiza legibilidad moderna en interfaces densas, filtros y formularios.
* **Detalles Caligráficos:** [`Great Vibes`](https://fonts.google.com/specimen/Great+Vibes).

Se definen escalas tipográficas semánticas listas para usar como utilidades de Tailwind (`text-display-lg`, `text-display-lg-mobile`, `text-headline-md`, `text-headline-sm`, `text-title-lg`, `text-body-lg`, `text-body-md`, `text-label-caps`).

### Paleta de Colores Semántica (Modo Claro vs. Modo Oscuro)

| Token CSS (Tailwind) | Modo Claro (*Biblioteca Clásica*) | Modo Oscuro (*Dark Academia*) | Rol Visual |
| :--- | :--- | :--- | :--- |
| `--color-background` | `#f0e3cc` (*Parchment Luminoso*) | `#1c1314` (*Deep Espresso*) | Fondo general de la aplicación. |
| `--color-on-background` | `#322325` (*Espresso*) | `#e0ceb4` (*Parchment*) | Texto principal sobre el fondo. |
| `--color-surface` | `#e0ceb4` (*Parchment*) | `#322325` (*Espresso*) | Superficie base de tarjetas y paneles. |
| `--color-surface-container-lowest` | `#fbf6ec` (*Blanco Antiguo*) | `#140d0e` (*Espresso Oscuro*) | Contenedores de alto contraste (tablas, modales). |
| `--color-primary` | `#681822` (*Burgundy*) | `#ba874b` (*Antique Gold*) | Acciones primarias, botones principales y foco. |
| `--color-primary-container` | `#322325` (*Espresso*) | `#681822` (*Burgundy*) | Contenedores de énfasis primario. |
| `--color-secondary-container` | `#ba874b` (*Antique Gold*) | `#433033` (*Espresso Claro*) | Elementos secundarios y badges. |
| `--color-tertiary` | `#ba874b` (*Antique Gold*) | `#681822` (*Burgundy*) | Acentos curatoriales e indicadores destacados. |
| `--color-outline` | `#ba874b` (*Antique Gold*) | `#ba874b` (*Antique Gold*) | Bordes principales y líneas divisorias. |
| `--color-error` | `#ba1a1a` (*Rojo Carmesí*) | `#ba1a1a` (*Rojo Carmesí*) | Alertas, préstamos vencidos y errores de validación. |

### Espaciado y Layout Tokens
* `--spacing-container-max`: `1280px`
* `--spacing-margin-edge`: `32px`
* `--spacing-gutter`: `24px`
* `--spacing-stack-sm`: `12px` | `--spacing-stack-md`: `24px` | `--spacing-stack-lg`: `48px`

---

## 9. Módulos Funcionales Principales

### 9.1. Catálogo y CoverFlow 3D (`BookCatalog.jsx`, `BookCoverFlow.jsx`, `CatalogSearch.jsx`)
* **`BookCoverFlow`:** Renderiza las primeras 10 obras destacadas en un carrusel 3D infinito. Calcula en tiempo real la distancia circular más corta entre el índice activo y cada tarjeta, aplicando transformaciones espaciales (`translateX`, `translateZ`, `rotateY`, `scale`, `brightness` y `zIndex`) y ajustando el espaciado automáticamente según el ancho de pantalla (`< 640px`).
* **`CatalogSearch` y `FilterSidebar`:** Utiliza `useMemo` para filtrar instantáneamente en cliente combinando búsqueda textual (título o autor), género literario (obtenido dinámicamente de la API vía `useGenres`), editorial (extraída dinámicamente de los volúmenes cargados) y rango de años de publicación (`desde` / `hasta`).

### 9.2. Ficha Técnica del Libro (`BookDetail.jsx`)
* Consulta el libro por su `:id` mediante `useBook(id)` y transforma la respuesta con `adaptBookDetail`.
* Presenta una grilla responsiva de 3 columnas: a la izquierda, la portada (`BookCover`) y el módulo de disponibilidad física (`CurrentStock`), que detalla cuántos ejemplares están disponibles y lista cada copia con su ubicación; a la derecha, los metadatos completos (`BookInfo`) y la sección de reseñas (`BookReviews`).

### 9.3. Gestión de Inventario y Catalogación (`Inventory.jsx`, `LoadBookForm.jsx`, `ItemForm.jsx`)
* **Cruces en Memoria (`Inventory.jsx`):** Combina `useInventory()` y `useBooks()` indexando los libros en un mapa `O(1)` (`booksById`) mediante `useMemo` para enriquecer cada ejemplar físico con los datos de su obra.
* **`InventoryTable`:** Permite buscar ejemplares en vivo por título, autor, ISBN o código de inventario (`inventory_code`), además de filtrar por estado (`Disponible`, `Prestado`, etc.).
* **`LoadBookForm` (`/librarian/inventory/newBook`):**
  * Envía datos mediante `FormData` para soportar la carga de archivos de imagen (`cover_image`) con previsualización instantánea (`URL.createObjectURL`).
  * Permite seleccionar múltiples autores y géneros existentes, o **crear nuevos autores y géneros en línea** (impactando directamente en `authorService.create` y `genreService.create` y actualizando las listas seleccionables sin perder el progreso del formulario).
* **`ItemForm` (`/librarian/inventory/newItem`):**
  * Incluye un buscador desplegable con autocompletado en tiempo real para seleccionar el libro por título o `#ID`, asignarle su código de inventario, ubicación física en estantería y estado inicial (`ITEM_STATUS`).

### 9.4. Panel de Préstamos Activos (`LoansDashboard.jsx`)
* Lista todos los préstamos registrados en el sistema consumiendo `loanService.getAll()`.
* **Cálculo Semántico de Vencimientos (`getStatusInfo`):** Compara la fecha actual con `due_at` y `returned_at`:
  * **Devuelto:** Texto en tono secundario.
  * **Vencido:** Indica la cantidad exacta de días de demora en color `--color-error`.
  * **Vence hoy:** Alerta destacada en color `--color-tertiary` (*Antique Gold*).
  * **En curso:** Muestra los días restantes de préstamo.
* **Devolución / Interrupción Instantánea (`handleInterruptLoan`):** Permite finalizar un préstamo activo enviando una petición `PATCH /api/v1/loan/:id/` con `{ returned_at: new Date().toISOString() }` y actualizando el estado local sin necesidad de recargar la página.

### 9.5. Barra Lateral Adaptativa (`SideBar.jsx`) y Perfil (`UserProfile.jsx`)
* **`SideBar`:** En escritorio (`>= 1024px`) permanece colapsada a `84px` mostrando solo íconos y se expande suavemente a `264px` al pasar el cursor (`:hover`), revelando etiquetas y controles secundarios; en dispositivos móviles (`< 1024px`) funciona como un drawer deslizable controlado por menú hamburguesa. Adapta sus enlaces según el rol (`LIBRARIAN`, `USER` o `VISITANTE`) e incluye un modal de confirmación antes de cerrar sesión.
* **`UserProfile`:** Muestra la información del usuario autenticado (`first_name`, `last_name`, `username`, `email`, rol y fecha de alta formateada en locale `es-AR`) y ofrece un modo de edición in-situ conectado a `PATCH /api/v1/me/`.

---

## 10. Guía de Instalación, Configuración y Despliegue

### Requisitos Previos
* **Node.js:** v18.0.0 o superior (recomendado v20+ LTS).
* **Gestor de paquetes:** `npm` (incluido con Node.js) o `yarn`.
* **Backend Activo:** Instancia de la API de Folium (Django) ejecutándose localmente o en un servidor remoto.

### Instalación Paso a Paso

1. **Clonar el repositorio:**
   ```bash
   # Con HTTPS
   git clone https://github.com/Facundo177/folium-web-app.git

   # O con SSH
   git clone git@github.com:Facundo177/folium-web-app.git
   ```

2. **Acceder al directorio del proyecto e instalar dependencias:**
   ```bash
   cd folium-web-app
   npm install
   ```

3. **Configurar las variables de entorno:**
   Crear un archivo `.env` en la raíz del proyecto definiendo la URL base de la API backend:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   ```
   *(Si no se especifica `VITE_API_BASE_URL`, Axios utilizará por defecto `http://localhost:8080/api/v1`).*

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173` (o el puerto indicado en la terminal). Para detener el servidor, presionar `Ctrl + C`.

### Scripts Disponibles en `package.json`

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo de Vite con Hot Module Replacement (HMR). |
| `npm run build` | Compila y empaqueta la aplicación optimizada para producción en la carpeta `dist/`. |
| `npm run preview` | Levanta un servidor local estático para verificar el resultado compilado en `dist/`. |
| `npm run lint` | Ejecuta ESLint sobre todo el código fuente para detectar errores de estilo o buenas prácticas. |

### Despliegue en Producción (Vercel)
El repositorio incluye el archivo `vercel.json` preconfigurado para entornos Serverless/Static en **Vercel**:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Esta regla redirige cualquier ruta solicitada directamente en el navegador hacia `/index.html`, permitiendo que `BrowserRouter` de React Router gestione el enrutamiento en el cliente sin producir errores `404` al refrescar la página. Recuerda configurar la variable de entorno `VITE_API_BASE_URL` en el panel de control de Vercel apuntando a la URL de producción del backend.