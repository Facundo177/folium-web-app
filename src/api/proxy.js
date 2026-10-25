/**
 * Vercel Serverless Function: Proxy Reverso para el Backend en AWS EC2.
 *
 * ¿Por qué es necesario este proxy?
 * 1. Tu frontend en Vercel corre en HTTPS (https://folium-web.vercel.app).
 * 2. Tu backend en AWS corre en HTTP (http://54.160.130.29).
 * 3. Los navegadores bloquean peticiones directas de HTTPS a HTTP (Mixed Content).
 * 4. Las reglas directas de 'rewrites' en vercel.json no permiten destinos externos en HTTP inseguro.
 *
 * Esta Serverless Function se ejecuta del lado del servidor de Vercel (Node.js).
 * Como es comunicación servidor-a-servidor, no sufre restricciones de Mixed Content ni CORS,
 * y devuelve la respuesta en HTTPS al navegador.
 */
export const config = {
  api: {
    bodyParser: false, // Permite transmitir streams crudos (JSON, multipart/form-data para portadas e importador)
  },
};
export default async function handler(req, res) {
  const BACKEND_HOST = process.env.BACKEND_HOST || "http://54.160.130.29";
  try {
    // 1. Extraer la ruta relativa (ej: v1/token/ o v1/genre/)
    const rawPath = req.query?.path || "";
    const cleanPath = Array.isArray(rawPath) ? rawPath.join("/") : rawPath;
    // 2. Reconstruir los query params (excluyendo el parámetro interno 'path' del rewrite)
    const searchParams = new URLSearchParams();
    if (req.query) {
      for (const [key, val] of Object.entries(req.query)) {
        if (key !== "path") {
          if (Array.isArray(val)) {
            val.forEach((v) => searchParams.append(key, v));
          } else if (val !== undefined && val !== null) {
            searchParams.append(key, val);
          }
        }
      }
    }
    const queryString = searchParams.toString();
    // 3. Construir la URL completa hacia el backend en AWS
    const targetUrl = `${BACKEND_HOST.replace(/\/+$/, "")}/api/${cleanPath.replace(/^\/+/, "")}${
      queryString ? `?${queryString}` : ""
    }`;
    // 4. Clonar headers eliminando los conflictivos de host/conexión
    const forwardHeaders = {};
    for (const [key, value] of Object.entries(req.headers || {})) {
      const lower = key.toLowerCase();
      if (!["host", "connection", "content-length"].includes(lower) && value) {
        forwardHeaders[key] = value;
      }
    }
    // 5. Configurar opciones de petición HTTP
    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
    };
    // Leer el cuerpo para métodos no GET/HEAD
    if (!["GET", "HEAD"].includes(req.method.toUpperCase())) {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      if (chunks.length > 0) {
        fetchOptions.body = Buffer.concat(chunks);
      }
    }
    // 6. Consultar a AWS EC2
    const backendResponse = await fetch(targetUrl, fetchOptions);
    // 7. Enviar código de estado
    res.status(backendResponse.status);
    // 8. Reenviar headers de respuesta
    backendResponse.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (!["content-encoding", "transfer-encoding"].includes(lowerKey)) {
        res.setHeader(key, val);
      }
    });
    // 9. Devolver el payload
    const arrayBuffer = await backendResponse.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Error en Vercel API Proxy:", error);
    return res.status(502).json({
      error: "Bad Gateway",
      detail: "No se pudo establecer conexión con el backend en AWS.",
      message: error.message,
    });
  }
}