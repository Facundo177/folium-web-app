import SideNavigationBar from "../components/SideNavigationBar";

export const Inventory = () => {


    return (
    <>
        <div className="antialiased min-h-screen flex font-body-md text-body-md selection:bg-tertiary-fixed selection:text-on-tertiary-fixed">


            <SideNavigationBar/>


            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
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
                        <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">search</span>
                        <input className="w-full pl-10 pr-4 py-1.5 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-on-tertiary-fixed-variant focus:ring-1 focus:ring-on-tertiary-fixed-variant font-body-md text-body-md transition-shadow" placeholder="Search inventory..." type="text"></input>
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
                {/* Canvas */}
                <div className="flex-1 p-margin-edge md:p-stack-lg max-w-[1280px] mx-auto w-full">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
                        <div>
                            <h2 className="font-headline-md text-headline-md text-primary">Gestión de Inventario</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage and curate the bookstore's active catalogue.</p>
                        </div>
                        <button className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded shadow-sm hover:bg-inverse-surface transition-colors">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            <span className="font-label-caps text-label-caps uppercase">Añadir Nuevo Libro</span>
                        </button>
                    </div>
                    {/* Stats Row (Bento-style summary) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg">
                        {/* Stat Card 1 */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-shadow">
                            <div>
                                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Total Libros</p>
                                <p className="font-display-lg text-display-lg md:text-display-lg-mobile text-primary">12,450</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                                <span className="material-symbols-outlined text-secondary text-[24px]">library_books</span>
                            </div>
                        </div>
                        {/* Stat Card 2 */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-shadow">
                            <div>
                                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Stock Bajo</p>
                                <p className="font-display-lg text-display-lg md:text-display-lg-mobile text-on-tertiary-fixed-variant">42</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-tertiary-fixed-variant text-[24px]">warning_amber</span>
                            </div>
                        </div>
                        {/* Stat Card 3 */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-shadow">
                            <div>
                                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Pedidos Pendientes</p>
                                <p className="font-display-lg text-display-lg md:text-display-lg-mobile text-primary">18</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                                <span className="material-symbols-outlined text-secondary text-[24px]">local_shipping</span>
                            </div>
                        </div>
                    </div>
                    {/* Inventory Section */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                        {/* Filters Toolbar */}
                        <div className="p-4 border-b border-outline-variant bg-surface-bright flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center w-full md:w-auto relative">
                                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">search</span>
                                <input className="w-full md:w-80 pl-10 pr-4 py-2 bg-surface-container-lowest border-b-2 border-outline-variant border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-on-tertiary-fixed-variant font-body-md text-body-md transition-colors bg-transparent" placeholder="Title, Author, or ISBN" type="text"></input>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                                <select className="py-1.5 px-3 bg-surface-container-lowest border border-outline-variant rounded font-label-caps text-label-caps text-on-surface-variant uppercase focus:border-primary focus:ring-0 cursor-pointer">
                                    <option>All Genres</option>
                                    <option>Fiction</option>
                                    <option>Non-Fiction</option>
                                    <option>Classic</option>
                                </select>
                                <select className="py-1.5 px-3 bg-surface-container-lowest border border-outline-variant rounded font-label-caps text-label-caps text-on-surface-variant uppercase focus:border-primary focus:ring-0 cursor-pointer">
                                    <option>Stock Status</option>
                                    <option>In Stock</option>
                                    <option>Low Stock</option>
                                    <option>Out of Stock</option>
                                </select>
                                <button aria-label="More filters" className="p-1.5 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px]">tune</span>
                                </button>
                            </div>
                        </div>
                        {/* Data Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-bright border-b border-outline-variant">
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-16">Cover</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Title &amp; Author</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase hidden md:table-cell">ISBN</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase hidden sm:table-cell">Genre</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Price</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-center">Status</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/50">
                                    {/* Row 1 */}
                                    <tr className="book-row-hover group">
                                        <td className="py-3 px-4">
                                            <div className="w-10 h-14 bg-surface-container border border-outline-variant shadow-sm relative overflow-hidden">
                                                <img alt="Cover" className="w-full h-full object-cover" data-alt="A vintage, minimalist book cover for 'El nombre del viento', featuring subtle arcane symbols on a dark parchment background, highly detailed, soft studio lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0BL97SrK5ZCfdv55RhenQa9hQbMZiDeOIYUyyVmSj76UuWTQ-LD7XrCq-yXA8PTA1YkGFGrp8edLtPrhGtYeKQbl84hNTs7joBW2-uOA-tXFoxTMk0TZXVgv0GIkXVaKN1aG6vhNmpv3acVMe0P3xHUlPoKKcaZzHwsMTD42RCQxpp_4ztnJaEHKxKVDjkatVQtJg642lGAEVF896m59J_TGxuWzcQpuftbUJ005tOZ_K4rIiAfJX"></img>
                                                    <div className="absolute inset-0 border border-black/10"></div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-title-lg text-title-lg text-primary truncate max-w-[200px] md:max-w-xs">El nombre del viento</div>
                                            <div className="font-body-md text-body-md text-on-surface-variant mt-0.5">Patrick Rothfuss</div>
                                        </td>
                                        <td className="py-3 px-4 font-body-md text-on-surface-variant hidden md:table-cell font-mono text-sm tracking-wide">978-8401352836</td>
                                        <td className="py-3 px-4 font-body-md text-on-surface-variant hidden sm:table-cell">Fantasy</td>
                                        <td className="py-3 px-4 font-body-md text-primary text-right font-medium">€24.90</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded font-label-caps text-label-caps uppercase bg-surface-container-high text-on-surface">
                                                In Stock
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="View details">
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </button>
                                                <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Edit entry">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Row 2 */}
                                    <tr className="book-row-hover group">
                                        <td className="py-3 px-4">
                                            <div className="w-10 h-14 bg-surface-container border border-outline-variant shadow-sm relative overflow-hidden">
                                                <img alt="Cover" className="w-full h-full object-cover" data-alt="A classic, minimalist book cover for 'Cien años de soledad', featuring delicate yellow butterflies on an off-white linen texture, elegant typography, high key lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCANCZCYiHrfCIwi8t93OcbH4TDObpMxcAE_b9MJ4V1sn--KOyWmNvL9o01Ieh8OHDbWg27QuZVABEmIbiXOVMzeVYY6Q7-psmzCRNPuQH9tRilmMiwE4RRfrom1ED3aeOrSCRxGSwdM5AKp2HdYEe_8BPerJ9PKEPGC5b2gYOS26qbrlH8EN3aoTTKsTIvgxM0jFaH2nVInbD8IcKQfseZVU5VigLDxJZwRygmyzHjScAW4ENAufvD"></img>
                                                    <div className="absolute inset-0 border border-black/10"></div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-title-lg text-title-lg text-primary truncate max-w-[200px] md:max-w-xs">Cien años de soledad</div>
                                            <div className="font-body-md text-body-md text-on-surface-variant mt-0.5">Gabriel García Márquez</div>
                                        </td>
                                        <td className="py-3 px-4 font-body-md text-on-surface-variant hidden md:table-cell font-mono text-sm tracking-wide">978-0307474728</td>
                                        <td className="py-3 px-4 font-body-md text-on-surface-variant hidden sm:table-cell">Magical Realism</td>
                                        <td className="py-3 px-4 font-body-md text-primary text-right font-medium">€18.50</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded font-label-caps text-label-caps uppercase bg-tertiary-fixed text-on-tertiary-fixed-variant border border-tertiary-fixed-dim/30">
                                                Low Stock
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="View details">
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </button>
                                                <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Edit entry">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Row 3 */}
                                    <tr className="book-row-hover group">
                                        <td className="py-3 px-4">
                                            <div className="w-10 h-14 bg-surface-container border border-outline-variant shadow-sm relative overflow-hidden">
                                                <img alt="Cover" className="w-full h-full object-cover" data-alt="A stark, brutalist minimalist book cover for '1984', featuring sharp geometric shapes in black and off-white, totalitarian aesthetic, high contrast, studio quality." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaN6k-iwq2b7whgzOmIcG3anEM78SNaRgVftGtlAXSO7rGowGjQhHO2dFOUxipf5N4hyq_T2_-uAsBZbLtGtT6TS2Ec-X39dSzan521B8zVGBonj8j4aNPLgwzGndPyQW9u4kLIQMUFGRs7YiS4Wcw-Rc1zoy787ZIpCw4Qo4yleFvlo8iRQGG0pR1tDQH_fWyN3r5vSoFmbQiTfM3UR-8KJcu-MEnSx0xl9clVsoNJgvmJkihuZWl"></img>
                                                    <div className="absolute inset-0 border border-black/10"></div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-title-lg text-title-lg text-primary truncate max-w-[200px] md:max-w-xs">1984</div>
                                            <div className="font-body-md text-body-md text-on-surface-variant mt-0.5">George Orwell</div>
                                        </td>
                                        <td className="py-3 px-4 font-body-md text-on-surface-variant hidden md:table-cell font-mono text-sm tracking-wide">978-0451524935</td>
                                        <td className="py-3 px-4 font-body-md text-on-surface-variant hidden sm:table-cell">Dystopian</td>
                                        <td className="py-3 px-4 font-body-md text-primary text-right font-medium">€14.99</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded font-label-caps text-label-caps uppercase bg-surface-container-high text-on-surface">
                                                In Stock
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="View details">
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </button>
                                                <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Edit entry">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {/* Table Footer / Pagination */}
                        <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-surface-bright">
                            <span className="font-body-md text-on-surface-variant text-sm">Showing 1 to 3 of 12,450 entries</span>
                            <div className="flex gap-1">
                                <button className="px-3 py-1 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50" disabled="">Prev</button>
                                <button className="px-3 py-1 border border-outline-variant rounded bg-primary text-on-primary">1</button>
                                <button className="px-3 py-1 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container transition-colors">2</button>
                                <button className="px-3 py-1 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container transition-colors">3</button>
                                <span className="px-2 py-1 text-on-surface-variant">...</span>
                                <button className="px-3 py-1 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container transition-colors">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>


        </div>
        
    
    </>)

}

export default Inventory;