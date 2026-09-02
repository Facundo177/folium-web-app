export default function BookDetailHeader() {
  return (
    <div className="flex justify-between items-center py-stack-sm mb-stack-md text-body-md text-on-surface-variant font-sans">
      <button className="flex items-center gap-2 hover:text-on-surface transition-colors cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Inventory
      </button>
      <div className="text-body-md">
        Fiction &nbsp;›&nbsp; <span className="font-medium text-on-surface">Classic Literature</span>
      </div>
    </div>
  );
}