// Dashboard.jsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import {
  CogIcon,
  MessageSquareMoreIcon,
  PhoneIcon,
  Users,
  Search,
} from "lucide-react";
import { Divider } from "@mui/material";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DarkModeSwitcher from "@/components/DarkModeSwitcher.jsx";
import { useEffect, useState } from "react";
import ProfileOptions from "@/components/profile/ProfileOptions.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, socket } from "@/socket.js";
import { toast } from "@/hooks/use-toast.js";
import { useGetUserQuery } from "@/redux/api/authApi.js";
import { updateUser } from "@/redux/slices/authSlice.js"; // Import action
import { setCurrentConversation } from "@/redux/slices/conversationSlice.js";
import { setIncomingCallData } from "@/redux/slices/appSlice.js";

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

const Dashboard = () => {
  const { data, refetch, isLoading, isFetching, isSuccess, isError } =
    useGetUserQuery(undefined);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const currentConversation = useSelector(
    (state) => state?.conversation?.currentConversation
  );
  const [active, setActive] = useState(null);
  const [forceRender, setForceRender] = useState(0); // Force re-render state
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      connectSocket(user._id);

      if (socket) {
        socket.on("new_friend_request", (data) => {
          toast({ variant: "success", title: data.message });
        });

        socket.on("friend_request_sent", (data) => {
          toast({ variant: "success", title: data.message });
        });

        socket.on("request_accepted", (data) => {
          toast({ variant: "success", title: data.message });
        });

        socket.on("request-unsend", (data) => {
          toast({ variant: "success", title: data.message });
        });

        socket.on("request_rejected", (data) => {
          toast({ variant: "success", title: data.message });
        });

        socket.on("friend_removed", (data) => {
          toast({ variant: "success", title: data.message });
        });

        socket.on("open_chat", (data) => {
          console.log("Dashboard: Received open_chat event", data);
          navigate(`/chat`);
          dispatch(setCurrentConversation(data));
          toast({
            title: "Chat opened",
            description: "Conversation ready!",
          });
        });

        socket.on("database-updated", async () => {
          // Check if the query has been started (not just if data exists)
          if (isSuccess || isError || isLoading || isFetching) {
            try {
              const result = await refetch();

              if (result.data?.user) {
                dispatch(updateUser(result.data.user));
              }

              // Force component re-render by updating state
              setForceRender((prev) => prev + 1);
            } catch (error) {
              console.error("Dashboard: Error refetching user data:", error);
              // Still force re-render even if refetch fails
              setForceRender((prev) => prev + 1);
            }
          } else {
            console.warn("Dashboard: Cannot refetch, query not started yet.");
            // Force re-render even if query hasn't started
            setForceRender((prev) => prev + 1);
          }
        });

        socket.on("error", (data) => {
          toast({
            variant: "error",
            title: data.message || "An error occurred",
          });
          refetch();
        });

        // Global incoming call listener
        socket.on(
          "incoming_video_call",
          ({ caller_id, offer, conversation_id }) => {
            console.log(
              `Dashboard: User ${user._id} received incoming call from ${caller_id} for conversation ${conversation_id}`
            );
            if (caller_id !== user._id) {
              dispatch(
                setIncomingCallData({ caller_id, offer, conversation_id })
              );
            }
          }
        );
      }

      return () => {
        socket?.off("new_friend_request");
        socket?.off("friend_request_sent");
        socket?.off("request_accepted");
        socket?.off("request-unsend");
        socket?.off("request_rejected");
        socket?.off("friend_removed");
        socket?.off("open_chat");
        socket?.off("database-updated");
        socket?.off("incoming_video_call");
        socket?.off("error");
      };
    }
  }, [
    isAuthenticated,
    user?._id,
    refetch,
    dispatch,
    navigate,
    isSuccess,
    isError,
    isLoading,
    isFetching,
  ]);

  useEffect(() => {
    const routes = {
      "/": 0,
      "/chat": 1,
      "/explore": 2,
      "/profile": 3,
    };
    setActive(routes[location.pathname] ?? null);
  }, [location]);

  return (
    <div className="flex min-h-screen mobile-full-height" key={forceRender}>
      {/* Mobile and tablet: Bottom navigation bar - hide when chat is open */}
      {!currentConversation && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-100 dark:bg-gray-900 shadow-light dark:shadow-dark border-t border-gray-200 dark:border-gray-700 lg:hidden">
          <div className="flex items-center justify-around py-2">
            <div
              className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer ${
                active === 0
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
              onClick={() => {
                setActive(0);
                navigate("/");
              }}
            >
              <img src={Logo} alt="Logo" className="h-6 w-6 mb-1" />
              <span className="text-xs">Home</span>
            </div>
            {[
              ["/chat", MessageSquareMoreIcon, 1, "Chat"],
              ["/explore", Search, 2, "Explore"],
              ["/profile", CogIcon, 3, "Profile"],
            ].map(([path, Icon, index, label]) => (
              <div
                key={path}
                className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer ${
                  active === index
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
                onClick={() => {
                  setActive(index);
                  navigate(path);
                }}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{label}</span>
              </div>
            ))}
            <div className="flex flex-col items-center justify-center p-2">
              <DarkModeSwitcher />
              <span className="text-xs mt-1">Theme</span>
            </div>
            <ProfileOptions>
              <div className="flex flex-col items-center justify-center p-2 cursor-pointer">
                {user?.status === "Online" ? (
                  <StyledBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </AvatarFallback>
                    </Avatar>
                  </StyledBadge>
                ) : (
                  <StyledRedBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </AvatarFallback>
                    </Avatar>
                  </StyledRedBadge>
                )}
                <span className="text-xs mt-1">Profile</span>
              </div>
            </ProfileOptions>
          </div>
        </div>
      )}

      {/* Desktop: Side navigation */}
      <div className="hidden lg:flex min-h-screen w-[100px] bg-gray-100 dark:bg-gray-900 shadow-light dark:shadow-dark flex-shrink-0">
        <div className="h-full w-full flex flex-col items-center justify-between">
          <div className="w-full flex flex-col items-center justify-center gap-y-3">
            <div className="h-16 w-16 rounded-lg my-4 flex items-center justify-center cursor-pointer">
              <img
                src={Logo}
                alt="Logo"
                onClick={() => {
                  setActive(0);
                  navigate("/");
                }}
              />
            </div>
            {[
              ["/chat", MessageSquareMoreIcon, 1],
              ["/explore", Search, 2],
              ["/profile", CogIcon, 3],
            ].map(([path, Icon, index]) => (
              <div
                key={path}
                className={`h-16 w-16 rounded-lg flex items-center cursor-pointer justify-center ${
                  active === index
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
                onClick={() => {
                  setActive(index);
                  navigate(path);
                }}
              >
                <Icon size={28} />
              </div>
            ))}
            <Divider className="w-16 bg-gray-100 dark:bg-gray-700" />
          </div>
          <div className="w-full flex flex-col items-center justify-center mb-8 gap-y-3">
            <div className="h-16 w-16 rounded-lg flex items-center justify-center">
              <DarkModeSwitcher />
            </div>
            <ProfileOptions>
              {user?.status === "Online" ? (
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  variant="dot"
                >
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user.avatar} />
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
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      <Skeleton className="h-16 w-16 rounded-full" />
                    </AvatarFallback>
                  </Avatar>
                </StyledRedBadge>
              )}
            </ProfileOptions>
          </div>
        </div>
      </div>

      {/* Main content area with conditional bottom padding for mobile navigation */}
      <div
        className={`flex-1 h-full ${
          currentConversation ? "pb-0" : "pb-28"
        } lg:pb-0`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
