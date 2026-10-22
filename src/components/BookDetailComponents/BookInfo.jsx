export default function BookInfo({
  ISBN = "",
  title = "",
  author = "",
  editorial = "",
  publicationDate = "",
  description = "",
  tags = [],
  location = "",
}) {
  const metadata = [
    {
      label: "ISBN",
      value: ISBN ? (ISBN.length > 3 ? `${ISBN.slice(0, 3)}-${ISBN.slice(3)}` : ISBN) : "—",
      mono: true,
    },
    { label: "Editorial", value: editorial || "—" },
    { label: "Año", value: publicationDate || "—" },
    { label: "Ubicación", value: location || "Sin asignar" },
  ];

  return (
    <div className="flex flex-col font-sans space-y-6">
      {/* Géneros, título y autor */}
      <div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-DEFAULT text-xs font-semibold uppercase tracking-wider bg-surface-container text-primary border border-outline-variant/80 shadow-2xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-on-surface font-normal leading-tight mb-2">
          {title}
        </h1>
        <p className="text-lg sm:text-xl font-serif text-on-surface-variant">
          por <span className="font-medium text-on-surface">{author}</span>
        </p>
      </div>

      {/* Ficha de edición */}
      <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-DEFAULT p-5 shadow-2xs">
        <h3 className="text-label-caps text-outline font-bold uppercase tracking-widest mb-3 pb-2 border-b border-outline-variant/40">
          Ficha de Edición
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {metadata.map((m) => (
            <div key={m.label}>
              <span className="block text-[11px] uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">
                {m.label}
              </span>
              <span
                className={`text-sm text-on-surface font-medium truncate block ${m.mono ? "font-mono" : ""}`}
                title={m.value}
              >
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sinopsis */}
      <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-DEFAULT p-6 shadow-2xs">
        <h3 className="text-label-caps text-primary font-bold uppercase tracking-widest mb-3 pb-2 border-b border-outline-variant/40">
          Sinopsis
        </h3>
        <p className="text-body-lg text-on-surface font-sans leading-relaxed whitespace-pre-line">
          {description || "Sin descripción disponible para esta obra en el archivo."}
        </p>
      </div>
    </div>
  );
}
