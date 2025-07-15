import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { socket } from "@/socket.js";
import Chats from "./Chats.jsx";
import MessageView from "./MessageView.jsx";
import ProfileSidebar from "./ProfileSidebar.jsx";
import SharedSidebar from "./SharedSidebar.jsx";
import HomePage from "../HomePage.jsx";
import { fetchDirectConversations } from "@/redux/slices/conversationSlice.js";

const GeneralApp = () => {
  const conversation = useSelector((state) => state.conversation);
  const app = useSelector((state) => state.app);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) {
      socket?.emit("get_direct_chats", { user_id: user._id });
    }
  }, [user?._id]); // ✅ Run only when `user._id` changes

  useEffect(() => {
    const handleDirectChats = (data) => {
      dispatch(fetchDirectConversations(data));
    };

    const handleDatabaseChange = () => {
      if (user?._id) {
        socket?.emit("get_direct_chats", { user_id: user._id });
      }
    };

    // Also listen to database-updated for consistency
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
  }, [user?._id, dispatch]); // Removed conversation dependency as it's not needed

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Chats - Hidden on small screens when a conversation is active */}
      <div
        className={`${
          conversation.currentConversation ? "hidden lg:flex" : "flex"
        } flex-shrink-0`}
      >
        <Chats />
      </div>

      {/* Chat Messages */}
      {conversation.currentConversation === null ? (
        <div className="hidden lg:flex flex-1">
          <HomePage />
        </div>
      ) : (
        <MessageView />
      )}

      {/* Sidebars */}
      {app.sidebar.isOpen && app.sidebar.type === "PROFILE" && (
        <div className="hidden lg:block">
          <ProfileSidebar />
        </div>
      )}
      {app.sidebar.isOpen && app.sidebar.type === "SHARED" && (
        <div className="hidden lg:block">
          <SharedSidebar />
        </div>
      )}
    </div>
  );
};
export default GeneralApp;
