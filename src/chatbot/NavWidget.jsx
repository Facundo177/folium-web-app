import { useNavigate } from 'react-router-dom';

export const NavWidget = (props) => {
  const navigate = useNavigate();
  
  return (
    <button 
      onClick={() => navigate(props.payload.route)} 
      className="bg-tertiary-container text-on-tertiary px-4 py-2 rounded-DEFAULT text-label-caps hover:opacity-90 transition-opacity ml-12 mb-2"
    >
      {props.payload.text}
    </button>
  );
};