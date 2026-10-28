/**
 * Vercel Serverless Function: Proxy Reverso para API y Archivos Multimedia (AWS EC2).
 *
 * Ubicación: /api/proxy.js en la raíz del proyecto.
 *
 * Funcionalidades:
 * 1. Proxy para endpoints de API (/api/v1/...) hacia Django REST en AWS.
 * 2. Proxy para archivos multimedia (/media/books/covers/...) sirviéndolos en HTTPS seguro
 *    con caché y Content-Type adecuado, solucionando el bloqueo de Mixed Content para imágenes.
 * 3. Streaming directo de respuestas HTTP vía Readable.fromWeb() para minimizar TTFB y uso de RAM.
 * 4. Sanitización defensiva contra Path Traversal ('..') y validación de prefijos por lista blanca.
 */

import { Readable } from "node:stream";

export const config = {
  api: {
    bodyParser: false, // Permite transmitir streams crudos (JSON, multipart/form-data)
  },
};

const ALLOWED_PREFIXES = new Set(["api", "media"]);

const MIME_TYPES = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
  ico: "image/x-icon",
};

export default async function handler(req, res) {
  const BACKEND_HOST = process.env.BACKEND_HOST || "http://54.160.130.29";

  try {
    const rawPrefix = String(req.query?.prefix || "api").toLowerCase();
    const prefix = ALLOWED_PREFIXES.has(rawPrefix) ? rawPrefix : "api";

    const rawPath = req.query?.path || "";
    const cleanPath = Array.isArray(rawPath) ? rawPath.join("/") : String(rawPath);

    // Sanitización contra path traversal y caracteres nulos
    const sanitizedPath = cleanPath
      .replace(/\\/g, "/")
      .replace(/\.\./g, "")
      .replace(/\0/g, "")
      .replace(/^\/+/, "");

    // Si se accede directamente a /api/proxy sin path
    if (!sanitizedPath && prefix === "api") {
      return res.status(200).json({ status: "ok", message: "Folium API & Media Proxy active" });
    }

    let normalizedPath = sanitizedPath;
    // Para endpoints de API (Django DRF), asegurar la barra final si no es un archivo con extensión
    if (prefix === "api") {
      const lastSegment = sanitizedPath.split("/").pop();
      const hasExtension = lastSegment && lastSegment.includes(".");
      normalizedPath = sanitizedPath.endsWith("/") || hasExtension
        ? sanitizedPath
        : `${sanitizedPath}/`;
    }

    // Reconstruir query params (excluyendo parámetros de control 'path' y 'prefix')
    const searchParams = new URLSearchParams();
    if (req.query) {
      for (const [key, val] of Object.entries(req.query)) {
        if (key !== "path" && key !== "prefix") {
          if (Array.isArray(val)) {
            val.forEach((v) => searchParams.append(key, v));
          } else if (val !== undefined && val !== null) {
            searchParams.append(key, val);
          }
        }
      }
    }
    const queryString = searchParams.toString();

    // Construir la URL completa hacia AWS EC2
    const targetUrl = `${BACKEND_HOST.replace(/\/+$/, "")}/${prefix}/${normalizedPath}${
      queryString ? `?${queryString}` : ""
    }`;

    // Clonar headers eliminando los conflictivos de host/conexión
    const forwardHeaders = {};
    for (const [key, value] of Object.entries(req.headers || {})) {
      const lower = key.toLowerCase();
      if (!["host", "connection", "content-length"].includes(lower) && value) {
        forwardHeaders[key] = value;
      }
    }

    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
    };

    // Leer el cuerpo para métodos que transmiten payload
    if (!["GET", "HEAD"].includes(req.method.toUpperCase())) {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      if (chunks.length > 0) {
        fetchOptions.body = Buffer.concat(chunks);
      }
    }

    // Consultar a AWS EC2 (servidor a servidor)
    const backendResponse = await fetch(targetUrl, fetchOptions);

    res.status(backendResponse.status);

    // Reenviar headers de respuesta
    backendResponse.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (!["content-encoding", "transfer-encoding"].includes(lowerKey)) {
        res.setHeader(key, val);
      }
    });

    // Si es un archivo multimedia, asegurar Content-Type correcto y caché CDN
    if (prefix === "media") {
      const ext = normalizedPath.split(".").pop()?.toLowerCase();
      if (MIME_TYPES[ext]) {
        res.setHeader("Content-Type", MIME_TYPES[ext]);
      }
      res.setHeader(
        "Cache-Control",
        "public, max-age=604800, s-maxage=604800, stale-while-revalidate=2592000"
      );
    }

    // Transmisión directa por streaming sin almacenar en memoria RAM
    if (backendResponse.body) {
      return Readable.fromWeb(backendResponse.body).pipe(res);
    }

    return res.end();
  } catch (error) {
    console.error("Error en Vercel Proxy:", error);
    return res.status(502).json({
      error: "Bad Gateway",
      detail: "No se pudo establecer conexión con el backend en AWS.",
      ...(process.env.NODE_ENV !== "production" ? { message: error.message } : {}),
    });
  }
}
