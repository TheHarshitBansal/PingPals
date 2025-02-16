import { useSelector } from "react-redux";
import GroupChat from "./GroupChat.jsx";
import HomePage from "../HomePage.jsx";
import MessageView from "../dashboard/MessageView.jsx";

const GroupGeneralApp = () => {
  const conversation = useSelector((state) => state.conversation);
  return (
    <div className="flex h-screen w-full">
      <GroupChat />
      {conversation.currentConversation === null ? (
        <HomePage />
      ) : (
        <MessageView />
      )}
    </div>
  );
};
export default GroupGeneralApp;
