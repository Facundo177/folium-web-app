import { useState } from 'react';

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav style={styles.navContainer}>
      {/* Logo / Marca */}
      <div style={styles.logo}>MiSitio</div>

      {/* Enlaces para pantalla grande (Desktop) */}
      <div style={styles.desktopLinks}>
        <a href="#inicio" style={styles.link}>Inicio</a>
        <a href="#servicios" style={styles.link}>Servicios</a>
        <a href="#contacto" style={styles.link}>Contacto</a>
      </div>

      {/* Botón Hamburguesa (Mobile) */}
      <button 
        style={styles.hamburgerBtn} 
        onClick={toggleMenu}
        aria-label="Toggle Navigation"
      >
        <span style={{ 
          ...styles.bar, 
          transform: isOpen ? 'rotate(45deg) translate(5px, 6px)' : 'none' 
        }} />
        <span style={{ 
          ...styles.bar, 
          opacity: isOpen ? 0 : 1 
        }} />
        <span style={{ 
          ...styles.bar, 
          transform: isOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none' 
        }} />
      </button>

      {/* Fondo oscuro al abrir el menú */}
      {isOpen && <div style={styles.backdrop} onClick={toggleMenu} />}

      {/* Menú Desplegable Lateral (Mobile) */}
      <div style={{
        ...styles.mobileDrawer,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      }}>
        <a href="#inicio" style={styles.drawerLink} onClick={toggleMenu}>Inicio</a>
        <a href="#servicios" style={styles.drawerLink} onClick={toggleMenu}>Servicios</a>
        <a href="#contacto" style={styles.drawerLink} onClick={toggleMenu}>Contacto</a>
      </div>
    </nav>
  );
}

// Estilos dinámicos
const styles = {
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1f2937',
    color: '#ffffff',
    position: 'relative',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  desktopLinks: {
    display: 'flex',
    gap: '1.5rem',
    // Puedes ocultar esto en CSS tradicional con media queries (@media (max-width: 768px))
  },
  link: {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '1rem',
  },
  hamburgerBtn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: '30px',
    height: '25px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    zIndex: 10,
  },
  bar: {
    width: '100%',
    height: '3px',
    backgroundColor: '#ffffff',
    borderRadius: '2px',
    transition: 'all 0.3s ease-in-out',
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 8,
  },
  mobileDrawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '250px',
    height: '100vh',
    backgroundColor: '#111827',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '5rem',
    paddingLeft: '2rem',
    gap: '1.5rem',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 9,
    boxShadow: '-2px 0 5px rgba(0,0,0,0.3)',
  },
  drawerLink: {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '1.2rem',
  },
};
