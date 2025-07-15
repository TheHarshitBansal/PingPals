import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import Badge from "@mui/material/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { styled } from "@mui/material";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentConversation } from "@/redux/slices/conversationSlice.js";

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
      className={`w-full h-20 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between px-3 py-2 border-y border-gray-100 dark:border-gray-900 cursor-pointer ${
        currentCoversation?._id === currentConvo?._id
          ? "bg-gray-200 dark:bg-gray-800"
          : ""
      }`}
      onClick={() => {
        dispatch(setCurrentConversation(currentConvo));
      }}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-x-2">
          {online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar className="cursor-pointer h-14 w-14">
                <AvatarImage src={avatar} loading="lazy" />
                <AvatarFallback>
                  <Skeleton className="h-16 w-16 rounded-full" />
                </AvatarFallback>
              </Avatar>
            </StyledBadge>
          ) : (
            <StyledRedBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar className="cursor-pointer h-14 w-14">
                <AvatarImage src={avatar} loading="lazy" />
                <AvatarFallback>
                  <Skeleton className="h-16 w-16 rounded-full" />
                </AvatarFallback>
              </Avatar>
            </StyledRedBadge>
          )}

          <div>
            <h3 className="font-semibold line-clamp-1">{name}</h3>
            <p className="text-sm line-clamp-1 text-gray-500 dark:text-gray-400">
              {message || "No messages yet"}
            </p>
          </div>
        </div>
        <div className="flex">
          <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
        </div>
      </div>
    </div>
  );
};

const Chats = () => {
  const [search, setSearch] = useState("");

  const chats = useSelector((state) => state.conversation.directConversations);
  const user = useSelector((state) => state.auth.user);

  const [showChats, setShowChats] = useState(chats);

  useEffect(() => {
    if (!search) {
      setShowChats(chats);
    }
    if (search) {
      const filteredChats = chats.filter((chat) => {
        const participant = chat.participants.find(
          (person) => person._id !== user._id
        );
        return participant.name.toLowerCase().includes(search.toLowerCase());
      });
      setShowChats(filteredChats);
    }
  }, [search]);

  const conversations = showChats.map((chat) => {
    const participant = chat.participants.find(
      (person) => person._id !== user._id
    );

    const lastMessage =
      chat.messages?.length > 0
        ? chat.messages[chat.messages.length - 1].type === "Media"
          ? "Media"
          : chat.messages[chat.messages.length - 1].content
        : "No messages yet";

    const lastMessageTime =
      chat.messages?.length > 0
        ? chat.messages[chat.messages.length - 1].createdAt
        : "";

    return {
      id: participant._id,
      name: participant.name,
      avatar: participant.avatar,
      online: participant.status === "Online",
      message: lastMessage,
      time: lastMessageTime,
    };
  });

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className="relative h-screen min-w-80 max-w-80 shadow-light dark:shadow-dark flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold">Chats</h1>
      </div>

      {/* Search Box */}
      <div className="px-5 flex-shrink-0">
        <Input placeholder="Search" className="mb-2" onChange={handleChange} />
      </div>

      {/* Chat List */}
      {conversations.length === 0 && (
        <div className="relative h-screen min-w-80 max-w-80 flex items-center justify-center">
          <h1 className="text-2xl font-bold">No Chats</h1>
        </div>
      )}
      {conversations.length > 0 && (
        <div className="flex-1 overflow-y-auto px-5 no-scrollbar">
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
