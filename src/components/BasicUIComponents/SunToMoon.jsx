import { MorphIcon } from "morphicons/react";
import { Sun, Moon } from "lucide";

export default function MenuToX({isDarkMode}){
    return(
        <MorphIcon icon={isDarkMode ? Sun : Moon} />
    );
}