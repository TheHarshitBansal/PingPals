import { useSelector } from "react-redux";
import GroupChat from "./GroupChat.jsx";
import HomePage from "../HomePage.jsx";
import MessageView from "../dashboard/MessageView.jsx";

const GroupGeneralApp = () => {
  const app = useSelector((state) => state.app);
  return (
    <div className="flex h-screen w-full">
      <GroupChat />
      {app.chat_id === null ? <HomePage /> : <MessageView />}
    </div>
  );
};
export default GroupGeneralApp;
