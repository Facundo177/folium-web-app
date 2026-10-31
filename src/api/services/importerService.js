import api from '../axiosConfig';

/**
 * Límites de tamaño para proteger el proxy serverless de Vercel (límite estricto de 4.5 MB por request).
 * - .xlsx (ZIP binario no divisible sin descomprimir): máximo 4 MB.
 * - Formatos divisibles (.csv, .tsv, .txt, .bib, .mrc, .marc, .xml, .marcxml): hasta 20 MB en tandas de ~3.5 MB.
 */
export const IMPORTER_LIMITS = {
  MAX_XLSX_BYTES: 4 * 1024 * 1024, // 4 MB
  MAX_TOTAL_BYTES: 20 * 1024 * 1024, // 20 MB
  CHUNK_MAX_BYTES: Math.floor(3.5 * 1024 * 1024), // 3.5 MB por tanda
  PREVIEW_SLICE_BYTES: 256 * 1024, // 256 KB para detección rápida en preview
  COVER_BATCH_SIZE: 15, // Micro-tandas de hasta 15 ISBNs para búsqueda de portadas sin timeout
};

const VALID_EXTENSIONS = [
  '.xlsx',
  '.csv',
  '.tsv',
  '.txt',
  '.bib',
  '.mrc',
  '.marc',
  '.xml',
  '.marcxml',
];

/**
 * Valida la extensión y el tamaño del archivo según su formato.
 * @param {File} file
 */
export function validateImporterFile(file) {
  if (!file) {
    return { valid: false, error: 'No se seleccionó ningún archivo.' };
  }

  const lowerName = (file.name || '').toLowerCase();
  const hasValidExt = VALID_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  if (!hasValidExt) {
    return {
      valid: false,
      error:
        'Por favor selecciona un archivo con formato válido (.xlsx, .csv, .tsv, .txt, .bib, .mrc, .marc o .xml).',
    };
  }

  const isXlsx = lowerName.endsWith('.xlsx');

  if (isXlsx && file.size > IMPORTER_LIMITS.MAX_XLSX_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `El archivo Excel (.xlsx) pesa ${sizeMb} MB y supera el límite de 4 MB permitido por el servidor para planillas comprimidas. Guárdalo como archivo .CSV (que admite hasta 20 MB mediante envío en tandas) y vuelve a intentarlo.`,
    };
  }

  if (!isXlsx && file.size > IMPORTER_LIMITS.MAX_TOTAL_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `El archivo pesa ${sizeMb} MB y supera el máximo permitido de 20 MB por operación.`,
    };
  }

  const estimatedChunks = isXlsx
    ? 1
    : Math.max(1, Math.ceil(file.size / IMPORTER_LIMITS.CHUNK_MAX_BYTES));

  return {
    valid: true,
    isXlsx,
    isChunked: estimatedChunks > 1,
    estimatedChunks,
  };
}

/**
 * Divide un archivo MARC 21 binario (ISO 2709) en tandas cortando en el terminador de registro 0x1D.
 */
function splitMarc21Bytes(bytes, fileName, fileType, maxChunkBytes) {
  const chunks = [];
  let offset = 0;
  let totalRecords = 0;

  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0x1d) totalRecords++;
  }

  while (offset < bytes.length) {
    if (offset + maxChunkBytes >= bytes.length) {
      chunks.push(
        new File([bytes.subarray(offset)], fileName, {
          type: fileType || 'application/marc',
        })
      );
      break;
    }

    let cutIdx = -1;
    const searchEnd = Math.min(bytes.length - 1, offset + maxChunkBytes);
    for (let i = searchEnd; i >= offset; i--) {
      if (bytes[i] === 0x1d) {
        cutIdx = i + 1;
        break;
      }
    }

    if (cutIdx === -1 || cutIdx <= offset) {
      cutIdx = searchEnd + 1;
    }

    chunks.push(
      new File([bytes.subarray(offset, cutIdx)], fileName, {
        type: fileType || 'application/marc',
      })
    );
    offset = cutIdx;
  }

  return { chunks, estimatedTotalRows: totalRecords };
}

/**
 * Divide un archivo MARCXML en tandas agrupando bloques <record>...</record> completos.
 */
function splitMarcXmlText(text, fileName, fileType, maxChunkBytes) {
  const recordRegex = /<(?:\w+:)?record[\s>][\s\S]*?<\/(?:\w+:)?record>/gi;
  const records = text.match(recordRegex) || [];
  if (records.length === 0) {
    return {
      chunks: [new File([text], fileName, { type: fileType || 'application/xml' })],
      estimatedTotalRows: 0,
    };
  }

  const xmlHeader =
    '<?xml version="1.0" encoding="UTF-8"?>\n<collection xmlns="http://www.loc.gov/MARC21/slim">\n';
  const xmlFooter = '\n</collection>';
  const wrapperOverhead = new TextEncoder().encode(xmlHeader + xmlFooter).length + 64;

  const chunks = [];
  let currentBatch = [];
  let currentBytes = wrapperOverhead;
  const encoder = new TextEncoder();

  for (const rec of records) {
    const recBytes = encoder.encode(rec + '\n').length;
    if (currentBatch.length > 0 && currentBytes + recBytes > maxChunkBytes) {
      const xmlContent = xmlHeader + currentBatch.join('\n') + xmlFooter;
      chunks.push(new File([xmlContent], fileName, { type: fileType || 'application/xml' }));
      currentBatch = [rec];
      currentBytes = wrapperOverhead + recBytes;
    } else {
      currentBatch.push(rec);
      currentBytes += recBytes;
    }
  }

  if (currentBatch.length > 0) {
    const xmlContent = xmlHeader + currentBatch.join('\n') + xmlFooter;
    chunks.push(new File([xmlContent], fileName, { type: fileType || 'application/xml' }));
  }

  return { chunks, estimatedTotalRows: records.length };
}

/**
 * Divide un archivo BibTeX (.bib) en tandas cortando entre entradas @tipo{...}.
 */
function splitBibTexText(text, fileName, fileType, maxChunkBytes) {
  const parts = text.split(/(?=\n@[a-zA-Z]+\s*\{)/);
  const encoder = new TextEncoder();
  const chunks = [];
  let currentParts = [];
  let currentBytes = 0;
  let totalEntries = 0;

  for (const part of parts) {
    if (/@[a-zA-Z]+\s*\{/.test(part)) {
      totalEntries++;
    }
    const partBytes = encoder.encode(part).length;
    if (currentParts.length > 0 && currentBytes + partBytes > maxChunkBytes) {
      chunks.push(
        new File([currentParts.join('')], fileName, {
          type: fileType || 'application/x-bibtex',
        })
      );
      currentParts = [part];
      currentBytes = partBytes;
    } else {
      currentParts.push(part);
      currentBytes += partBytes;
    }
  }

  if (currentParts.length > 0) {
    chunks.push(
      new File([currentParts.join('')], fileName, {
        type: fileType || 'application/x-bibtex',
      })
    );
  }

  return { chunks, estimatedTotalRows: totalEntries };
}

/**
 * Divide un archivo CSV / TSV / TXT operando sobre bytes crudos para preservar cualquier encoding
 * (UTF-8, Latin-1, CP1252) e inyectando la fila de encabezados al comienzo de cada tanda.
 */
function splitDelimitedBytes(bytes, fileName, fileType, maxChunkBytes) {
  let firstNewline = -1;
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0x0a) {
      firstNewline = i;
      break;
    }
  }

  if (firstNewline === -1 || firstNewline >= bytes.length - 1) {
    return {
      chunks: [new File([bytes], fileName, { type: fileType || 'text/csv' })],
      estimatedTotalRows: 0,
    };
  }

  // Contar saltos de línea no vacíos aproximados para total_rows
  let totalLines = 0;
  for (let i = firstNewline + 1; i < bytes.length; i++) {
    if (bytes[i] === 0x0a) totalLines++;
  }
  if (bytes[bytes.length - 1] !== 0x0a) totalLines++;

  const headerBytes = bytes.subarray(0, firstNewline + 1);
  const maxBodyBytes = Math.max(1024, maxChunkBytes - headerBytes.length);

  const chunks = [];
  let offset = firstNewline + 1;

  while (offset < bytes.length) {
    if (offset + maxBodyBytes >= bytes.length) {
      const slice = bytes.subarray(offset);
      chunks.push(
        new File([headerBytes, slice], fileName, {
          type: fileType || 'text/csv',
        })
      );
      break;
    }

    let cutIdx = -1;
    const searchEnd = Math.min(bytes.length - 1, offset + maxBodyBytes);
    for (let i = searchEnd; i >= offset; i--) {
      if (bytes[i] === 0x0a) {
        cutIdx = i + 1;
        break;
      }
    }

    if (cutIdx === -1 || cutIdx <= offset) {
      // Si una fila aislada es inusualmente larga, avanzar hasta el próximo salto de línea
      for (let i = searchEnd + 1; i < bytes.length; i++) {
        if (bytes[i] === 0x0a) {
          cutIdx = i + 1;
          break;
        }
      }
      if (cutIdx === -1) cutIdx = bytes.length;
    }

    const slice = bytes.subarray(offset, cutIdx);
    chunks.push(
      new File([headerBytes, slice], fileName, {
        type: fileType || 'text/csv',
      })
    );
    offset = cutIdx;
  }

  return { chunks, estimatedTotalRows: totalLines };
}

/**
 * Divide un archivo en paquetes seguros menores a maxChunkBytes respetando límites de fila/registro.
 * @param {File} file
 * @param {number} [maxChunkBytes]
 * @returns {Promise<{chunks: File[], estimatedTotalRows: number | null}>}
 */
export async function splitFileIntoChunks(
  file,
  maxChunkBytes = IMPORTER_LIMITS.CHUNK_MAX_BYTES
) {
  const lowerName = (file.name || '').toLowerCase();

  if (file.size <= maxChunkBytes || lowerName.endsWith('.xlsx')) {
    return { chunks: [file], estimatedTotalRows: null };
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // 1. MARC 21 binario (.mrc, .marc o detección por cabecera numérica + 0x1E)
  const isMarcBinary =
    lowerName.endsWith('.mrc') ||
    lowerName.endsWith('.marc') ||
    (bytes.length >= 24 &&
      bytes[0] >= 48 &&
      bytes[0] <= 57 &&
      bytes.subarray(0, 1024).includes(0x1e));

  if (isMarcBinary) {
    return splitMarc21Bytes(bytes, file.name, file.type, maxChunkBytes);
  }

  // 2. MARCXML (.xml, .marcxml)
  const headText = new TextDecoder('utf-8', { fatal: false })
    .decode(bytes.subarray(0, 1024))
    .toLowerCase();

  if (
    lowerName.endsWith('.xml') ||
    lowerName.endsWith('.marcxml') ||
    headText.includes('<record') ||
    headText.includes('<collection')
  ) {
    const fullText = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    return splitMarcXmlText(fullText, file.name, file.type, maxChunkBytes);
  }

  // 3. BibTeX (.bib)
  if (lowerName.endsWith('.bib') || /@[a-zA-Z]+\s*\{/.test(headText)) {
    const fullText = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    return splitBibTexText(fullText, file.name, file.type, maxChunkBytes);
  }

  // 4. CSV / TSV / TXT por defecto
  return splitDelimitedBytes(bytes, file.name, file.type, maxChunkBytes);
}

const BASE = '/importer/';
const UPLOAD_TIMEOUT = 120000; // 2 minutos por tanda

export const importerService = {
  /**
   * Envía el archivo (o solo una muestra inicial si supera el límite por tanda)
   * para inspeccionar columnas, total de filas y obtener una muestra con mapeo sugerido.
   * @param {File} file
   */
  preview: async (file) => {
    if (file.size <= IMPORTER_LIMITS.CHUNK_MAX_BYTES) {
      const formData = new FormData();
      formData.append('file', file);
      return api.post(`${BASE}preview/`, formData, {
        timeout: UPLOAD_TIMEOUT,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    // Si el archivo supera 3.5 MB, enviamos únicamente un fragmento ligero de vista previa
    const { chunks: previewChunks, estimatedTotalRows } = await splitFileIntoChunks(
      file,
      IMPORTER_LIMITS.PREVIEW_SLICE_BYTES
    );
    const { chunks: fullChunks } = await splitFileIntoChunks(
      file,
      IMPORTER_LIMITS.CHUNK_MAX_BYTES
    );

    const formData = new FormData();
    formData.append('file', previewChunks[0]);

    const response = await api.post(`${BASE}preview/`, formData, {
      timeout: UPLOAD_TIMEOUT,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response?.data) {
      if (estimatedTotalRows && estimatedTotalRows > response.data.total_rows) {
        response.data.total_rows = estimatedTotalRows;
      }
      response.data.total_chunks = fullChunks.length;
    }

    return response;
  },

  /**
   * Ejecuta un dry-run de validación sobre el archivo con el mapa de columnas seleccionado.
   * Si el archivo supera 3.5 MB, lo divide en tandas secuenciales y consolida los resultados.
   * @param {File} file
   * @param {Record<string, string>} mapping
   * @param {Record<string, string>} [options]
   * @param {(progress: {current: number, total: number}) => void} [onProgress]
   */
  simulate: async (file, mapping, options = {}, onProgress) => {
    const { chunks } = await splitFileIntoChunks(file, IMPORTER_LIMITS.CHUNK_MAX_BYTES);

    const aggregated = {
      success: true,
      total_rows: 0,
      valid_rows: 0,
      new_books: 0,
      new_books_count: 0,
      existing_books: 0,
      existing_books_count: 0,
      rows_with_errors: 0,
      errors_count: 0,
      error_details: [],
      errors: [],
      sample_previews: [],
      preview_items: [],
      total_chunks: chunks.length,
    };

    let rowOffset = 0;
    const seenIsbns = [];
    const seenTitles = [];

    for (let i = 0; i < chunks.length; i++) {
      onProgress?.({ current: i + 1, total: chunks.length });

      const chunkOptions =
        chunks.length > 1
          ? {
              ...options,
              seen_isbns: seenIsbns.slice(0, 5000),
              seen_titles: seenTitles.slice(0, 5000),
            }
          : options;

      const formData = new FormData();
      formData.append('file', chunks[i]);
      formData.append('mapping', JSON.stringify(mapping));
      formData.append('options', JSON.stringify(chunkOptions));

      const response = await api.post(`${BASE}simulate/`, formData, {
        timeout: UPLOAD_TIMEOUT,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data || {};
      const chunkRows = data.total_rows || 0;

      if (Array.isArray(data.discovered_isbns)) {
        for (const isbn of data.discovered_isbns) {
          if (seenIsbns.length < 5000) seenIsbns.push(isbn);
        }
      }
      if (Array.isArray(data.discovered_titles)) {
        for (const title of data.discovered_titles) {
          if (seenTitles.length < 5000) seenTitles.push(title);
        }
      }

      aggregated.total_rows += chunkRows;
      aggregated.valid_rows += data.valid_rows || 0;
      aggregated.new_books += data.new_books ?? data.new_books_count ?? 0;
      aggregated.existing_books += data.existing_books ?? data.existing_books_count ?? 0;
      aggregated.rows_with_errors += data.rows_with_errors ?? data.errors_count ?? 0;

      const chunkErrors = data.error_details || data.errors || [];
      for (const err of chunkErrors) {
        if (aggregated.error_details.length < 50) {
          aggregated.error_details.push({
            ...err,
            row: (err.row || 2) + rowOffset,
          });
        }
      }

      const chunkPreviews = data.sample_previews || data.preview_items || [];
      for (const prev of chunkPreviews) {
        if (aggregated.sample_previews.length < 6) {
          aggregated.sample_previews.push(prev);
        }
      }

      rowOffset += chunkRows;
    }

    aggregated.new_books_count = aggregated.new_books;
    aggregated.existing_books_count = aggregated.existing_books;
    aggregated.errors_count = aggregated.rows_with_errors;
    aggregated.errors = aggregated.error_details;
    aggregated.preview_items = aggregated.sample_previews;

    return { data: aggregated };
  },

  /**
   * Ejecuta la importación masiva definitiva en base de datos.
   * Si el archivo supera 3.5 MB, envía cada tanda en una petición independiente bajo el límite de Vercel.
   * @param {File} file
   * @param {Record<string, string>} mapping
   * @param {Record<string, string>} [options]
   * @param {(progress: {current: number, total: number}) => void} [onProgress]
   */
  execute: async (file, mapping, options = {}, onProgress) => {
    const { chunks } = await splitFileIntoChunks(file, IMPORTER_LIMITS.CHUNK_MAX_BYTES);

    let importedBooks = 0;
    let importedItems = 0;
    let skippedRows = 0;
    let coversAssigned = 0;
    const pendingCoverIsbnsSet = new Set();

    for (let i = 0; i < chunks.length; i++) {
      onProgress?.({ current: i + 1, total: chunks.length });

      const formData = new FormData();
      formData.append('file', chunks[i]);
      formData.append('mapping', JSON.stringify(mapping));
      formData.append('options', JSON.stringify(options));

      const response = await api.post(`${BASE}execute/`, formData, {
        timeout: UPLOAD_TIMEOUT,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data || {};
      importedBooks += data.imported_books || 0;
      importedItems += data.imported_items || 0;
      skippedRows += data.skipped_rows || 0;
      coversAssigned += data.covers_assigned || 0;

      if (Array.isArray(data.pending_cover_isbns)) {
        for (const isbn of data.pending_cover_isbns) {
          if (isbn) pendingCoverIsbnsSet.add(String(isbn));
        }
      }
    }

    const pendingCoverIsbns = Array.from(pendingCoverIsbnsSet);

    return {
      data: {
        success: true,
        imported_books: importedBooks,
        imported_items: importedItems,
        skipped_rows: skippedRows,
        covers_assigned: coversAssigned,
        pending_cover_isbns: pendingCoverIsbns,
        total_chunks: chunks.length,
        message: `Se importaron con éxito ${importedBooks} obras y ${importedItems} ejemplares físicos${
          chunks.length > 1 ? ` (procesados en ${chunks.length} tandas)` : ''
        }.`,
      },
    };
  },

  /**
   * Busca y asigna portadas para una micro-tanda de hasta 25 ISBNs.
   * @param {string[]} isbns
   */
  fetchCoversBatch: async (isbns) => {
    return api.post(
      `${BASE}fetch-covers/`,
      { isbns },
      {
        timeout: 60000,
      }
    );
  },

  /**
   * Procesa una lista de ISBNs pendientes en micro-tandas de COVER_BATCH_SIZE (15)
   * para evitar timeouts en Vercel y reportar progreso en tiempo real.
   * @param {string[]} isbns
   * @param {(progress: {processed: number, total: number, found: number, notFound: number}) => void} [onProgress]
   * @param {() => boolean} [shouldStop]
   */
  fetchCoversInBatches: async (isbns = [], onProgress, shouldStop) => {
    const cleanList = Array.from(new Set((isbns || []).filter(Boolean)));
    const total = cleanList.length;
    if (total === 0) {
      return { processed: 0, total: 0, found: 0, notFound: 0, stopped: false };
    }

    const batchSize = IMPORTER_LIMITS.COVER_BATCH_SIZE;
    let processed = 0;
    let found = 0;
    let notFound = 0;
    let stopped = false;

    for (let offset = 0; offset < total; offset += batchSize) {
      if (shouldStop?.()) {
        stopped = true;
        break;
      }

      const batch = cleanList.slice(offset, offset + batchSize);
      try {
        const res = await api.post(
          `${BASE}fetch-covers/`,
          { isbns: batch },
          { timeout: 60000 }
        );
        const d = res?.data || {};
        const batchFound = d.found || 0;
        const batchProcessed = d.processed || batch.length;
        found += batchFound;
        notFound += Math.max(0, batchProcessed - batchFound);
        processed += batchProcessed;
      } catch (err) {
        console.warn('Error parcial buscando micro-tanda de portadas:', err);
        processed += batch.length;
        notFound += batch.length;
      }

      onProgress?.({
        processed: Math.min(processed, total),
        total,
        found,
        notFound,
      });
    }

    return {
      processed: Math.min(processed, total),
      total,
      found,
      notFound,
      stopped,
    };
  },
};
