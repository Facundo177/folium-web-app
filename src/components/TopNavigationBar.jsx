export const TopNavigationBar = () => {
  return (
    <>
      {/* Top Navigation Bar */}
      <header className="flex justify-between items-center px-margin-edge w-full sticky top-0 z-30 h-16 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline">
        {/* Mobile Menu Trigger */}
        <button className="md:hidden text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="font-headline-sm text-headline-sm text-primary dark:text-on-primary-fixed md:hidden">
          Folio Manager
        </div>
        {/* Search Bar (Left aligned per JSON) */}
        <div className="hidden md:flex items-center w-96 relative">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-1.5 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-on-tertiary-fixed-variant focus:ring-1 focus:ring-on-tertiary-fixed-variant font-body-md text-body-md transition-shadow"
            placeholder="Search inventory..."
            type="text"
          ></input>
        </div>
        {/* Trailing Icons */}
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors rounded p-1.5 cursor-pointer active:opacity-80">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors rounded p-1.5 cursor-pointer active:opacity-80">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>
    </>
  );
};

export default TopNavigationBar;
