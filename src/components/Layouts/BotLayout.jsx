import { Outlet } from "react-router-dom";
import FoliumBot from "../../chatbot/FoliumBot";


export default function BotLayout() {
  return (
    <div>
        <FoliumBot/>
        <main style={{ width: "100%" }}>
            <Outlet/>
        </main>
    </div>
  );
}