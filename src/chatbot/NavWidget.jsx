import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const NavWidget = (props) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(props.payload.route)}
      className="ml-11 mb-2 inline-flex items-center gap-2 bg-primary text-on-primary border border-outline/40 px-4 py-2 rounded-sm text-[11px] font-bold uppercase tracking-widest shadow-sm hover:opacity-90 transition-all hover:-translate-y-0.5 cursor-pointer"
    >
      <span>{props.payload.text}</span>
      <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );
};