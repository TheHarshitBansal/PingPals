import { Sun, Moon } from "lucide-react";
import { useColorMode } from "../hooks/useColorMode";
import React from "react";

const DarkModeSwitcher = () => {
  const [colorMode, setColorMode] = useColorMode();
  return (
    <li className="list-none">
      <label
        htmlFor="toggle"
        className="relative m-0 block h-7 w-14 rounded-full bg-gray-200 dark:bg-gray-700"
      >
        <input
          type="checkbox"
          name="toggle"
          id="toggle"
          className="absolute z-50 m-0 top-0 h-full w-full hover:cursor-pointer opacity-0"
          onChange={() => setColorMode(colorMode === "dark" ? "light" : "dark")}
        />

        <span
          className={`absolute top-1/2 left-[3px] flex h-6 w-6 -translate-y-1/2 translate-x-0 items-center justify-center rounded-full bg-white dark:bg-gray-800 ease-linear duration-200 ${
            colorMode === "dark" && "!right-[3px] !translate-x-full"
          }`}
        >
          <span className="dark:hidden">
            <Sun size={16} />
          </span>
          <span className="hidden dark:block">
            <Moon size={16} color="white" />
          </span>
        </span>
      </label>
    </li>
  );
};

export default DarkModeSwitcher;
