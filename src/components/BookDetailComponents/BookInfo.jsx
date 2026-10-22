export default function BookInfo({ description = "", className = "" }) {
  return (
    <div className={`bg-surface-container-lowest border border-outline-variant/70 rounded-DEFAULT p-6 md:p-8 shadow-2xs font-sans ${className}`}>
      <h2 className="font-serif text-headline-sm text-on-surface mb-4 pb-3 border-b border-outline-variant/50">
        Sobre esta obra
      </h2>
      <p className="text-body-lg text-on-surface leading-relaxed whitespace-pre-line first-letter:font-serif first-letter:text-5xl first-letter:text-primary first-letter:float-left first-letter:mr-2 first-letter:leading-[0.9]">
        {description || "Sin descripción disponible para esta obra en el archivo."}
      </p>
    </div>
  );
}
