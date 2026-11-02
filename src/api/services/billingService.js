import api from "../axiosConfig";

/**
 * Catálogo local de respaldo (sincronizado con `LIBRARY_PLANS_CATALOG` del backend).
 * Diseñado para ARPU objetivo USD 300 - 400/mes con escalabilidad cloud en AWS.
 */
export const DEFAULT_LIBRARY_PLANS = [
  {
    code: "BASIC",
    name: "Folium Gestión",
    superscript: "1",
    badge_text: "Solo Gestión de Biblioteca & Inventario",
    is_featured: false,
    subtitle_prefix: "Ideal para instituciones que desean ",
    subtitle_highlight: "ordenar su catálogo y mostrador",
    subtitle_suffix:
      " sin habilitar un portal web público a los usuarios.",
    monthly_price: 247000,
    annual_monthly_equivalent: 205800,
    annual_total_price: 2470000,
    currency_id: "ARS",
    usd_reference: "190.00",
    annual_usd_reference: "158.33",
    usage_multiplier_note:
      "Incluye 50 GB de almacenamiento AWS S3 y 250 GB de tráfico CloudFront",
    cta_label: "Contratar Plan Gestión",
    includes_heading:
      "Funcionalidades de administración interna incluidas:",
    limits: {
      max_books: 10000,
      max_items: 25000,
      max_librarians: 3,
      has_reader_portal: false,
      has_coverflow_3d: false,
      has_mass_importer: true,
      has_ai_curator: false,
      has_priority_support: false,
      s3_storage_gb: 50,
      cloudfront_bandwidth_gb: 250,
    },
    feature_groups: [
      {
        category: "Administración y Circulación Interna",
        items: [
          "Panel exclusivo de bibliotecario con préstamos y devoluciones de mostrador",
          "Jerarquía ontológica dual: Obra (Book) y Ejemplares físicos (BookItem)",
          "Control de signatura topográfica exacta (Sala, Pasillo y Estante)",
          "Hasta 3 cuentas simultáneas de personal bibliotecario y catalogador",
          "Importador ágil de fondos bibliográficos mediante planillas Excel (.xlsx) y CSV",
        ],
      },
      {
        category: "Límites de Infraestructura Cloud en AWS",
        items: [
          "50 GB de almacenamiento seguro en Amazon S3 para portadas y respaldos",
          "250 GB / mes de transferencia de datos en AWS CloudFront",
          "Base de datos PostgreSQL con respaldo diario automatizado",
          "Hasta 10.000 títulos únicos y 25.000 ejemplares físicos con código de barras",
        ],
      },
    ],
  },
  {
    code: "PRO",
    name: "Folium Integral",
    superscript: "1",
    badge_text: "Recomendado • Estado Actual Completo (Usuarios + Biblioteca)",
    is_featured: true,
    subtitle_prefix: "Nuestra solución integral que ",
    subtitle_highlight: "conecta a los bibliotecarios con toda la comunidad",
    subtitle_suffix:
      " mediante catálogo 3D, reservas 24/7 y motor MARC 21.",
    monthly_price: 455000,
    annual_monthly_equivalent: 379100,
    annual_total_price: 4550000,
    currency_id: "ARS",
    usd_reference: "350.00",
    annual_usd_reference: "291.66",
    usage_multiplier_note:
      "Incluye 250 GB de almacenamiento AWS S3 y 1 TB de tráfico mensual acelerado",
    cta_label: "Comenzar con Plan Integral",
    includes_heading:
      "Todo lo del Plan Básico, más el portal completo de usuarios:",
    limits: {
      max_books: 50000,
      max_items: 120000,
      max_librarians: 10,
      has_reader_portal: true,
      has_coverflow_3d: true,
      has_mass_importer: true,
      has_ai_curator: false,
      has_priority_support: true,
      s3_storage_gb: 250,
      cloudfront_bandwidth_gb: 1000,
    },
    feature_groups: [
      {
        category: "Portal del Lector & OPAC 3D",
        items: [
          "Catálogo público con Carrusel 3D CoverFlow y física de resorte",
          "Portal autogestionado del socio con credencial digital institucional por DNI",
          "Módulo de Reservas Online 24/7 y semáforo automático de vencimientos",
          "Buscador reactivo con filtro por facetas y stock en sala en tiempo real",
          "Socios lectores y estudiantes activos ilimitados",
        ],
      },
      {
        category: "Rigor Internacional MARC 21 & Circulación",
        items: [
          "Ingesta nativa de archivos MARC 21 (.mrc ISO 2709), MARCXML y BibTeX",
          "Simulación Dry-Run previa para verificar consistencia antes de persistir",
          "Notificaciones automáticas por correo electrónico con Celery y Redis",
          "Hasta 10 puestos de bibliotecarios y administradores con auditoría forense",
        ],
      },
      {
        category: "Límites de Infraestructura Cloud en AWS",
        items: [
          "250 GB de almacenamiento en Amazon S3 para activos en alta definición",
          "1.000 GB (1 TB) / mes de transferencia en AWS CloudFront",
          "Snapshots automáticos de base de datos cada 12 horas con retención de 15 días",
        ],
      },
    ],
  },
  {
    code: "PREMIUM",
    name: "Folium Nexus AI",
    superscript: "1",
    badge_text: "Suite de Vanguardia • Tomito AI Bot + Multi-Sede + API",
    is_featured: false,
    subtitle_prefix: "Para instituciones y consorcios que exigen ",
    subtitle_highlight: "Inteligencia Artificial generativa y multisede",
    subtitle_suffix:
      " con integraciones académicas y resiliencia de misión crítica.",
    monthly_price: 767000,
    annual_monthly_equivalent: 639100,
    annual_total_price: 7670000,
    currency_id: "ARS",
    usd_reference: "590.00",
    annual_usd_reference: "491.66",
    usage_multiplier_note:
      "Incluye 1 TB de almacenamiento AWS S3, 5 TB de tráfico CloudFront y clúster Multi-AZ",
    cta_label: "Solicitar Plan Nexus AI",
    includes_heading:
      "Todo lo del Plan Pro, más tecnologías de vanguardia:",
    limits: {
      max_books: 0,
      max_items: 0,
      max_librarians: 0,
      has_reader_portal: true,
      has_coverflow_3d: true,
      has_mass_importer: true,
      has_ai_curator: true,
      has_priority_support: true,
      s3_storage_gb: 1000,
      cloudfront_bandwidth_gb: 5000,
    },
    feature_groups: [
      {
        category: "Conserje Inteligente Tomito AI (RAG Generativo)",
        items: [
          "Asistente conversacional Tomito AI entrenado sobre el catálogo propio",
          "Búsqueda semántica en lenguaje natural y recomendaciones personalizadas",
          "Hasta 25.000 consultas mensuales de alumnos y socios asistidas por IA",
          "Respuestas instantáneas de stock, estantería y reglamento de sala",
        ],
      },
      {
        category: "Consorcios Multi-Sede & Conectividad",
        items: [
          "Gestión multi-campus y multi-sucursal con catálogo colectivo centralizado",
          "Préstamo y circulación interbibliotecaria entre diferentes sedes",
          "API REST completa y Webhooks para integración con LMS (Moodle, Canvas, Classroom)",
          "Obras, ejemplares físicos y cuentas de operadores ilimitados",
        ],
      },
      {
        category: "Infraestructura Empresarial Dedicada en AWS",
        items: [
          "1.000 GB (1 TB) de almacenamiento en Amazon S3 ampliable sin tope",
          "5.000 GB (5 TB) / mes de transferencia con aceleración perimetral",
          "Clúster PostgreSQL Multi-AZ de alta disponibilidad con réplica de lectura",
          "SLA del 99.9% garantizado por contrato y canal de soporte prioritario 24/7",
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
   * @param {"BASIC"|"PRO"|"PREMIUM"} payload.plan_code
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
