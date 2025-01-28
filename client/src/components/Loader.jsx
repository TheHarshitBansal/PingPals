import React from "react";
import { Loader } from "lucide-react";

const LoadingSpinner = ({ size = "md", text = "Loading..." }) => {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <Loader className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
      {text && <p className="text-gray-700 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
