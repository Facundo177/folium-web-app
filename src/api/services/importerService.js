import api from '../axiosConfig';

/**
 * Servicio para el importador masivo de catálogos (Fase 1: Excel / CSV).
 * Endpoints:
 * - POST /api/v1/importer/preview/
 * - POST /api/v1/importer/simulate/
 * - POST /api/v1/importer/execute/
 */
const BASE = '/importer/';

export const importerService = {
  /**
   * Envía el archivo para inspeccionar columnas, total de filas y obtener una muestra con mapeo sugerido.
   * @param {File} file
   * @returns {Promise<AxiosResponse<{filename: string, total_rows: number, headers: string[], suggested_mapping: Record<string, string>, sample_rows: object[]}>>}
   */
  preview: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`${BASE}preview/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Ejecuta un dry-run de validación sobre el archivo con el mapa de columnas seleccionado.
   * @param {File} file
   * @param {Record<string, string>} mapping
   * @returns {Promise<AxiosResponse<{success: boolean, total_rows: number, valid_rows: number, new_books: number, existing_books: number, rows_with_errors: number, error_details: Array<{row: number, error: string}>, sample_previews: object[]}>>}
   */
  simulate: (file, mapping) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    return api.post(`${BASE}simulate/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Ejecuta la importación masiva definitiva en base de datos.
   * @param {File} file
   * @param {Record<string, string>} mapping
   * @returns {Promise<AxiosResponse<{success: boolean, imported_books: number, imported_items: number, skipped_rows: number, message: string}>>}
   */
  execute: (file, mapping) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    return api.post(`${BASE}execute/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
