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
  SlidersHorizontal,
} from "lucide-react";
import GoBackButton from "../components/BasicUIComponents/GoBackButton";
import { importerService, validateImporterFile } from "../api/services/importerService";

const FOLIUM_FIELDS = [
  { id: "title", label: "Título de la Obra", required: true, description: "Nombre principal del libro" },
  { id: "author", label: "Autor(es)", required: true, description: "Nombre y apellido (soporta múltiples autores y 'Apellido, Nombre')" },
  { id: "isbn", label: "ISBN", required: false, description: "ISBN-10 o ISBN-13 (opcional; si falta, la obra queda sin ISBN)" },
  { id: "editorial", label: "Editorial", required: false, description: "Casa publicadora o sello editorial" },
  { id: "year", label: "Año de Publicación", required: false, description: "Año numérico (ej. 1985)" },
  { id: "genre", label: "Género / Materia", required: false, description: "Categoría(s) literaria(s); si vienen varias con coma, se separan automáticamente" },
  { id: "inventory_code", label: "Código de Ejemplar (Signatura)", required: false, description: "Identificador del ejemplar físico" },
  { id: "location", label: "Ubicación en Sala", required: false, description: "Estantería, pasillo o sala física" },
  { id: "description", label: "Sinopsis / Resumen", required: false, description: "Breve descripción de la obra" },
];

const SAMPLE_CSV = `Título;Autor;ISBN;Editorial;Año;Género;Código Ejemplar;Ubicación;Descripción
Cien años de soledad;Gabriel García Márquez;9780307474728;Sudamericana;1967;Realismo Mágico, Clásicos;INV-MACONDO-01;Pasillo A - Estante 3;Obra cumbre de la literatura hispanoamericana.
Ficciones;Jorge Luis Borges;9789500419574;Sur;1944;Ficción Filosófica, Cuentos;INV-BORGES-01;Pasillo B - Estante 1;Colección de relatos memorables.
Rayuela;Julio Cortázar;9788466331906;Sudamericana;1963;Novela Experimental, Literatura Argentina;INV-CORTAZAR-01;Pasillo A - Estante 2;Contrarrelato lúdico en París y Buenos Aires.
El túnel;Ernesto Sabato;9789500401494;Sur;1948;Novela Psicológica, Drama;INV-SABATO-01;Pasillo C - Estante 4;La confesión de Juan Pablo Castel.
La invención de Morel;Adolfo Bioy Casares;9788420658421;Losada;1940;Ciencia Ficción, Misterio;INV-BIOY-01;Pasillo B - Estante 2;Clásico de ciencia ficción y misterio.`;

const SAMPLE_BIB = `@book{garciamarquez1967cien,
  title = {Cien años de soledad},
  author = {García Márquez, Gabriel},
  isbn = {9780307474728},
  publisher = {Sudamericana},
  year = {1967},
  keywords = {Realismo Mágico, Clásicos},
  abstract = {Obra cumbre de la literatura hispanoamericana.}
}

@book{borges1944ficciones,
  title = {Ficciones},
  author = {Borges, Jorge Luis},
  isbn = {9789500419574},
  publisher = {Sur},
  year = {1944},
  keywords = {Ficción Filosófica, Cuentos},
  abstract = {Colección de relatos memorables.}
}

@book{cortazar1963rayuela,
  title = {Rayuela},
  author = {Cortázar, Julio},
  isbn = {9788466331906},
  publisher = {Sudamericana},
  year = {1963},
  keywords = {Novela Experimental, Literatura Argentina},
  abstract = {Contrarrelato lúdico en París y Buenos Aires.}
}`;

const SAMPLE_MARCXML = `<?xml version="1.0" encoding="UTF-8"?>
<collection xmlns="http://www.loc.gov/MARC21/slim">
  <record>
    <leader>00725nam a2200217 u 4500</leader>
    <controlfield tag="001">FOL-0001</controlfield>
    <controlfield tag="008">850314s1967    ck            000 0 spa  </controlfield>
    <datafield tag="020" ind1=" " ind2=" ">
      <subfield code="a">9780307474728</subfield>
    </datafield>
    <datafield tag="100" ind1="1" ind2=" ">
      <subfield code="a">García Márquez, Gabriel,</subfield>
      <subfield code="d">1927-2014.</subfield>
    </datafield>
    <datafield tag="245" ind1="1" ind2="0">
      <subfield code="a">Cien años de soledad /</subfield>
      <subfield code="c">Gabriel García Márquez.</subfield>
    </datafield>
    <datafield tag="264" ind1=" " ind2="1">
      <subfield code="b">Sudamericana,</subfield>
      <subfield code="c">1967.</subfield>
    </datafield>
    <datafield tag="650" ind1=" " ind2="0">
      <subfield code="a">Realismo mágico.</subfield>
    </datafield>
    <datafield tag="852" ind1=" " ind2=" ">
      <subfield code="p">INV-GABO-01</subfield>
      <subfield code="c">Sala A</subfield>
      <subfield code="h">Estante 3</subfield>
    </datafield>
    <datafield tag="520" ind1=" " ind2=" ">
      <subfield code="a">Obra cumbre de la literatura hispanoamericana.</subfield>
    </datafield>
  </record>
  <record>
    <leader>00680nam a2200205 u 4500</leader>
    <controlfield tag="001">FOL-0002</controlfield>
    <controlfield tag="008">850314s1944    ag            000 0 spa  </controlfield>
    <datafield tag="020" ind1=" " ind2=" ">
      <subfield code="a">9789500419574</subfield>
    </datafield>
    <datafield tag="100" ind1="1" ind2=" ">
      <subfield code="a">Borges, Jorge Luis,</subfield>
      <subfield code="d">1899-1986.</subfield>
    </datafield>
    <datafield tag="245" ind1="1" ind2="0">
      <subfield code="a">Ficciones /</subfield>
      <subfield code="c">Jorge Luis Borges.</subfield>
    </datafield>
    <datafield tag="264" ind1=" " ind2="1">
      <subfield code="b">Sur,</subfield>
      <subfield code="c">1944.</subfield>
    </datafield>
    <datafield tag="650" ind1=" " ind2="0">
      <subfield code="a">Ficción Filosófica.</subfield>
    </datafield>
    <datafield tag="852" ind1=" " ind2=" ">
      <subfield code="p">INV-BORGES-01</subfield>
      <subfield code="c">Sector Archivo</subfield>
      <subfield code="h">Estantería 4</subfield>
    </datafield>
    <datafield tag="520" ind1=" " ind2=" ">
      <subfield code="a">Colección canónica de relatos sobre laberintos e infinitud.</subfield>
    </datafield>
  </record>
</collection>`;

const SAMPLE_MRC_B64 = "MDA0MjFuYW0gYTIyMDAxMzMgdSA0NTAwMDAxMDAwOTAwMDAwMDA4MDA0MTAwMDA5MDIwMDAxODAwMDUwMTAwMDAzMTAwMDY4MjQ1MDA1NTAwMDk5MjY0MDAyNTAwMTU0NjUwMDAyMjAwMTc5ODUyMDAzNTAwMjAxNTIwMDA1MTAwMjM2HkZPTC0wMDAxHjg1MDMxNHMxOTY3ICAgIGNrICAgICAgICAgICAgMDAwIDAgc3BhICAeICAfYTk3ODAzMDc0NzQ3MjgeMSAfYUdhcmPDrWEgTcOhcnF1ZXosIEdhYnJpZWwsHjEwH2FDaWVuIGHDsW9zIGRlIHNvbGVkYWQgLx9jR2FicmllbCBHYXJjw61hIE3DoXJxdWV6Lh4gMR9iU3VkYW1lcmljYW5hLB9jMTk2Ny4eIDAfYVJlYWxpc21vIG3DoWdpY28uHiAgH3BJTlYtR0FCTy0wMR9jU2FsYSBBH2hFc3RhbnRlIDMeICAfYU9icmEgY3VtYnJlIGRlIGxhIGxpdGVyYXR1cmEgaGlzcGFub2FtZXJpY2FuYS4eHTAwNDA5bmFtIGEyMjAwMTMzIHUgNDUwMDAwMTAwMDkwMDAwMDAwODAwNDEwMDAwOTAyMDAwMTgwMDA1MDEwMDAwMjQwMDA2ODI0NTAwMzYwMDA5MjI2NDAwMTYwMDEyODY1MDAwMjYwMDE0NDg1MjAwNDkwMDE3MDUyMDAwNTYwMDIxOR5GT0wtMDAwMh44NTAzMTRzMTk0NCAgICBhZyAgICAgICAgICAgIDAwMCAwIHNwYSAgHiAgH2E5Nzg5NTAwNDE5NTc0HjEgH2FCb3JnZXMsIEpvcmdlIEx1aXMsHjEwH2FGaWNjaW9uZXMgLx9jSm9yZ2UgTHVpcyBCb3JnZXMuHiAxH2JTdXIsH2MxOTQ0Lh4gMB9hRmljY2nDs24gRmlsb3PDs2ZpY2EuHiAgH3BJTlYtQk9SR0VTLTAxH2NTZWN0b3IgQXJjaGl2bx9oRXN0YW50ZXLDrWEgNB4gIB9hQ29sZWNjacOzbiBkZSByZWxhdG9zIHNvYnJlIGxhYmVyaW50b3MgZSBpbmZpbml0dWQuHh0wMDM5N25hbSBhMjIwMDEzMyB1IDQ1MDAwMDEwMDA5MDAwMDAwMDgwMDQxMDAwMDkwMjAwMDE4MDAwNTAxMDAwMDIyMDAwNjgyNDUwMDMyMDAwOTAyNjQwMDI1MDAxMjI2NTAwMDI1MDAxNDc4NTIwMDM5MDAxNzI1MjAwMDUyMDAyMTEeRk9MLTAwMDMeODUwMzE0czE5NjMgICAgZnIgICAgICAgICAgICAwMDAgMCBzcGEgIB4gIB9hOTc4ODQ2NjMzMTkwNh4xIB9hQ29ydMOhemFyLCBKdWxpbyweMTAfYVJheXVlbGEgLx9jSnVsaW8gQ29ydMOhemFyLh4gMR9iU3VkYW1lcmljYW5hLB9jMTk2My4eIDAfYU5vdmVsYSBFeHBlcmltZW50YWwuHiAgH3BJTlYtQ09SVEFaQVItMDEfY1NhbGEgQR9oRXN0YW50ZSAyHiAgH2FDb250cmFycmVsYXRvIGzDumRpY28gZW4gUGFyw61zIHkgQnVlbm9zIEFpcmVzLh4d";

export default function CatalogImporter() {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [fileMeta, setFileMeta] = useState({ isChunked: false, estimatedChunks: 1 });
  const [isDragging, setIsDragging] = useState(false);

  // Estados de comunicación, respuesta y progreso por tandas
  const [isLoading, setIsLoading] = useState(false);
  const [chunkProgress, setChunkProgress] = useState({ current: 0, total: 1 });
  const [errorMessage, setErrorMessage] = useState("");

  // Paso 2: Vista previa, mapeo y opciones manuales de formato
  const [fileHeaders, setFileHeaders] = useState([]);
  const [sampleRows, setSampleRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [mapping, setMapping] = useState({});
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [formatOptions, setFormatOptions] = useState({
    genre_separator: "auto",
    author_format: "auto",
  });

  // Paso 3: Simulación (Dry Run)
  const [simulationData, setSimulationData] = useState(null);

  // Paso 4: Resultados finales
  const [executionResult, setExecutionResult] = useState(null);

  const fileInputRef = useRef(null);

  // Descargar plantilla CSV, BibTeX o MARC de muestra
  const handleDownloadSample = (format = "csv") => {
    let blob;
    let filename;

    if (format === "mrc") {
      const binaryString = atob(SAMPLE_MRC_B64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: "application/marc" });
      filename = "folium_plantilla_catalogo.mrc";
    } else if (format === "marcxml") {
      blob = new Blob([SAMPLE_MARCXML], { type: "application/marcxml+xml;charset=utf-8;" });
      filename = "folium_plantilla_catalogo.xml";
    } else if (format === "bib") {
      blob = new Blob([SAMPLE_BIB], { type: "application/x-bibtex;charset=utf-8;" });
      filename = "folium_plantilla_catalogo.bib";
    } else {
      blob = new Blob(["\uFEFF" + SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
      filename = "folium_plantilla_catalogo.csv";
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Manejo de archivo seleccionado con validación de límites (4 MB para .xlsx, 20 MB en tandas para el resto)
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const validation = validateImporterFile(selectedFile);
    if (!validation.valid) {
      setFile(null);
      setFileMeta({ isChunked: false, estimatedChunks: 1 });
      setErrorMessage(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFile(selectedFile);
    setFileMeta({
      isChunked: validation.isChunked,
      estimatedChunks: validation.estimatedChunks,
    });
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
      if (data.total_chunks && data.total_chunks > 1) {
        setFileMeta({ isChunked: true, estimatedChunks: data.total_chunks });
      }
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

  // Ejecutar Step 2 -> Step 3 (Simulación Dry Run, soportando múltiples tandas)
  const handleRunSimulation = async () => {
    if (!mapping.title || !mapping.author) {
      setErrorMessage("Debes asignar obligatoriamente las columnas para 'Título' y 'Autor(es)'.");
      return;
    }

    setIsLoading(true);
    setChunkProgress({ current: 1, total: fileMeta.estimatedChunks || 1 });
    setErrorMessage("");

    try {
      const response = await importerService.simulate(
        file,
        mapping,
        formatOptions,
        (prog) => setChunkProgress(prog)
      );
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

  // Ejecutar Step 3 -> Step 4 (Ejecución real en BD, soportando múltiples tandas)
  const handleExecuteImport = async () => {
    setIsLoading(true);
    setChunkProgress({ current: 1, total: fileMeta.estimatedChunks || 1 });
    setErrorMessage("");

    try {
      const response = await importerService.execute(
        file,
        mapping,
        formatOptions,
        (prog) => setChunkProgress(prog)
      );
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
    setFileMeta({ isChunked: false, estimatedChunks: 1 });
    setChunkProgress({ current: 0, total: 1 });
    setFileHeaders([]);
    setSampleRows([]);
    setTotalRows(0);
    setMapping({});
    setShowAdvancedOptions(false);
    setFormatOptions({
      genre_separator: "auto",
      author_format: "auto",
    });
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
          Carga colecciones enteras en lote mediante planillas Excel (.xlsx), archivos CSV, BibTeX (.bib) o registros MARC 21 / MARCXML (.mrc, .xml).
          El asistente detecta los encabezados, separa múltiples géneros, previene duplicados y genera los ejemplares físicos automáticamente.
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
              accept=".xlsx,.csv,.tsv,.txt,.bib,.mrc,.marc,.xml,.marcxml"
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

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-on-surface-variant font-mono mb-3">
              <span className="px-2 py-1 bg-surface-container rounded border border-outline-variant/60">.xlsx (Excel • máx. 4 MB)</span>
              <span className="px-2 py-1 bg-surface-container rounded border border-outline-variant/60">.csv (hasta 20 MB)</span>
              <span className="px-2 py-1 bg-surface-container rounded border border-outline-variant/60">.bib (BibTeX • hasta 20 MB)</span>
              <span className="px-2 py-1 bg-surface-container rounded border border-outline-variant/60">.mrc / .marc (MARC 21 • hasta 20 MB)</span>
              <span className="px-2 py-1 bg-surface-container rounded border border-outline-variant/60">.xml (MARCXML • hasta 20 MB)</span>
              <span className="px-2 py-1 bg-surface-container rounded border border-outline-variant/60">.tsv / .txt (hasta 20 MB)</span>
            </div>
            <p className="text-[11px] text-on-surface-variant/80">
              Los archivos mayores a 3.5 MB (excepto .xlsx) se dividen y envían automáticamente en tandas menores a 4 MB.
            </p>
          </div>

          {/* Tarjeta del archivo seleccionado */}
          {file && (
            <div className="p-4 bg-surface-container-low border border-primary/30 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-3 truncate">
                <FileText className="w-7 h-7 text-primary shrink-0" />
                <div className="truncate">
                  <p className="text-sm font-bold text-on-surface truncate">{file.name}</p>
                  <p className="text-xs text-on-surface-variant flex flex-wrap items-center gap-2">
                    <span>
                      {file.size >= 1024 * 1024
                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                        : `${(file.size / 1024).toFixed(1)} KB`}{" "}
                      • Listo para procesar
                    </span>
                    {fileMeta.isChunked && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25 text-[11px] font-semibold">
                        Se enviará en {fileMeta.estimatedChunks} tandas (&lt; 4 MB c/u)
                      </span>
                    )}
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
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDownloadSample("csv")}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-surface-container-highest border border-outline-variant text-on-surface rounded-lg text-xs font-semibold hover:border-primary transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                Plantilla CSV
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSample("bib")}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-surface-container-highest border border-outline-variant text-on-surface rounded-lg text-xs font-semibold hover:border-primary transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                Ejemplo .bib
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSample("mrc")}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-surface-container-highest border border-outline-variant text-on-surface rounded-lg text-xs font-semibold hover:border-primary transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                Ejemplo .mrc (MARC 21)
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSample("marcxml")}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-surface-container-highest border border-outline-variant text-on-surface rounded-lg text-xs font-semibold hover:border-primary transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                Ejemplo MARCXML
              </button>
            </div>
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
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-xs text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-md border border-outline-variant/50">
                  Archivo: <span className="font-semibold text-on-surface">{file?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions((prev) => !prev)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                    showAdvancedOptions || formatOptions.genre_separator !== "auto" || formatOptions.author_format !== "auto"
                      ? "bg-primary/10 text-primary border-primary/40"
                      : "bg-surface-container text-on-surface-variant border-outline-variant/60 hover:border-primary/40 hover:text-on-surface"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Configurar formato manualmente
                </button>
              </div>
            </div>

            {/* Panel desplegable de opciones manuales de formato */}
            {showAdvancedOptions && (
              <div className="mb-6 p-4 rounded-xl bg-surface-container-low border border-primary/30 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Opciones manuales de interpretación
                    </h3>
                    <p className="text-[11px] text-on-surface-variant">
                      Por defecto Folium detecta y separa automáticamente múltiples géneros y autores. Puedes forzar un criterio específico aquí si tu archivo usa otra convención.
                    </p>
                  </div>
                  {(formatOptions.genre_separator !== "auto" || formatOptions.author_format !== "auto") && (
                    <button
                      type="button"
                      onClick={() => setFormatOptions({ genre_separator: "auto", author_format: "auto" })}
                      className="text-[11px] font-semibold text-primary underline hover:opacity-80 cursor-pointer shrink-0"
                    >
                      Restaurar automático
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Separador para múltiples géneros
                    </label>
                    <select
                      value={formatOptions.genre_separator}
                      onChange={(e) =>
                        setFormatOptions((prev) => ({ ...prev, genre_separator: e.target.value }))
                      }
                      className="w-full text-xs bg-surface-container border border-outline-variant rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value="auto">Automático (coma, punto y coma o barra /)</option>
                      <option value="comma">Separar solo por coma (,)</option>
                      <option value="semicolon">Separar solo por punto y coma (;)</option>
                      <option value="slash">Separar solo por barra (/)</option>
                      <option value="none">No separar (guardar la cadena entera como un único género)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Formato en la columna de Autor(es)
                    </label>
                    <select
                      value={formatOptions.author_format}
                      onChange={(e) =>
                        setFormatOptions((prev) => ({ ...prev, author_format: e.target.value }))
                      }
                      className="w-full text-xs bg-surface-container border border-outline-variant rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value="auto">Automático (detecta &quot;Apellido, Nombre&quot; y listas de autores)</option>
                      <option value="firstname_lastname">&quot;Nombre Apellido&quot; (varios autores separados por coma o &apos;;&apos;)</option>
                      <option value="lastname_firstname">&quot;Apellido, Nombre&quot; (varios autores separados por &apos;;&apos;)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

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
                  {chunkProgress.total > 1
                    ? `Simulando tanda ${chunkProgress.current} de ${chunkProgress.total}...`
                    : "Simulando..."}
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
                {simulationData.new_books ?? simulationData.new_books_count ?? 0}
              </p>
              <span className="text-xs text-on-surface-variant">Se crearán en el catálogo</span>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-xl border border-blue-500/30 shadow-sm">
              <span className="text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">Obras Existentes</span>
              <p className="text-3xl font-serif font-bold text-blue-600 dark:text-blue-400 mt-1">
                {simulationData.existing_books ?? simulationData.existing_books_count ?? 0}
              </p>
              <span className="text-xs text-on-surface-variant">Se sumarán ejemplares físicos</span>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-xl border border-amber-500/30 shadow-sm">
              <span className="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">Inconsistencias</span>
              <p className="text-3xl font-serif font-bold text-amber-600 dark:text-amber-400 mt-1">
                {simulationData.rows_with_errors ?? simulationData.errors_count ?? 0}
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
                    <span className="text-on-surface-variant">{errItem.error || errItem.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Muestra de cómo quedará registrada una obra */}
          {(simulationData.sample_previews || simulationData.preview_items)?.length > 0 && (
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/70 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                <Library className="w-4 h-4 text-primary" />
                Muestra de obras interpretadas por Folium ({(simulationData.sample_previews || simulationData.preview_items).length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(simulationData.sample_previews || simulationData.preview_items).map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-surface-container-low rounded-lg border border-outline-variant/50 text-xs flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-bold text-on-surface text-sm line-clamp-1">{item.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                          item.status === "EXISTING" ? "bg-blue-500/10 text-blue-600" : "bg-emerald-500/10 text-emerald-600"
                        }`}>
                          {item.status === "EXISTING" ? "Existente (+copia)" : "Nuevo"}
                        </span>
                      </div>

                      <div className="text-on-surface-variant mb-2 flex flex-wrap items-center gap-1">
                        <span className="font-semibold">Autor(es):</span>
                        {Array.isArray(item.authors_list) && item.authors_list.length > 0 ? (
                          item.authors_list.map((authorName, aIdx) => (
                            <span
                              key={aIdx}
                              className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/60 text-on-surface text-[11px]"
                            >
                              {authorName}
                            </span>
                          ))
                        ) : (
                          <span>{item.author || "—"}</span>
                        )}
                      </div>

                      {Array.isArray(item.genres_list) && item.genres_list.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mb-2">
                          <span className="font-semibold text-on-surface-variant">Géneros:</span>
                          {item.genres_list.map((genreName, gIdx) => (
                            <span
                              key={gIdx}
                              className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold"
                            >
                              {genreName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-on-surface-variant pt-1.5 border-t border-outline-variant/30">
                      <span>ISBN: <strong className="text-on-surface">{item.isbn || "Sin ISBN"}</strong></span>
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
              Modificar Mapeo / Formato
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
                  {chunkProgress.total > 1
                    ? `Importando tanda ${chunkProgress.current} de ${chunkProgress.total}...`
                    : "Importando registros a Folium..."}
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
            Los datos han sido validados y persistidos de forma transaccional en la base de datos de Folium
            {executionResult.total_chunks > 1
              ? ` (enviados en ${executionResult.total_chunks} tandas seguras menores a 4 MB)`
              : ""}.
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
