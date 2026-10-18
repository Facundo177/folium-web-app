export default function BookInfo({
  ISBN = '',
  title = '',
  author = '',
  editorial = '',
  publicationDate = '',
  description = ``,
  tags = [],
}) {

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Título y Autor */}
      <div className="mb-stack-md">
        <h1 className="text-display-lg text-on-surface mb-2 font-serif">
          {title}
        </h1>
        <h2 className="text-headline-sm text-on-surface-variant font-serif">
          de {author}
        </h2>
      </div>

      {/* Grid de Metadatos */}
      <div className={`grid grid-cols-1 ${editorial ? "md:grid-cols-3" : "md:grid-cols-2"} gap-stack-sm mb-stack-md`}>
        <div className="border border-outline-variant bg-surface-container-lowest p-3">
          <p className="text-label-caps text-on-surface-variant mb-1">
            ISBN
          </p>
          <p className="text-body-md text-on-surface">
            {ISBN.length > 3 ? ISBN.slice(0,3) + '-' + ISBN.slice(3) : ISBN}
          </p>
        </div>
        {editorial && (
          <div className="border border-outline-variant bg-surface-container-lowest p-3">
            <p className="text-label-caps text-on-surface-variant mb-1">
              Editorial
            </p>
            <p className="text-body-md text-on-surface">
              {editorial}
            </p>
          </div>
        )}
        <div className="border border-outline-variant bg-surface-container-lowest p-3">
          <p className="text-label-caps text-on-surface-variant mb-1">
            Año de publicación
          </p>
          <p className="text-body-md text-on-surface">
            {publicationDate}
          </p>
        </div>
      </div>

      {/* Nota del Curador */}
      <div className="border border-outline-variant bg-surface-container-lowest p-gutter flex-1 shadow-sm">
        <h3 className="text-label-caps text-on-surface-variant mb-stack-sm border-b border-outline-variant pb-2">
          Sinopsis
        </h3>
        <p className="text-body-md text-on-surface mb-stack-md leading-relaxed">
          {description || "Sin descripción disponible."}
        </p>
        {/* Etiquetas (Tags) */}
        <div className="flex gap-2 flex-wrap">
            {tags.map((tag) => (
                <span 
                    key={tag}
                    className="border border-outline-variant bg-surface-container px-3 py-1 text-label-caps text-on-surface-variant rounded-sm"
                >
                    {tag}
                </span>
            ))}
        
        </div>
      </div>
    </div>
  );
}
