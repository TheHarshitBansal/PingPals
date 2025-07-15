import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import Badge from "@mui/material/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { styled } from "@mui/material";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentConversation } from "@/redux/slices/conversationSlice.js";
import { socket } from "@/socket.js";
import authApi from "@/redux/api/authApi.js";
import { toast } from "@/hooks/use-toast.js";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 5s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const StyledRedBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#f44336",
    color: "#f44336",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple-red 5s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple-red": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

export const ChatElement = ({ id, name, avatar, online, message, time }) => {
  const user = useSelector((state) => state.auth.user);
  const chats = useSelector((state) => state.conversation.directConversations);
  const currentCoversation = useSelector(
    (state) => state.conversation.currentConversation
  );
  const currentConvo = chats.find(
    (chat) =>
      chat?.participants?.find((person) => person._id !== user._id)?._id === id
  );

  const dispatch = useDispatch();
  return (
    <div
      className={`w-full h-16 sm:h-20 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between px-2 sm:px-3 py-2 border-y border-gray-100 dark:border-gray-900 cursor-pointer ${
        currentCoversation?._id === currentConvo?._id
          ? "bg-gray-200 dark:bg-gray-800"
          : ""
      }`}
      onClick={() => {
        dispatch(setCurrentConversation(currentConvo));
      }}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-x-2 min-w-0 flex-1">
          {online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar className="cursor-pointer h-10 w-10 sm:h-14 sm:w-14 flex-shrink-0">
                <AvatarImage src={avatar} loading="lazy" />
                <AvatarFallback>
                  <Skeleton className="h-full w-full rounded-full" />
                </AvatarFallback>
              </Avatar>
            </StyledBadge>
          ) : (
            <StyledRedBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar className="cursor-pointer h-10 w-10 sm:h-14 sm:w-14 flex-shrink-0">
                <AvatarImage src={avatar} loading="lazy" />
                <AvatarFallback>
                  <Skeleton className="h-full w-full rounded-full" />
                </AvatarFallback>
              </Avatar>
            </StyledRedBadge>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold line-clamp-1 text-sm sm:text-base">
              {name}
            </h3>
            <p className="text-xs sm:text-sm line-clamp-1 text-gray-500 dark:text-gray-400">
              {message || "No messages yet"}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 ml-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
        </div>
      </div>
    </div>
  );
};

const Chats = () => {
  const [search, setSearch] = useState("");
  const [forceRefresh, setForceRefresh] = useState(0); // Add force refresh state
  const dispatch = useDispatch();

  const chats = useSelector((state) => state.conversation.directConversations);
  const user = useSelector((state) => state.auth.user);

  const [showChats, setShowChats] = useState(chats);

  // Add socket event listeners for real-time updates
  useEffect(() => {
    if (socket) {
      // Handle database updates by invalidating cache
      const handleDatabaseUpdate = () => {
        // Invalidate all cache tags to ensure fresh data including user status
        dispatch(
          authApi.util.invalidateTags(["User", "People", "Friends", "Requests"])
        );
        // Force component re-render for immediate UI update
        setForceRefresh((prev) => prev + 1);
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

      // Handle real-time message updates - force immediate cache invalidation
      const handleMessageUpdate = () => {
        // Force re-render of chat conversations with immediate invalidation
        dispatch(
          authApi.util.invalidateTags(["User", "People", "Friends", "Requests"])
        );
        setForceRefresh((prev) => prev + 1);
      };

      // Handle new messages specifically
      const handleNewMessage = () => {
        // Immediately invalidate cache when new messages arrive
        dispatch(
          authApi.util.invalidateTags(["User", "People", "Friends", "Requests"])
        );
        setForceRefresh((prev) => prev + 1);
      };

      // Listen to database update events - this should handle all status changes
      socket.on("database-updated", handleDatabaseUpdate);
      socket.on("database-changed", handleMessageUpdate);
      socket.on("error", handleSocketError);

      // Listen to specific message events for immediate updates
      socket.on("direct_chats", handleMessageUpdate);
      socket.on("dispatch_messages", handleNewMessage);
      socket.on("text_message", handleNewMessage);
      socket.on("message", handleNewMessage);

      // Cleanup function
      return () => {
        socket.off("database-updated", handleDatabaseUpdate);
        socket.off("database-changed", handleMessageUpdate);
        socket.off("error", handleSocketError);
        socket.off("direct_chats", handleMessageUpdate);
        socket.off("dispatch_messages", handleNewMessage);
        socket.off("text_message", handleNewMessage);
        socket.off("message", handleNewMessage);
      };
    }
  }, [dispatch]);

  useEffect(() => {
    setShowChats(chats);
  }, [chats]);

  useEffect(() => {
    if (!search) {
      setShowChats(chats);
    }
    if (search) {
      const filteredChats = chats.filter((chat) => {
        const participant = chat.participants.find(
          (person) => person._id !== user._id
        );
        return participant?.name?.toLowerCase().includes(search.toLowerCase());
      });
      setShowChats(filteredChats);
    }
  }, [search, chats]);

  const conversations = showChats
    .map((chat) => {
      const participant = chat.participants.find(
        (person) => person._id !== user._id
      );

      // Handle cases where participant might be undefined
      if (!participant) {
        return null;
      }

      // Sort messages by creation time to get the actual latest message
      const sortedMessages = chat.messages
        ? [...chat.messages].sort((a, b) => {
            // Skip separators when finding latest message
            if (a.type === "Separator" && b.type !== "Separator") return -1;
            if (b.type === "Separator" && a.type !== "Separator") return 1;
            if (a.type === "Separator" && b.type === "Separator") return 0;

            // Sort by MongoDB ObjectId timestamp for most accurate ordering
            if (a._id && b._id) {
              const aTime = new Date(
                parseInt(a._id.toString().substring(0, 8), 16) * 1000
              );
              const bTime = new Date(
                parseInt(b._id.toString().substring(0, 8), 16) * 1000
              );
              return bTime - aTime; // Descending order (latest first)
            }

            // Fallback to time string comparison
            const aTime = a.createdAt?.split(":") || ["0", "0"];
            const bTime = b.createdAt?.split(":") || ["0", "0"];
            const aMinutes = parseInt(aTime[0]) * 60 + parseInt(aTime[1]);
            const bMinutes = parseInt(bTime[0]) * 60 + parseInt(bTime[1]);

            return bMinutes - aMinutes; // Descending order (latest first)
          })
        : [];

      // Get the latest non-separator message
      const latestMessage = sortedMessages.find(
        (msg) => msg.type !== "Separator"
      );

      const lastMessage = latestMessage
        ? latestMessage.type === "Media"
          ? "📎 Media"
          : latestMessage.content || "No messages yet"
        : "No messages yet";

      const lastMessageTime = latestMessage?.createdAt || "";

      return {
        id: participant._id,
        name: participant.name,
        avatar: participant.avatar,
        online: participant.status === "Online",
        message: lastMessage,
        time: lastMessageTime,
      };
    })
    .filter(Boolean); // Remove null entries

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div
      className="relative h-screen w-full sm:min-w-80 sm:max-w-80 lg:min-w-80 lg:max-w-80 shadow-light dark:shadow-dark flex flex-col"
      key={forceRefresh}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold">Chats</h1>
      </div>

      {/* Search Box */}
      <div className="px-3 sm:px-5 flex-shrink-0">
        <Input
          placeholder="Search"
          className="mb-2 text-sm sm:text-base"
          onChange={handleChange}
        />
      </div>

      {/* Chat List */}
      {conversations.length === 0 && (
        <div className="relative h-screen w-full flex items-center justify-center px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-center">
            No Chats
          </h1>
        </div>
      )}
      {conversations.length > 0 && (
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 no-scrollbar">
          {conversations.map((user, index) => (
            <ChatElement
              id={user.id}
              key={index}
              name={user.name}
              message={user.message}
              avatar={user.avatar}
              time={user.time}
              online={user.online}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Chats;
