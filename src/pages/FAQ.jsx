import { Link } from "react-router-dom";
import GoBackButton from "../components/BasicUIComponents/GoBackButton";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { HelpCircle, ChevronDown, BookOpen } from "lucide-react";

const FAQS = [
  {
    q: "¿Necesito una cuenta para explorar el catálogo?",
    a: "No. Podés recorrer todo el acervo, consultar las fichas técnicas, autores y disponibilidad en tiempo real como invitado. Para solicitar reservas, guardar favoritos y calificar libros, sí es necesario registrarse gratuitamente.",
  },
  {
    q: "¿Cómo reservo un libro?",
    a: "Iniciá sesión con tu cuenta de lector, buscá el título en el catálogo y pulsá el botón 'Reservar'. Confirmá la solicitud en el modal emergente y se apartará un ejemplar físico durante 14 días para retiro en sala.",
  },
  {
    q: "¿Cómo cancelo una reserva activa?",
    a: "Podés cancelarla en cualquier momento desde la misma tarjeta del catálogo (el botón pasa a indicar 'Cancelar reserva') o desde tu panel personal en 'Mis Reservas'.",
  },
  {
    q: "¿Los libros tienen costo o se compran?",
    a: "No. En Folium los libros no se venden ni se alquilan. La plataforma funciona bajo el modelo tradicional de bibliotecas públicas y comunitarias de préstamo y circulación libre.",
  },
  {
    q: "¿Qué documentación necesito para retirar un libro en sala?",
    a: "Únicamente presentar tu DNI en el mostrador presencial. El bibliotecario validará tu identidad contra el sistema y generará el préstamo en segundos.",
  },
  {
    q: "¿Cuánto tiempo puedo conservar un ejemplar?",
    a: "El período inicial estándar de préstamo es de 14 días corridos, con posibilidad de renovación presencial en mostrador si la obra no posee reservas en espera.",
  },
];

export default function FAQ() {
  useDocumentMetadata({
    title: "Preguntas Frecuentes — Folium",
    description: "Respuestas a las dudas más comunes sobre reservas, préstamos y catálogo en Folium.",
    canonicalPath: "/preguntas-frecuentes",
    schema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  });

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 lg:py-12 text-on-background animate-fade-in">
      <div className="mb-6">
        <GoBackButton />
      </div>

      <header className="mb-10">
        <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>Dudas Comunes</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-on-background font-medium mb-3">
          Preguntas Frecuentes
        </h1>
        <p className="text-body-lg text-on-surface-variant leading-relaxed max-w-2xl">
          Respuestas claras a las dudas más habituales sobre reservas, préstamos y el uso de Folium.
        </p>
      </header>

      <div className="flex flex-col gap-3.5 mb-10">
        {FAQS.map((item, index) => (
          <details
            key={index}
            className="group bg-surface-container border border-outline-variant/60 rounded-md p-5 transition-colors open:bg-surface-container-high/60"
          >
            <summary className="font-serif text-lg sm:text-xl text-on-surface cursor-pointer flex items-center justify-between gap-4 select-none">
              <span>{item.q}</span>
              <ChevronDown className="w-5 h-5 text-on-surface-variant transition-transform duration-200 group-open:rotate-180 shrink-0" />
            </summary>
            <p className="mt-3 text-sm text-on-surface-variant leading-relaxed pt-2 border-t border-outline-variant/30">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <div className="bg-surface-container-low border border-outline-variant/50 rounded-md p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg text-on-surface font-medium">¿Listo para comenzar a leer?</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Explorá miles de volúmenes disponibles en nuestro catálogo abierto.</p>
        </div>
        <Link
          to="/catalog"
          className="px-5 py-2.5 bg-primary text-on-primary hover:bg-primary-container text-xs font-bold tracking-widest uppercase rounded-sm transition-colors cursor-pointer inline-flex items-center gap-2 shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          Ir al Catálogo
        </Link>
      </div>
    </main>
  );
}
