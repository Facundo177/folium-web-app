const FAQS = [
  {
    q: "¿Necesito cuenta para ver el catálogo?",
    a: "No. Podés explorarlo libremente, pero para reservar tenés que iniciar sesión.",
  },
  {
    q: "¿Cómo reservo un libro?",
    a: "Iniciá sesión, buscá el libro en el catálogo y tocá Reservar.",
  },
  {
    q: "¿Cómo cancelo una reserva?",
    a: "En el catálogo, el botón del libro reservado pasa a decir Cancelar reserva.",
  },
  {
    q: "¿Los libros se compran?",
    a: "No, los libros se prestan. No hay precios ni carrito de compras.",
  },
];

export default function FAQ() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-on-background">
      <h1 className="font-serif text-3xl mb-8">Preguntas frecuentes</h1>
      <div className="flex flex-col gap-3">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="bg-surface-container border border-outline-variant/50 rounded-md p-4"
          >
            <summary className="font-serif text-lg cursor-pointer">{item.q}</summary>
            <p className="mt-3 text-on-surface-variant">{item.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}