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

  const currentConvo = chats?.find((chat) => {
    const otherParticipant = chat?.participants?.find(
      (person) => person._id !== user._id
    );
    const matches = otherParticipant?._id === id;
    console.log(
      `ChatElement: Checking chat ${chat?._id}, otherParticipant: ${otherParticipant?._id}, matches: ${matches}`
    );
    return matches;
  });

  const dispatch = useDispatch();
  return (
    <div
      className={`w-full h-16 md:h-18 lg:h-20 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between px-2 md:px-3 lg:px-4 py-2 border-y border-gray-100 dark:border-gray-900 cursor-pointer ${
        currentCoversation?._id === currentConvo?._id
          ? "bg-gray-200 dark:bg-gray-800"
          : ""
      }`}
      onClick={() => {
        if (currentConvo) {
          dispatch(setCurrentConversation(currentConvo));
        }
      }}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-x-2 md:gap-x-3 min-w-0 flex-1">
          {online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar className="cursor-pointer h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 flex-shrink-0">
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
              <Avatar className="cursor-pointer h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 flex-shrink-0">
                <AvatarImage src={avatar} loading="lazy" />
                <AvatarFallback>
                  <Skeleton className="h-full w-full rounded-full" />
                </AvatarFallback>
              </Avatar>
            </StyledRedBadge>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold line-clamp-1 text-sm md:text-base lg:text-lg">
              {name || "Unknown User"}
            </h3>
            <p className="text-xs md:text-sm line-clamp-1 text-gray-500 dark:text-gray-400">
              {message || "No messages yet"}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 ml-2">
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            {time}
          </p>
        </div>
      </div>
    </div>
  );
};

const Chats = () => {
  const [search, setSearch] = useState("");
  const [forceRefresh, setForceRefresh] = useState(0);
  const dispatch = useDispatch();

  const chats = useSelector((state) => state.conversation.directConversations);
  const user = useSelector((state) => state.auth.user);

  const [showChats, setShowChats] = useState(chats);

  useEffect(() => {
    if (socket) {
      const handleDatabaseUpdate = () => {
        dispatch(
          authApi.util.invalidateTags(["User", "People", "Friends", "Requests"])
        );
        setForceRefresh((prev) => prev + 1);
      };

      const handleSocketError = (data) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "An error occurred",
        });
        dispatch(
          authApi.util.invalidateTags(["User", "People", "Friends", "Requests"])
        );
      };

      const handleMessageUpdate = () => {
        dispatch(
          authApi.util.invalidateTags(["User", "People", "Friends", "Requests"])
        );
        setForceRefresh((prev) => prev + 1);
      };

      const handleNewMessage = () => {
        dispatch(
          authApi.util.invalidateTags(["User", "People", "Friends", "Requests"])
        );
        setForceRefresh((prev) => prev + 1);
      };

      socket.on("database-updated", handleDatabaseUpdate);
      socket.on("database-changed", handleMessageUpdate);
      socket.on("error", handleSocketError);

      socket.on("direct_chats", handleMessageUpdate);
      socket.on("dispatch_messages", handleNewMessage);
      socket.on("text_message", handleNewMessage);
      socket.on("message", handleNewMessage);

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
    console.log(
      "Chats: Updated showChats with:",
      chats?.length || 0,
      "conversations"
    );
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

  const conversations = (showChats || [])
    .map((chat) => {
      // Ensure chat object exists and has required properties
      if (!chat || !chat.participants || !Array.isArray(chat.participants)) {
        console.warn("Chats: Invalid chat object:", chat);
        return null;
      }

      const participant = chat.participants.find(
        (person) => person && person._id && person._id !== user._id
      );

      // Handle cases where participant might be undefined
      if (!participant || !participant._id) {
        console.warn("Chats: Found chat with no valid participant:", chat);
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

      const conversationItem = {
        id: participant._id,
        name: participant.name || "Unknown User",
        avatar: participant.avatar || "",
        online: participant.status === "Online",
        message: lastMessage,
        time: lastMessageTime,
      };

      // Validate the conversation item before returning
      if (!conversationItem.id) {
        console.warn("Chats: Conversation item missing ID:", conversationItem);
        return null;
      }

      console.log("Chats: Processed conversation item:", conversationItem);
      return conversationItem;
    })
    .filter(Boolean); // Remove null entries

  console.log("Chats: Total conversations processed:", conversations.length);

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div
      className="relative h-screen w-full md:min-w-80 md:max-w-80 lg:min-w-96 lg:max-w-96 shadow-light dark:shadow-dark flex flex-col"
      key={forceRefresh}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-4 md:py-5 flex-shrink-0">
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold">Chats</h1>
      </div>

      {/* Search Box */}
      <div className="px-3 md:px-5 lg:px-6 flex-shrink-0">
        <Input
          placeholder="Search"
          className="mb-2 text-sm md:text-base"
          onChange={handleChange}
        />
      </div>

      {/* Chat List */}
      {conversations.length === 0 && (
        <div className="relative h-screen w-full flex items-center justify-center px-4">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-center">
            No Chats
          </h1>
        </div>
      )}
      {conversations.length > 0 && (
        <div className="flex-1 overflow-y-auto px-3 md:px-5 lg:px-6 no-scrollbar">
          {conversations.map((user) => (
            <ChatElement
              id={user.id}
              key={user.id}
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
