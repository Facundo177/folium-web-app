/**
 * Vercel Serverless Function: Proxy Reverso para el Backend en AWS EC2.
 *
 * NOTA DE UBICACIÓN IMPORTANTE:
 * Este archivo DEBE estar obligatoriamente en la raíz del proyecto:
 *   /api/proxy.js  (NO dentro de /src/api/)
 *
 * Vercel solo detecta y despliega Serverless Functions si residen en la carpeta
 * '/api' de la raíz.
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

    // Si se accede directamente a /api/proxy sin path, devolver estado del servicio
    if (!cleanPath) {
      return res.status(200).json({ status: "ok", message: "Folium API Proxy active" });
    }

    // 2. Asegurar que las rutas de la API terminen con '/' para Django (evita redirects 301)
    const lastSegment = cleanPath.split("/").pop();
    const hasExtension = lastSegment && lastSegment.includes(".");
    const normalizedPath = cleanPath.endsWith("/") || hasExtension
      ? cleanPath
      : `${cleanPath}/`;

    // 3. Reconstruir los query params (excluyendo el parámetro interno 'path' del rewrite)
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

    // 4. Construir la URL completa hacia el backend en AWS
    const targetUrl = `${BACKEND_HOST.replace(/\/+$/, "")}/api/${normalizedPath.replace(/^\/+/, "")}${
      queryString ? `?${queryString}` : ""
    }`;

    // 5. Clonar headers eliminando los conflictivos de host/conexión
    const forwardHeaders = {};
    for (const [key, value] of Object.entries(req.headers || {})) {
      const lower = key.toLowerCase();
      if (!["host", "connection", "content-length"].includes(lower) && value) {
        forwardHeaders[key] = value;
      }
    }

    // 6. Configurar opciones de petición HTTP
    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
    };

    // Leer el cuerpo para métodos que transmiten payload (POST, PUT, PATCH, DELETE)
    if (!["GET", "HEAD"].includes(req.method.toUpperCase())) {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      if (chunks.length > 0) {
        fetchOptions.body = Buffer.concat(chunks);
      }
    }

    // 7. Consultar a AWS EC2 (servidor a servidor, sin restricciones Mixed Content ni CORS)
    const backendResponse = await fetch(targetUrl, fetchOptions);

    // 8. Enviar código de estado HTTP recibido de AWS
    res.status(backendResponse.status);

    // 9. Reenviar headers de respuesta
    backendResponse.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (!["content-encoding", "transfer-encoding"].includes(lowerKey)) {
        res.setHeader(key, val);
      }
    });

    // 10. Devolver el payload al cliente
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
