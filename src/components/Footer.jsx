import { BookOpen, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/50 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Marca + enlaces */}
          <div>
            <div className="flex items-center gap-2 mb-5 text-on-surface">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-serif text-lg">Folium · Archivo y Librería</h3>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm text-on-surface-variant">
              <li><Link to="/" className="hover:text-primary transition-colors">Nosotros</Link></li>
              <li><Link to="/user/catalog" className="hover:text-primary transition-colors">Catálogo</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Sedes y Bibliotecas</Link></li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="font-serif text-lg text-on-surface mb-5">Ayuda</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-on-surface-variant">
              <li><Link to="/" className="hover:text-primary transition-colors">Cómo reservar</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Préstamo y devolución</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Preguntas frecuentes</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-serif text-lg text-on-surface mb-5">Atención al Lector</h3>
            <ul className="flex flex-col gap-3 text-sm text-on-surface-variant">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="text-on-surface font-semibold">0810-33-FOLIUM</p>
                  <p className="text-xs">Lun a Vie de 9 a 19 hs</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 shrink-0" />
                <span>lectores@folium.org</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Patagones 2463, CABA</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-serif text-lg text-on-surface mb-5">Gaceta Bibliográfica</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Suscribite para recibir novedades y avisos de nuevas adquisiciones.
            </p>
            <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/50 rounded-sm px-3 py-2.5 mb-3">
              <Mail className="w-4 h-4 text-on-surface-variant shrink-0" />
              <input
                type="email"
                placeholder="Ingresá tu email..."
                className="bg-transparent flex-1 outline-none text-sm text-on-surface placeholder:text-outline"
              />
            </div>
            <button
              type="button"
              className="w-full bg-on-surface text-surface py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
            >
              Suscribirme
            </button>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-10 pt-5 border-t border-outline-variant/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-on-surface-variant">
          <p>© 2026 Folium. Todos los derechos reservados.</p>
          <p className="uppercase tracking-widest">Carpe librum</p>
        </div>
      </div>
    </footer>
  );
}