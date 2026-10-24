import { useState } from "react";
import {
  X,
  ShieldCheck,
  CreditCard,
  Building2,
  Mail,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { billingService } from "../../api/services/billingService";
import { useAuth } from "../../auth/AuthProvider";

function formatArs(value) {
  return Number(value || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function MercadoPagoCheckoutModal({
  isOpen,
  onClose,
  selectedPlan,
  initialBillingCycle = "MONTHLY",
  onSimulatedSuccess,
}) {
  const { user } = useAuth();

  const [billingCycle, setBillingCycle] = useState(initialBillingCycle);
  const [checkoutMode, setCheckoutMode] = useState("PREFERENCE"); // "PREFERENCE" | "SUBSCRIPTION"
  const [organizationName, setOrganizationName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [payerEmail, setPayerEmail] = useState(user?.email || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [checkoutResult, setCheckoutResult] = useState(null);

  if (!isOpen || !selectedPlan) return null;

  const totalAmount =
    billingCycle === "ANNUAL"
      ? selectedPlan.annual_total_price
      : selectedPlan.monthly_price;

  const monthlyEquiv =
    billingCycle === "ANNUAL"
      ? selectedPlan.annual_monthly_equivalent
      : selectedPlan.monthly_price;

  const handleCreateCheckout = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanOrg = organizationName.trim();
    if (cleanOrg.length < 3) {
      setErrorMsg(
        "Por favor ingresa el nombre oficial de la biblioteca o institución (mínimo 3 caracteres)."
      );
      return;
    }

    const cleanEmail = payerEmail.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Ingresa un correo electrónico válido para recibir la factura.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await billingService.createCheckout({
        plan_code: selectedPlan.code,
        billing_cycle: billingCycle,
        organization_name: cleanOrg,
        tax_id: taxId.trim(),
        payer_email: cleanEmail,
        checkout_mode: checkoutMode,
      });

      const checkoutData = response.checkout;
      setCheckoutResult(checkoutData);

      // Si estamos conectados al API real de MercadoPago, redirigimos a init_point
      if (
        checkoutData?.mode === "LIVE_OR_SANDBOX_API" &&
        checkoutData?.init_point
      ) {
        window.location.href = checkoutData.init_point;
      }
    } catch (err) {
      // Si el backend aún no tiene registrada la ruta en urls.py (404),
      // generamos una vista previa local del flujo de MercadoPago para demostración
      if (err.response?.status === 404 || err.code === "ERR_NETWORK") {
        const mockRef = `FOLIUM-${selectedPlan.code}-${billingCycle}-${Date.now()
          .toString()
          .slice(-6)}`;
        setCheckoutResult({
          mode: "LOCAL_SIMULATION",
          preference_id: `PREF-SANDBOX-${Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase()}`,
          external_reference: mockRef,
          amount: totalAmount,
          currency_id: "ARS",
          plan_name: selectedPlan.name,
          billing_cycle: billingCycle,
          simulation_notice:
            "Vista previa de integración: Conecta billing_urls.py en Django y configura MP_ACCESS_TOKEN para redirigir a la pasarela real de MercadoPago.",
        });
      } else {
        const apiDetail =
          err.response?.data?.detail ||
          Object.values(err.response?.data || {})
            .flat()
            .join(" ") ||
          "No se pudo generar la orden de pago con MercadoPago.";
        setErrorMsg(apiDetail);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setCheckoutResult(null);
    setErrorMsg("");
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={handleResetAndClose}
    >
      <div
        className="w-full max-w-xl bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl overflow-hidden font-sans text-on-surface animate-fade-in my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="bg-surface-container px-6 py-5 border-b border-outline-variant/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary block">
                Pasarela Institucional • MercadoPago
              </span>
              <h3 className="font-serif text-xl font-semibold text-on-surface">
                Suscribir a {selectedPlan.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-colors cursor-pointer"
            aria-label="Cerrar ventana de pago"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 sm:p-7">
          {!checkoutResult ? (
            <form onSubmit={handleCreateCheckout} className="flex flex-col gap-5">
              {/* Resumen de Precio y Ciclo */}
              <div className="bg-surface-container/60 border border-outline-variant/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                    Plan Seleccionado
                  </span>
                  <p className="font-serif text-lg font-semibold text-on-surface">
                    {selectedPlan.name}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Equivalente a ${formatArs(monthlyEquiv)} ARS / mes
                  </p>
                </div>

                {/* Selector rápido Mensual / Anual dentro del checkout */}
                <div className="flex flex-col items-start sm:items-end">
                  <div className="inline-flex rounded-lg bg-surface-container-lowest border border-outline-variant/60 p-0.5 mb-1.5">
                    <button
                      type="button"
                      onClick={() => setBillingCycle("MONTHLY")}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                        billingCycle === "MONTHLY"
                          ? "bg-primary text-on-primary"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Mensual
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle("ANNUAL")}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                        billingCycle === "ANNUAL"
                          ? "bg-primary text-on-primary"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Anual (-20%)
                    </button>
                  </div>
                  <p className="font-serif text-2xl font-bold text-primary">
                    ${formatArs(totalAmount)}{" "}
                    <span className="text-xs font-sans font-normal text-on-surface-variant">
                      ARS {billingCycle === "ANNUAL" ? "/ año" : "/ mes"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Modalidad de Cobro en MercadoPago */}
              <div>
                <label className="text-label-caps text-on-surface block mb-2">
                  Modalidad de pago en MercadoPago
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutMode("PREFERENCE")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      checkoutMode === "PREFERENCE"
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-outline-variant/60 hover:border-outline"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-on-surface">
                        Checkout Pro (Pago por período)
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Tarjeta, dinero en cuenta o transferencia.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutMode("SUBSCRIPTION")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      checkoutMode === "SUBSCRIPTION"
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-outline-variant/60 hover:border-outline"
                    }`}
                  >
                    <RefreshCw className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-on-surface">
                        Suscripción Automática
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Débito automático recurrente con tarjeta.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Datos de la Biblioteca / Institución */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-caps text-on-surface flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  Nombre de la Biblioteca o Institución *
                </label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Ej: Biblioteca Popular Sarmiento"
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-caps text-on-surface flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    CUIT / CUIL (Opcional)
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="Ej: 30-71234567-9"
                    className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/60"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-label-caps text-on-surface flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    Email de Facturación *
                  </label>
                  <input
                    type="email"
                    required
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="administracion@biblioteca.org"
                    className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/60"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-lg bg-error/10 border border-error/30 text-error text-xs font-medium flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Botón de envío hacia MercadoPago */}
              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-full bg-primary text-on-primary text-sm font-bold tracking-wide hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generando orden segura en MercadoPago...
                    </>
                  ) : (
                    <>
                      <span>Continuar a MercadoPago (${formatArs(totalAmount)} ARS)</span>
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-on-surface-variant flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  Tus datos de pago son procesados directamente por MercadoPago bajo encriptación TLS y validación HMAC.
                </p>
              </div>
            </form>
          ) : (
            /* Vista de Preferencia Generada (Modo Sandbox / Simulación Local) */
            <div className="flex flex-col gap-5">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/25 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif text-lg font-semibold text-on-surface">
                    Orden de pago generada correctamente
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {checkoutResult.simulation_notice ||
                      "La preferencia fue creada en el servidor. Haz clic debajo para completar el pago en MercadoPago."}
                  </p>
                </div>
              </div>

              <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/50 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Institución:</span>
                  <span className="font-bold text-on-surface">{organizationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Referencia Externa:</span>
                  <span className="font-mono text-on-surface">
                    {checkoutResult.external_reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">ID Preferencia / Sub:</span>
                  <span className="font-mono text-primary font-semibold">
                    {checkoutResult.preference_id || checkoutResult.preapproval_id}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-outline-variant/40 text-sm">
                  <span className="font-bold text-on-surface">Total a abonar:</span>
                  <span className="font-bold text-primary">
                    ${formatArs(checkoutResult.amount)} {checkoutResult.currency_id}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onSimulatedSuccess) {
                      onSimulatedSuccess({
                        plan: selectedPlan,
                        billingCycle,
                        organizationName,
                        externalReference: checkoutResult.external_reference,
                      });
                    }
                    handleResetAndClose();
                  }}
                  className="flex-1 py-3 px-5 rounded-full bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simular Pago Aprobado (Sandbox)
                </button>

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="py-3 px-5 rounded-full bg-surface-variant text-on-surface text-xs font-bold uppercase tracking-wider hover:bg-outline-variant transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
