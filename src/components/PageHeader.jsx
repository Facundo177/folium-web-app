export const PageHeader = () => {
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">
            Gestión de Inventario
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Manage and curate the bookstore's active catalogue.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded shadow-sm hover:bg-inverse-surface transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="font-label-caps text-label-caps uppercase">
            Añadir Nuevo Libro
          </span>
        </button>
      </div>
    </>
  );
};

export default PageHeader;
