import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { socket } from "@/socket.js";
import Chats from "./Chats.jsx";
import MessageView from "./MessageView.jsx";
import ProfileSidebar from "./ProfileSidebar.jsx";
import SharedSidebar from "./SharedSidebar.jsx";
import HomePage from "../HomePage.jsx";
import {
  fetchDirectConversations,
  setCurrentConversation,
} from "@/redux/slices/conversationSlice.js";
import { toggleSidebar } from "@/redux/slices/appSlice.js";

const GeneralApp = () => {
  const conversation = useSelector((state) => state.conversation);
  const app = useSelector((state) => state.app);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) {
      socket?.emit("get_direct_chats", { user_id: user._id });
    }
  }, [user?._id]);

  useEffect(() => {
    const handleDirectChats = (data) => {
      dispatch(fetchDirectConversations(data));
    };

    const handleDatabaseChange = () => {
      if (user?._id) {
        socket?.emit("get_direct_chats", { user_id: user._id });
      }
    };

    const handleDatabaseUpdate = () => {
      if (user?._id) {
        socket?.emit("get_direct_chats", { user_id: user._id });
      }
    };

    socket?.on("direct_chats", handleDirectChats);
    socket?.on("database-changed", handleDatabaseChange);
    socket?.on("database-updated", handleDatabaseUpdate);

    return () => {
      socket?.off("direct_chats", handleDirectChats);
      socket?.off("database-changed", handleDatabaseChange);
      socket?.off("database-updated", handleDatabaseUpdate);
    };
  }, [user?._id, dispatch]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Chats Sidebar - Responsive behavior */}
      <div
        className={`${
          conversation.currentConversation
            ? "hidden md:flex" // Hide on mobile and small tablets when conversation is active
            : "flex" // Always show when no conversation is selected
        } flex-shrink-0 w-full md:w-auto`}
      >
        <Chats />
      </div>

      {/* Chat Messages - Takes remaining space but leaves room for sidebars */}
      {conversation.currentConversation === null ? (
        <div className="hidden md:flex flex-1">
          <HomePage />
        </div>
      ) : (
        <div
          className={`flex-1 ${
            app.sidebar.isOpen
              ? "lg:max-w-none xl:max-w-[calc(100%-320px)]"
              : "w-full"
          } min-w-0`}
        >
          <MessageView />
        </div>
      )}

      {/* Profile Sidebar - Show as overlay on mobile, sidebar on larger screens */}
      {app.sidebar.isOpen && app.sidebar.type === "PROFILE" && (
        <>
          {/* Mobile overlay */}
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => dispatch(toggleSidebar())}
          >
            <div
              className="absolute right-0 top-0 h-full w-80 max-w-[85vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <ProfileSidebar />
            </div>
          </div>
          {/* Desktop sidebar */}
          <div className="hidden lg:flex lg:w-80 xl:w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-700">
            <ProfileSidebar />
          </div>
        </>
      )}

      {/* Shared Sidebar - Show as overlay on mobile, sidebar on larger screens */}
      {app.sidebar.isOpen && app.sidebar.type === "SHARED" && (
        <>
          {/* Mobile overlay */}
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => dispatch(toggleSidebar())}
          >
            <div
              className="absolute right-0 top-0 h-full w-80 max-w-[85vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <SharedSidebar />
            </div>
          </div>
          {/* Desktop sidebar */}
          <div className="hidden lg:flex lg:w-80 xl:w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-700">
            <SharedSidebar />
          </div>
        </>
      )}
    </div>
  );
};
export default GeneralApp;
