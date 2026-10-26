import api from "../axiosConfig";

/**
 * Catálogo local de respaldo (sincronizado con `LIBRARY_PLANS_CATALOG` del backend).
 * Garantiza que la interfaz de planes funcione de inmediato incluso antes de
 * conectar `billing_urls.py` en el archivo `urls.py` principal de Django.
 */
export const DEFAULT_LIBRARY_PLANS = [
  {
    code: "PLUS",
    name: "Folium Acervo Plus",
    superscript: "1",
    badge_text: "",
    is_featured: false,
    subtitle_prefix: "Obtén ",
    subtitle_highlight: "capacidad ampliada",
    subtitle_suffix:
      " y herramientas de catalogación ágil para modernizar tu biblioteca comunitaria, popular o escolar.",
    monthly_price: 14990,
    annual_monthly_equivalent: 11990,
    annual_total_price: 143880,
    currency_id: "ARS",
    usd_reference: "9.99",
    usage_multiplier_note:
      "Obtén 5 veces más capacidad de acervo que con la versión sin cargo",
    cta_label: "Comenzar",
    includes_heading:
      "Todo lo que incluye la modalidad sin cargo, además de lo siguiente:",
    limits: {
      max_books: 5000,
      max_items: 15000,
      max_librarians: 3,
      has_mass_importer: true,
      has_ai_curator: false,
      has_priority_support: false,
    },
    feature_groups: [
      {
        category: "Gestión de Archivo e Inventario",
        items: [
          "Hasta 5.000 títulos únicos y 15.000 ejemplares físicos trazables",
          "Importador masivo de catálogos por Excel (.xlsx), CSV y BibTeX (.bib) con simulación previa",
          "Hasta 3 cuentas de Bibliotecario con panel de circulación y devoluciones",
          "Control de ubicaciones físicas por sala, pasillo y estantería",
        ],
      },
      {
        category: "Comunidad y Experiencia Lectora",
        items: [
          "Acceso a nuestro Asistente Curador Folium rápido para socios",
          "Obtén límites de reservas simultáneas 2 veces mayores² y alertas de vencimiento",
          "Reportes mensuales de préstamos activos, rotación y estado de conservación",
        ],
      },
    ],
  },
  {
    code: "PRO",
    name: "Folium Patrimonio Pro",
    superscript: "1",
    badge_text: "Incluye Curador IA Avanzado & Acervo Ilimitado",
    is_featured: true,
    subtitle_prefix: "Obtén ",
    subtitle_highlight: "acceso mejorado",
    subtitle_suffix:
      " a funciones nuevas y potentes de preservación, analítica e inteligencia para impulsar tu institución.",
    monthly_price: 34990,
    annual_monthly_equivalent: 27990,
    annual_total_price: 335880,
    currency_id: "ARS",
    usd_reference: "24.99",
    usage_multiplier_note:
      "Obtén catálogo ilimitado y 4 veces más capacidad operativa que la versión gratuita",
    cta_label: "Comenzar",
    includes_heading:
      "Todo lo que incluye la modalidad sin cargo, además de lo siguiente:",
    limits: {
      max_books: 0,
      max_items: 0,
      max_librarians: 15,
      has_mass_importer: true,
      has_ai_curator: true,
      has_priority_support: true,
    },
    feature_groups: [
      {
        category: "Suite Patrimonial & Curador IA",
        items: [
          "Acceso al motor de recomendaciones semánticas y Curador IA Pro",
          "Acceso a nuestro módulo de Importación Masiva sin límite de filas",
          "Acceso a gestión multi-sede con obras y ejemplares físicos ilimitados",
          "Obtén hasta 15 cuentas de Bibliotecario y Administrador² con auditoría de actividad",
        ],
      },
      {
        category: "Soporte Institucional y Prioridad",
        items: [
          "Acompañamiento técnico prioritario en la migración inicial de tu archivo",
          "Estadísticas históricas de lectura, demanda por género y reseñas verificadas",
          "Reglas personalizadas de plazos de préstamo y renovación por colección",
        ],
      },
    ],
  },
];

const BASE = "/billing/";

export const billingService = {
  /**
   * Obtiene los planes institucionales desde el backend.
   * Si el endpoint aún no fue registrado en `urls.py`, devuelve el catálogo por defecto.
   */
  getPlans: async () => {
    try {
      const response = await api.get(`${BASE}plans/`);
      return response.data;
    } catch {
      return {
        plans: DEFAULT_LIBRARY_PLANS,
        gateway: {
          provider: "mercadopago",
          is_live_configured: false,
          public_key: import.meta.env.VITE_MP_PUBLIC_KEY || null,
        },
      };
    }
  },

  /**
   * Solicita al backend la creación de una preferencia de Checkout Pro
   * o una suscripción recurrente (`PreApproval`) en MercadoPago.
   *
   * @param {Object} payload
   * @param {"PLUS"|"PRO"} payload.plan_code
   * @param {"MONTHLY"|"ANNUAL"} payload.billing_cycle
   * @param {string} payload.organization_name
   * @param {string} [payload.tax_id]
   * @param {string} [payload.payer_email]
   * @param {"PREFERENCE"|"SUBSCRIPTION"} [payload.checkout_mode]
   */
  createCheckout: async (payload) => {
    const response = await api.post(`${BASE}checkout/`, payload);
    return response.data;
  },

  /**
   * Verifica el estado real de un pago al regresar desde las `back_urls` de MercadoPago.
   * @param {Object} params - `{ payment_id, external_reference, payment_status }`
   */
  verifyPaymentStatus: async (params) => {
    const response = await api.get(`${BASE}payment-status/`, { params });
    return response.data;
  },
};
