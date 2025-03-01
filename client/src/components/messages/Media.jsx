import React from "react";
import MessageOptions from "./MessageOptions.jsx";
import LazyImage from "../LazyImage.jsx";

const Media = ({ incoming, timestamp, file, messageId }) => {
  const media = JSON.parse(file);
  const fileType = media.path.split(".").pop().toLowerCase();

  const isImage = /(jpg|jpeg|png|gif|webp)$/i.test(fileType);
  const isVideo = /(mp4|webm|ogg)$/i.test(fileType);

  return (
    <div className={`max-w-96 w-fit ${incoming ? "" : "ml-auto"}`}>
      <MessageOptions messageId={messageId} incoming={incoming}>
        {isImage ? (
          <LazyImage
            src={media.path}
            alt={media.filename}
            className={`mb-2.5 rounded-2xl ${
              incoming
                ? "rounded-bl-none bg-gray-200 dark:bg-gray-800"
                : "rounded-br-none bg-blue-400 dark:bg-blue-500"
            }`}
          />
        ) : isVideo ? (
          <video
            src={media.path}
            controls
            className="mb-2.5 rounded-2xl max-w-full h-auto"
          />
        ) : (
          <LazyImage
            src={media.path}
            alt="file"
            className={`mb-2.5 rounded-2xl ${
              incoming
                ? "rounded-bl-none bg-gray-200 dark:bg-gray-800"
                : "rounded-br-none bg-blue-400 dark:bg-blue-500"
            }`}
          />
        )}

        <div className="flex items-center justify-end space-x-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {timestamp}
          </p>
        </div>
      </MessageOptions>
    </div>
  );
};

export default Media;
