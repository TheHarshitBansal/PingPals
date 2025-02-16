import React from "react";
import { CircleDashedIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import Badge from "@mui/material/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { styled } from "@mui/material";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import users from "@/data/users.js";
import { useDispatch } from "react-redux";
import { openChat } from "@/redux/slices/appSlice.js";

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

// INFO: Individual Chat Element

export const ChatElement = ({
  id,
  name,
  message,
  avatar,
  time,
  badge,
  online,
}) => {
  const dispatch = useDispatch();
  return (
    <div
      className="w-full h-20 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between px-3 py-2 border-y border-gray-100 dark:border-gray-900 cursor-pointer"
      onClick={() => {
        dispatch(openChat(id));
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-x-2">
          {online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar className="cursor-pointer">
                <AvatarImage src={avatar} loading="lazy" />
                <AvatarFallback>
                  <Skeleton className="h-16 w-16 rounded-full" />
                </AvatarFallback>
              </Avatar>
            </StyledBadge>
          ) : (
            <Avatar className="cursor-pointer">
              <AvatarImage src={avatar} loading="lazy" />
              <AvatarFallback>
                <Skeleton className="h-16 w-16 rounded-full" />
              </AvatarFallback>
            </Avatar>
          )}

          <div>
            <h3 className="font-semibold line-clamp-1">{name}</h3>
            <p className="text-sm line-clamp-1">{message}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4 items-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
          <Badge
            badgeContent={badge}
            color="primary"
            sx={{ width: "8px", height: "8px" }}
          />
        </div>
      </div>
    </div>
  );
};

// INFO: Chats Component

const Chats = () => {
  return (
    <div className="relative h-screen min-w-80 max-w-80 shadow-light dark:shadow-dark flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold">Chats</h1>
        <CircleDashedIcon size={32} />
      </div>

      {/* Search Box */}
      <div className="px-5 flex-shrink-0">
        <Input placeholder="Search" className="mb-2" />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-5 no-scrollbar">
        {users.map((user, index) => (
          <ChatElement
            id={user.id}
            key={index}
            name={user.name}
            message={user.message}
            avatar={user.avatar}
            time={user.time}
            badge={user.badge}
            online={user.online}
          />
        ))}
      </div>
    </div>
  );
};
export default Chats;
