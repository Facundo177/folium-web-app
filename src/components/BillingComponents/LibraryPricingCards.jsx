import { useState } from "react";
import { BadgeCheck, Check, Sparkle, ShieldCheck, Building2 } from "lucide-react";
import { DEFAULT_LIBRARY_PLANS } from "../../api/services/billingService";

/**
 * Formatea números en formato moneda argentina (ej: 14990 -> "14.990")
 */
function formatArsPrice(value) {
  const num = Number(value || 0);
  return num.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function LibraryPricingCards({
  plans = DEFAULT_LIBRARY_PLANS,
  onSelectPlan,
}) {
  const [billingCycle, setBillingCycle] = useState("MONTHLY"); // "MONTHLY" | "ANNUAL"
  const [currencyView, setCurrencyView] = useState("ARS"); // "ARS" | "USD"

  const activePlans = plans?.length ? plans : DEFAULT_LIBRARY_PLANS;

  const handlePlanClick = (plan) => {
    if (onSelectPlan) {
      onSelectPlan(plan, billingCycle);
    }
  };

  return (
    <section
      id="planes-bibliotecas"
      className="w-full py-12 px-4 sm:px-8 font-sans text-on-background transition-colors"
    >
      <div className="max-w-5xl mx-auto">
        {/* Encabezado y Controles de Facturación */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-label-caps text-primary tracking-[0.2em] uppercase block mb-3">
            Suscripciones Institucionales • MercadoPago
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-on-surface font-medium leading-tight mb-4">
            Planes pensados para cada escala de biblioteca
          </h2>
          <p className="text-body-lg text-on-surface-variant leading-relaxed mb-8">
            Comienza con nuestra modalidad sin cargo para pequeños archivos o
            amplía la capacidad operativa de tu institución con facturación
            local transparente a través de MercadoPago.
          </p>

          {/* Barra de Selectores: Ciclo Mensual/Anual y Moneda */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-surface-container p-1.5 rounded-full border border-outline-variant/60 shadow-xs">
            <button
              type="button"
              onClick={() => setBillingCycle("MONTHLY")}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                billingCycle === "MONTHLY"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("ANNUAL")}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                billingCycle === "ANNUAL"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span>Anual</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  billingCycle === "ANNUAL"
                    ? "bg-on-primary text-primary"
                    : "bg-primary/15 text-primary"
                }`}
              >
                -20% OFF
              </span>
            </button>

            <div className="h-5 w-px bg-outline-variant/60 mx-1 hidden sm:block" />

            <div className="inline-flex items-center rounded-full bg-surface-container-lowest border border-outline-variant/40 p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setCurrencyView("ARS")}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  currencyView === "ARS"
                    ? "bg-secondary text-on-secondary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                $ ARS
              </button>
              <button
                type="button"
                onClick={() => setCurrencyView("USD")}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  currencyView === "USD"
                    ? "bg-secondary text-on-secondary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                USD (Ref.)
              </button>
            </div>
          </div>
        </div>

        {/* Grilla Principal de Tarjetas (Inspirada en el layout limpio de referencia) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {activePlans.map((plan) => {
            const isPro = Boolean(plan.is_featured || plan.code === "PRO");
            const displayArsPrice =
              billingCycle === "ANNUAL"
                ? plan.annual_monthly_equivalent
                : plan.monthly_price;

            const displayUsdPrice =
              billingCycle === "ANNUAL"
                ? (Number(plan.usd_reference || 10) * 0.8).toFixed(2)
                : plan.usd_reference;

            return (
              <article
                key={plan.code}
                className={`relative rounded-3xl bg-surface-container-lowest p-7 sm:p-9 flex flex-col justify-between transition-all duration-300 ${
                  isPro
                    ? "border-2 border-primary shadow-xl ring-1 ring-primary/15"
                    : "border border-outline-variant/80 shadow-md hover:border-outline"
                }`}
              >
                <div>
                  {/* Etiqueta Superior Destacada (Ej: "Incluye Curador IA Avanzado...") */}
                  <div className="min-h-[24px] mb-1">
                    {plan.badge_text ? (
                      <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary tracking-tight">
                        {plan.badge_text}
                      </span>
                    ) : null}
                  </div>

                  {/* Nombre del Plan con superíndice */}
                  <h3 className="font-serif text-3xl sm:text-[34px] font-semibold text-on-surface leading-tight mb-3">
                    {plan.name}
                    {plan.superscript && (
                      <sup className="text-sm font-sans font-semibold text-on-surface-variant ml-0.5">
                        {plan.superscript}
                      </sup>
                    )}
                  </h3>

                  {/* Subtítulo con palabras clave resaltadas en negrita */}
                  <p className="text-body-lg text-on-surface-variant leading-relaxed mb-7 min-h-[72px]">
                    {plan.subtitle_prefix}
                    <strong className="font-bold text-on-surface">
                      {plan.subtitle_highlight}
                    </strong>
                    {plan.subtitle_suffix}
                  </p>

                  {/* Bloque de Precio Principal */}
                  <div className="mb-7">
                    <div className="flex items-baseline flex-wrap gap-x-1.5">
                      <span className="text-lg sm:text-xl font-bold text-primary self-start mt-1">
                        $
                      </span>
                      {currencyView === "ARS" ? (
                        <>
                          <span className="font-serif text-4xl sm:text-5xl font-bold text-primary tracking-tight leading-none">
                            {formatArsPrice(displayArsPrice)}
                          </span>
                          <span className="text-body-md font-medium text-on-surface-variant">
                            ARS por mes
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-serif text-4xl sm:text-5xl font-bold text-primary tracking-tight leading-none">
                            {displayUsdPrice}
                          </span>
                          <span className="text-body-md font-medium text-on-surface-variant">
                            USD por mes (ref.)
                          </span>
                        </>
                      )}
                    </div>

                    {billingCycle === "ANNUAL" && currencyView === "ARS" && (
                      <p className="text-xs font-semibold text-primary mt-1.5">
                        Facturado anualmente (${formatArsPrice(plan.annual_total_price)} ARS/año)
                      </p>
                    )}

                    <p className="text-xs text-on-surface-variant mt-2 leading-normal">
                      {plan.usage_multiplier_note}
                    </p>
                  </div>

                  {/* Botón Redondeado Principal ("Comenzar") */}
                  <button
                    type="button"
                    onClick={() => handlePlanClick(plan)}
                    className={`w-full py-3.5 px-6 rounded-full text-sm font-bold tracking-wide transition-all cursor-pointer shadow-sm mb-8 ${
                      isPro
                        ? "bg-primary text-on-primary hover:opacity-95 shadow-md"
                        : "bg-primary/90 text-on-primary hover:bg-primary"
                    }`}
                  >
                    {plan.cta_label || "Comenzar"}
                  </button>

                  {/* Sello de Inclusión Base */}
                  <div className="flex items-start gap-3 pb-5 border-b border-outline-variant/50">
                    <BadgeCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-body-md font-bold text-on-surface leading-snug">
                      {plan.includes_heading}
                    </p>
                  </div>

                  {/* Grupos de Características con Estrella de 4 Puntas (✦) y Tildes (✓) */}
                  <div className="pt-5 flex flex-col gap-6">
                    {(plan.feature_groups || []).map((group, gIdx) => (
                      <div key={gIdx} className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                          <Sparkle
                            className="w-4 h-4 text-on-surface shrink-0"
                            fill="currentColor"
                          />
                          <h4 className="text-body-md font-bold text-on-surface">
                            {group.category}
                          </h4>
                        </div>

                        <ul className="flex flex-col gap-3 pl-1">
                          {(group.items || []).map((itemText, iIdx) => (
                            <li
                              key={iIdx}
                              className="flex items-start gap-3 text-body-md text-on-surface-variant leading-relaxed"
                            >
                              <Check className="w-4 h-4 text-primary shrink-0 mt-1 stroke-[2.5]" />
                              <span>{itemText}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pie de Tarjeta con Garantía MercadoPago */}
                <div className="mt-8 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    Pago seguro con MercadoPago
                  </span>
                  <span>Cancelación sin permanencia</span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Franja de Modalidad Sin Cargo (Folium Comunidad) */}
        <div className="mt-8 rounded-2xl bg-surface-container border border-outline-variant/60 p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-surface-container-lowest border border-outline-variant/50 flex items-center justify-center text-primary shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-serif text-xl font-semibold text-on-surface">
                  Modalidad Sin Cargo — Folium Comunidad
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-on-surface border border-outline-variant/50">
                  Gratis para siempre
                </span>
              </div>
              <p className="text-body-md text-on-surface-variant mt-1">
                Incluye catálogo público, hasta <strong>250 títulos</strong>,{" "}
                <strong>500 ejemplares físicos</strong>, 1 cuenta de bibliotecario y
                gestión básica de préstamos y reservas para pequeñas bibliotecas en formación.
              </p>
            </div>
          </div>
        </div>

        {/* Notas Legales y Aclaraciones al Pie (Superíndices ¹ y ²) */}
        <div className="mt-6 px-2 text-xs text-on-surface-variant space-y-1.5 leading-relaxed">
          <p>
            <sup>1</sup> Los precios expresados en pesos argentinos (ARS) se procesan
            localmente a través de <strong>MercadoPago</strong> (Checkout Pro o Débito
            Automático) sin recargos por moneda extranjera. La vista en USD es
            únicamente de referencia internacional.
          </p>
          <p>
            <sup>2</sup> Los límites de cuentas bibliotecarias y reglas de reserva
            aplican por institución registrada. Puedes cambiar de plan o cancelar la
            renovación automática en cualquier momento desde el panel de administración.
          </p>
        </div>
      </div>
    </section>
  );
}
