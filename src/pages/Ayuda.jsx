import { Link } from "react-router-dom";

export default function Ayuda() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-on-background">
      <h1 className="font-serif text-3xl mb-8">Cómo reservar</h1>

      <h2 className="font-serif text-xl mb-3">Registrarte</h2>
      <ol className="list-decimal pl-5 mb-8 text-on-surface-variant leading-relaxed">
        <li>Entrá a <Link to="/register" className="text-primary underline">Crear cuenta</Link>.</li>
        <li>Completá tus datos y confirmá el registro.</li>
        <li>Ya podés iniciar sesión.</li>
      </ol>

      <h2 className="font-serif text-xl mb-3">Iniciar sesión</h2>
      <ol className="list-decimal pl-5 mb-8 text-on-surface-variant leading-relaxed">
        <li>Entrá a <Link to="/login" className="text-primary underline">Iniciar sesión</Link>.</li>
        <li>Ingresá tu email y contraseña.</li>
        <li>Te llevamos al catálogo.</li>
      </ol>

      <h2 className="font-serif text-xl mb-3">Reservar un libro</h2>
      <ol className="list-decimal pl-5 text-on-surface-variant leading-relaxed">
        <li>Buscá el libro en el catálogo.</li>
        <li>Tocá <strong>Reservar</strong> y confirmá en la ventana emergente.</li>
        <li>Podés cancelar la reserva desde el mismo botón.</li>
      </ol>
    </main>
  );
}