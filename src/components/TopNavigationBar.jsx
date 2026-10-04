export const TopNavigationBar = () => {
  return (
    <>
      {/* Top Navigation Bar */}
      <header className="flex justify-end items-center px-margin-edge w-full sticky top-0 z-30 h-16 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline">

        {/* Search Bar (Left aligned per JSON) */}
        {/* <div className="pr-4 md:flex items-center w-96 relative">
          <span className="hidden md:block absolute left-3">
            <svg className="h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
          </span>
          <input
            className="w-full pl-10 pr-4 py-1.5 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-on-tertiary-fixed-variant focus:ring-1 focus:ring-on-tertiary-fixed-variant font-body-md text-body-md transition-shadow"
            placeholder="Search inventory..."
            type="text"
          ></input>
        </div> */}
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
