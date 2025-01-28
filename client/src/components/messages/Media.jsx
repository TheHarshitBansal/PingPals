import { Check, Checks } from "@phosphor-icons/react";
import MediaGrid from "./MediaGrid.jsx";
import React from "react";
import MessageOptions from "./MessageOptions.jsx";

const Media = ({ incoming, read_receipt, timestamp, assets, caption }) => {
  return (
    <div className={`max-w-96 w-fit ${incoming ? "" : "ml-auto"}`}>
      <MessageOptions>
        <div
          className={`mb-2.5 rounded-2xl ${
            incoming
              ? "rounded-bl-none bg-gray-200 dark:bg-gray-800"
              : "rounded-br-none bg-blue-400 dark:bg-blue-500"
          }  p-3 space-y-2`}
        >
          <MediaGrid media={assets} />
          <p className="text-sm">{caption}</p>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
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
                <Checks weight="bold" size={18} />
              ) : (
                <Check weight="bold" size={18} />
              )}
            </div>
          )}
        </div>
      </MessageOptions>
    </div>
  );
};
export default Media;
