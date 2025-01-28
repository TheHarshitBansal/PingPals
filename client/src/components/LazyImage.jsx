import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const LazyImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);

  const handleImageLoad = () => {
    setLoaded(true);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Skeleton as a fallback */}
      {!loaded && <Skeleton className="absolute top-0 left-0 w-full h-full" />}

      {/* Lazy loaded image */}
      <img
        src={src}
        alt={alt}
        className={`!w-full !h-full !object-cover !object-center transition-opacity duration-500 ${
          loaded ? className : "opacity-0"
        }`}
        loading="lazy"
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default LazyImage;
