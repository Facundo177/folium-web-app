import { MorphIcon } from "morphicons/react";
import { Menu, X } from "lucide";

export default function MenuToX({open}){
    return(
        <MorphIcon icon={open ? X : Menu} />
    );
}