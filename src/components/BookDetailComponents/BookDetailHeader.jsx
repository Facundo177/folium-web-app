import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "../BasicUIComponents/ArrowLeftIcon";

export default function BookDetailHeader() {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between items-center py-stack-sm mb-stack-md text-body-md text-on-surface-variant font-sans">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 hover:text-on-surface transition-colors cursor-pointer">
        <ArrowLeftIcon/> Return
      </button>
      <div className="text-body-md">
        Fiction &nbsp;›&nbsp; <span className="font-medium text-on-surface">Classic Literature</span>
      </div>
    </div>
  );
}