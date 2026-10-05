import FoliumSmallLogo from "../BasicUIComponents/FoliumSmallLogo";
import ArrowLeftIcon from "../BasicUIComponents/ArrowLeftIcon";

const demoAccounts = [
  { name: "Admin Sistema", role: "Admin", username: "admin", password: "admin1234" },
  { name: "María Fernández", role: "Librarian", username: "mfernandez", password: "biblio1234" },
  { name: "Lucas Rodríguez", role: "Lector", username: "lrodriguez", password: "lector1234" },
];

export default function AuthSidebar({ handleLandingButtonClick, onDemoAccountSelect }) {
  return (
    <div className="flex flex-col justify-between h-full bg-primary-container text-on-primary p-12">
      {/* Header / Logo */}
      <div>
        <button
          onClick={handleLandingButtonClick}
          className="w-full flex items-center gap-3 bg-inverse-surface p-3 rounded-lg border border-outline-variant/10 cursor-pointer hover:bg-outline/20 transition-colors"
        >
          <div className="w-5 h-10 rounded flex items-center justify-center">
            <ArrowLeftIcon />
          </div>
          <div className="w-10 h-10 bg-inverse-surface rounded flex items-center justify-center">
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
        <h2 className="text-display-lg-mobile md:text-display-lg font-serif text-on-primary mb-6 mt-6 leading-tight">
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
          {demoAccounts.map((account) => (
            <button
              key={account.username}
              type="button"
              onClick={() => onDemoAccountSelect(account)}
              className="w-full text-left bg-inverse-surface p-4 rounded-lg border border-outline-variant/10 cursor-pointer hover:bg-outline/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
            >
              <p className="text-body-md text-on-primary font-medium">
                {account.name}{" "}
                <span className="text-on-primary-container font-normal">
                  · {account.role}
                </span>
              </p>
              <p className="text-body-md text-on-primary-container mt-1">
                {account.username} / {account.password}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
