import { SmileySticker } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import React from "react";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const EmojiPicker = () => {
  const colorMode = JSON.parse(window.localStorage.getItem("colorMode"));

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const trigger = useRef(null);
  const picker = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isPickerOpen &&
        !picker.current.contains(e.target) &&
        !trigger.current.contains(e.target)
      ) {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPickerOpen]);

  const handleEmojiClick = (e) => {
    e.preventDefault();

    setIsPickerOpen(!isPickerOpen);
  };

  return (
    <div className="relative flex">
      <button onClick={handleEmojiClick} ref={trigger}>
        <SmileySticker size={24} color="gray" weight="bold" />
      </button>

      {isPickerOpen && (
        <div ref={picker} className="absolute z-40 bottom-10 right-0">
          <Picker theme={colorMode} data={data} onEmojiSelect={console.log} />
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
