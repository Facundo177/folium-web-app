import { useState } from 'react';
import { 
  Library, 
  BookMarked, 
  LayoutDashboard, 
  UserCircle,
  LogOut,
  Menu, 
  X,
  Heart,
  BookUp2Icon,
  UserRoundArrowLeft,
  LogIn,
  UserPlus,
  BookLock
} from 'lucide-react';

import { ThemeToggle } from '../theme/ThemeToggle';
import { useNavigate, useLocation, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useUserProfile } from '../hooks/useUserProfile';

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtenemos hooks de autenticación
  const { profile } = useUserProfile();
  const { user, logout } = useAuth();
  
  // Verificamos de forma segura si el usuario existe antes de leer el rol
  const roleLibrarian = user?.role === "LIBRARIAN";
  
  // Determinamos qué menú mostrar según si hay sesión y qué rol tiene
  let navItems;
  
  if (roleLibrarian) {
    navItems = [
      { id: 'catalog', label: 'Catálogo General', icon: Library, navigateTo: '/catalog' },
      { id: 'inventory', label: 'Inventario', icon: LayoutDashboard, navigateTo: '/librarian/inventory' },
      { id: 'newBook', label: 'Añadir Nuevo Libro', icon: BookUp2Icon, navigateTo: '/librarian/inventory/newBook'},
      { id: 'reservations', label: 'Reservas', icon: BookLock, navigateTo: '/librarian/reservations'},
      { id: 'loans', label: 'Préstamos', icon: UserRoundArrowLeft, navigateTo: '/librarian/loans'},
    ];
  } else if (user) {
    // Si hay un usuario (Lector normal)
    navItems = [
      { id: 'catalog', label: 'Catálogo General', icon: Library, navigateTo: '/catalog' },
      { id: 'favourites', label: 'Favoritos', icon: Heart, navigateTo: '/user/favourites' },
      { id: 'reservations', label: 'Reservas', icon: BookLock, navigateTo: '/user/reservations'},
      { id: 'loans', label: 'Préstamos Activos', icon: BookMarked, navigateTo: '/user/loans' },
    ];
  } else {
    // Usuario NO logueado (Invitado / GUEST)
    navItems = [
      { id: 'catalog', label: 'Catálogo Público', icon: Library, navigateTo: '/catalog' },
      { id: 'register', label: 'Crear Cuenta', icon: UserPlus, navigateTo: '/register' },
      { id: 'login', label: 'Iniciar Sesión', icon: LogIn, navigateTo: '/login' },
    ];
  }

  // Derivamos la pestaña activa directamente de la ruta actual (location.pathname)
  const activeTab = (() => {
    const currentPath = location.pathname;
    if (currentPath.endsWith('/catalog')) return 'catalog';

    const matched = [...navItems]
      .sort((a, b) => b.navigateTo.length - a.navigateTo.length)
      .find(
        (item) =>
          currentPath === item.navigateTo ||
          currentPath.startsWith(`${item.navigateTo}/`)
      );

    return matched?.id ?? null;
  })();

  // Nombres seguros para evitar romper la página
  const displayFirstName = profile?.first_name || user?.username || 'Invitado';
  const displayLastName = profile?.last_name || '';
  const displayRole = user ? (roleLibrarian ? 'BIBLIOTECARIO/A' : 'LECTOR/A') : 'VISITANTE';


  return (
    <>
      {/* =========================================================
          MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN
      ========================================================= */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center text-center animate-fade-in will-change-transform"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Ícono de Advertencia / Salida */}
            <div className="w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            
            <h3 className="text-title-lg text-on-surface font-serif font-bold mb-2">
              Cerrar Sesión
            </h3>
            <p className="text-body-md text-on-surface-variant mb-6">
              ¿Estás seguro de que deseas salir de folium?
            </p>
            
            <div className="flex w-full gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="flex-1 bg-surface-variant text-on-surface hover:bg-outline-variant py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowLogoutModal(false);
                  logout(); // Aquí ejecutamos el logout real
                }} 
                className="flex-1 bg-error text-on-error hover:opacity-90 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-md cursor-pointer"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}



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
          className="lg:hidden fixed inset-0 bg-black/65 z-50 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR PRINCIPAL */}
      <aside className={`
        folium-sidebar flex flex-col gap-4 p-5 overflow-hidden flex-shrink-0 bg-surface-container shadow-2xl z-50
        
        lg:sticky lg:top-6 lg:h-[calc(100vh-48px)] lg:ml-6 lg:rounded-xl lg:border lg:border-outline-variant/50 lg:translate-x-0
        
        fixed top-0 left-0 h-full rounded-r-2xl border-r border-outline-variant/20 
        transform 
        ${isMobileOpen ? 'translate-x-0 transition-transform duration-300 ease-out will-change-transform' : '-translate-x-full'}
        ${showLogoutModal ? 'is-modal-open' : ''}
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
        <Link
          to={user ? '/user/profile' : '/register'}
          onClick={() => setIsMobileOpen(false)}
          className="flex items-center gap-4 relative cursor-pointer group/profile text-inherit no-underline"
          title={user ? 'Ver mi perfil' : 'Registrarse en Folium'}
        >
          <div className="w-11 h-11 flex-shrink-0 bg-primary-container rounded-full flex items-center justify-center border border-outline-variant/30">
            <UserCircle className="w-6 h-6 text-on-primary-container" />
          </div>
          
          <div className="hide-on-collapse flex flex-col whitespace-nowrap">
            <p className="font-serif text-base font-medium text-on-surface leading-tight">
              {displayFirstName} {displayLastName}
            </p>
            <p className="font-sans text-xs text-on-surface-variant font-semibold tracking-widest uppercase">
              {displayRole}
            </p>
          </div>
        </Link>

        {/* Navegación Principal */}
        <nav className="flex flex-col gap-2 mt-4 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.navigateTo}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-4 h-12 w-full rounded-xl transition-colors cursor-pointer no-underline ${
                  (isActive || activeTab === item.id)
                    ? 'text-primary font-bold' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {(isActive || activeTab === item.id) && (
                    <div className="absolute inset-0 bg-primary/10 rounded-xl" />
                  )}
                  
                  <item.icon className="w-[22px] h-[22px] flex-shrink-0 ml-[11px] relative z-10" />
                  <p className="hide-on-collapse font-sans text-sm font-medium m-0 whitespace-nowrap relative z-10">
                    {item.label}
                  </p>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Separador */}
        <hr className="border-0 h-px bg-outline-variant/40 my-2" />

        {/* Acciones y Tema */}
        <div className="actions-container mt-auto flex flex-row shrink-0 w-full">

          {user ? (
            <button 
              title="Cerrar Sesión"
              className="action-btn w-11 h-11 bg-surface-variant rounded-xl flex items-center justify-center text-on-surface hover:bg-error hover:text-on-error transition-colors shadow-sm border border-outline-variant/30 shrink-0"
              onClick={() => setShowLogoutModal(true)} 
            >
              <LogOut className="w-6 h-6" />
            </button>
          ) : (
            <button 
              title="Iniciar Sesión"
              className="action-btn w-11 h-11 bg-primary text-on-primary rounded-xl flex items-center justify-center hover:opacity-90 transition-colors shadow-sm border border-outline-variant/30 shrink-0"
              onClick={() => {
                setIsMobileOpen(false);
                navigate('/login');
              }}
            >
              <LogIn className="w-5 h-5" />
            </button>
          )}
          
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
