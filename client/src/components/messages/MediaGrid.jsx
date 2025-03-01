import React from "react";
import { Skeleton } from "../ui/skeleton.jsx";
import LazyImage from "../LazyImage.jsx";

const MediaGrid = ({ file }) => {
  const renderGrid = () => {
    const media = JSON.parse(file);
    if (!media || !Array.isArray(media) || media.length === 0) {
      <Skeleton className="w-full max-h-64 min-h-64 rounded-lg" />;
    }

    const mediaCount = media.length;

    if (mediaCount === 1) {
      return (
        <LazyImage
          src={media[0].path}
          alt={media[0].filename || "Media"}
          className="w-full max-h-64 min-h-64 object-cover rounded-lg"
        />
      );
    } else if (mediaCount === 2) {
      return (
        <div className="grid grid-cols-2 gap-1">
          {media.map((item, index) => (
            <LazyImage
              key={index}
              src={item.path}
              alt={item.filename || `Media ${index + 1}`}
              className="w-full max-h-64 min-h-64 object-cover rounded-lg"
            />
          ))}
        </div>
      );
    } else if (mediaCount === 3 || mediaCount === 4) {
      return (
        <div className={`grid grid-cols-${mediaCount === 3 ? "2" : "2"} gap-1`}>
          {media.map((item, index) => (
            <LazyImage
              key={index}
              src={item.path}
              alt={item.filename || `Media ${index + 1}`}
              className={`w-full max-h-64 min-h-64 object-cover rounded-lg ${
                mediaCount === 3 && index === 0 ? "col-span-2" : ""
              }`}
            />
          ))}
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-2 gap-1 relative">
          {media.slice(0, 3).map((item, index) => (
            <LazyImage
              key={index}
              src={item.path}
              alt={item.filename || `Media ${index + 1}`}
              className="w-full max-h-64 min-h-64 object-cover rounded-lg"
            />
          ))}
          {mediaCount > 4 && (
            <div className="relative">
              <LazyImage
                src={media[4].path}
                alt={media[4].filename || `Media 5`}
                className="w-full max-h-64 min-h-64 object-cover rounded-lg opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <span className="text-white text-lg font-semibold">
                  +{mediaCount - 4}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return <div className="w-full max-w-md mx-auto">{renderGrid()}</div>;
};

export default MediaGrid;
