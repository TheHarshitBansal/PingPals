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

      {/* Chat Messages - Takes full width on mobile when conversation is active */}
      {conversation.currentConversation === null ? (
        <div className="hidden md:flex flex-1">
          <HomePage />
        </div>
      ) : (
        <div className="flex-1 w-full">
          <MessageView />
        </div>
      )}

      {/* Sidebars - Only show on larger screens */}
      {app.sidebar.isOpen && app.sidebar.type === "PROFILE" && (
        <div className="hidden xl:block">
          <ProfileSidebar />
        </div>
      )}
      {app.sidebar.isOpen && app.sidebar.type === "SHARED" && (
        <div className="hidden xl:block">
          <SharedSidebar />
        </div>
      )}
    </div>
  );
};
export default GeneralApp;
