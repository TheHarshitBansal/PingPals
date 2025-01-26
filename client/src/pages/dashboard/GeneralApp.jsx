import Chats from "./Chats.jsx";
import MessageView from "./MessageView.jsx";

const GeneralApp = () => {
  return (
    <div className="flex h-screen w-full">
      {/* Chats */}
      <Chats />

      {/* Chat Messages */}
      <MessageView />
    </div>
  );
};
export default GeneralApp;
