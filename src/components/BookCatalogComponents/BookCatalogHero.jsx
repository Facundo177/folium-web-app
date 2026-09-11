export default function BookCatalogHero() {
  return (
    <section className="relative w-full min-h-screen pt-32 pb-48 px-margin-edge bg-surface-variant flex flex-col items-center justify-center">
      {/* Fondo de biblioteca con overlay degradado para legibilidad */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-multiply"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop")' }}
      ></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/40 via-background/80 to-background"></div>

      {/* Contenido Principal */}
      <div className="relative z-10 w-full max-w-[var(--spacing-container-max)]">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-surface-container-high px-3 py-1 text-label-caps text-on-surface-variant rounded-sm">CURATORIAL RESERVE 2026</span>
            <span className="text-label-caps text-on-surface-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary-container"></span> Oxford Reading Stacks Active
            </span>
          </div>
          
          <h1 className="font-serif text-display-lg text-on-surface mb-6 leading-tight">
            Curated for the Inquisitive Mind.
          </h1>
          
          <p className="text-body-lg text-on-surface-variant mb-8 leading-relaxed max-w-xl">
            Step into our living repository of exceptional works, ancient manuscripts, and timeless editions. Reserve your reading copy or curate your private archival collection.
          </p>
          
          <div className="flex items-center gap-4">
            <button className="bg-primary text-on-primary px-6 py-3 rounded-DEFAULT font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
              Browse the Library <ArrowRightIcon />
            </button>
            <button className="bg-surface-container-high text-on-surface px-6 py-3 rounded-DEFAULT font-medium flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
              <ShieldIcon /> Member Sign In to Borrow
            </button>
          </div>
        </div>
      </div>

      {/* Tarjeta inferior de Estadísticas */}
      <div className="relative pt-20 w-full max-w-[var(--spacing-container-max)] px-margin-edge z-20">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-8 grid grid-cols-1 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-outline-variant">
          
          <div className="flex flex-col pt-4 md:pt-0 md:pl-6 first:pl-0 first:pt-0 border-none">
            <span className="text-label-caps text-on-surface-variant mb-2">ARCHIVAL VOLUMES</span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-headline-md text-on-surface">12,450</span>
              <span className="text-body-md text-on-surface-variant">registered</span>
            </div>
            <span className="text-body-md text-on-surface-variant mt-1">First folios, private presses, parchment</span>
          </div>

          <div className="flex flex-col pt-4 md:pt-0 md:pl-6">
            <span className="text-label-caps text-on-surface-variant mb-2">CIRCULATION STATUS</span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-headline-md text-on-surface">98.4%</span>
              <span className="text-body-md text-on-surface-variant">available</span>
            </div>
            <span className="text-body-md text-on-surface-variant mt-1">Immediate dispatch or study desk loan</span>
          </div>

          <div className="flex flex-col pt-4 md:pt-0 md:pl-6">
            <span className="text-label-caps text-on-surface-variant mb-2">REGIONAL REPOSITORIES</span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-headline-md text-on-surface">Oxford</span>
              <span className="text-body-md text-on-surface-variant">& St. Gallen</span>
            </div>
            <span className="text-body-md text-on-surface-variant mt-1">Inter-collegiate secure courier transit</span>
          </div>

          <div className="flex flex-col pt-4 md:pt-0 md:pl-6">
            <span className="text-label-caps text-on-surface-variant mb-2">ATHENAEUM FELLOWS</span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-headline-md text-on-surface">3,120</span>
              <span className="text-body-md text-on-surface-variant">patrons</span>
            </div>
            <span className="text-body-md text-on-surface-variant mt-1">Active readers across 42 jurisdictions</span>
          </div>

        </div>
      </div>
    </section>
  );
}

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);