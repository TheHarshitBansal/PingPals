import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { socket } from "@/socket.js";
import { fetchDirectConversations } from "@/redux/slices/conversationSlice.js";
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
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) {
      socket.emit(
        "get_direct_chats",
        { user_id: user._id },
        (conversations) => {
          dispatch(fetchDirectConversations(conversations));
        }
      );

      return () => {
        socket.off("get_direct_chats");
      };
    }
  }, [user?._id, dispatch]);

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
