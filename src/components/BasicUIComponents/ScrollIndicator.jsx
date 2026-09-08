export default function ScrollIndicator(){
    return(
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-stack-sm z-10">
          <span className="text-label-caps text-on-surface-variant">
            Desplazar
          </span>
          <svg
            className="w-4 h-4 text-on-surface-variant"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
    );
}
