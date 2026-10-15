
import LoadBookForm from "../components/InventoryComponents/LoadBookForm";



export const LoadBook = () => {

  return (


    <div className="flex-1 flex items-center justify-center p-gutter py-12 overflow-y-auto">
        
        {/* The 'key' forces the fade-in animation to replay when the URL changes */}
        <div key={location.pathname} className="animate-fade-in w-full flex justify-center">
          
        <LoadBookForm/>
        </div>

      </div>

  );
};

export default LoadBook;