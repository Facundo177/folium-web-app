import { Link } from "react-router-dom";
import GoBackButton from "../components/BasicUIComponents/GoBackButton";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { HelpCircle, UserPlus, LogIn, BookmarkCheck, ArrowRight } from "lucide-react";

export default function Ayuda() {
  useDocumentMetadata({
    title: "Centro de Ayuda — Folium",
    description: "Guía paso a paso para crear tu cuenta, buscar libros y solicitar reservas.",
  });

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 lg:py-12 text-on-background animate-fade-in">
      <div className="mb-6">
        <GoBackButton />
      </div>

      <header className="mb-10">
        <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>Guía Rápida</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-on-background font-medium mb-3">
          Centro de Ayuda
        </h1>
        <p className="text-body-lg text-on-surface-variant leading-relaxed max-w-2xl">
          Todo lo que necesitás saber para registrarte, explorar el catálogo y reservar ejemplares en sala.
        </p>
      </header>

      <div className="space-y-6 mb-10">
        {/* Paso 1 */}
        <section className="bg-surface-container border border-outline-variant/60 rounded-md p-6 shadow-xs flex flex-col md:flex-row gap-5 items-start">
          <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Paso 1</div>
            <h2 className="font-serif text-xl text-on-surface mb-2 font-medium">Crear tu cuenta gratuita</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-3">
              Para solicitar reservas y armar tu estantería de favoritos, ingresá a la página de registro. Solo necesitás tu nombre, DNI, correo electrónico y una contraseña segura.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
            >
              Crear cuenta ahora <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Paso 2 */}
        <section className="bg-surface-container border border-outline-variant/60 rounded-md p-6 shadow-xs flex flex-col md:flex-row gap-5 items-start">
          <div className="w-10 h-10 rounded-sm bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <LogIn className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Paso 2</div>
            <h2 className="font-serif text-xl text-on-surface mb-2 font-medium">Iniciar sesión</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-3">
              Una vez registrada tu cuenta, iniciá sesión con tu nombre de usuario o correo y contraseña para desbloquear todas las funciones del catálogo general.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
            >
              Iniciar sesión <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Paso 3 */}
        <section className="bg-surface-container border border-outline-variant/60 rounded-md p-6 shadow-xs flex flex-col md:flex-row gap-5 items-start">
          <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Paso 3</div>
            <h2 className="font-serif text-xl text-on-surface mb-2 font-medium">Reservar un libro</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-3">
              Buscá la obra en el catálogo, verificá que cuente con ejemplares disponibles y hacé clic en <strong>Reservar</strong>. Confirmá en el modal emergente y tu reserva quedará guardada por 14 días para que retires el volumen en el mostrador presencial.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
            >
              Ir al catálogo general <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/50 rounded-md p-6 text-center">
        <h3 className="font-serif text-lg text-on-surface font-medium mb-1">
          ¿Tenés más preguntas?
        </h3>
        <p className="text-xs sm:text-sm text-on-surface-variant mb-4">
          Consultá nuestra sección de respuestas a las dudas más comunes de los lectores.
        </p>
        <Link
          to="/preguntas-frecuentes"
          className="px-4 py-2 bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container text-xs font-bold tracking-widest uppercase rounded-sm transition-colors cursor-pointer inline-flex items-center gap-2"
        >
          Ver Preguntas Frecuentes
        </Link>
      </div>
    </main>
  );
}
