import { useAuth } from "../../auth/AuthProvider";

export default function CurrentStock({
    stock = 0,
    items = []
}) {
    const locations = [...new Set(items.map((i) => i.location))].join(", ");

    const { user } = useAuth();
    const canEdit = ["LIBRARIAN", "ADMIN"].includes(user?.role);


    return (
        <div className="border border-outline-variant bg-surface-container-low p-gutter flex flex-col h-full font-sans shadow-sm relative overflow-hidden">

            {/* Background logo watermark (Opcional, simulando el diseño de fondo) */}
            <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none text-9xl">F</div>

            <div className="flex justify-between items-center mb-stack-md relative z-10">
                <h3 className="text-title-lg text-on-surface">Disponibilidad</h3>
                {stock ?
                    <span className="border border-outline-variant bg-surface-container-lowest px-3 py-1 text-label-caps text-on-surface rounded-full flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        Disponible
                    </span>
                    :
                    <span className="border border-outline-variant px-3 py-1 text-label-caps rounded-full flex items-center gap-2 bg-error-container text-on-error-container">
                        <span className="w-2 h-2 rounded-full bg-error"></span>
                        Sin disponibilidad
                    </span>
                }
            </div>

            <div className="mb-stack-md relative z-10">
                <p className="text-body-md text-on-surface-variant mb-1">
                    Ejemplares disponibles
                </p>
                <div className="flex items-baseline gap-2">
                    <span className="text-display-lg text-on-surface font-serif">
                        {stock}
                    </span>
                    <span className="text-body-lg text-on-surface-variant">
                        {stock === 1 ? "ejemplar" : "ejemplares"}
                    </span>
                </div>
            </div>

            <hr className="border-outline-variant mb-stack-md relative z-10" />


            <div className="mb-stack-lg relative z-10">
                <p className="text-body-md text-on-surface-variant mb-1">
                    Ubicacion
                </p>
                <span className="text-body-md text-on-surface font-medium">
                    {locations || "—"}
                </span>
            </div>

            {canEdit && (
                <button className="mt-auto border border-outline-variant bg-surface-container-lowest hover:bg-surface text-on-surface text-label-caps py-3 px-4 flex justify-center items-center gap-2 transition-colors relative z-10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
                Actualizar inventario
            </button>
            )}

            
        </div>
    );
}