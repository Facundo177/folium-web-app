import { useState } from 'react';
import { 
  Library, 
  BookMarked, 
  Settings, 
  UserCircle,
  Menu, 
  X,
  Heart,     
} from 'lucide-react';

import { ThemeToggle } from './ThemeToggle';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ isDarkMode, setIsDarkMode }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: 'catalog', label: 'Catálogo General', icon: Library, navigateTo: '/user/catalog' },
    { id: 'loans', label: 'Préstamos Activos', icon: BookMarked, navigateTo: '/user/loans' },
    { id: 'favourites', label: 'Favoritos', icon: Heart, navigateTo: '/user/favourites' },
  ];

  const navigate = useNavigate();

  return (
    <>
      {/* BOTÓN HAMBURGUESA (Visible solo en móvil) */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-surface-container border border-outline-variant/50 rounded-lg text-on-surface shadow-md hover:text-primary transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* OVERLAY FONDO OSCURO (Visible solo en móvil al abrir) */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR PRINCIPAL */}
      <aside className={`
        folium-sidebar flex flex-col gap-4 p-5 overflow-hidden flex-shrink-0 bg-surface-container shadow-2xl z-50
        
        lg:sticky lg:top-6 lg:h-[calc(100vh-48px)] lg:ml-6 lg:rounded-xl lg:border lg:border-outline-variant/50 lg:translate-x-0
        

        fixed top-0 left-0 h-full rounded-r-2xl border-r border-outline-variant/20 
        transform
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>    
        
        {/* Cabecera Móvil con Botón Cerrar */}
        <div className="lg:hidden flex justify-end mb-2">
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-outline-variant/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Perfil del Usuario */}
        <div className="flex items-center gap-4 relative cursor-pointer group/profile"
        onClick={() => navigate('/user/profile')}>
          <div className="w-11 h-11 flex-shrink-0 bg-primary-container rounded-full flex items-center justify-center border border-outline-variant/30">
            <UserCircle className="w-6 h-6 text-on-primary-container" />
          </div>
          
          <div className="hide-on-collapse flex flex-col whitespace-nowrap">
            <p className="font-serif text-base font-medium text-on-surface leading-tight">Ananya Sharma</p>
            <p className="font-sans text-xs text-on-surface-variant font-semibold tracking-widest uppercase">Archivista Mayor</p>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="flex flex-col gap-2 mt-4 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileOpen(false);
                navigate(item.navigateTo);
              }}
              className={`relative flex items-center gap-4 h-12 w-full rounded-xl transition-colors ${
                activeTab === item.id 
                  ? 'text-primary font-bold' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute inset-0 bg-primary/10 rounded-xl" />
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
        <hr className="border-0 h-px bg-outline-variant/40 my-2" />

        {/* Acciones y Tema */}
        <div className="actions-container mt-auto flex-shrink-0 w-full">
          <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}/>

          {/* Botón de Ajustes */}
          <button 
            title="Configuración"
            className="action-btn w-11 h-11 bg-surface-variant rounded-xl flex items-center justify-center text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm border border-outline-variant/30"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </aside>
    </>
  );
}