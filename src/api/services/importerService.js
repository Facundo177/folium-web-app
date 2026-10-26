import api from '../axiosConfig';

/**
 * Servicio para el importador masivo de catálogos (Fase 1: Excel / CSV / BibTeX).
 * Endpoints:
 * - POST /api/v1/importer/preview/
 * - POST /api/v1/importer/simulate/
 * - POST /api/v1/importer/execute/
 */
const BASE = '/importer/';
const UPLOAD_TIMEOUT = 120000; // 2 minutos para soportar archivos de gran volumen

export const importerService = {
  /**
   * Envía el archivo para inspeccionar columnas, total de filas y obtener una muestra con mapeo sugerido.
   * @param {File} file
   */
  preview: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`${BASE}preview/`, formData, {
      timeout: UPLOAD_TIMEOUT,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Ejecuta un dry-run de validación sobre el archivo con el mapa de columnas seleccionado.
   * @param {File} file
   * @param {Record<string, string>} mapping
   */
  simulate: (file, mapping) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    return api.post(`${BASE}simulate/`, formData, {
      timeout: UPLOAD_TIMEOUT,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Ejecuta la importación masiva definitiva en base de datos.
   * @param {File} file
   * @param {Record<string, string>} mapping
   */
  execute: (file, mapping) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    return api.post(`${BASE}execute/`, formData, {
      timeout: UPLOAD_TIMEOUT,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
