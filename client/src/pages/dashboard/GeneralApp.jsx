import { useSelector } from "react-redux";
import Chats from "./Chats.jsx";
import MessageView from "./MessageView.jsx";
import ProfileSidebar from "./ProfileSidebar.jsx";
import StarredSidebar from "./StarredSidebar.jsx";
import SharedSidebar from "./SharedSidebar.jsx";
import HomePage from "../HomePage.jsx";
import { useEffect } from "react";
import { socket } from "@/socket.js";

const GeneralApp = () => {
  const app = useSelector((state) => state.app);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    socket.emit("get_direct_chats", { user_id: user._id }, (data) => {});
  }, []);
  return (
    <div className="flex h-screen w-full">
      {/* Chats */}
      <Chats />

      {/* Chat Messages */}
      {app.chat_id === null ? <HomePage /> : <MessageView />}

      {/* Chat Profile */}
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
