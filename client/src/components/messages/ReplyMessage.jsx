import { Checks } from "@phosphor-icons/react";
import { Check } from "lucide-react";
import MessageOptions from "./MessageOptions.jsx";

const ReplyMessage = ({
  incoming,
  timestamp,
  original,
  content,
  read_receipt,
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
          <p
            className={`text-sm ${
              incoming
                ? "bg-gray-50 dark:bg-gray-700"
                : "bg-blue-300 dark:bg-blue-400"
            } p-2 rounded-md`}
          >
            {original}
          </p>

          <p className="text-sm">{content}</p>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {timestamp}
          </p>
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
      </MessageOptions>
    </div>
  );
};
export default ReplyMessage;
