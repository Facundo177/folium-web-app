import { MorphIcon } from "morphicons/react";
import { Eye, EyeOff } from "lucide"; // data, not components

export default function PasswordEye({open}){
    return(
        <MorphIcon icon={open ? Eye : EyeOff} />
    );
}