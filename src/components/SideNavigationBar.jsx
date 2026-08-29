export const SideNavigationBar = () => {
  return (
    <>
      {/* Desktop Side Navigation Shell */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 py-stack-md bg-surface-container-lowest dark:bg-surface-container-low border-r border-outline-variant dark:border-outline z-40">
        {/* Brand Header */}
        <div className="px-gutter mb-stack-lg">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: "28px", fontVariationSettings: "FILL 1" }}
            >
              book_4
            </span>
            <div>
              <h1 className="font-headline-sm text-headline-sm tracking-tight text-primary">
                folium
              </h1>
              <p className="font-label-caps text-label-caps text-on-surface-variant mt-1 uppercase">
                Un producto de TOMO
              </p>
            </div>
          </div>
        </div>
        {/* Main Navigation Links */}
        <div className="flex-1 px-3 space-y-1">
          <a
            className="flex items-center gap-3 px-4 py-3 rounded group text-on-surface-variant dark:text-on-secondary-fixed-variant hover:bg-surface-container dark:hover:bg-surface-container-high transition-all"
            href="#"
          >
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-200">
              dashboard
            </span>
            <span className="font-label-caps text-label-caps uppercase">
              Dashboard
            </span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded group text-primary dark:text-primary-fixed font-bold border-r-2 border-primary dark:border-primary-fixed-dim bg-surface-container-low"
            href="#"
          >
            <span
              className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-200"
              style={{ fontVariationSettings: "FILL 1" }}
            >
              menu_book
            </span>
            <span className="font-label-caps text-label-caps uppercase">
              Inventory
            </span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded group text-on-surface-variant dark:text-on-secondary-fixed-variant hover:bg-surface-container dark:hover:bg-surface-container-high transition-all"
            href="#"
          >
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-200">
              receipt_long
            </span>
            <span className="font-label-caps text-label-caps uppercase">
              Orders
            </span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded group text-on-surface-variant dark:text-on-secondary-fixed-variant hover:bg-surface-container dark:hover:bg-surface-container-high transition-all"
            href="#"
          >
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-200">
              group
            </span>
            <span className="font-label-caps text-label-caps uppercase">
              Customers
            </span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded group text-on-surface-variant dark:text-on-secondary-fixed-variant hover:bg-surface-container dark:hover:bg-surface-container-high transition-all"
            href="#"
          >
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-200">
              analytics
            </span>
            <span className="font-label-caps text-label-caps uppercase">
              Reports
            </span>
          </a>
        </div>
        {/* Action Area */}
        <div className="px-gutter mt-stack-md mb-stack-md">
          <button className="w-full py-2 bg-on-tertiary-fixed-variant text-on-tertiary font-label-caps text-label-caps uppercase rounded hover:bg-tertiary-container transition-colors shadow-sm">
            Finalize Order
          </button>
        </div>

        {/* Footer Links */}
        <div className="px-3 space-y-1 pt-stack-sm border-t border-outline-variant mx-4">
          <a
            className="flex items-center gap-3 px-4 py-2 rounded group text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
            <span className="font-label-caps text-label-caps uppercase">
              Settings
            </span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-2 rounded group text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              help_outline
            </span>
            <span className="font-label-caps text-label-caps uppercase">
              Support
            </span>
          </a>
          <div className="mt-4 px-4 flex items-center gap-3">
            <img
              alt="Store Manager Profile"
              className="w-8 h-8 rounded-full object-cover border border-outline-variant"
              data-alt="A small, elegant profile portrait of a bookstore manager in a minimalist setting, high key lighting, professional and calm aesthetic, monochrome tones."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCo60ETa_txVsSM3NIwcgV5eZj9Y8gszv_Ryui9h6fonDhw_DbiLfr0-GZ3grJZge0ar_q6iq5YdXTSLJGxPe6B1Z8wmzfjcFJ0tlwOD1p2ps8Uu4TuW7dVIWo_Ok_fmlOkbgMcGC89UGUmD-vf5R0kid-8t4HCLQHztWWdGOCshMdavG7eKZg8EggOSnIiSB-kgCMW-YbBZYLW-agcJHNEgHN8HXgoupxBZ93OvMB_-jW6ULQEQ0tx"
            ></img>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              E. P. Smith
            </span>
          </div>
        </div>
      </nav>
    </>
  );
};

export default SideNavigationBar;
