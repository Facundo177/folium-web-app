// import { MorphIcon } from "morphicons/react";
// import { Book, BookOpen } from "lucide";

import { Book, BookOpen } from "lucide";

// export default function OpenToClosedBook({open}){
//     return(
//         <MorphIcon icon={open ? BookOpen : Book} />
//     );
// }



export default function OpenToClosedBook({ open }) {
    return (
        <div className="inline-flex items-center justify-center transition-transform duration-300">
            <div style={{ transform: open ? "scaleX(1.1)" : "scaleX(0.9)" }}>
                {open ? <BookOpen size={24} /> : <Book size={24} />}
            </div>
        </div>
    );
}