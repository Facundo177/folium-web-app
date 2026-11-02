import { Link } from "react-router-dom";
import GoBackButton from "../components/BasicUIComponents/GoBackButton";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { BookOpen, Sparkles, HeartHandshake, ShieldCheck } from "lucide-react";

export default function Nosotros() {
  useDocumentMetadata({
    title: "Sobre Nosotros — Folium",
    description: "Conocé la misión de Folium y cómo conectamos a lectores con las bibliotecas.",
  });

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 lg:py-12 text-on-background animate-fade-in">
      <div className="mb-6">
        <GoBackButton />
      </div>

      <header className="mb-10">
        <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Sobre el Proyecto</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-on-background font-medium mb-3">
          Acerca de Folium
        </h1>
        <p className="text-body-lg text-on-surface-variant leading-relaxed max-w-2xl">
          Conectamos a lectores apasionados con las bibliotecas de su comunidad, revalorizando el libro físico y garantizando el acceso abierto a la lectura.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-surface-container border border-outline-variant/60 rounded-md p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-xl text-on-surface mb-2 font-medium">Nuestra Misión</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Folium nace con el propósito de acercar el acervo bibliográfico a todas las personas. A través de nuestro catálogo digital, podés descubrir títulos, verificar ejemplares en sala y solicitar reservas para retiro presencial.
            </p>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant/60 rounded-md p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-sm bg-secondary/10 text-secondary flex items-center justify-center mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-xl text-on-surface mb-2 font-medium">Filosofía de Acceso Abierto</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              <em>Carpe librum</em>. En Folium los libros circulan y se comparten: no se venden ni se alquilan con fines de lucro. Creemos en las bibliotecas como santuarios del saber accesibles para toda la sociedad.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/50 rounded-md p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Para Bibliotecas e Instituciones</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl text-on-surface font-medium">
            ¿Querés modernizar la gestión de tu biblioteca?
          </h3>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-xl">
            Descubrí nuestras herramientas de mostrador presencial, catalogación MARC 21 y control automatizado de préstamos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/pricing"
            className="px-4 py-2 bg-primary text-on-primary hover:bg-primary-container text-xs font-bold tracking-widest uppercase rounded-sm transition-colors cursor-pointer"
          >
            Ver Planes B2B
          </Link>
          <Link
            to="/catalog"
            className="px-4 py-2 border border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold tracking-widest uppercase rounded-sm transition-colors cursor-pointer"
          >
            Explorar Catálogo
          </Link>
        </div>
      </div>
    </main>
  );
}
