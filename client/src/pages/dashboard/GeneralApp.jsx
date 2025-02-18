import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { socket } from "@/socket.js";
import Chats from "./Chats.jsx";
import MessageView from "./MessageView.jsx";
import ProfileSidebar from "./ProfileSidebar.jsx";
import StarredSidebar from "./StarredSidebar.jsx";
import SharedSidebar from "./SharedSidebar.jsx";
import HomePage from "../HomePage.jsx";

const GeneralApp = () => {
  const conversation = useSelector((state) => state.conversation);
  const app = useSelector((state) => state.app);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user?._id) {
      socket?.emit("get_direct_chats", { user_id: user._id });
    }
  });

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
