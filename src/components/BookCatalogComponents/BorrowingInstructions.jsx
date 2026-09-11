export default function BorrowingInstructions() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <span className="text-label-caps text-on-surface-variant mb-2 block">CHARTER & PROTOCOLS</span>
        <h2 className="font-serif text-headline-md text-on-surface mb-2">Borrowing from The Archive</h2>
        <p className="text-body-md text-on-surface-variant">Every physical folio is maintained under strict temperature, relative humidity, and archival conservation standards.</p>
      </div>

      {/* Tarjetas de Protocolos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <span className="font-serif text-3xl text-outline-variant">01</span>
            <QrCodeIcon />
          </div>
          <h3 className="text-title-lg font-serif text-on-surface mb-3">Curate & Select</h3>
          <p className="text-body-md text-on-surface-variant mb-8 flex-1">
            Browse our online catalog of first editions, translations, and philosophical monographs. Add to your study queue.
          </p>
          <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant pt-4 border-t border-outline-variant/30">
            INCLUDES DIGITISED HIGH-RES PREVIEWS
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <span className="font-serif text-3xl text-outline-variant">02</span>
            <IdCardIcon />
          </div>
          <h3 className="text-title-lg font-serif text-on-surface mb-3">Authenticate Account</h3>
          <p className="text-body-md text-on-surface-variant mb-8 flex-1">
            Sign in with your Athenaeum Reader ID. Membership verifies handling certification and insurance coverage.
          </p>
          <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant pt-4 border-t border-outline-variant/30">
            SEAMLESS CRYPTOGRAPHIC LEDGER ENTRY
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <span className="font-serif text-3xl text-outline-variant">03</span>
            <BookOpenIcon />
          </div>
          <h3 className="text-title-lg font-serif text-on-surface mb-3">Study Desk or Delivery</h3>
          <p className="text-body-md text-on-surface-variant mb-8 flex-1">
            Reserve a private leather desk in the Oxford Stacks or receive secured courier dispatch in climate-proof boxing.
          </p>
          <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant pt-4 border-t border-outline-variant/30">
            30-DAY RENEWABLE READING PERIODS
          </span>
        </div>

      </div>

      {/* Banner Inferior */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="max-w-2xl">
          <span className="text-label-caps text-on-surface-variant mb-2 block">ARCHIVE FELLOWSHIP BENEFITS</span>
          <h3 className="font-serif text-headline-sm text-on-surface mb-2">Privileged Access to Private Rare Holdings</h3>
          <p className="text-body-md text-on-surface-variant">Patrons receive priority booking for private study rooms, unlimited saved bibliographies, invitations to nocturnal salon readings, and direct consultation with senior curators.</p>
        </div>
        <button className="bg-primary text-on-primary px-6 py-4 rounded-DEFAULT font-medium whitespace-nowrap hover:opacity-90 transition-opacity">
          Become an Archive Fellow
        </button>
      </div>
    </section>
  );
}

const QrCodeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
);
const IdCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface"><path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/></svg>
);
const BookOpenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);