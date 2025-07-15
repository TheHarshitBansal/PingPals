import { Check, Checks } from "@phosphor-icons/react";
import React from "react";
import extractLinks from "@/utils/extractLinks.js";
import Microlink from "@microlink/react";
import MessageOptions from "./MessageOptions.jsx";

const Text = ({ incoming, timestamp, read_receipt, content, messageId }) => {
  const { modifiedString, linksArray } = extractLinks(content);
  return (
    <div
      className={`max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg w-fit ${
        !incoming ? "ml-auto" : ""
      }`}
    >
      <MessageOptions messageId={messageId} incoming={incoming}>
        <div
          className={`mb-2.5 rounded-2xl ${
            !incoming
              ? "rounded-br-none bg-blue-400 dark:bg-blue-500"
              : "rounded-bl-none bg-gray-200 dark:bg-gray-800"
          } px-3 md:px-4 lg:px-5 py-2 md:py-3 space-y-2`}
        >
          <p
            className="text-sm md:text-base whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: modifiedString }}
          ></p>
          {linksArray.length > 0 && (
            <Microlink style={{ width: "100%" }} url={linksArray[0]} />
          )}
        </div>

        <div className="flex items-center justify-end space-x-2">
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            {timestamp}
          </p>
          {!incoming && read_receipt && (
            <div
              className={`${
                read_receipt === "read"
                  ? "text-blue-500"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {read_receipt !== "sent" ? (
                <Checks weight="bold" size={16} className="md:hidden" />
              ) : (
                <Check weight="bold" size={16} className="md:hidden" />
              )}
              {read_receipt !== "sent" ? (
                <Checks weight="bold" size={18} className="hidden md:block" />
              ) : (
                <Check weight="bold" size={18} className="hidden md:block" />
              )}
            </div>
          )}
        </div>
      </MessageOptions>
    </div>
  );
};

export default Text;
