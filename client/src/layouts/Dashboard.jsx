import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { CogIcon, MessageSquareMoreIcon, PhoneIcon, Users } from "lucide-react";
import { Divider } from "@mui/material";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { faker } from "@faker-js/faker";
import DarkModeSwitcher from "@/components/DarkModeSwitcher.jsx";
import { useEffect, useState } from "react";
import ProfileOptions from "@/components/profile/ProfileOptions.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, socket } from "@/socket.js";
import { toast } from "@/hooks/use-toast.js";

const Dashboard = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [active, setActive] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      window.onload = () => {
        if (!window.location.hash) {
          window.location = window.location + "#loaded";
          window.location.reload();
        }
      };

      if (!socket) {
        connectSocket(user._id);
      }

      //INFO: New Friend Request
      socket.on("new_friend_request", (data) => {
        toast("success", data.message);
      });

      //INFO: Friend Request Sent
      socket.on("friend_request_sent", (data) => {
        toast("success", data.message);
      });

      //INFO: Friend Request Accepted
      socket.on("request_accepted", (data) => {
        toast("success", data.message);
      });
    }

    return () => {
      if (socket) {
        socket.off("new_friend_request");
        socket.off("friend_request_sent");
        socket.off("request_accepted");
      }
    };
  }, [isAuthenticated, socket]);

  useEffect(() => {
    if (location.pathname === "/") {
      setActive(0);
    } else if (location.pathname === "/chat") {
      setActive(1);
    } else if (location.pathname === "/group") {
      setActive(2);
    } else if (location.pathname === "/calls") {
      setActive(3);
    } else if (location.pathname === "/settings") {
      setActive(4);
    } else {
      setActive(null);
    }
  }, [location]);

  return (
    <div className="flex">
      <div
        className={`h-screen w-[100px] bg-gray-100 dark:bg-gray-900 shadow-light dark:shadow-dark`}
      >
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
            <div
              className={`h-16 w-16 rounded-lg flex items-center cursor-pointer justify-center ${
                active === 1
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
              onClick={() => {
                setActive(1);
                navigate("/chat");
              }}
            >
              <MessageSquareMoreIcon size={28} />
            </div>
            <div
              className={`h-16 w-16 rounded-lg flex items-center cursor-pointer justify-center ${
                active === 2
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
              onClick={() => {
                setActive(2);
                navigate("/group");
              }}
            >
              <Users size={28} />
            </div>
            <div
              className={`h-16 w-16 rounded-lg flex items-center cursor-pointer justify-center ${
                active === 3
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
              onClick={() => {
                setActive(3);
                navigate("/calls");
              }}
            >
              <PhoneIcon size={28} />
            </div>
            <Divider className="w-16 bg-gray-100 dark:bg-gray-700" />
            <div
              className={`h-16 w-16 rounded-lg flex items-center cursor-pointer justify-center ${
                active === 4
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
              onClick={() => {
                setActive(4);
                navigate("/settings");
              }}
            >
              <CogIcon size={28} />
            </div>
          </div>
          <div className="w-full flex flex-col items-center justify-center mb-8 gap-y-3">
            <div className="h-16 w-16 rounded-lg flex items-center justify-center">
              <DarkModeSwitcher />
            </div>
            <ProfileOptions>
              <Avatar className="cursor-pointer">
                <AvatarImage src={faker.image.avatar()} />
                <AvatarFallback>
                  <Skeleton className="h-16 w-16 rounded-full" />
                </AvatarFallback>
              </Avatar>
            </ProfileOptions>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};
export default Dashboard;
