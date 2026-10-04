
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Library, 
  BookMarked, 
  Settings, 
  UserCircle,
  Menu, // Icono hamburguesa
  X     // Icono cerrar
} from 'lucide-react';

import { ThemeToggle } from './ThemeToggle';

export default function Sidebar({ isDarkMode, setIsDarkMode }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'catalog', label: 'Catálogo General', icon: Library },
    { id: 'loans', label: 'Préstamos Activos', icon: BookMarked },
  ];

  return (
    <>
      {/* BOTÓN HAMBURGUESA (Visible solo en móvil) */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-inverse-surface border border-outline-variant/30 rounded-lg text-on-primary shadow-lg hover:bg-tertiary-container/20 transition-colors"
      >
        <Menu className="w-6 h-6 text-on-primary-container" />
      </button>

      {/* OVERLAY FONDO OSCURO (Visible solo en móvil al abrir) */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}



      {/* className="folium-sidebar sticky top-6 h-[calc(100vh-48px)] ml-6 overflow-hidden flex flex-col gap-4 p-5 rounded-xl bg-inverse-surface border border-outline-variant/20 shadow-2xl z-50 flex-shrink-0" */}

      {/* SIDEBAR PRINCIPAL */}
      <aside className={`
        folium-sidebar flex flex-col gap-4 p-5 overflow-hidden flex-shrink-0 bg-inverse-surface shadow-2xl z-50
        
        lg:sticky lg:top-6 lg:h-[calc(100vh-48px)] lg:ml-6 lg:rounded-xl lg:border lg:border-outline-variant/20 lg:translate-x-0
        
        fixed top-0 left-0 h-full rounded-r-2xl border-r border-outline-variant/20 
        transform
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>    
        
        {/* Cabecera Móvil con Botón Cerrar */}
        <div className="lg:hidden flex justify-end mb-2">
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-outline hover:text-on-primary hover:bg-outline-variant/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Perfil del Usuario */}
        <div className="flex items-center gap-4 relative cursor-pointer group/profile">
          <div className="w-11 h-11 flex-shrink-0 bg-primary-container rounded-full flex items-center justify-center border border-outline-variant/30">
            <UserCircle className="w-6 h-6 text-on-primary-container" />
          </div>
          
          <div className="hide-on-collapse flex flex-col whitespace-nowrap">
            <p className="font-serif text-base font-medium text-on-primary leading-tight">Ananya Sharma</p>
            <p className="font-sans text-xs text-outline font-semibold tracking-widest uppercase">Archivista Mayor</p>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="flex flex-col gap-2 mt-4 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileOpen(false); // Cierra el menú al seleccionar en móvil
              }}
              className={`relative flex items-center gap-4 h-12 w-full rounded-xl transition-colors ${
                activeTab === item.id 
                  ? 'text-on-tertiary-container' 
                  : 'text-on-primary-container hover:text-on-primary'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute inset-0 bg-tertiary-container/20 rounded-xl" />
              )}
              
              <item.icon className="w-[22px] h-[22px] flex-shrink-0 ml-[11px] relative z-10" />
              <p className="hide-on-collapse font-sans text-sm font-medium m-0 whitespace-nowrap relative z-10">
                {item.label}
              </p>
              
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
          <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}/>

          {/* Botón de Ajustes */}
          <button 
            title="Configuración"
            className="action-btn w-11 h-11 bg-primary-container rounded-xl flex items-center justify-center text-on-primary-container hover:bg-tertiary-container/30 hover:text-on-tertiary-container transition-colors shadow-sm"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

      </aside>
    </>
  );
}