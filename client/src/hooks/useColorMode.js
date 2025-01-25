import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage"

export const useColorMode = () => {
    const [colorMode, useColorMode] = useLocalStorage("colorMode", "light");

    useEffect(()=>{
        const className = 'dark';
        const bodyClass = window.document.body.classList;

        colorMode === 'dark' ? bodyClass.add(className) : bodyClass.remove(className);
    }, [colorMode]);

    return [colorMode, useColorMode];
}