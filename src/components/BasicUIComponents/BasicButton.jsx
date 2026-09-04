export default function BasicButton({buttonText = "..."}){
    return(
        <button className="flex-1 bg-surface-container-lowest text-on-surface text-body-md font-medium py-2 rounded shadow-sm">
          {buttonText}
        </button>
    );
}