import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthSidebar from '../Login&RegisterComponents/AuthSidebar';

export default function AuthLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLandingButtonClick = () => navigate("/");
  const handleDemoAccountSelect = ({ username: selectedUsername, password: selectedPassword }) => {
    setUsername(selectedUsername);
    setPassword(selectedPassword);
    if (location.pathname === '/register') navigate('/login');
  };

  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");

    root.classList.remove("dark");

    return () => {
      // Al salir de las rutas de autenticación, restauramos el modo oscuro si correspondía
      const savedTheme = localStorage.getItem("theme") || localStorage.getItem("folium-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldBeDark = savedTheme ? savedTheme === "dark" : (hadDark || prefersDark);

      if (shouldBeDark) {
        root.classList.add("dark");
      }
    };
  }, []);

  return (
    <div className="force-light bg-background text-on-background flex flex-col md:flex-row min-h-screen font-sans">
      {/* Panel lateral izquierdo (Ocupa aproximadamente 1/3 del ancho en desktop) */}
      <div className="w-full md:w-100 lg:w-md shrink-0">
        <AuthSidebar
          handleLandingButtonClick={handleLandingButtonClick}
          onDemoAccountSelect={handleDemoAccountSelect}
        />
      </div>

      {/* Área del Formulario Dinámica */}
      <div className="flex-1 flex items-center justify-center p-gutter py-12 overflow-y-auto">
        
        {/* The 'key' forces the fade-in animation to replay when the URL changes */}
        <div key={location.pathname} className="animate-fade-in w-full flex justify-center">
          <Outlet context={{ username, password, setUsername, setPassword }} />
        </div>

      </div>
    </div>
  );
}
