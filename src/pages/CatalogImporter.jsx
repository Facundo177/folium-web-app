import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Download,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Image as ImageIcon,
  FileCheck,
  Database,
  Archive,
} from "lucide-react";
import GoBackButton from "../components/BasicUIComponents/GoBackButton";
import { importerService, validateImporterFile } from "../api/services/importerService";

const FOLIUM_FIELDS = [
  { id: "title", label: "Título de la Obra", required: true, description: "Nombre principal de la obra bibliográfica" },
  { id: "author", label: "Autor(es)", required: true, description: "Nombre(s) y apellido(s); admite múltiples autores y formato 'Apellido, Nombre'" },
  { id: "isbn", label: "ISBN", required: false, description: "ISBN-10 o ISBN-13 normalizado para indexación y portadas" },
  { id: "editorial", label: "Editorial", required: false, description: "Casa publicadora o sello editorial" },
  { id: "year", label: "Año de Publicación", required: false, description: "Año de edición o impresión (ej. 1967)" },
  { id: "genre", label: "Materia / Género", required: false, description: "Descriptores temáticos o materias normalizadas" },
  { id: "inventory_code", label: "Signatura Topográfica / Código", required: false, description: "Identificador unívoco del ejemplar físico" },
  { id: "location", label: "Ubicación en Sala", required: false, description: "Estantería, sector o sala física de depósito" },
  { id: "description", label: "Sinopsis / Resumen", required: false, description: "Nota de contenido o resumen catalográfico" },
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

  // Estados de carga, comunicación y tandas
  const [isLoading, setIsLoading] = useState(false);
  const [chunkProgress, setChunkProgress] = useState({ current: 0, total: 1 });
  const [errorMessage, setErrorMessage] = useState("");

  // Paso 2: Encabezados, filas de muestra, mapeo y opciones bibliográficas
  const [fileHeaders, setFileHeaders] = useState([]);
  const [sampleRows, setSampleRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [mapping, setMapping] = useState({});
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [formatOptions, setFormatOptions] = useState({
    genre_separator: "auto",
    author_format: "auto",
    fetch_covers_by_isbn: true,
  });

  // Paso 3: Simulación (Dry Run)
  const [simulationData, setSimulationData] = useState(null);

  // Paso 4: Resultados finales y enriquecimiento de portadas
  const [executionResult, setExecutionResult] = useState(null);
  const [isFetchingCovers, setIsFetchingCovers] = useState(false);
  const [coverProgress, setCoverProgress] = useState({
    processed: 0,
    total: 0,
    found: 0,
    notFound: 0,
    stopped: false,
  });
  const stopCoverFetchRef = useRef(false);

  const fileInputRef = useRef(null);

  // Descarga de ejemplares de prueba
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

  // Selección de archivo con validación
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

  // Paso 1 -> Paso 2
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

  // Asignar columna a campo
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

  // Paso 2 -> Paso 3 (Simulación Dry Run)
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

  // Paso 3 -> Paso 4 (Ejecución real)
  const handleExecuteImport = async () => {
    setIsLoading(true);
    setChunkProgress({ current: 1, total: fileMeta.estimatedChunks || 1 });
    setErrorMessage("");
    stopCoverFetchRef.current = false;

    try {
      const response = await importerService.execute(
        file,
        mapping,
        formatOptions,
        (prog) => setChunkProgress(prog)
      );
      const resultData = response.data || {};
      const initialLocalCovers = resultData.covers_assigned || 0;
      const pendingIsbns = Array.isArray(resultData.pending_cover_isbns)
        ? resultData.pending_cover_isbns
        : [];

      setExecutionResult({
        ...resultData,
        covers_assigned: initialLocalCovers,
      });
      setCurrentStep(4);
      setIsLoading(false);

      if (formatOptions.fetch_covers_by_isbn && pendingIsbns.length > 0) {
        setIsFetchingCovers(true);
        setCoverProgress({
          processed: 0,
          total: pendingIsbns.length,
          found: 0,
          notFound: 0,
          stopped: false,
        });

        const finalCoverStats = await importerService.fetchCoversInBatches(
          pendingIsbns,
          (cProg) => {
            setCoverProgress({
              ...cProg,
              stopped: stopCoverFetchRef.current,
            });
            setExecutionResult((prev) =>
              prev
                ? {
                    ...prev,
                    covers_assigned: initialLocalCovers + (cProg.found || 0),
                  }
                : prev
            );
          },
          () => stopCoverFetchRef.current
        );

        setCoverProgress(finalCoverStats);
        setExecutionResult((prev) =>
          prev
            ? {
                ...prev,
                covers_assigned: initialLocalCovers + (finalCoverStats.found || 0),
              }
            : prev
        );
        setIsFetchingCovers(false);
      }
    } catch (err) {
      console.error("Error al ejecutar importación masiva:", err);
      const msg = err.response?.data?.detail || "Ocurrió un error al persistir los registros en la base de datos.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  // Reiniciar flujo
  const handleReset = () => {
    stopCoverFetchRef.current = true;
    setIsFetchingCovers(false);
    setCoverProgress({
      processed: 0,
      total: 0,
      found: 0,
      notFound: 0,
      stopped: false,
    });
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
      fetch_covers_by_isbn: true,
    });
    setSimulationData(null);
    setExecutionResult(null);
    setErrorMessage("");
    setCurrentStep(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const steps = [
    { num: "01", name: "Documento Fuente" },
    { num: "02", name: "Cotejo de Columnas" },
    { num: "03", name: "Auditoría de Ingesta" },
    { num: "04", name: "Acta de Incorporación" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 text-on-surface font-sans">
      {/* =========================================================
          ENCABEZADO EDITORIAL & REGISTRO DE ARCHIVO
      ========================================================= */}
      <div className="border-b border-outline-variant/60 pb-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <GoBackButton />
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-on-surface-variant">
            <Archive className="w-3.5 h-3.5 text-primary" />
            <span>Folio Cat-Ingesta // Registro Colectivo</span>
          </div>
        </div>

        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-serif font-normal text-on-surface tracking-tight mb-2">
            Ingesta e Incorporación de Fondos Bibliográficos
          </h1>
          <p className="text-sm md:text-[15px] text-on-surface-variant leading-relaxed">
            Mesa técnica de procesamiento masivo. Asimilación de registros catalográficos en formatos MARC 21, MARCXML, BibTeX, planillas Excel y esquemas tabulares delimitados con asignación automática de signaturas físicas.
          </p>
        </div>

        {/* Fases de Ingesta (Stepper Sobrio Editorial con Verde Semántico de Éxito) */}
        <div className="mt-8 pt-6 border-t border-outline-variant/40">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((s, idx) => {
              const stepNumber = idx + 1;
              const isActive = currentStep === stepNumber;
              const isPast = currentStep > stepNumber;
              return (
                <div key={s.num} className="relative">
                  <div
                    className={`h-0.5 w-full mb-3 transition-colors ${
                      isActive
                        ? "bg-primary"
                        : isPast
                        ? "bg-emerald-600 dark:bg-emerald-400"
                        : "bg-outline-variant/40"
                    }`}
                  />
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`font-mono text-xs ${
                        isActive
                          ? "text-primary font-bold"
                          : isPast
                          ? "text-emerald-700 dark:text-emerald-400 font-bold"
                          : "text-on-surface-variant/40"
                      }`}
                    >
                      {isPast ? "✓" : s.num}
                    </span>
                    <span
                      className={`text-xs uppercase tracking-wider ${
                        isActive
                          ? "font-bold text-on-surface"
                          : isPast
                          ? "font-semibold text-emerald-800 dark:text-emerald-300"
                          : "text-on-surface-variant/60"
                      }`}
                    >
                      {s.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notificación de Error */}
      {errorMessage && (
        <div className="mb-8 p-4 rounded-sm bg-error-container/80 text-on-error-container border-l-4 border-error flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* =========================================================
          FASE 1: DEPÓSITO Y RECEPCIÓN DOCUMENTAL
      ========================================================= */}
      {currentStep === 1 && (
        <div className="space-y-8">
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-sm">
            {/* Cabecera de la Ficha de Depósito */}
            <div className="px-6 py-4 border-b border-outline-variant/60 flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/50">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-on-surface-variant">
                <FileCheck className="w-4 h-4 text-primary" />
                <span>Hoja de Depósito // Admisión de Registros</span>
              </div>
              <span className="text-[11px] font-mono text-on-surface-variant">
                Límite: 20 MB por lote (Excel máx. 4 MB)
              </span>
            </div>

            {/* Zona de Arrastre / Selección de Archivo */}
            <div className="p-8 md:p-12">
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
                className={`border border-dashed p-8 md:p-12 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/[0.04]"
                    : "border-outline-variant hover:border-primary/70 bg-surface-container-lowest"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.csv,.tsv,.txt,.bib,.mrc,.marc,.xml,.marcxml"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                />

                <div className="max-w-md mx-auto space-y-4">
                  <div className="font-serif italic text-2xl text-on-surface">
                    Depositar catálogo para cotejo
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Haga clic para explorar los archivos locales o arrastre la planilla de inventario a este espacio.
                  </p>

                  {/* Sellos de Formatos Admitidos con Mayor Contraste y Tipografía Monospaced */}
                  <div className="pt-4 border-t border-outline-variant/40 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 bg-surface-container-low border border-outline-variant text-on-surface rounded-sm">
                      <strong className="text-primary font-bold">MARC 21</strong> (.mrc)
                    </span>
                    <span className="px-2.5 py-1 bg-surface-container-low border border-outline-variant text-on-surface rounded-sm">
                      <strong className="text-primary font-bold">MARCXML</strong> (.xml)
                    </span>
                    <span className="px-2.5 py-1 bg-surface-container-low border border-outline-variant text-on-surface rounded-sm">
                      <strong className="text-primary font-bold">BibTeX</strong> (.bib)
                    </span>
                    <span className="px-2.5 py-1 bg-surface-container-low border border-outline-variant text-on-surface rounded-sm">
                      <strong className="text-primary font-bold">Excel</strong> (.xlsx • máx 4 MB)
                    </span>
                    <span className="px-2.5 py-1 bg-surface-container-low border border-outline-variant text-on-surface rounded-sm">
                      <strong className="text-primary font-bold">CSV / TSV</strong> (.csv, .tsv)
                    </span>
                  </div>
                </div>
              </div>

              {/* Ficha del Archivo Cargado */}
              {file && (
                <div className="mt-6 p-4 bg-surface-container-low border border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-mono text-sm font-bold text-on-surface">{file.name}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5 flex flex-wrap items-center gap-2 font-mono">
                        <span>
                          {file.size >= 1024 * 1024
                            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                            : `${(file.size / 1024).toFixed(1)} KB`}
                        </span>
                        {fileMeta.isChunked && (
                          <span className="text-primary font-semibold">
                            [Transmisión fraccionada: {fileMeta.estimatedChunks} tandas]
                          </span>
                        )}
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">— Documento listo para cotejo</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePreviewUpload}
                    disabled={isLoading}
                    className="self-end md:self-auto flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Analizando...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceder al Cotejo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Muestrarios y Plantillas de Referencia con Distintivos Técnicos */}
          <div className="p-6 bg-surface-container-low border border-outline-variant/60 rounded-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-base font-normal text-on-surface mb-1">
                  Muestrarios de Estructura Bibliográfica
                </h2>
                <p className="text-xs text-on-surface-variant max-w-xl">
                  Archivos de muestra preparados con cinco obras canónicas hispanoamericanas para auditar la compatibilidad de campos y signaturas.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadSample("csv")}
                  className="px-3.5 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-mono hover:border-primary transition-colors flex items-center gap-2 cursor-pointer rounded-sm shadow-xs"
                >
                  <span className="px-1.5 py-0.5 bg-surface-container text-on-surface text-[10px] font-bold border border-outline-variant/60 rounded-xs">
                    CSV
                  </span>
                  <span>Plantilla .csv</span>
                  <Download className="w-3 h-3 text-primary ml-1" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSample("bib")}
                  className="px-3.5 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-mono hover:border-primary transition-colors flex items-center gap-2 cursor-pointer rounded-sm shadow-xs"
                >
                  <span className="px-1.5 py-0.5 bg-surface-container text-on-surface text-[10px] font-bold border border-outline-variant/60 rounded-xs">
                    BIB
                  </span>
                  <span>Muestra .bib</span>
                  <Download className="w-3 h-3 text-primary ml-1" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSample("mrc")}
                  className="px-3.5 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-mono hover:border-primary transition-colors flex items-center gap-2 cursor-pointer rounded-sm shadow-xs"
                >
                  <span className="px-1.5 py-0.5 bg-surface-container text-on-surface text-[10px] font-bold border border-outline-variant/60 rounded-xs">
                    MRC
                  </span>
                  <span>MARC 21 (.mrc)</span>
                  <Download className="w-3 h-3 text-primary ml-1" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSample("marcxml")}
                  className="px-3.5 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-mono hover:border-primary transition-colors flex items-center gap-2 cursor-pointer rounded-sm shadow-xs"
                >
                  <span className="px-1.5 py-0.5 bg-surface-container text-on-surface text-[10px] font-bold border border-outline-variant/60 rounded-xs">
                    XML
                  </span>
                  <span>MARCXML (.xml)</span>
                  <Download className="w-3 h-3 text-primary ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          FASE 2: MESA DE COTEJO Y ASIGNACIÓN BIBLIOGRÁFICA
      ========================================================= */}
      {currentStep === 2 && (
        <div className="space-y-8">
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-sm">
            {/* Barra de Contexto del Cotejo */}
            <div className="px-6 py-4 border-b border-outline-variant/60 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-low/40">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-on-surface-variant">
                  <Database className="w-4 h-4 text-primary" />
                  <span>Cotejo de Columnas // {file?.name}</span>
                </div>
                <div className="font-serif text-xl text-on-surface mt-1">
                  Correspondencia de Campos ({totalRows} filas detectadas)
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions((prev) => !prev)}
                  className={`flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-3 py-1.5 border transition-colors cursor-pointer rounded-sm ${
                    showAdvancedOptions || formatOptions.genre_separator !== "auto" || formatOptions.author_format !== "auto"
                      ? "border-primary text-primary bg-primary/[0.04]"
                      : "border-outline-variant text-on-surface-variant hover:border-on-surface"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Criterios de Normalización</span>
                </button>
              </div>
            </div>

            {/* Panel de Criterios de Normalización (Técnico y Sobrio) */}
            {showAdvancedOptions && (
              <div className="p-6 bg-surface-container-low/70 border-b border-outline-variant/60">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-base text-on-surface">
                    Reglas de interpretación bibliográfica
                  </h3>
                  {(formatOptions.genre_separator !== "auto" || formatOptions.author_format !== "auto") && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormatOptions((prev) => ({
                          ...prev,
                          genre_separator: "auto",
                          author_format: "auto",
                        }))
                      }
                      className="text-xs font-mono text-primary underline hover:opacity-80 cursor-pointer"
                    >
                      Restablecer automáticos
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-on-surface mb-1.5">
                      Segmentación de Descriptores / Materias
                    </label>
                    <select
                      value={formatOptions.genre_separator}
                      onChange={(e) =>
                        setFormatOptions((prev) => ({ ...prev, genre_separator: e.target.value }))
                      }
                      className="w-full text-xs font-mono bg-surface-container-lowest border border-outline-variant rounded-sm px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value="auto">Automático (coma, punto y coma o barra /)</option>
                      <option value="comma">Separar exclusivamente por coma (,)</option>
                      <option value="semicolon">Separar exclusivamente por punto y coma (;)</option>
                      <option value="slash">Separar exclusivamente por barra (/)</option>
                      <option value="none">Preservar como término único sin segmentar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-on-surface mb-1.5">
                      Sintaxis de Autores
                    </label>
                    <select
                      value={formatOptions.author_format}
                      onChange={(e) =>
                        setFormatOptions((prev) => ({ ...prev, author_format: e.target.value }))
                      }
                      className="w-full text-xs font-mono bg-surface-container-lowest border border-outline-variant rounded-sm px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value="auto">Automático (reconoce 'Apellido, Nombre' y nombres directos)</option>
                      <option value="firstname_lastname">Nombre Apellido (autores separados por ';' o coma)</option>
                      <option value="lastname_firstname">Apellido, Nombre (autores separados por ';')</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Política de Portadas ISBN */}
            <div className="px-6 py-4 bg-surface-container-low/30 border-b border-outline-variant/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ImageIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  <span className="font-semibold text-on-surface">Enriquecimiento visual por ISBN: </span>
                  {formatOptions.fetch_covers_by_isbn
                    ? "Al concluir la carga, Folium consultará las portadas en la red de repositorios sin demorar la importación."
                    : "Las obras se registrarán con la portada ornamental clásica de archivo."}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setFormatOptions((prev) => ({ ...prev, fetch_covers_by_isbn: true }))
                  }
                  className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border rounded-sm transition-colors cursor-pointer ${
                    formatOptions.fetch_covers_by_isbn
                      ? "border-primary bg-primary text-on-primary font-bold"
                      : "border-outline-variant text-on-surface-variant hover:border-on-surface"
                  }`}
                >
                  Buscar por ISBN
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormatOptions((prev) => ({ ...prev, fetch_covers_by_isbn: false }))
                  }
                  className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border rounded-sm transition-colors cursor-pointer ${
                    !formatOptions.fetch_covers_by_isbn
                      ? "border-primary bg-primary text-on-primary font-bold"
                      : "border-outline-variant text-on-surface-variant hover:border-on-surface"
                  }`}
                >
                  Omitir portadas
                </button>
              </div>
            </div>

            {/* Mesa de Mapeo Tabular (Ledger) con Validación Visual en Verde */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-6 w-1/3">Campo Canónico Folium</th>
                    <th className="py-3 px-6 w-1/3">Columna en Archivo Fuente</th>
                    <th className="py-3 px-6 w-1/3">Previsualización (Fila 1)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {FOLIUM_FIELDS.map((field) => {
                    const selectedCol = mapping[field.id] || "";
                    const sampleValue = selectedCol && sampleRows[0] ? sampleRows[0][selectedCol] : null;

                    return (
                      <tr key={field.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="py-3.5 px-6 align-top">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-sm font-medium text-on-surface">
                              {field.label}
                            </span>
                            {selectedCol ? (
                              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-xs border border-emerald-500/20">
                                ✓ Asignado
                              </span>
                            ) : field.required ? (
                              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-xs border border-amber-500/20">
                                [Requerido]
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                            {field.description}
                          </p>
                        </td>

                        <td className="py-3.5 px-6 align-top">
                          <select
                            value={selectedCol}
                            onChange={(e) => handleMappingChange(field.id, e.target.value)}
                            className={`w-full text-xs font-mono border rounded-sm px-3 py-2 text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary ${
                              selectedCol
                                ? "border-emerald-600/50 dark:border-emerald-500/50 font-semibold"
                                : field.required
                                ? "border-amber-500/60 bg-amber-500/[0.02]"
                                : "border-outline-variant/60"
                            }`}
                          >
                            <option value="">— Sin asignar —</option>
                            {fileHeaders.map((header) => (
                              <option key={header} value={header}>
                                {header}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3.5 px-6 align-top font-mono text-xs">
                          {sampleValue ? (
                            <span className="text-on-surface bg-surface-container-low px-2.5 py-1 rounded-sm border-l-2 border-emerald-600 dark:border-emerald-400 border-t border-r border-b border-outline-variant/40 inline-block max-w-xs truncate shadow-2xs">
                              {sampleValue}
                            </span>
                          ) : selectedCol ? (
                            <span className="text-on-surface-variant/40 italic">Registro vacío en fila 1</span>
                          ) : (
                            <span className="text-on-surface-variant/30">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Muestra Documental (Primeras 5 Filas) */}
          {sampleRows.length > 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-sm p-6">
              <div className="flex items-center justify-between mb-3 border-b border-outline-variant/40 pb-2">
                <span className="font-serif text-sm text-on-surface">
                  Muestra de registro en crudo (5 primeras filas)
                </span>
                <span className="text-[11px] font-mono text-on-surface-variant">
                  {fileHeaders.length} columnas detectadas
                </span>
              </div>

              <div className="overflow-x-auto max-h-56 border border-outline-variant/60 rounded-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-surface-container-low sticky top-0 text-on-surface-variant font-mono text-[10px] uppercase tracking-wider border-b border-outline-variant">
                    <tr>
                      <th className="p-2 border-r border-outline-variant/40 w-12 text-center">#</th>
                      {fileHeaders.map((h) => (
                        <th key={h} className="p-2 whitespace-nowrap border-r border-outline-variant/40">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 font-mono text-[11px]">
                    {sampleRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low/30">
                        <td className="p-2 text-center text-on-surface-variant/60 border-r border-outline-variant/40">
                          {idx + 1}
                        </td>
                        {fileHeaders.map((h) => (
                          <td key={h} className="p-2 whitespace-nowrap text-on-surface max-w-[220px] truncate border-r border-outline-variant/30">
                            {row[h] || <span className="text-on-surface-variant/30 italic">∅</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Navegación Fase 2 */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Documento</span>
            </button>
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isLoading || !mapping.title || !mapping.author}
              className="flex items-center gap-2 bg-primary text-on-primary px-7 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-40 transition-opacity cursor-pointer shadow-xs"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {chunkProgress.total > 1
                      ? `Auditando tanda ${chunkProgress.current} de ${chunkProgress.total}...`
                      : "Ejecutando Simulación..."}
                  </span>
                </>
              ) : (
                <>
                  <span>Simular y Auditar Lote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          FASE 3: AUDITORÍA Y SIMULACIÓN PREVIA (BALANCE DE INGESTA)
      ========================================================= */}
      {currentStep === 3 && simulationData && (
        <div className="space-y-8">
          {/* Balance Tipográfico de Ingesta con Colores Semánticos Claros */}
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-sm">
            <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/40">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-on-surface-variant">
                <FileCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Auditoría de Ingesta // Balance Técnico</span>
              </div>
              <span className="text-[11px] font-mono text-on-surface-variant">
                Modo: Simulación (Dry Run sin alteración de base de datos)
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-outline-variant/60">
              <div className="p-6">
                <span className="text-[11px] font-mono uppercase tracking-widest text-on-surface-variant">
                  Registros en Planilla
                </span>
                <p className="font-serif text-3xl text-on-surface mt-2 font-normal">
                  {simulationData.total_rows}
                </p>
                <span className="text-xs text-on-surface-variant mt-1 block">Filas leídas en archivo</span>
              </div>

              {/* Obras Nuevas en Verde de Éxito / Incorporación */}
              <div className="p-6">
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-semibold">
                  Obras Nuevas (Alta)
                </span>
                <p className="font-serif text-3xl text-emerald-700 dark:text-emerald-400 mt-2 font-normal">
                  {simulationData.new_books ?? simulationData.new_books_count ?? 0}
                </p>
                <span className="text-xs text-emerald-800/80 dark:text-emerald-400/80 mt-1 block">
                  Títulos para incorporar al fondo
                </span>
              </div>

              {/* Obras Existentes en Tono Neutro Pizarra */}
              <div className="p-6">
                <span className="text-[11px] font-mono uppercase tracking-widest text-on-surface-variant font-medium">
                  Obras Existentes
                </span>
                <p className="font-serif text-3xl text-on-surface mt-2 font-normal">
                  {simulationData.existing_books ?? simulationData.existing_books_count ?? 0}
                </p>
                <span className="text-xs text-on-surface-variant mt-1 block">Se sumarán ejemplares físicos</span>
              </div>

              {/* Inconsistencias en Ámbar Cálido de Advertencia */}
              <div className="p-6">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold">
                  Registros Omitidos
                </span>
                <p className="font-serif text-3xl text-amber-700 dark:text-amber-400 mt-2 font-normal">
                  {simulationData.rows_with_errors ?? simulationData.errors_count ?? 0}
                </p>
                <span className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-1 block">
                  Filas sin título o autor
                </span>
              </div>
            </div>
          </div>

          {/* Detalle de Inconsistencias en Ámbar */}
          {simulationData.error_details && simulationData.error_details.length > 0 && (
            <div className="bg-surface-container-low border border-amber-500/40 rounded-sm p-6">
              <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Observaciones de Consistencia ({simulationData.error_details.length} filas)</span>
              </div>
              <p className="text-xs text-on-surface-variant mb-4">
                Las siguientes filas no satisfacen los requisitos mínimos de catalogación y serán omitidas de forma segura:
              </p>
              <div className="max-h-48 overflow-y-auto space-y-2 font-mono text-xs">
                {simulationData.error_details.map((errItem, idx) => (
                  <div key={idx} className="bg-surface-container-lowest px-3 py-2 border border-outline-variant/60 flex items-center justify-between">
                    <span className="font-bold text-on-surface">Fila #{errItem.row}</span>
                    <span className="text-on-surface-variant">{errItem.error || errItem.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Muestra Interpretada: Fichas Bibliográficas de Muestra */}
          {(simulationData.sample_previews || simulationData.preview_items)?.length > 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-sm p-6">
              <div className="flex items-center justify-between mb-4 border-b border-outline-variant/40 pb-3">
                <div>
                  <h3 className="font-serif text-base text-on-surface">
                    Muestra de Fichas Bibliográficas Interpretadas
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Representación visual normalizada según el motor catalográfico de Folium.
                  </p>
                </div>
                <span className="font-mono text-xs text-on-surface-variant">
                  {(simulationData.sample_previews || simulationData.preview_items).length} registros expuestos
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(simulationData.sample_previews || simulationData.preview_items).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-surface-container-low/40 border border-outline-variant/70 rounded-sm flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-serif text-base text-on-surface font-medium leading-snug">
                          {item.title}
                        </h4>
                        <span
                          className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-xs shrink-0 ${
                            item.status === "EXISTING"
                              ? "border-outline-variant text-on-surface-variant bg-surface-container"
                              : "border-emerald-600/40 text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 font-bold"
                          }`}
                        >
                          {item.status === "EXISTING" ? "Ejemplar Extra" : "Nueva Obra"}
                        </span>
                      </div>

                      <div className="text-xs text-on-surface-variant mb-2">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant/80 mr-1.5">
                          Autor(es):
                        </span>
                        {Array.isArray(item.authors_list) && item.authors_list.length > 0 ? (
                          <span className="font-serif italic text-on-surface">
                            {item.authors_list.join("; ")}
                          </span>
                        ) : (
                          <span className="font-serif italic text-on-surface">{item.author || "—"}</span>
                        )}
                      </div>

                      {Array.isArray(item.genres_list) && item.genres_list.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {item.genres_list.map((genreName, gIdx) => (
                            <span
                              key={gIdx}
                              className="px-2 py-0.5 text-[10px] font-mono bg-surface-container border border-outline-variant/60 text-on-surface rounded-xs"
                            >
                              {genreName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-outline-variant/40 flex flex-wrap items-center justify-between text-[11px] font-mono text-on-surface-variant">
                      <span>ISBN: <strong className="text-on-surface">{item.isbn || "Sin ISBN"}</strong></span>
                      {item.editorial && <span>Ed: <strong className="text-on-surface">{item.editorial}</strong></span>}
                      {item.year && <span>Año: <strong className="text-on-surface">{item.year}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navegación Fase 3 */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ajustar Mapeo</span>
            </button>

            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={isLoading || simulationData.valid_rows === 0}
              className="flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-sm font-bold text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-40 transition-opacity cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {chunkProgress.total > 1
                      ? `Asentando tanda ${chunkProgress.current} de ${chunkProgress.total}...`
                      : "Registrando en fondo bibliográfico..."}
                  </span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Incorporar al Catálogo ({simulationData.valid_rows} obras válidas)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          FASE 4: ACTA DE INCORPORACIÓN Y CIERRE DE LOTE
      ========================================================= */}
      {currentStep === 4 && executionResult && (
        <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-sm p-8 md:p-12 max-w-3xl mx-auto">
          {/* Cabecera del Acta */}
          <div className="text-center pb-8 border-b border-outline-variant/60">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-3">
              <Check className="w-4 h-4" />
              <span>Acta de Incorporación Definitiva</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-on-surface tracking-tight mb-2">
              Lote Asimilado con Éxito
            </h2>
            <p className="text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
              Los registros han sido asentados de manera transaccional en el fondo general de Folium
              {executionResult.total_chunks > 1
                ? ` en ${executionResult.total_chunks} tandas auditadas`
                : ""}.
            </p>
          </div>

          {/* Cuadrante de Balance Final con Colores Semánticos */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-outline-variant/60 my-8 py-2 border-y border-outline-variant/60">
            <div className="p-4 text-center">
              <p className="font-serif text-3xl text-emerald-700 dark:text-emerald-400 font-normal">
                {executionResult.imported_books}
              </p>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mt-1 block font-semibold">
                Nuevas Obras
              </span>
            </div>

            <div className="p-4 text-center">
              <p className="font-serif text-3xl text-on-surface font-normal">
                {executionResult.imported_items}
              </p>
              <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant mt-1 block">
                Ejemplares Físicos
              </span>
            </div>

            <div className="p-4 text-center">
              <p className="font-serif text-3xl text-on-surface font-normal">
                {executionResult.covers_assigned ?? 0}
              </p>
              <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant mt-1 block">
                Portadas Asignadas
              </span>
            </div>

            <div className="p-4 text-center">
              <p className="font-serif text-3xl text-amber-700 dark:text-amber-400 font-normal">
                {executionResult.skipped_rows}
              </p>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 mt-1 block font-semibold">
                Omitidos / Incompletos
              </span>
            </div>
          </div>

          {/* Estado de Enriquecimiento de Portadas */}
          {(isFetchingCovers || coverProgress.total > 0) && (
            <div className="mb-8 p-4 bg-surface-container-low border border-outline-variant/60 rounded-sm">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 text-xs font-mono text-on-surface">
                  {isFetchingCovers && <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />}
                  <span>
                    {isFetchingCovers
                      ? `Consultando portadas por ISBN (${coverProgress.processed} de ${coverProgress.total})...`
                      : coverProgress.stopped
                      ? `Búsqueda interrumpida (${coverProgress.processed} consultados)`
                      : `Enriquecimiento concluido (${coverProgress.found} portadas recuperadas)`}
                  </span>
                </div>
                {isFetchingCovers && (
                  <button
                    type="button"
                    onClick={() => {
                      stopCoverFetchRef.current = true;
                    }}
                    className="text-[11px] font-mono uppercase tracking-wider text-primary underline hover:opacity-80 cursor-pointer"
                  >
                    Detener búsqueda
                  </button>
                )}
              </div>
              <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-400 transition-all duration-300"
                  style={{
                    width: `${
                      coverProgress.total > 0
                        ? Math.min(100, Math.round((coverProgress.processed / coverProgress.total) * 100))
                        : 100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Acciones Finales de Gestión */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/librarian/inventory"
              className="w-full sm:w-auto text-center bg-primary text-on-primary px-8 py-3 rounded-sm font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity cursor-pointer shadow-sm"
            >
              Consultar Inventario de Ejemplares
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto text-center bg-surface-container-low border border-outline-variant text-on-surface px-8 py-3 rounded-sm font-bold text-xs uppercase tracking-wider hover:border-on-surface transition-colors cursor-pointer"
            >
              Procesar Otro Lote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
