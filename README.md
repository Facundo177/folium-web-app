# Folium Web App - Frontend Documentation

![Logo de folium](./public/folium-logo-variants/folium-logotipo-white.png)



## 1. Visión General del Proyecto
**Folium** es una aplicación web moderna para la gestión de bibliotecas y archivos históricos. La interfaz está diseñada con una estética "Dark Academia" y de archivo curatorial, ofreciendo experiencias interactivas ricas (como carruseles 3D) y un asistente virtual (Chatbot) integrado.

El proyecto está construido como una Single Page Application (SPA) altamente optimizada, utilizando las últimas versiones del ecosistema React y consumiendo una API RESTful desarrollada en Django.

### Stack Tecnológico Principal
*   **Core:** React v19 + Vite v8
*   **Enrutamiento:** React Router DOM v7
*   **Estilos:** Tailwind CSS v4 (con tokens de diseño por variables CSS)
*   **Animaciones y UI:** Framer Motion v13
*   **Peticiones HTTP:** Axios v1.20
*   **Autenticación:** JSON Web Tokens (JWT) con `jwt-decode`
*   **Asistente Virtual:** `react-chatbot-kit`
*   **Despliegue Configurado:** Vercel (`vercel.json`)

---

## 2. Estructura de Directorios (Architecture)
El proyecto sigue una arquitectura modular basada en responsabilidades, separando claramente la lógica de negocio, la interfaz y los servicios de red[cite: 4].

```text
folium-web-app/
├── public/               # Archivos estáticos públicos
├── src/                  # Código fuente principal
│   ├── api/              # Configuración de Axios y servicios REST (endpoints)
│   ├── assets/           # Imágenes, íconos estáticos y tipografías locales
│   ├── auth/             # Contexto de autenticación, Protected Routes y lógica JWT
│   ├── chatbot/          # Configuración del bot (ActionProvider, MessageParser)
│   ├── components/       # Componentes de UI reutilizables (Cards, Modals, Drawers)
│   ├── hooks/            # Custom Hooks (ej. useAuth, useTheme)
│   ├── pages/            # Vistas principales atadas al enrutamiento
│   ├── App.jsx           # Enrutador principal y Providers globales
│   ├── index.css         # Tailwind directives y variables CSS maestras
│   └── main.jsx          # Punto de entrada de React (createRoot)
├── .env                  # Variables de entorno (ej. VITE_API_URL)
├── eslint.config.js      # Reglas de linting
├── vercel.json           # Configuración de despliegue y rewrites
└── vite.config.js        # Configuración del bundler
```

---


## 3. Sistema de Enrutamiento (Routing & Layouts)
La navegación está gestionada por `react-router-dom` utilizando un sistema de Layouts anidados y protección de rutas por Roles (`USER`, `LIBRARIAN`, `ADMIN`).

### Top-Level Layout
Todas las rutas están envueltas dentro de `<BotLayout>`, lo que garantiza que el Chatbot mantenga su estado e historial de conversación sin importar por qué pantallas navegue el usuario.

### Mapa de Rutas
*   **Rutas Públicas:**
    *   `/` ➔ `FoliumLanding` (Landing page)
    *   `/login` | `/register` ➔ Envueltas en `AuthLayout`
    *   `/book/:ISBN` ➔ `BookDetail` (Vista pública de un volumen específico)
    *   `/test` ➔ Ruta de pruebas (Solo visible en entornos `DEV`)
*   **Rutas Protegidas (Shared):** Requieren rol `USER`, `LIBRARIAN` o `ADMIN`.
    *   `/user/catalog` ➔ `BookCatalog` (Búsqueda y filtros)
    *   `/user/favourites` ➔ Colección personal
    *   *Envueltas en:* `UserLayout`
*   **Rutas Privadas (Staff):** Requieren rol `LIBRARIAN` o `ADMIN`.
    *   `/librarian/inventory` ➔ `Inventory` (Gestión de catálogo físico/digital)
    *   *Envueltas en:* `UserLayout`
*   **Rutas de Administración:** Requieren rol `ADMIN`.
    *   `/admin/dashboard` ➔ Métricas y panel central
    *   `/admin/dashboard/settings` ➔ Configuración global
    *   *Envueltas en:* `LibrarianLayout`
*   **Fallback:** `*` ➔ `Error404`

---

## 4. Servicios y Conexión Backend (API Layer)
Ubicados en `src/api/`, los servicios encapsulan las llamadas a la API de Django, aplicando el principio DRY (Don't Repeat Yourself). 

### Autenticación (JWT)
El servicio de autenticación gestiona la obtención de los tokens y su almacenamiento en el cliente:
*   **Endpoint:** `POST /api/v1/token/`
*   **Almacenamiento:** `localStorage` (`accessToken`, `refreshToken`).
*   **Flujo:** `login()` procesa las credenciales y guarda los tokens, mientras que `logout()` limpia la sesión local.

### Módulos de Datos (CRUD)
Cada entidad tiene su propio servicio exportado, exponiendo los métodos estándar (`getAll`, `getById`, `create`, `update`, `patch`, `remove`):
*   **`authorService`:** `/api/v1/author/`
*   **`bookService`:** `/api/v1/book/`
*   **`genreService`:** `/api/v1/genre/`
*   **`itemService`:** `/api/v1/items/` (Gestión de ejemplares físicos)
*   **`loanService`:** `/api/v1/loan/` (Gestión de préstamos)

*Nota de Seguridad:* Las peticiones requieren la inyección del `accessToken` (manejado vía Interceptores de Axios) y las rutas críticas requieren privilegios de `LIBRARIAN` o superiores en el backend.

---

## 5. Gestión del Estado (State Management)
La aplicación evita dependencias pesadas (como Redux) priorizando las herramientas nativas de React:

1.  **Context API (Estado Global):**
    *   `AuthProvider`: Administra los datos del usuario en sesión, su rol y expone el hook `useAuth()`.
    *   `ThemeProvider`: Administra el modo de color (Oscuro/Claro), interactuando con el DOM (`<html class="dark">`) y persistiendo la selección en `localStorage`.
2.  **Estado Local (Componentes):**
    *   `useState` y `useMemo` se utilizan en vistas como el Catálogo (`BookCatalog`) para filtrar grandes listas de volúmenes en tiempo real por texto, precio y categoría sin afectar el rendimiento global.

---

## 6. Sistema de Diseño y Componentes Clave (UI)
El proyecto utiliza Tailwind v4 con variables CSS personalizadas que definen la estética corporativa (ej. `--color-tertiary-container`, `--color-background`).

### Componentes Destacados (`src/components/`)
*   **`BookCoverFlow`:** Carrusel 3D impulsado por `framer-motion` que renderiza tarjetas de libros con físicas de rebote y perspectiva espacial.
*   **`FilterSidebar` / `FilterDrawer`:** Sistema de filtrado modular tipo acordeón.
*   **`CatalogBookCard`:** Tarjeta de volumen que integra el formato de moneda local y acciones de reserva.
*   **`FoliumBot`:** Componente flotante de asistente virtual que lee el rol del `AuthProvider` para ignorar o responder consultas sobre rutas restringidas (como el inventario o dashboard).
*   **`Toast`:** Sistema de notificaciones efímeras (feedbacks de "Guardado en favoritos", "Reserva confirmada").

---

## 7. Guía de Desarrollo (Quick Start)

### Requisitos Previos
*   Node.js (v18 o superior recomendado)
*   npm o yarn

### Instalación y Ejecución
1.  Clonar el repositorio.
    
    Con SSH:
    ```bash
    git clone git@github.com:Facundo177/folium-web-app.git
    ```
    Con HTTPS:
    ```bash
    git clone https://github.com/Facundo177/folium-web-app.git
    ```
2.  Instalar dependencias:
    ```bash
    npm install
    ```
3.  Configurar variables de entorno: Crear un archivo `.env` en la raíz (ej. `VITE_API_URL=http://localhost:8000/api/v1`).
4.  Iniciar el servidor de desarrollo (Vite):
    ```bash
    npm run dev
    ```
5. Para interrumpir la ejecución del servidor local
    *Ctrl + c* en la terminal

### Comandos Disponibles
*   `npm run build`: Compila la aplicación para producción en la carpeta `dist/`.
*   `npm run lint`: Ejecuta ESLint para mantener el estándar de código.
*   `npm run preview`: Previsualiza el build de producción localmente.