import Media from "@/components/messages/Media.jsx";
import Text from "@/components/messages/Text.jsx";
import { StarredMessages } from "@/data/messages.js";
import { setSidebarType } from "@/redux/slices/appSlice.js";
import { ChevronLeft } from "lucide-react";
import { useDispatch } from "react-redux";

const StarredSidebar = () => {
  const dispatch = useDispatch();

  const handleProfile = () => {
    dispatch(setSidebarType("PROFILE"));
  };

  return (
    <div className="flex flex-col shadow-light dark:shadow-dark w-1/4 h-full">
      {/* //INFO: HEADER */}
      <div className="sticky border-b border-gray-300 dark:border-gray-700 flex items-center justify-start gap-x-2 w-full p-6 ">
        <button onClick={handleProfile}>
          <ChevronLeft size={24} color="gray" />
        </button>
        <div className="font-semibold text-lg">Starred Messages</div>
      </div>

      {/* //INFO: STARRED MESSAGES */}
      <div className="max-h-full space-y-3 overflow-auto no-scrollbar px-6 py-7 grow bg-gray-50 dark:bg-gray-900 shadow-inner">
        {StarredMessages.map((message, index) => {
          if (message.type === "text") {
            return (
              <Text
                key={index}
                incoming={message?.incoming}
                content={message?.content}
              />
            );
          } else if (message.type === "media") {
            return (
              <Media
                key={index}
                incoming={message?.incoming}
                assets={message?.assets}
                caption={message?.caption}
              />
            );
          }
        })}
      </div>
    </div>
  );
};
export default StarredSidebar;
