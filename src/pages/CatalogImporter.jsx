import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Download,
  Check,
  RefreshCw,
  Library,
  BookCopy,
  Info,
} from "lucide-react";
import GoBackButton from "../components/BasicUIComponents/GoBackButton";
import { importerService } from "../api/services/importerService";

const FOLIUM_FIELDS = [
  { id: "title", label: "Título de la Obra", required: true, description: "Nombre principal del libro" },
  { id: "author", label: "Autor(es)", required: true, description: "Nombre y apellido del autor o autores" },
  { id: "isbn", label: "ISBN", required: false, description: "ISBN-10 o ISBN-13 (si falta, se autogenera)" },
  { id: "editorial", label: "Editorial", required: false, description: "Casa publicadora o sello editorial" },
  { id: "year", label: "Año de Publicación", required: false, description: "Año numérico (ej. 1985)" },
  { id: "genre", label: "Género / Materia", required: false, description: "Categoría literaria temática" },
  { id: "inventory_code", label: "Código de Ejemplar (Signatura)", required: false, description: "Identificador del ejemplar físico" },
  { id: "location", label: "Ubicación en Sala", required: false, description: "Estantería, pasillo o sala física" },
  { id: "description", label: "Sinopsis / Resumen", required: false, description: "Breve descripción de la obra" },
];

const SAMPLE_CSV = `Título;Autor;ISBN;Editorial;Año;Género;Código Ejemplar;Ubicación;Descripción
Cien años de soledad;Gabriel García Márquez;9780307474728;Sudamericana;1967;Realismo Mágico;INV-MACONDO-01;Pasillo A - Estante 3;Obra cumbre de la literatura hispanoamericana.
Ficciones;Jorge Luis Borges;9789500419574;Sur;1944;Ficción Filosófica;INV-BORGES-01;Pasillo B - Estante 1;Colección de relatos memorables.
Rayuela;Julio Cortázar;9788466331906;Sudamericana;1963;Novela Experimental;INV-CORTAZAR-01;Pasillo A - Estante 2;Contrarrelato lúdico en París y Buenos Aires.
El túnel;Ernesto Sabato;9789500401494;Sur;1948;Novela Psicológica;INV-SABATO-01;Pasillo C - Estante 4;La confesión de Juan Pablo Castel.
La invención de Morel;Adolfo Bioy Casares;9788420658421;Losada;1940;Ciencia Ficción;INV-BIOY-01;Pasillo B - Estante 2;Clásico de ciencia ficción y misterio.`;

export default function CatalogImporter() {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Estados de comunicación y respuesta
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Paso 2: Vista previa y mapeo
  const [fileHeaders, setFileHeaders] = useState([]);
  const [sampleRows, setSampleRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [mapping, setMapping] = useState({});

  // Paso 3: Simulación (Dry Run)
  const [simulationData, setSimulationData] = useState(null);

  // Paso 4: Resultados finales
  const [executionResult, setExecutionResult] = useState(null);

  const fileInputRef = useRef(null);

  // Descargar plantilla CSV de muestra
  const handleDownloadSample = () => {
    const blob = new Blob(["\uFEFF" + SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "folium_plantilla_catalogo.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Manejo de archivo seleccionado
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    const validExtensions = [".xlsx", ".csv", ".tsv", ".txt"];
    const hasValidExt = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setErrorMessage("Por favor selecciona un archivo con formato válido (.xlsx, .csv, .tsv o .txt).");
      return;
    }

    setFile(selectedFile);
    setErrorMessage("");
  };

  // Cargar archivo y procesar Step 1 -> Step 2
  const handlePreviewUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await importerService.preview(file);
      const data = response.data;
      setFileHeaders(data.headers || []);
      setSampleRows(data.sample_rows || []);
      setTotalRows(data.total_rows || 0);
      setMapping(data.suggested_mapping || {});
      setCurrentStep(2);
    } catch (err) {
      console.error("Error al previsualizar archivo:", err);
      const msg = err.response?.data?.detail || "No se pudo leer el archivo. Revisa que tenga filas y formato válido.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Asignar columna a un campo de Folium
  const handleMappingChange = (fieldId, columnHeader) => {
    setMapping((prev) => {
      const updated = { ...prev };
      if (!columnHeader) {
        delete updated[fieldId];
      } else {
        updated[fieldId] = columnHeader;
      }
      return updated;
    });
  };

  // Ejecutar Step 2 -> Step 3 (Simulación Dry Run)
  const handleRunSimulation = async () => {
    if (!mapping.title || !mapping.author) {
      setErrorMessage("Debes asignar obligatoriamente las columnas para 'Título' y 'Autor(es)'.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await importerService.simulate(file, mapping);
      setSimulationData(response.data);
      setCurrentStep(3);
    } catch (err) {
      console.error("Error al simular importación:", err);
      const msg = err.response?.data?.detail || "Error al ejecutar la simulación.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Ejecutar Step 3 -> Step 4 (Ejecución real en BD)
  const handleExecuteImport = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await importerService.execute(file, mapping);
      setExecutionResult(response.data);
      setCurrentStep(4);
    } catch (err) {
      console.error("Error al ejecutar importación masiva:", err);
      const msg = err.response?.data?.detail || "Ocurrió un error al persistir los registros en la base de datos.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Reiniciar flujo
  const handleReset = () => {
    setFile(null);
    setFileHeaders([]);
    setSampleRows([]);
    setTotalRows(0);
    setMapping({});
    setSimulationData(null);
    setExecutionResult(null);
    setErrorMessage("");
    setCurrentStep(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-fade-in text-on-surface">
      {/* Botón Volver y Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <GoBackButton />
        <span className="text-xs uppercase tracking-widest text-primary font-bold bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          Módulo de Archivo & Catálogo
        </span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif text-on-surface font-normal mb-2 flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-primary" />
          Importador Masivo de Catálogos
        </h1>
        <p className="text-on-surface-variant text-sm md:text-base max-w-2xl">
          Carga colecciones enteras en lote mediante planillas Excel (.xlsx) o archivos CSV.
          El asistente detecta los encabezados, previene duplicados y genera los ejemplares físicos automáticamente.
        </p>
      </div>

      {/* Indicador de Pasos (Stepper) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/60 shadow-sm">
        {[
          { step: 1, label: "1. Subir Archivo" },
          { step: 2, label: "2. Mapear Columnas" },
          { step: 3, label: "3. Auditar Simulación" },
          { step: 4, label: "4. Resultado Final" },
        ].map((s) => {
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;
          return (
            <div
              key={s.step}
              className={`flex items-center gap-2 p-2.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-on-primary font-bold shadow-sm"
                  : isDone
                  ? "text-primary bg-primary/10"
                  : "text-on-surface-variant opacity-60"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive
                    ? "bg-on-primary text-primary"
                    : isDone
                    ? "bg-primary text-on-primary"
                    : "border border-outline-variant"
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : s.step}
              </div>
              <span className="truncate">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Banner de Mensaje de Error */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-error-container text-on-error-container border border-error/30 flex items-start gap-3 animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">{errorMessage}</div>
        </div>
      )}

      {/* =========================================================
          PASO 1: SELECCIÓN Y CARGA DE ARCHIVO
      ========================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 md:p-14 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-outline-variant/80 hover:border-primary/60 bg-surface-container-lowest"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv,.tsv,.txt"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />

            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="font-serif text-lg md:text-xl font-medium text-on-surface mb-1">
              Arrastra y suelta tu planilla aquí
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
              o haz clic para explorar tus carpetas locales
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-on-surface-variant font-mono">
              <span className="px-2 py-1 bg-surface-container rounded border border-outline-variant/60">.xlsx (Excel)</span>
              <span className="px-2 py-1 bg-surface-container rounded border border-outline-variant/60">.csv (UTF-8 / Latin-1)</span>
              <span className="px-2 py-1 bg-surface-container rounded border border-outline-variant/60">.tsv / .txt</span>
            </div>
          </div>

          {/* Tarjeta del archivo seleccionado */}
          {file && (
            <div className="p-4 bg-surface-container-low border border-primary/30 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-3 truncate">
                <FileText className="w-7 h-7 text-primary shrink-0" />
                <div className="truncate">
                  <p className="text-sm font-bold text-on-surface truncate">{file.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {(file.size / 1024).toFixed(1)} KB • Listo para procesar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePreviewUpload}
                disabled={isLoading}
                className="shrink-0 flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all shadow"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    Continuar al Mapeo
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Caja informativa y Descarga de Plantilla */}
          <div className="p-5 bg-surface-container-low border border-outline-variant/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-on-surface-variant leading-relaxed">
                <p className="font-bold text-on-surface mb-0.5">¿No sabes qué estructura usar?</p>
                Puedes descargar nuestra planilla de ejemplo con 5 libros clásicos listos para probar la importación.
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-surface-container-highest border border-outline-variant text-on-surface rounded-lg text-xs font-semibold hover:border-primary transition-colors shrink-0"
            >
              <Download className="w-4 h-4 text-primary" />
              Descargar Plantilla CSV
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          PASO 2: VISUAL MAPPER DE COLUMNAS
      ========================================================= */}
      {currentStep === 2 && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/70 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-6 border-b border-outline-variant/40">
              <div>
                <h2 className="text-lg font-serif font-bold text-on-surface">
                  Mapeo de Columnas ({totalRows} filas detectadas)
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Asocia cada columna de tu planilla con el campo correspondiente de Folium. Los campos con asterisco (*) son obligatorios.
                </p>
              </div>
              <div className="text-xs text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-md border border-outline-variant/50">
                Archivo: <span className="font-semibold text-on-surface">{file?.name}</span>
              </div>
            </div>

            {/* Grilla de Campos de Folium vs Columnas del archivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FOLIUM_FIELDS.map((field) => {
                const selectedCol = mapping[field.id] || "";
                const isAutoMatched = Boolean(selectedCol);
                return (
                  <div
                    key={field.id}
                    className={`p-3.5 rounded-lg border transition-colors ${
                      isAutoMatched
                        ? "border-primary/40 bg-primary/[0.02]"
                        : field.required
                        ? "border-error/40 bg-error/[0.02]"
                        : "border-outline-variant/60 bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        {field.label}
                        {field.required && <span className="text-error font-black">*</span>}
                      </label>
                      {isAutoMatched && (
                        <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          Detectado
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant mb-2">{field.description}</p>
                    <select
                      value={selectedCol}
                      onChange={(e) => handleMappingChange(field.id, e.target.value)}
                      className="w-full text-xs bg-surface-container border border-outline-variant rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value="">— Ignorar / No mapear —</option>
                      {fileHeaders.map((header) => (
                        <option key={header} value={header}>
                          Columna: &quot;{header}&quot;
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabla de Muestra de las Primeras 5 Filas */}
          {sampleRows.length > 0 && (
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/70 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Muestra de datos (primeras 5 filas)
              </h3>
              <div className="overflow-x-auto max-h-60 border border-outline-variant/50 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-surface-container sticky top-0 text-on-surface-variant uppercase font-mono text-[10px] tracking-wider border-b border-outline-variant">
                    <tr>
                      {fileHeaders.map((h) => (
                        <th key={h} className="p-2.5 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    {sampleRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                        {fileHeaders.map((h) => (
                          <td key={h} className="p-2.5 whitespace-nowrap text-on-surface max-w-[200px] truncate">
                            {row[h] || <span className="opacity-30 italic">vacío</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Acciones de Navegación Step 2 */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Cambiar Archivo
            </button>
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isLoading || !mapping.title || !mapping.author}
              className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40 transition-all shadow"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Simulando...
                </>
              ) : (
                <>
                  Simular y Validar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          PASO 3: SIMULACIÓN & AUDITORÍA DRY-RUN
      ========================================================= */}
      {currentStep === 3 && simulationData && (
        <div className="space-y-8 animate-fade-in">
          {/* Métricas del Dry-Run */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/70 shadow-sm">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Total Filas</span>
              <p className="text-3xl font-serif font-bold text-on-surface mt-1">{simulationData.total_rows}</p>
              <span className="text-xs text-on-surface-variant">Detectadas en la planilla</span>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-xl border border-emerald-500/30 shadow-sm">
              <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Nuevas Obras</span>
              <p className="text-3xl font-serif font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {simulationData.new_books}
              </p>
              <span className="text-xs text-on-surface-variant">Se crearán en el catálogo</span>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-xl border border-blue-500/30 shadow-sm">
              <span className="text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">Obras Existentes</span>
              <p className="text-3xl font-serif font-bold text-blue-600 dark:text-blue-400 mt-1">
                {simulationData.existing_books}
              </p>
              <span className="text-xs text-on-surface-variant">Se sumarán ejemplares físicos</span>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-xl border border-amber-500/30 shadow-sm">
              <span className="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">Inconsistencias</span>
              <p className="text-3xl font-serif font-bold text-amber-600 dark:text-amber-400 mt-1">
                {simulationData.rows_with_errors}
              </p>
              <span className="text-xs text-on-surface-variant">Filas que se omitirán</span>
            </div>
          </div>

          {/* Advertencias o Errores de Filas */}
          {simulationData.error_details && simulationData.error_details.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                Filas con datos incompletos ({simulationData.error_details.length})
              </div>
              <p className="text-xs text-on-surface-variant mb-3">
                Estas filas no contienen título o autor y serán ignoradas de forma segura durante la importación:
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs font-mono">
                {simulationData.error_details.map((errItem, idx) => (
                  <div key={idx} className="bg-surface-container-lowest px-3 py-1.5 rounded border border-outline-variant/40 flex items-center justify-between">
                    <span>Fila #{errItem.row}</span>
                    <span className="text-on-surface-variant">{errItem.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Muestra de cómo quedará registrada una obra */}
          {simulationData.sample_previews && simulationData.sample_previews.length > 0 && (
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/70 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                <Library className="w-4 h-4 text-primary" />
                Muestra de obras interpretadas por Folium ({simulationData.sample_previews.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {simulationData.sample_previews.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-surface-container-low rounded-lg border border-outline-variant/50 text-xs">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-on-surface text-sm line-clamp-1">{item.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                        item.status === "EXISTING" ? "bg-blue-500/10 text-blue-600" : "bg-emerald-500/10 text-emerald-600"
                      }`}>
                        {item.status === "EXISTING" ? "Existente" : "Nuevo"}
                      </span>
                    </div>
                    <p className="text-on-surface-variant mb-1.5">
                      <span className="font-semibold">Autor:</span> {item.author || "—"}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-on-surface-variant">
                      <span>ISBN: <strong className="text-on-surface">{item.isbn || "Autogenerado"}</strong></span>
                      {item.editorial && <span>Editorial: <strong className="text-on-surface">{item.editorial}</strong></span>}
                      {item.year && <span>Año: <strong className="text-on-surface">{item.year}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones de Navegación Step 3 */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Modificar Mapeo
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={isLoading || simulationData.valid_rows === 0}
              className="flex items-center gap-2 bg-primary text-on-primary px-7 py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40 transition-all shadow-md"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Importando registros a Folium...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar e Importar al Catálogo ({simulationData.valid_rows} registros)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          PASO 4: RESULTADO FINAL Y RESUMEN
      ========================================================= */}
      {currentStep === 4 && executionResult && (
        <div className="bg-surface-container-lowest p-8 md:p-12 rounded-2xl border border-outline-variant/70 shadow-lg text-center max-w-2xl mx-auto animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-5">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl md:text-3xl font-serif font-bold text-on-surface mb-2">
            ¡Importación Completada con Éxito!
          </h2>
          <p className="text-sm text-on-surface-variant mb-8">
            Los datos han sido validados y persistidos de forma transaccional en la base de datos de Folium.
          </p>

          {/* Tarjetas de Estadísticas Finales */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
              <BookCopy className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-serif font-bold text-on-surface">{executionResult.imported_books}</p>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Obras Nuevas</span>
            </div>
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
              <Library className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-2xl font-serif font-bold text-on-surface">{executionResult.imported_items}</p>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Ejemplares Físicos</span>
            </div>
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
              <AlertCircle className="w-5 h-5 text-on-surface-variant mx-auto mb-1" />
              <p className="text-2xl font-serif font-bold text-on-surface">{executionResult.skipped_rows}</p>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Omitidos</span>
            </div>
          </div>

          {/* Botones de acción final */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/librarian/inventory"
              className="w-full sm:w-auto bg-primary text-on-primary px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow"
            >
              Ir al Inventario de Ejemplares
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto bg-surface-container border border-outline-variant text-on-surface px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:border-primary transition-colors"
            >
              Importar Otro Lote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
