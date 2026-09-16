import FoliumSmallLogo from "../BasicUIComponents/FoliumSmallLogo";
import ArrowLeftIcon from "../BasicUIComponents/ArrowLeftIcon";

export default function AuthSidebar({ handleLandingButtonClick }) {
  return (
    <div className="flex flex-col justify-between h-full bg-primary-container text-on-primary p-12">
      {/* Header / Logo */}
      <div>
        <button
          onClick={handleLandingButtonClick}
          className="cursor-pointer hover:shadow-2xl w-full flex items-center gap-3 mb-16 bg-inverse-surface p-2"
        >
          <div className="w-5 h-10 bg-inverse-surface rounded flex items-center justify-center">
            <ArrowLeftIcon />
          </div>
          <div className="w-10 h-10 bg-inverse-surface rounded flex items-center justify-center border">
            <FoliumSmallLogo />
          </div>
          <div className="flex flex-col">
            <h1 className="text-start text-title-lg font-serif leading-none tracking-wide text-on-primary">
              folium
            </h1>
            <span className="text-start text-[10px] font-bold tracking-widest text-on-primary-container uppercase mt-1">
              Biblioteca Digital
            </span>
          </div>
        </button>

        {/* Hero Text */}
        <h2 className="text-display-lg-mobile md:text-display-lg font-serif text-on-primary mb-6 leading-tight">
          Tu catálogo,
          <br />
          siempre contigo.
        </h2>
        <p className="text-body-lg text-on-primary-container leading-relaxed">
          Accede a miles de títulos, gestiona tus préstamos y guarda tus
          lecturas favoritas desde cualquier sede.
        </p>
      </div>

      {/* Footer / Cuentas de Prueba */}
      <div className="mt-12 pt-8 border-t border-inverse-surface">
        <h3 className="text-label-caps text-on-primary-container mb-4">
          CUENTAS DE PRUEBA
        </h3>

        <div className="flex flex-col gap-3">
          {/* Tarjeta Lector */}
          <div className="bg-inverse-surface p-4 rounded-lg border border-outline-variant/10 cursor-pointer hover:bg-outline/20 transition-colors">
            <p className="text-body-md text-on-primary font-medium">
              E. P. Smith{" "}
              <span className="text-on-primary-container font-normal">
                · Lector
              </span>
            </p>
            <p className="text-body-md text-on-primary-container mt-1">
              usuario@biblioteca.com / 1234
            </p>
          </div>

          {/* Tarjeta Admin */}
          <div className="bg-inverse-surface p-4 rounded-lg border border-outline-variant/10 cursor-pointer hover:bg-outline/20 transition-colors">
            <p className="text-body-md text-on-primary font-medium">
              Administrador{" "}
              <span className="text-on-primary-container font-normal">
                · Admin
              </span>
            </p>
            <p className="text-body-md text-on-primary-container mt-1">
              admin@biblioteca.com / admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
