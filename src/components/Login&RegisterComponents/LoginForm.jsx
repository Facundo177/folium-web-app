import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import PasswordEye from "../BasicUIComponents/PasswordEye";
import { useAuth } from "../../auth/AuthProvider";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { username, password, setUsername, setPassword } = useOutletContext();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const loggedUser = await login(username, password);

      // Redirección condicional según rol:
      if (loggedUser?.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (loggedUser?.role === "LIBRARIAN") {
        navigate("/librarian/inventory", { replace: true });
      } else {
        // Lector (USER) o por defecto
        navigate("/user/catalog", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Credenciales incorrectas. Verificá tu usuario y contraseña."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] flex flex-col items-center">
      {/* Toggle Iniciar sesión / Crear cuenta */}
      <div className="w-full bg-on-primary-fixed-variant/10 rounded-lg p-1 flex mb-12">
        <button className="flex-1 bg-surface-container-lowest text-on-surface text-body-md font-medium py-2 rounded shadow-sm border border-on-primary-fixed-variant">
          Iniciar sesión
        </button>
        <Link
          to="/register"
          className="flex-1 text-on-surface-variant text-body-md font-medium py-2 rounded hover:text-on-surface transition-colors text-center "
        >
          Crear cuenta
        </Link>
      </div>

      {/* Textos de Bienvenida */}
      <div className="w-full mb-8">
        <h2 className="text-headline-md font-serif text-on-surface mb-2">
          Bienvenido de nuevo
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Ingresa tus datos para continuar.
        </p>
      </div>

      {/* Formulario */}
      <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
        {/* Campo Usuario */}
        <div className="flex flex-col gap-2">
          <label className="text-label-caps text-on-surface font-bold">
            USUARIO
          </label>
          <input
            required
            type="text"
            placeholder="tu_usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors placeholder:text-on-surface-variant/50"
          />
        </div>

        {/* Campo Contraseña */}
        <div className="flex flex-col gap-2">
          <label className="text-label-caps text-on-surface font-bold">
            CONTRASEÑA
          </label>
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors placeholder:text-on-surface-variant/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors"
            >
              <PasswordEye open={showPassword} />
            </button>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <p className="text-body-sm text-error bg-error-container px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-on-tertiary-fixed-variant text-on-tertiary text-body-lg font-medium py-3 rounded-lg mt-2 hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isLoading ? "Ingresando..." : "Entrar"}
        </button>
      </form>

      <p className="text-body-md text-on-surface-variant mt-8">
        ¿Olvidaste tu contraseña?{" "}
        <a
          href="#"
          className="text-on-tertiary-fixed-variant underline underline-offset-4 hover:text-on-tertiary-container transition-colors"
        >
          Recuperar contraseña
        </a>
      </p>
    </div>
  );
}



// import { useState } from "react";

// export const LoginForm = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPass, setShowPass] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     setTimeout(() => {
//     }, 600);
//   };

//   return (
//     <>
//       {/* Right panel — form */}
//       <div className="flex-1 flex items-center justify-center p-6">
//         <div className="w-full max-w-sm">
//           {/* Mobile logo */}
//           <div className="flex items-center gap-2.5 mb-8 md:hidden">
//             <div className="w-8 h-8 bg-[#1A1A18] rounded flex items-center justify-center">
//               <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//                 <rect
//                   x="1"
//                   y="1"
//                   width="5"
//                   height="7"
//                   rx="0.5"
//                   stroke="white"
//                   strokeWidth="1.2"
//                 />
//                 <rect
//                   x="8"
//                   y="1"
//                   width="5"
//                   height="7"
//                   rx="0.5"
//                   stroke="white"
//                   strokeWidth="1.2"
//                 />
//                 <rect
//                   x="1"
//                   y="10"
//                   width="12"
//                   height="1.5"
//                   rx="0.5"
//                   fill="white"
//                 />
//               </svg>
//             </div>
//             <p
//               className="text-[#1A1A18] font-bold text-xl"
//               style={{ fontFamily: "var(--font-serif)" }}
//             >
//               folium
//             </p>
//           </div>

//           <h1
//             className="text-2xl font-bold text-[#1A1A18] mb-1"
//             style={{ fontFamily: "var(--font-serif)" }}
//           >
//             Iniciar sesión
//           </h1>
//           <p className="text-[#6B6B65] text-sm mb-8">
//             Bienvenido de nuevo. Ingresa tus datos para continuar.
//           </p>

//           <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//             <div>
//               <label className="text-xs font-semibold text-[#1A1A18] uppercase tracking-wide mb-1.5 block">
//                 Correo electrónico
//               </label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => {
//                   setEmail(e.target.value);
//                   setError("");
//                 }}
//                 placeholder="correo@biblioteca.com"
//                 required
//                 className={`w-full px-4 py-2.5 border rounded-lg text-sm bg-white outline-none transition-all placeholder:text-[#9B9B95] ${error ? "border-[#8B1A1A] ring-1 ring-[#8B1A1A]/20" : "border-[#E2E0D8] focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A]/20"}`}
//               />
//             </div>
//             <div>
//               <label className="text-xs font-semibold text-[#1A1A18] uppercase tracking-wide mb-1.5 block">
//                 Contraseña
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPass ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => {
//                     setPassword(e.target.value);
//                     setError("");
//                   }}
//                   placeholder="••••••••"
//                   required
//                   className={`w-full px-4 py-2.5 pr-10 border rounded-lg text-sm bg-white outline-none transition-all placeholder:text-[#9B9B95] ${error ? "border-[#8B1A1A] ring-1 ring-[#8B1A1A]/20" : "border-[#E2E0D8] focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A]/20"}`}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPass(!showPass)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9B95] hover:text-[#6B6B65]"
//                 >
//                   {showPass ? (
//                     <svg
//                       width="16"
//                       height="16"
//                       viewBox="0 0 16 16"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="1.4"
//                     >
//                       <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" />
//                       <circle cx="8" cy="8" r="1.8" />
//                       <path d="M3 3l10 10" strokeLinecap="round" />
//                     </svg>
//                   ) : (
//                     <svg
//                       width="16"
//                       height="16"
//                       viewBox="0 0 16 16"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="1.4"
//                     >
//                       <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" />
//                       <circle cx="8" cy="8" r="1.8" />
//                     </svg>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {error && (
//               <p className="text-[#8B1A1A] text-xs bg-[#f9e8e8] px-3 py-2 rounded-lg">
//                 {error}
//               </p>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="mt-1 w-full py-2.5 bg-[#8B1A1A] hover:bg-[#6B1414] disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <svg
//                   className="animate-spin"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 16 16"
//                   fill="none"
//                 >
//                   <circle
//                     cx="8"
//                     cy="8"
//                     r="6"
//                     stroke="white"
//                     strokeWidth="2"
//                     strokeOpacity="0.3"
//                   />
//                   <path
//                     d="M8 2a6 6 0 0 1 6 6"
//                     stroke="white"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//               ) : (
//                 "Entrar"
//               )}
//             </button>
//           </form>

//           <p className="text-[#9B9B95] text-[11px] text-center mt-6">
//             ¿Olvidaste tu contraseña?{" "}
//             <button className="text-[#8B1A1A] underline underline-offset-2">
//               Contacta a tu sede
//             </button>
//           </p>
//         </div>
//       </div>
//     </>
//   );
// };

// export default LoginForm;
