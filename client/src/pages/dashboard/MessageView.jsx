// MessageView.js
import { useEffect, useState, useCallback } from "react";
import {
  CaretDown,
  Gif,
  PaperPlaneTilt,
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
import {
  fetchMessages,
  setCurrentConversation,
} from "@/redux/slices/conversationSlice.js";
import {
  setIncomingCallData,
  clearIncomingCallData,
} from "@/redux/slices/appSlice.js"; // Import from appSlice
import ChatOptions from "@/components/messages/ChatOptions.jsx";
import VideoCall from "@/components/VideoCall.jsx";
import authApi from "@/redux/api/authApi.js";
import { toast } from "@/hooks/use-toast.js";

const MessageView = () => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [isGifOpen, setIsGifOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0); // Add force refresh state
  const profileSidebar = useSelector((state) => state?.app?.sidebar?.isOpen);
  const chat = useSelector((state) => state?.conversation?.currentConversation);
  const user = useSelector((state) => state?.auth?.user);
  const messages = useSelector((state) => state?.conversation?.currentMessages);
  const incomingCallData = useSelector((state) => state.app.incomingCallData); // Get from appSlice

  const users =
    chat?.participants?.filter((person) => person?._id !== user?._id) || [];
  const receiverId = users[0]?._id;
  const receiverName = users[0]?.name || "Unknown User";

  // Sort messages by creation order to maintain proper sequence
  const sortedMessages = messages
    ? [...messages].sort((a, b) => {
        // If both are separators, sort by date
        if (a.type === "Separator" && b.type === "Separator") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }

        // If one is a separator, use the actual createdAt timestamp for comparison
        if (a.type === "Separator") {
          const separatorDate = new Date(a.createdAt);
          const messageDate = b._id
            ? new Date(b._id.toString().substring(0, 8), 16) * 1000
            : new Date();
          return separatorDate - messageDate;
        }

        if (b.type === "Separator") {
          const messageDate = a._id
            ? new Date(a._id.toString().substring(0, 8), 16) * 1000
            : new Date();
          const separatorDate = new Date(b.createdAt);
          return messageDate - separatorDate;
        }

        // For regular messages, sort by MongoDB ObjectId timestamp (most reliable)
        if (a._id && b._id) {
          const aTime = new Date(
            parseInt(a._id.toString().substring(0, 8), 16) * 1000
          );
          const bTime = new Date(
            parseInt(b._id.toString().substring(0, 8), 16) * 1000
          );
          return aTime - bTime;
        }

        // Fallback to time string comparison if no _id
        const aTime = a.createdAt?.split(":") || ["0", "0"];
        const bTime = b.createdAt?.split(":") || ["0", "0"];
        const aMinutes = parseInt(aTime[0]) * 60 + parseInt(aTime[1]);
        const bMinutes = parseInt(bTime[0]) * 60 + parseInt(bTime[1]);

        return aMinutes - bMinutes;
      })
    : [];

  const handleMessageSend = useCallback(
    async (e) => {
      e.preventDefault();
      if (message.trim() === "") return;
      await socket?.emit("message", { conversation_id: chat._id });
      await socket?.emit("text_message", {
        conversation_id: chat._id,
        content: message,
        receiver_id: receiverId,
      });
      setMessage("");
    },
    [message, chat, receiverId]
  );

  useEffect(() => {
    if (socket) {
      // Handle database updates by invalidating cache
      const handleDatabaseUpdate = () => {
        // Invalidate cache to ensure fresh data including user status
        dispatch(
          authApi.util.invalidateTags(["User", "People", "Friends", "Requests"])
        );
        // Force component re-render for immediate UI update
        setForceRefresh((prev) => prev + 1);
        // Also refetch messages for immediate update
        if (chat?._id) {
          socket?.emit("get_messages", { conversation_id: chat._id });
        }
      };

      // Handle real-time message updates
      const handleDatabaseChange = () => {
        if (chat?._id) {
          socket?.emit("get_messages", { conversation_id: chat._id });
        }
      };

      // Handle socket errors
      const handleSocketError = (data) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "An error occurred",
        });
        // Invalidate cache to ensure data consistency
        dispatch(
          authApi.util.invalidateTags(["User", "People", "Friends", "Requests"])
        );
      };

      const handleDispatchMessages = async (data) => {
        dispatch(fetchMessages(data));
      };

      // Initial message fetch
      if (chat?._id) {
        handleDatabaseChange();
      }

      // Listen to all relevant events - database-updated should handle status changes
      socket.on("database-changed", handleDatabaseChange);
      socket.on("database-updated", handleDatabaseUpdate);
      socket.on("dispatch_messages", handleDispatchMessages);
      socket.on("error", handleSocketError);

      // Cleanup function
      return () => {
        socket.off("database-changed", handleDatabaseChange);
        socket.off("database-updated", handleDatabaseUpdate);
        socket.off("dispatch_messages", handleDispatchMessages);
        socket.off("error", handleSocketError);
      };
    }
  }, [chat?._id, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleMessageSend(e);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMessageSend]);

  useEffect(() => {
    if (incomingCallData) {
      setIsCallActive(true);
    }
  }, [incomingCallData]);

  // Close video call when chat is deleted or set to null
  useEffect(() => {
    if (!chat && isCallActive) {
      setIsCallActive(false);
      dispatch(clearIncomingCallData());
    }
  }, [chat, isCallActive, dispatch]);

  const handleEmojiSelect = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji);
  };

  const handleCallClose = () => {
    setIsCallActive(false);
    dispatch(clearIncomingCallData()); // Use appSlice action
  };

  return (
    <div
      className={`flex flex-col h-full border-x border-gray-100 dark:border-gray-900 shadow-light dark:shadow-dark ${
        !profileSidebar ? "w-full xl:w-4/5" : "w-full xl:w-3/5"
      } transition-all ease-linear duration-300`}
      key={forceRefresh}
    >
      {/* Show loading if chat data is incomplete */}
      {!chat || !users.length ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Loading conversation...
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => dispatch(setCurrentConversation(null))}
            >
              Go Back
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Header */}
          <div className="flex sticky items-center justify-between border-b px-3 md:px-4 lg:px-6 py-3 md:py-4">
            {/* Back button for mobile */}
            <button
              onClick={() => dispatch(setCurrentConversation(null))}
              className="md:hidden mr-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div
              onClick={() => dispatch(toggleSidebar())}
              className="flex items-center cursor-pointer flex-1 min-w-0"
            >
              <div className="mr-3 md:mr-4 h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full overflow-hidden flex-shrink-0">
                <Avatar className="h-full w-full">
                  <AvatarImage src={users[0]?.avatar || ""} />
                  <AvatarFallback>
                    <Skeleton className="h-full w-full rounded-full" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="font-medium text-black dark:text-white text-sm md:text-base lg:text-lg truncate">
                  {users[0]?.name || "Unknown User"}
                </h5>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {users[0]?.status}
                </p>
              </div>
            </div>
            <div className="cursor-pointer flex items-center space-x-2 md:space-x-3 lg:space-x-6 h-full flex-shrink-0">
              <button
                onClick={() => setIsCallActive(true)}
                className="p-1 md:p-2"
              >
                <VideoCamera size={18} className="md:hidden" color="gray" />
                <VideoCamera
                  size={20}
                  className="hidden md:block lg:hidden"
                  color="gray"
                />
                <VideoCamera
                  size={24}
                  className="hidden lg:block"
                  color="gray"
                />
              </button>
              <Divider
                orientation="vertical"
                flexItem
                className="bg-gray-100 dark:bg-gray-700 hidden md:block"
              />
              <ChatOptions chatId={chat?._id}>
                <CaretDown size={18} className="md:hidden" color="gray" />
                <CaretDown
                  size={20}
                  className="hidden md:block lg:hidden"
                  color="gray"
                />
                <CaretDown size={24} className="hidden lg:block" color="gray" />
              </ChatOptions>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="max-h-full space-y-2 md:space-y-3 lg:space-y-4 overflow-auto no-scrollbar px-3 md:px-4 lg:px-6 py-4 md:py-6 lg:py-8 grow bg-gray-50 dark:bg-gray-900 shadow-inner">
            {sortedMessages?.map((message, index) => {
              switch (message.type) {
                case "Separator":
                  return (
                    <DateSeparator
                      key={`separator-${index}-${message.createdAt}`}
                      date={message?.createdAt}
                    />
                  );
                case "Text":
                  return (
                    <Text
                      key={`text-${index}-${
                        message?._id || message?.createdAt
                      }`}
                      incoming={message?.sender === users[0]?._id}
                      timestamp={message?.createdAt}
                      content={message?.content}
                      messageId={message?._id}
                    />
                  );
                case "Media":
                  return (
                    <Media
                      key={`media-${index}-${
                        message?._id || message?.createdAt
                      }`}
                      incoming={message?.sender === users[0]?._id}
                      timestamp={message?.createdAt}
                      file={message?.file}
                      messageId={message?._id}
                    />
                  );
                default:
                  return (
                    <Text
                      key={`default-${index}-${
                        message?._id || message?.createdAt
                      }`}
                      incoming={message?.sender === users[0]?._id}
                      timestamp={message?.createdAt}
                      content={message?.content || ""}
                      messageId={message?._id}
                    />
                  );
              }
            })}
          </div>

          {/* Chat Input */}
          <div className="sticky bottom-0 p-2 md:p-3 lg:p-4">
            <form
              className="flex items-center justify-between space-x-2 md:space-x-3 lg:space-x-4"
              onSubmit={handleMessageSend}
            >
              <div className="relative w-full">
                <textarea
                  placeholder={
                    user.friends.includes(users[0]?._id)
                      ? "Message"
                      : "You are not friends with this user"
                  }
                  className="h-10 md:h-12 lg:h-14 resize-none w-full rounded border border-gray-300 dark:border-gray-700 p-2 md:p-3 bg-gray-50 dark:bg-gray-900 shadow-inner text-sm md:text-base outline-none focus:border-blue-950 dark:focus:border-blue-200 text-black dark:text-white pl-3 md:pl-4 lg:pl-5 pr-16 md:pr-18 lg:pr-20 flex"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={!user.friends.includes(users[0]?._id)}
                  rows={1}
                />
                <div className="absolute right-2 md:right-3 lg:right-5 top-1/2 -translate-y-1/2 flex items-center justify-end space-x-1 md:space-x-2 lg:space-x-3">
                  <Attachments />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsGifOpen(!isGifOpen);
                    }}
                    className="p-1"
                  >
                    <Gif
                      size={18}
                      className="md:hidden"
                      color="gray"
                      weight="bold"
                    />
                    <Gif
                      size={20}
                      className="hidden md:block lg:hidden"
                      color="gray"
                      weight="bold"
                    />
                    <Gif
                      size={24}
                      className="hidden lg:block"
                      color="gray"
                      weight="bold"
                    />
                  </button>
                  <EmojiPicker selectEmoji={handleEmojiSelect} />
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-md bg-blue-500 text-white hover:bg-opacity-80 flex-shrink-0"
                disabled={message.trim() === ""}
              >
                <PaperPlaneTilt
                  size={18}
                  className="md:hidden"
                  color="white"
                  weight="bold"
                />
                <PaperPlaneTilt
                  size={20}
                  className="hidden md:block lg:hidden"
                  color="white"
                  weight="bold"
                />
                <PaperPlaneTilt
                  size={24}
                  className="hidden lg:block"
                  color="white"
                  weight="bold"
                />
              </button>
            </form>
            {isGifOpen && <Giphy />}
          </div>

          {/* Video Call */}
          <VideoCall
            isOpen={isCallActive}
            handleClose={handleCallClose}
            conversationId={chat?._id}
            userId={user?._id}
            receiverId={receiverId}
            receiverName={receiverName}
            incomingCallData={incomingCallData}
            users={users}
          />
        </>
      )}
    </div>
  );
};

export default MessageView;
