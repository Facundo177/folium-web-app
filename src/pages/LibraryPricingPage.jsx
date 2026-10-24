import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import LibraryPricingCards from "../components/BillingComponents/LibraryPricingCards";
import MercadoPagoCheckoutModal from "../components/BillingComponents/MercadoPagoCheckoutModal";
import { billingService, DEFAULT_LIBRARY_PLANS } from "../api/services/billingService";
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
    a: "Sí. Tanto Folium Acervo Plus como Folium Patrimonio Pro incluyen acceso completo a nuestro Importador Masivo inteligente, que detecta columnas automáticamente y simula la carga antes de impactar en la base de datos.",
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
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [plans, setPlans] = useState(DEFAULT_LIBRARY_PLANS);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState("MONTHLY");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentBanner, setPaymentBanner] = useState(null);

  // Cargar catálogo de planes desde el backend (con fallback local)
  useEffect(() => {
    let isMounted = true;
    billingService.getPlans().then((data) => {
      if (isMounted && data?.plans?.length) {
        setPlans(data.plans);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Detectar retorno desde las back_urls de MercadoPago (?payment_status=approved...)
  useEffect(() => {
    const statusParam =
      searchParams.get("payment_status") || searchParams.get("status");
    const paymentId =
      searchParams.get("payment_id") || searchParams.get("collection_id");
    const extRef = searchParams.get("external_reference");
    const planParam = searchParams.get("plan");

    if (!statusParam) return;

    if (statusParam === "approved" || statusParam === "authorized") {
      setPaymentBanner({
        type: "success",
        title: "¡Suscripción institucional activada con éxito!",
        message: `El pago fue confirmado por MercadoPago${
          planParam ? ` para el plan ${planParam}` : ""
        }${extRef ? ` (Ref: ${extRef})` : ""}. Todas las herramientas de tu nivel ya están habilitadas.`,
      });
    } else if (statusParam === "pending" || statusParam === "in_process") {
      setPaymentBanner({
        type: "pending",
        title: "Pago en proceso de acreditación",
        message:
          "MercadoPago está procesando tu transacción. En cuanto se confirme mediante nuestro Webhook seguro, tu plan se activará automáticamente.",
      });
    } else if (statusParam === "rejected" || statusParam === "failure") {
      setPaymentBanner({
        type: "error",
        title: "El pago no pudo completarse",
        message:
          "La transacción fue rechazada o cancelada en MercadoPago. Puedes intentar nuevamente con otro medio de pago.",
      });
    }

    // Si hay payment_id, consultamos al backend para verificación server-to-server
    if (paymentId) {
      billingService
        .verifyPaymentStatus({
          payment_id: paymentId,
          external_reference: extRef,
          payment_status: statusParam,
        })
        .catch(() => {
          // Silencioso si el endpoint aún no está montado en urls.py
        });
    }
  }, [searchParams]);

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
      type: "success",
      title: `¡Suscripción activada para "${organizationName}"!`,
      message: `Se registró correctamente el plan ${plan.name} (${
        billingCycle === "ANNUAL" ? "Ciclo Anual" : "Ciclo Mensual"
      }) con referencia ${externalReference}.`,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearBanner = () => {
    setPaymentBanner(null);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-sans flex flex-col">
      {/* Barra Superior de Navegación */}
      <header className="sticky top-0 z-30 w-full flex justify-between items-center py-4 px-6 sm:px-10 border-b border-outline-variant/40 bg-background/90 backdrop-blur-md">
        <Link
          to="/"
          className="flex items-center gap-3 text-inherit no-underline group"
        >
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-xs">
            <FoliumSmallLogo />
          </div>
          <span className="font-serif text-2xl text-on-surface group-hover:text-primary transition-colors">
            folium
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/catalog"
            className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors no-underline inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Catálogo
          </Link>
        </div>
      </header>

      {/* Banner de Estado de Pago (Retorno de MercadoPago o Simulación Sandbox) */}
      {paymentBanner && (
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-8 pt-8 animate-fade-in">
          <div
            className={`rounded-2xl p-5 border flex items-start justify-between gap-4 shadow-md ${
              paymentBanner.type === "success"
                ? "bg-surface-container-lowest border-primary text-on-surface"
                : paymentBanner.type === "pending"
                ? "bg-surface-container border-outline text-on-surface"
                : "bg-error-container/30 border-error text-on-surface"
            }`}
          >
            <div className="flex items-start gap-3.5">
              {paymentBanner.type === "success" && (
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              )}
              {paymentBanner.type === "pending" && (
                <Clock className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              )}
              {paymentBanner.type === "error" && (
                <AlertTriangle className="w-6 h-6 text-error shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="font-serif text-lg font-bold">
                  {paymentBanner.title}
                </h3>
                <p className="text-body-md text-on-surface-variant mt-1">
                  {paymentBanner.message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearBanner}
              className="text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface cursor-pointer shrink-0"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Componente Principal de Tarjetas de Planes */}
      <main className="flex-1">
        <LibraryPricingCards
          plans={plans}
          onSelectPlan={handleOpenCheckout}
        />

        {/* Sección de Preguntas Frecuentes Institucionales */}
        <section className="max-w-4xl mx-auto px-4 sm:px-8 py-12 border-t border-outline-variant/40">
          <div className="text-center mb-8">
            <span className="text-label-caps text-primary uppercase tracking-widest">
              Transparencia & Soporte
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-on-surface mt-2">
              Preguntas frecuentes sobre suscripciones
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
        </section>
      </main>

      {/* Pie de Página */}
      <footer className="py-6 px-6 border-t border-outline-variant/30 text-center text-xs text-on-surface-variant flex flex-col sm:flex-row items-center justify-between max-w-5xl w-full mx-auto gap-3">
        <span>© {new Date().getFullYear()} Folium — Gestión de Archivo y Patrimonio</span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Pagos procesados de forma segura con MercadoPago
        </span>
      </footer>

      {/* Modal de Checkout con MercadoPago */}
      <MercadoPagoCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={selectedPlan}
        initialBillingCycle={selectedCycle}
        onSimulatedSuccess={handleSimulatedSuccess}
      />
    </div>
  );
}
