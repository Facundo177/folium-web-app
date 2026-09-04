import { useState } from 'react';

export default function SideNavigationBar() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Lista de navegación principal
  const mainNavItems = [
    { name: 'DASHBOARD', icon: <DashboardIcon />, active: false },
    { name: 'INVENTORY', icon: <BookIcon />, active: true },
    { name: 'ORDERS', icon: <OrdersIcon />, active: false },
    { name: 'CUSTOMERS', icon: <CustomersIcon />, active: false },
    { name: 'REPORTS', icon: <ReportsIcon />, active: false },
  ];

  return (
    <>
      {/* Botón Hamburguesa (Visible en móviles o pantallas pequeñas) */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-3 left-4 z-100 p-2 bg-surface-container rounded-md text-on-surface shadow-sm"
        aria-label="Abrir menú"
      >
      {isOpen ? 
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> 
            <path d="M19 5L4.99998 19M5.00001 5L19 19" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g>
        </svg> 
        :
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      }
      </button>

      {/* Fondo oscuro al abrir en móvil (Backdrop) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-secondary/50 z-40" // md:hidden 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface-container-lowest border-r border-outline-variant flex flex-col transition-transform duration-300 ease-in-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header / Logo */}
        <div className="flex items-center gap-stack-sm p-gutter pt-16">
          <div className="text-on-surface">
            <LogoIcon />
          </div>
          <div className="flex flex-col">
            <h1 className="text-headline-md leading-none mb-1 text-on-surface">folium</h1>
            <span className="text-label-caps text-on-surface-variant">UN PRODUCTO DE TOMO</span>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 mt-stack-md flex flex-col">
          {mainNavItems.map((item) => (
            <a 
              key={item.name}
              href={`#${item.name.toLowerCase()}`}
              className={`flex items-center gap-stack-sm py-3 pl-gutter cursor-pointer transition-colors
                ${item.active 
                  ? 'bg-surface-variant border-r-[3px] border-on-surface' 
                  : 'hover:bg-surface hover:text-on-surface-variant text-on-surface'
                }`}
            >
              <span className="w-6 h-6 flex justify-center items-center text-on-surface">
                {item.icon}
              </span>
              <span className="text-label-caps text-on-surface mt-1">{item.name}</span>
            </a>
          ))}
        </nav>

        {/* Footer / Acciones */}
        <div className="p-gutter flex flex-col pb-8">
          {/* Botón Finalizar Orden */}
          <button className="w-full bg-on-tertiary-fixed-variant text-on-tertiary text-label-caps py-stack-sm rounded-DEFAULT mb-gutter hover:opacity-90 transition-opacity">
            FINALIZE ORDER
          </button>

          {/* Separador */}
          <hr className="border-outline-variant mb-gutter" />

          {/* Enlaces secundarios */}
          <div className="flex flex-col gap-stack-sm mb-gutter">
            <a href="#settings" className="flex items-center gap-stack-sm text-on-surface hover:text-on-surface-variant">
              <SettingsIcon />
              <span className="text-label-caps mt-1">SETTINGS</span>
            </a>
            <a href="#support" className="flex items-center gap-stack-sm text-on-surface hover:text-on-surface-variant">
              <SupportIcon />
              <span className="text-label-caps mt-1">SUPPORT</span>
            </a>
          </div>

          {/* Perfil de Usuario */}
          <div className="flex items-center gap-stack-sm mt-stack-sm cursor-pointer">
            <img 
              src="https://i.pravatar.cc/150?u=epsmith" 
              alt="E. P. SMITH avatar" 
              className="w-10 h-10 rounded-full bg-surface-variant object-cover border border-outline-variant"
            />
            <span className="text-label-caps text-on-surface mt-1">E. P. SMITH</span>
          </div>
        </div>
      </aside>
    </>
  );
}

// ==========================================
// SVGs Extraídos para mantener el diseño fiel
// ==========================================

const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    <path d="M8 2v20" />
  </svg>
);

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const OrdersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);

const CustomersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ReportsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="16" y1="12" x2="16" y2="16" /><line x1="8" y1="14" x2="8" y2="16" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SupportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);