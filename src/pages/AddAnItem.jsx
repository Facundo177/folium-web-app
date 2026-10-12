import ItemForm from "../components/InventoryComponents/ItemForm";

export const AddAnItem = () => {

  return (
    <div className="flex-1 flex items-center justify-center p-gutter py-12 overflow-y-auto">
        
        {/* The 'key' forces the fade-in animation to replay when the URL changes */}
        <div key={location.pathname} className="animate-fade-in w-full flex justify-center">
            <ItemForm/>
        </div>

      </div>
  );
};

export default AddAnItem;