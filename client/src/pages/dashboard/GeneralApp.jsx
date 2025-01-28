import { useSelector } from "react-redux";
import Chats from "./Chats.jsx";
import MessageView from "./MessageView.jsx";
import ProfileSidebar from "./ProfileSidebar.jsx";
import StarredSidebar from "./StarredSidebar.jsx";
import SharedSidebar from "./SharedSidebar.jsx";

const GeneralApp = () => {
  const sidebar = useSelector((state) => state.app.sidebar);
  return (
    <div className="flex h-screen w-full">
      {/* Chats */}
      <Chats />

      {/* Chat Messages */}
      <MessageView />

      {/* Chat Profile */}
      {sidebar.isOpen && sidebar.type === "PROFILE" && <ProfileSidebar />}
      {sidebar.isOpen && sidebar.type === "STARRED" && <StarredSidebar />}
      {sidebar.isOpen && sidebar.type === "SHARED" && <SharedSidebar />}
    </div>
  );
};
export default GeneralApp;
