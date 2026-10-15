import FoliumSmallLogo from "../BasicUIComponents/FoliumSmallLogo";
import ArrowLeftIcon from "../BasicUIComponents/ArrowLeftIcon";

const demoAccounts = [
  { name: "María Fernández", role: "Librarian", username: "mfernandez", password: "biblio1234" },
  { name: "Lucas Rodríguez", role: "Lector", username: "lrodriguez", password: "lector1234" },
];

export default function AuthSidebar({ handleLandingButtonClick, onDemoAccountSelect }) {
  return (
    <div className="flex flex-col justify-between h-full bg-primary-container p-12 transition-colors">
      
      {/* Header / Logo */}
      <div>
        <button
          onClick={handleLandingButtonClick}
          className="w-full flex items-center gap-3 bg-on-primary-container/5 p-3 rounded-lg border border-on-primary-container/10 cursor-pointer hover:bg-on-primary-container/10 transition-colors"
        >
          <div className="w-5 h-10 rounded flex items-center justify-center text-on-primary-container">
            <ArrowLeftIcon />
          </div>
          <div className="w-10 h-10 bg-on-primary-container/10 rounded flex items-center justify-center text-on-primary-container">
            <FoliumSmallLogo />
          </div>
          <div className="flex flex-col">
            <h1 className="text-start text-title-lg font-serif leading-none tracking-wide text-on-primary-container">
              folium
            </h1>
            <span className="text-start text-[10px] font-bold tracking-widest text-on-primary-container/70 uppercase mt-1">
              Biblioteca Digital
            </span>
          </div>
        </button>

        {/* Hero Text */}
        <h2 className="text-display-lg-mobile md:text-display-lg font-serif text-on-primary-container mb-6 mt-8 leading-tight">
          Tu catálogo,
          <br />
          siempre contigo.
        </h2>
        <p className="text-body-lg text-on-primary-container/80 leading-relaxed">
          Accede a miles de títulos, gestiona tus préstamos y guarda tus
          lecturas favoritas desde cualquier sede.
        </p>
      </div>

      {/* Footer / Cuentas de Prueba */}
      <div className="mt-12 pt-8 border-t border-on-primary-container/20">
        <h3 className="text-label-caps text-on-primary-container/70 mb-4">
          CUENTAS DE PRUEBA
        </h3>

        <div className="flex flex-col gap-3">
          {demoAccounts.map((account) => (
            <button
              key={account.username}
              type="button"
              onClick={() => onDemoAccountSelect(account)}
              className="w-full text-left bg-on-primary-container/5 p-4 rounded-lg border border-on-primary-container/10 cursor-pointer hover:bg-on-primary-container/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary"
            >
              <p className="text-body-md text-on-primary-container font-medium">
                {account.name}{" "}
                <span className="text-on-primary-container/70 font-normal">
                  · {account.role}
                </span>
              </p>
              <p className="text-body-md text-on-primary-container/60 mt-1">
                {account.username} / {account.password}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}