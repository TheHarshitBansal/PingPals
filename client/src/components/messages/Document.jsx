import { Check, Checks, DownloadSimple, File } from "@phosphor-icons/react";
import React from "react";
import MessageOptions from "./MessageOptions.jsx";

const Document = ({
  incoming,
  timestamp,
  read_receipt,
  content,
  fileName,
  fileSize,
}) => {
  return (
    <div className={`max-w-96 w-fit ${!incoming ? "ml-auto" : ""}`}>
      <MessageOptions>
        <div
          className={`mb-2.5 rounded-2xl ${
            !incoming
              ? "rounded-br-none bg-blue-400 dark:bg-blue-500"
              : "rounded-bl-none bg-gray-200 dark:bg-gray-800"
          } px-5 py-3 space-y-2`}
        >
          <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-md bg-blue-600/20">
                <File size={20} />
              </div>
              <div className="flex flex-col">
                <div>{fileName}</div>
                <div className="text-sm font-medium">{fileSize}</div>
              </div>
            </div>

            <button className="pl-5">
              <DownloadSimple size={20} color="gray" />
            </button>
          </div>
          <p className="text-sm">{content}</p>
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
export default Document;
