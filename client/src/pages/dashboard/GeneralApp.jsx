import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { socket } from "@/socket.js";
import Chats from "./Chats.jsx";
import MessageView from "./MessageView.jsx";
import ProfileSidebar from "./ProfileSidebar.jsx";
import StarredSidebar from "./StarredSidebar.jsx";
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

    socket?.on("direct_chats", handleDirectChats);
    socket?.on("database-changed", handleDatabaseChange);

    return () => {
      socket?.off("direct_chats", handleDirectChats);
      socket?.off("database-changed", handleDatabaseChange);
    };
  }, [user?._id, conversation.currentConversation?._id, dispatch]); // ✅ Dependencies updated

  return (
    <div className="flex h-screen w-full">
      {/* Chats */}
      <Chats />

      {/* Chat Messages */}
      {conversation.currentConversation === null ? (
        <HomePage />
      ) : (
        <MessageView />
      )}

      {/* Sidebars */}
      {app.sidebar.isOpen && app.sidebar.type === "PROFILE" && (
        <ProfileSidebar />
      )}
      {app.sidebar.isOpen && app.sidebar.type === "STARRED" && (
        <StarredSidebar />
      )}
      {app.sidebar.isOpen && app.sidebar.type === "SHARED" && <SharedSidebar />}
    </div>
  );
};
export default GeneralApp;
