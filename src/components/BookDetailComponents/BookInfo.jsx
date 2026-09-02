export default function BookInfo({
  ISBN = '9780140449266',
  title = 'The Count of Monte Cristo',
  author = 'Alexandre Dumas',
  publicationDate = '1844',
  publisher = 'Penguin Classics',
  language = 'English (Trans.)',
  description = `A sweeping epic of revenge, justice, and redemption. This particular edition features a 
          contemporary translation that preserves the romanticism of Dumas' original serialized prose. 
          Condition notes indicate slight foxing on the endpapers, consistent with its archival status, 
          but binding remains exceptionally tight. A cornerstone piece for any serious collection of 
          19th-century French literature.`,
  tags = ['Fiction', 'Adventure', 'Classic'],
}) {

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Título y Autor */}
      <div className="mb-stack-md">
        <h1 className="text-display-lg text-on-surface mb-2 font-serif">
          {title}
        </h1>
        <h2 className="text-headline-sm text-on-surface-variant font-serif">
          by {author}
        </h2>
      </div>

      {/* Grid de Metadatos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-sm mb-stack-md">
        <div className="border border-outline-variant bg-surface-container-lowest p-3">
          <p className="text-label-caps text-on-surface-variant mb-1">
            ISBN-13
          </p>
          <p className="text-body-md text-on-surface">
            {ISBN.slice(0,3) + '-' + ISBN.slice(3)}
            </p>
        </div>
        <div className="border border-outline-variant bg-surface-container-lowest p-3">
          <p className="text-label-caps text-on-surface-variant mb-1">
            Publication
          </p>
          <p className="text-body-md text-on-surface">
            {publicationDate}
          </p>
        </div>
        <div className="border border-outline-variant bg-surface-container-lowest p-3">
          <p className="text-label-caps text-on-surface-variant mb-1">
            Publisher
          </p>
          <p className="text-body-md text-on-surface">
            {publisher}
          </p>
        </div>
        <div className="border border-outline-variant bg-surface-container-lowest p-3">
          <p className="text-label-caps text-on-surface-variant mb-1">
            Language
          </p>
          <p className="text-body-md text-on-surface">
            {language}
          </p>
        </div>
      </div>

      {/* Nota del Curador */}
      <div className="border border-outline-variant bg-surface-container-lowest p-gutter flex-1 shadow-sm">
        <h3 className="text-label-caps text-on-surface-variant mb-stack-sm border-b border-outline-variant pb-2">
          Curator's Note / Summary
        </h3>
        <p className="text-body-md text-on-surface mb-stack-md leading-relaxed">
          {description}
        </p>
        {/* Etiquetas (Tags) */}
        <div className="flex gap-2">
            {tags.map((tag, key) => (
                <span 
                    key={key}
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
