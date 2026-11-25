import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  ShieldCheck,
  ChevronDown,
  Loader2,
  RefreshCw,
} from "lucide-react";
import LibraryPricingCards from "../components/BillingComponents/LibraryPricingCards";
import MercadoPagoCheckoutModal from "../components/BillingComponents/MercadoPagoCheckoutModal";
import { billingService } from "../api/services/billingService";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import FoliumSmallLogo from "../components/BasicUIComponents/FoliumSmallLogo";

const FAQ_ITEMS = [
  {
    q: "¿Cómo funciona la facturación a través de MercadoPago?",
    a: "Puedes abonar cada período mediante Checkout Pro (tarjetas de crédito, débito, dinero en cuenta o transferencia inmediata) o adherir una tarjeta al débito automático mensual/anual. Todos los cobros se procesan en moneda local (ARS) bajo el respaldo de MercadoPago.",
  },
  {
    q: "¿Qué sucede con nuestro catálogo si decidimos cambiar o cancelar el plan?",
    a: "Tu acervo bibliográfico jamás se elimina. Si decides volver a la modalidad Sin Cargo, todos tus libros y registros históricos permanecen intactos para consulta y lectura; únicamente se limitan las nuevas altas hasta estar dentro del cupo base.",
  },
  {
    q: "¿Podemos migrar un inventario existente desde Excel o Koha / Aguapey?",
    a: "Sí. Los planes Folium Gestión, Folium Integral y Folium Nexus AI incluyen acceso a nuestro Importador Masivo inteligente, que detecta columnas automáticamente y simula la carga antes de impactar en la base de datos.",
  },
  {
    q: "¿Emiten comprobantes para instituciones públicas, ONG o universidades?",
    a: "Sí. Al iniciar la suscripción puedes indicar el nombre oficial de la biblioteca y su CUIT institucional para que quede registrado en cada comprobante de transacción.",
  },
];

export default function LibraryPricingPage() {
  useDocumentMetadata({
    title: "Planes para Bibliotecas y Archivos — Folium",
    description:
      "Conoce los planes institucionales de Folium para bibliotecas populares, escolares, universitarias y archivos patrimoniales con MercadoPago.",
    canonicalPath: "/pricing",
    schema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState(null);
  const [plansRequestKey, setPlansRequestKey] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState("MONTHLY");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentBanner, setPaymentBanner] = useState(null);
  const [isFaqOpen, setIsFaqOpen] = useState(
    () => typeof window !== "undefined" && window.location.hash === "#faq"
  );

  // Forzar modo claro al ingresar a la página y restaurar al salir si correspondía
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");

    root.classList.remove("dark");

    return () => {
      // Al salir de la página de precios, restauramos el modo oscuro si correspondía
      const savedTheme =
        localStorage.getItem("theme") || localStorage.getItem("folium-theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const shouldBeDark = savedTheme
        ? savedTheme === "dark"
        : hadDark || prefersDark;

      if (shouldBeDark) {
        root.classList.add("dark");
      }
    };
  }, []);

  // Cargar catálogo real de planes desde el backend (con estados explícitos de carga y error)
  useEffect(() => {
    let isMounted = true;
    billingService
      .getPlans()
      .then((data) => {
        if (!isMounted) return;
        const serverPlans = Array.isArray(data?.plans) ? data.plans : [];
        if (serverPlans.length === 0) {
          setPlansError("No hay planes institucionales disponibles en este momento.");
          setPlans([]);
        } else {
          setPlans(serverPlans);
          setPlansError(null);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setPlansError(
          err.response?.data?.detail ||
            "No pudimos cargar los planes desde el servidor. Verificá tu conexión e intentá nuevamente."
        );
      })
      .finally(() => {
        if (isMounted) setIsLoadingPlans(false);
      });

    return () => {
      isMounted = false;
    };
  }, [plansRequestKey]);

  const handleRetryPlans = useCallback(() => {
    setIsLoadingPlans(true);
    setPlansError(null);
    setPlansRequestKey((k) => k + 1);
  }, []);

  const statusParam = searchParams.get("payment_status") || searchParams.get("status");
  const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");
  const extRef = searchParams.get("external_reference");
  const planParam = searchParams.get("plan");

  // Verificar server-to-server antes de declarar suscripción activada
  useEffect(() => {
    if (!paymentId) return;

    let isMounted = true;
    billingService
      .verifyPaymentStatus({
        payment_id: paymentId,
        external_reference: extRef,
        payment_status: statusParam,
      })
      .then((res) => {
        if (!isMounted) return;

        if (res?.verified === true && res?.simulated) {
          setPaymentBanner({
            type: "pending",
            title: "Simulación de pago en entorno de prueba",
            message: `Se procesó una respuesta simulada${
              extRef ? ` (Ref: ${extRef})` : ""
            }. No corresponde a un pago real ni activa una suscripción productiva.`,
          });
          return;
        }

        if (res?.verified === true) {
          setPaymentBanner({
            type: "success",
            title: "¡Suscripción institucional activada con éxito!",
            message: `El pago fue verificado por el servidor${
              planParam ? ` para el plan ${planParam}` : ""
            }${extRef ? ` (Ref: ${extRef})` : ""}. Todas las herramientas de tu nivel ya están habilitadas.`,
          });
          return;
        }

        if (res?.status === "pending" || res?.status === "in_process") {
          setPaymentBanner({
            type: "pending",
            title: "Pago en proceso de acreditación",
            message:
              "MercadoPago está procesando tu transacción. En cuanto se confirme mediante nuestro Webhook seguro, tu plan se activará automáticamente.",
          });
          return;
        }

        setPaymentBanner({
          type: "error",
          title: "El pago no pudo confirmarse",
          message:
            res?.detail ||
            "La transacción fue rechazada, cancelada o todavía no está aprobada en MercadoPago.",
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        setPaymentBanner({
          type: "error",
          title: "No pudimos verificar el estado del pago",
          message:
            err.response?.data?.detail ||
            "Ocurrió un error al consultar la acreditación en el servidor. Intenta recargar la página en unos segundos.",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [paymentId, extRef, statusParam, planParam]);

  // Banner derivado de retorno sin paymentId verificable (evita setState síncrono y nunca declara éxito sin verificación)
  const effectiveBanner = useMemo(() => {
    if (paymentBanner) return paymentBanner;
    if (!statusParam) return null;

    if (paymentId) {
      return {
        type: "pending",
        isVerifying: true,
        title: "Verificando pago con el servidor...",
        message: "Confirmando el estado real de tu transacción ante MercadoPago.",
      };
    }

    if (statusParam === "rejected" || statusParam === "failure") {
      return {
        type: "error",
        title: "El pago no pudo completarse",
        message:
          "La transacción fue rechazada o cancelada en MercadoPago. Puedes intentar nuevamente con otro medio de pago.",
      };
    }

    if (statusParam === "pending" || statusParam === "in_process") {
      return {
        type: "pending",
        title: "Pago en proceso de acreditación",
        message:
          "MercadoPago está procesando tu transacción. En cuanto se confirme mediante nuestro Webhook seguro, tu plan se activará automáticamente.",
      };
    }

    return {
      type: "pending",
      title: "Verificación de pago pendiente",
      message:
        "No recibimos un identificador de pago verificable en la URL de retorno. Si abonaste recién, aguarda la confirmación por correo.",
    };
  }, [paymentBanner, statusParam, paymentId]);

  const handleOpenCheckout = (plan, cycle) => {
    setSelectedPlan(plan);
    setSelectedCycle(cycle);
    setIsCheckoutOpen(true);
  };

  const handleSimulatedSuccess = ({
    plan,
    billingCycle,
    organizationName,
    externalReference,
  }) => {
    setPaymentBanner({
      type: "pending",
      title: `Simulación de pago completada para "${organizationName}"`,
      message: `Modo sandbox local para ${plan.name} (${
        billingCycle === "ANNUAL" ? "Ciclo Anual" : "Ciclo Mensual"
      }, Ref: ${externalReference}). No se realizó un cobro real ni se activó una suscripción productiva.`,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearBanner = () => {
    setPaymentBanner(null);
    setSearchParams({});
  };

  return (
    <div className="force-light min-h-screen bg-background text-on-background font-sans flex flex-col">
      {/* Barra Superior de Navegación */}
      <header className="sticky top-0 z-30 w-full flex justify-between items-center py-stack-sm px-margin-edge sm:px-10 border-b border-outline-variant/40 bg-background/90 backdrop-blur-md">
        {/* Logo y Marca */}
        <div className="flex items-center gap-base group text-inherit no-underline">
          <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary shadow-sm">
            <FoliumSmallLogo />
          </div>
          <span className="font-serif text-headline-md text-on-surface group-hover:text-tertiary-container transition-colors">
            folium
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors no-underline inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a la página principal
          </Link>
        </div>
      </header>

      {/* Banner de Estado de Pago (Retorno de MercadoPago o Simulación Sandbox) */}
      {effectiveBanner && (
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-8 pt-8 animate-fade-in">
          <div
            role={effectiveBanner.type === "error" ? "alert" : "status"}
            className={`rounded-2xl p-5 border flex items-start justify-between gap-4 shadow-md ${
              effectiveBanner.type === "success"
                ? "bg-surface-container-lowest border-primary text-on-surface"
                : effectiveBanner.type === "pending"
                  ? "bg-surface-container border-outline text-on-surface"
                  : "bg-error-container/30 border-error text-on-surface"
            }`}
          >
            <div className="flex items-start gap-3.5">
              {effectiveBanner.isVerifying ? (
                <Loader2 className="w-6 h-6 text-primary shrink-0 mt-0.5 animate-spin" />
              ) : effectiveBanner.type === "success" ? (
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              ) : effectiveBanner.type === "pending" ? (
                <Clock className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-error shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="font-serif text-lg font-bold">
                  {effectiveBanner.title}
                </h3>
                <p className="text-body-md text-on-surface-variant mt-1">
                  {effectiveBanner.message}
                </p>
              </div>
            </div>

            {!effectiveBanner.isVerifying && (
              <button
                type="button"
                onClick={clearBanner}
                className="text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface cursor-pointer shrink-0"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Componente Principal de Tarjetas de Planes */}
      <main className="flex-1">
        {isLoadingPlans ? (
          <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-body-md text-on-surface-variant font-serif italic">
              Consultando planes vigentes desde el servidor…
            </p>
          </section>
        ) : plansError ? (
          <section className="max-w-2xl mx-auto px-4 sm:px-8 py-16">
            <div
              role="alert"
              className="rounded-2xl border border-error/40 bg-error-container/20 p-6 text-center flex flex-col items-center gap-4"
            >
              <AlertTriangle className="w-8 h-8 text-error" />
              <div>
                <h2 className="font-serif text-xl font-semibold text-on-surface mb-1">
                  No se pudieron cargar los planes
                </h2>
                <p className="text-body-md text-on-surface-variant">{plansError}</p>
              </div>
              <button
                type="button"
                onClick={handleRetryPlans}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
            </div>
          </section>
        ) : (
          <LibraryPricingCards plans={plans} onSelectPlan={handleOpenCheckout} />
        )}

        {/* Sección de Preguntas Frecuentes Institucionales */}
        <section
          id="faq"
          className="max-w-4xl mx-auto px-4 sm:px-8 py-10 border-t border-outline-variant/40"
        >
          <div className={`text-center ${isFaqOpen ? "mb-8" : "mb-2"}`}>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsFaqOpen((prev) => !prev)}
                className="mt-2 inline-flex items-center justify-center gap-2.5 font-serif text-2xl sm:text-3xl text-on-surface hover:text-primary transition-colors cursor-pointer group"
                aria-expanded={isFaqOpen}
                title={
                  isFaqOpen
                    ? "Ocultar preguntas frecuentes"
                    : "Desplegar preguntas frecuentes"
                }
              >
                <span>Preguntas Frecuentes</span>
                <ChevronDown
                  className={`w-6 h-6 sm:w-7 sm:h-7 text-primary transition-transform duration-300 ${
                    isFaqOpen ? "rotate-180" : "group-hover:translate-y-0.5"
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {isFaqOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
              {FAQ_ITEMS.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-2xs"
                >
                  <h4 className="font-serif text-lg font-semibold text-on-surface flex items-start gap-2.5 mb-2">
                    <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Pie de Página */}
      <footer className="py-6 px-6 border-t border-outline-variant/30 text-center text-xs text-on-surface-variant flex flex-col sm:flex-row items-center justify-between max-w-5xl w-full mx-auto gap-3">
        <span>
          © {new Date().getFullYear()} Folium — Gestión de Archivo y Patrimonio
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Pagos procesados de forma segura con MercadoPago
        </span>
      </footer>

      {/* Modal de Checkout con MercadoPago */}
      <MercadoPagoCheckoutModal
        key={`${selectedPlan?.code || "none"}-${selectedCycle}-${isCheckoutOpen}`}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={selectedPlan}
        initialBillingCycle={selectedCycle}
        onSimulatedSuccess={handleSimulatedSuccess}
      />
    </div>
  );
}
