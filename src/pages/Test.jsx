import { useState } from "react";
import { authorService } from "../api/services/authorService";
import { bookService } from "../api/services/bookService";
import { genreService } from "../api/services/genreService";
import { itemService } from "../api/services/itemService";
import { loanService } from "../api/services/loanService";
import { useAuth } from "../auth/AuthProvider";

// Para probar otro recurso: importa su servicio arriba y agrega aquí su getAll,
// una key única para guardar el resultado y la ruta que quieres mostrar.
const collectionEndpoints = [
  { key: "items", label: "Ejemplares", path: "/items/", getAll: itemService.getAll },
  { key: "loans", label: "Préstamos", path: "/loan/", getAll: loanService.getAll },
  { key: "books", label: "Libros", path: "/book/", getAll: bookService.getAll },
  { key: "authors", label: "Autores", path: "/author/", getAll: authorService.getAll },
  { key: "genres", label: "Géneros", path: "/genre/", getAll: genreService.getAll },
];

export default function Test() {
  const { user, login, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginResult, setLoginResult] = useState(null);
  const [requests, setRequests] = useState({});

  // useAuth comparte la sesión de la app: login guarda los tokens y Axios los
  // adjunta automáticamente en las peticiones protegidas.
  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginResult(null);

    try {
      const loggedInUser = await login(username, password);
      setLoginResult({ ok: true, data: loggedInUser });
    } catch (error) {
      setLoginResult({
        ok: false,
        status: error.response?.status ?? null,
        data: error.response?.data ?? { message: error.message },
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGetAll = async (endpoint) => {
    // Cada endpoint guarda su propio estado para permitir probarlos por separado.
    setRequests((current) => ({
      ...current,
      [endpoint.key]: { loading: true },
    }));

    try {
      // Ejemplo para libros: await bookService.getAll(). Axios devuelve
      // { data, status, headers, ... }; data contiene el JSON del backend.
      const response = await endpoint.getAll();
      setRequests((current) => ({
        ...current,
        [endpoint.key]: {
          loading: false,
          status: response.status,
          data: response.data,
        },
      }));
    } catch (error) {
      // HTTP 401/403/etc. llega en error.response; sin respuesta, suele ser
      // un problema de red o timeout y solo tenemos error.message.
      setRequests((current) => ({
        ...current,
        [endpoint.key]: {
          loading: false,
          status: error.response?.status ?? null,
          data: error.response?.data ?? { message: error.message },
        },
      }));
    }
  };

  return (
    <main className="min-h-screen bg-background text-on-surface font-sans">
      <div className="mx-auto w-full max-w-5xl px-margin-edge py-stack-lg">
        <header className="border-b border-outline-variant pb-stack-md">
          <p className="text-label-caps text-on-surface-variant">Desarrollo</p>
          <h1 className="mt-2 text-headline-lg font-serif">Prueba de conexión API</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Iniciá sesión y ejecutá las consultas de colección manualmente.
          </p>
        </header>

        <section className="grid gap-stack-md border-b border-outline-variant py-stack-lg md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <h2 className="text-title-lg font-medium">Autenticación</h2>
            {user ? (
              <div className="mt-3 flex flex-wrap items-center gap-base">
                <p className="text-body-md">
                  Sesión activa: <strong>{user.username}</strong> ({user.role})
                </p>
                <button
                  type="button"
                  onClick={logout}
                  className="border border-outline-variant px-3 py-2 text-label-caps hover:bg-surface-container"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <p className="mt-3 text-body-md text-on-surface-variant">
                Sin sesión. Las peticiones protegidas probablemente respondan 401.
              </p>
            )}
          </div>

          <form onSubmit={handleLogin} className="grid gap-base sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-label-caps">
              Usuario
              <input
                required
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md normal-case"
                placeholder="admin"
              />
            </label>
            <label className="flex flex-col gap-1 text-label-caps">
              Contraseña
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md normal-case"
                placeholder="Contraseña"
              />
            </label>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="bg-primary px-4 py-2 text-label-caps text-on-primary hover:opacity-90 disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
            >
              {isLoggingIn ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          {loginResult && (
            <div className="md:col-span-2" role="status">
              <p className={loginResult.ok ? "text-green-700" : "text-error"}>
                {loginResult.ok
                  ? `Login correcto: ${loginResult.data?.role ?? "rol desconocido"}`
                  : `Login fallido${loginResult.status ? ` (HTTP ${loginResult.status})` : ""}`}
              </p>
              <pre className="mt-2 overflow-x-auto border border-outline-variant bg-surface-container-lowest p-3 text-xs">
                {JSON.stringify(loginResult.data, null, 2)}
              </pre>
            </div>
          )}
        </section>

        <section className="py-stack-lg">
          <h2 className="text-title-lg font-medium">GET de colecciones</h2>
          {/* Para añadir un GET nuevo, registra su servicio en collectionEndpoints;
              este map crea el botón y el panel de respuesta automáticamente. */}
          <div className="mt-stack-sm divide-y divide-outline-variant">
            {collectionEndpoints.map((endpoint) => {
              const result = requests[endpoint.key];

              return (
                <article key={endpoint.key} className="py-stack-sm">
                  <div className="flex flex-wrap items-center gap-base">
                    <button
                      type="button"
                      onClick={() => handleGetAll(endpoint)}
                      disabled={result?.loading}
                      className="bg-surface-container-high px-4 py-2 text-label-caps hover:bg-surface-container-highest disabled:opacity-60"
                    >
                      {result?.loading ? "Consultando..." : `GET ${endpoint.path}`}
                    </button>
                    <span className="text-body-md">{endpoint.label}</span>
                    {result && !result.loading && (
                      <span className={result.status >= 200 && result.status < 300 ? "text-green-700" : "text-error"}>
                        {result.status ? `HTTP ${result.status}` : "Error de conexión"}
                      </span>
                    )}
                  </div>
                  {result && !result.loading && (
                    <pre className="mt-3 max-h-96 overflow-auto border border-outline-variant bg-surface-container-lowest p-3 text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}