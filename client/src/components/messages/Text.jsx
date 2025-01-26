import { Check, Checks } from "@phosphor-icons/react";
import React from "react";
import extractLinks from "@/utils/extractLinks.js";
import Microlink from "@microlink/react";

const Text = ({ incoming, timestamp, read_receipt, content }) => {
  const { modifiedString, linksArray } = extractLinks(content);
  return (
    <div className={`max-w-96 w-fit ${!incoming ? "ml-auto" : ""}`}>
      <div
        className={`mb-2.5 rounded-2xl ${
          !incoming
            ? "rounded-br-none bg-blue-400 dark:bg-blue-500"
            : "rounded-bl-none bg-gray-200 dark:bg-gray-800"
        } px-5 py-3 space-y-2`}
      >
        <p
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: modifiedString }}
        ></p>
        {linksArray.length > 0 && (
          <Microlink style={{ width: "100%" }} url={linksArray[0]} />
        )}
      </div>

      <div className="flex items-center justify-end space-x-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">{timestamp}</p>
        {!incoming && (
          <div
            className={`${
              read_receipt === "read"
                ? "text-blue-500"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {read_receipt !== "sent" ? (
              <Checks weight="bold" size={18} />
            ) : (
              <Check weight="bold" size={18} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Text;
