import { useState } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  Library, 
  BookMarked, 
  Settings, 
  Moon, 
  Sun, 
  ChevronDown, 
  UserCircle 
} from 'lucide-react';

export default function Sidebar({ isDarkMode, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'catalog', label: 'Catálogo General', icon: Library },
    { id: 'loans', label: 'Préstamos Activos', icon: BookMarked },
  ];

  return (
      <aside className="folium-sidebar sticky top-6 h-[calc(100vh-48px)] ml-6 overflow-hidden flex flex-col gap-4 p-5 rounded-xl bg-inverse-surface border border-outline-variant/20 shadow-2xl z-50 flex-shrink-0">      
      {/* Perfil del Usuario */}
      <div className="flex items-center gap-4 relative cursor-pointer group/profile">
        <div className="w-11 h-11 flex-shrink-0 bg-primary-container rounded-full flex items-center justify-center border border-outline-variant/30">
          <UserCircle className="w-6 h-6 text-on-primary-container" />
        </div>
        
        <div className="hide-on-collapse flex flex-col whitespace-nowrap">
          <p className="font-serif text-base font-medium text-on-primary leading-tight">Ananya Sharma</p>
          <p className="font-sans text-xs text-outline font-semibold tracking-widest uppercase">Archivista Mayor</p>
        </div>
        
        <ChevronDown className="hide-on-collapse w-5 h-5 text-outline absolute right-0 group-hover/profile:text-on-primary transition-colors" />
      </div>

     {/*  Buscador 
      <div className="search-container relative flex items-center h-11 border border-outline-variant/40 rounded-xl mt-2 overflow-hidden bg-primary-container/30">
        <input 
          type="text" 
          placeholder="Buscar manuscrito..." 
          className="search-input absolute inset-0 w-full h-full border-0 outline-none text-sm text-on-primary px-11 placeholder:text-outline font-serif italic"
        />
        <Search className="w-[22px] h-[22px] text-outline absolute left-[11px] pointer-events-none" />
      </div> */}

      {/* Navegación Principal */}
      <nav className="flex flex-col gap-2 mt-4 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex items-center gap-4 h-12 w-full rounded-xl transition-colors ${
              activeTab === item.id 
                ? 'text-on-tertiary-container' 
                : 'text-on-primary-container hover:text-on-primary'
            }`}
          >
            {/* Fondo activo simulando el ::before del original */}
            {activeTab === item.id && (
              <div className="absolute inset-0 bg-tertiary-container/20 rounded-xl" />
            )}
            
            <item.icon className="w-[22px] h-[22px] flex-shrink-0 ml-[11px] relative z-10" />
            <p className="hide-on-collapse font-sans text-sm font-medium m-0 whitespace-nowrap relative z-10">
              {item.label}
            </p>
            
            {/* Opcional: Badge de notificaciones en un item */}
            {item.id === 'loans' && (
              <span className="hide-on-collapse absolute right-2 bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                3
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Separador */}
      <hr className="border-0 h-px bg-outline-variant/20 my-2" />

      {/* Acciones y Tema */}
      <div className="actions-container mt-auto flex-shrink-0 w-full">
        {/* Botón de Tema */}
        <button 
          onClick={toggleTheme}
          title="Alternar Tema"
          className="action-btn w-11 h-11 bg-primary-container rounded-xl flex items-center justify-center text-on-primary-container hover:bg-tertiary-container/30 hover:text-on-tertiary-container transition-colors shadow-sm"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Botón de Ajustes */}
        <button 
          title="Configuración"
          className="action-btn w-11 h-11 bg-primary-container rounded-xl flex items-center justify-center text-on-primary-container hover:bg-tertiary-container/30 hover:text-on-tertiary-container transition-colors shadow-sm"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

    </aside>
  );
}