import { useEffect, useState } from "react";

export const useLocalStorage = (key, initialValue) => {
    const [value, setValue] = useState(() => {
        try{
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue; 
        }
        catch(error){
            console.log(error);
            return initialValue;
        }
    })

    useEffect(() => {
      try {
        const valueToStore = typeof value === "function" ? value(value) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.log(error)
      }
    }, [key, value]);

    return [value, setValue];
}