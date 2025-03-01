import { useEffect, useState, useCallback } from "react";
import {
  CaretDown,
  Gif,
  PaperPlaneTilt,
  Phone,
  VideoCamera,
} from "@phosphor-icons/react";
import { Divider } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "@/redux/slices/appSlice.js";
import DateSeparator from "@/components/messages/DateSeparator.jsx";
import Text from "@/components/messages/Text.jsx";
import Media from "@/components/messages/Media.jsx";
import EmojiPicker from "@/components/EmojiPicker.jsx";
import Attachments from "@/components/Attachments.jsx";
import Giphy from "@/components/Giphy.jsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { socket } from "@/socket.js";
import { fetchMessages } from "@/redux/slices/conversationSlice.js";
import ChatOptions from "@/components/messages/ChatOptions.jsx";

const MessageView = () => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [isGifOpen, setIsGifOpen] = useState(false);
  const profileSidebar = useSelector((state) => state?.app?.sidebar?.isOpen);
  const chat = useSelector((state) => state?.conversation?.currentConversation);
  const user = useSelector((state) => state?.auth?.user);
  const messages = useSelector((state) => state?.conversation?.currentMessages);

  const users =
    chat?.participants?.filter((person) => person?._id !== user?._id) || [];

  const handleMessageSend = useCallback(
    async (e) => {
      e.preventDefault();
      if (message.trim() === "") return; // Prevent sending empty messages
      await socket?.emit("message", { conversation_id: chat._id });
      await socket?.emit("text_message", {
        conversation_id: chat._id,
        content: message,
        receiver_id: users[0]?._id,
      });
      setMessage(""); // Clear input after sending
    },
    [message]
  );

  useEffect(() => {
    const handleDatabaseChange = () => {
      socket?.emit("get_messages", {
        conversation_id: chat?._id,
      });
    };

    const handleDispatchMessages = async (data) => {
      dispatch(fetchMessages(data));
    };

    handleDatabaseChange();

    socket?.on("database-changed", handleDatabaseChange);
    socket?.on("dispatch_messages", handleDispatchMessages);

    return () => {
      socket?.off("database-changed", handleDatabaseChange);
      socket?.off("dispatch_messages", handleDispatchMessages);
    };
  }, [chat, dispatch, users, handleMessageSend]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Prevents newline from being added
        handleMessageSend(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleMessageSend]);

  const handleEmojiSelect = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji);
  };

  return (
    <div
      className={`flex flex-col h-full border-x border-gray-100 dark:border-gray-900 shadow-light dark:shadow-dark ${
        !profileSidebar ? "w-4/5" : "w-3/5"
      } transition-width ease-linear duration-300`}
    >
      {/* Chat Header */}
      <div className="flex sticky items-center justify-between border-b px-6 py-4">
        <div
          onClick={() => dispatch(toggleSidebar())}
          className="flex items-center cursor-pointer"
        >
          <div className="mr-4 h-10 w-full max-w-10 rounded-full overflow-hidden">
            <Avatar>
              <AvatarImage src={users[0]?.avatar || ""} />
              <AvatarFallback>
                <Skeleton className="h-16 w-16 rounded-full" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="w-full">
            <h5 className="font-medium text-black dark:text-white">
              {users[0]?.name || "Unknown User"}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {users[0]?.status}
            </p>
          </div>
        </div>

        <div className="cursor-pointer flex items-center space-x-6 h-full">
          <button>
            <VideoCamera size={24} color="gray" />
          </button>
          <button>
            <Phone size={24} color="gray" />
          </button>
          <Divider
            orientation="vertical"
            flexItem
            className="bg-gray-100 dark:bg-gray-700"
          />
          <button onClick={() => setIsAudioCall(true)}>
            <ChatOptions chatId={chat?._id}>
              <CaretDown size={24} color="gray" />
            </ChatOptions>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-h-full space-y-3 overflow-auto no-scrollbar px-6 py-7 grow bg-gray-50 dark:bg-gray-900 shadow-inner">
        {messages?.map((message, index) => {
          switch (message.type) {
            case "Separator":
              return <DateSeparator key={index} date={message?.createdAt} />;
            case "Text":
              return (
                <Text
                  key={index}
                  incoming={message?.sender === users[0]?._id}
                  timestamp={message?.createdAt}
                  content={message?.content}
                  messageId={message?._id}
                />
              );
            case "Media":
              return (
                <Media
                  key={index}
                  incoming={message?.sender === users[0]?._id}
                  timestamp={message?.createdAt}
                  file={message?.file}
                  messageId={message?._id}
                />
              );
            default:
              return null;
          }
        })}
      </div>
      {/* Chat Input */}
      <div className="sticky bottom-0 p-3 ">
        <form
          className="flex items-center justify-between space-x-4"
          onSubmit={handleMessageSend}
        >
          <div className="relative w-full">
            <textarea
              placeholder={
                user.friends.includes(users[0]?._id)
                  ? "Message"
                  : "You are not friends with this user"
              }
              className="h-12 resize-none w-full rounded border border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900 shadow-inner text-sm outline-none focus:border-blue-950 dark:focus:border-blue-200 text-black dark:text-white pl-5 pr-19 flex"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!user.friends.includes(users[0]?._id)}
              rows={1}
            />

            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-end space-x-4">
              <Attachments />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsGifOpen(!isGifOpen);
                }}
              >
                <Gif size={24} color="gray" weight="bold" />
              </button>
              <EmojiPicker selectEmoji={handleEmojiSelect} />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center h-12 max-w-12 w-full rounded-md bg-blue-500 text-white hover:bg-opacity-80"
            disabled={message.trim() === ""}
          >
            <PaperPlaneTilt size={24} color="white" weight="bold" />
          </button>
        </form>
        {isGifOpen && <Giphy />}
      </div>
    </div>
  );
};

export default MessageView;
