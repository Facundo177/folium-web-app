import AuthSidebar from './AuthSidebar';
import LoginForm from './LoginForm';

export default function AuthLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans bg-background">
      {/* Panel lateral izquierdo (Ocupa aproximadamente 1/3 del ancho en desktop) */}
      <div className="w-full md:w-100 lg:w-md shrink-0">
        <AuthSidebar />
      </div>

      {/* Área del formulario derecho (Ocupa el resto del espacio) */}
      <div className="flex-1 flex items-center justify-center p-gutter">
        <LoginForm />
      </div>
    </div>
  );
}