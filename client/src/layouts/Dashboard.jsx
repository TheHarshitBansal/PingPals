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
import { useGetUserQuery } from "@/redux/api/authApi.js";
import { updateUser } from "@/redux/slices/authSlice.js";

const Dashboard = () => {
  const { data, refetch } = useGetUserQuery(undefined);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [active, setActive] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket(user._id);

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

      socket.on("database-updated", async () => {
        const updatedData = await refetch();
        if (updatedData?.data?.user) {
          dispatch(updateUser(updatedData.data.user));
        }
      });

      return () => {
        socket.off("new_friend_request");
        socket.off("friend_request_sent");
        socket.off("request_accepted");
        socket.off("request-unsend");
        socket.off("request_rejected");
        socket.off("friend_removed");
        socket.off("database-updated");
      };
    }
  }, [isAuthenticated, user._id, refetch, data, dispatch]);

  useEffect(() => {
    const routes = {
      "/": 0,
      "/chat": 1,
      "/group": 2,
      "/calls": 3,
      "/settings": 4,
    };
    setActive(routes[location.pathname] ?? null);
  }, [location]);

  return (
    <div className="flex">
      <div className="h-screen w-[100px] bg-gray-100 dark:bg-gray-900 shadow-light dark:shadow-dark">
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
              ["/group", Users, 2],
              ["/calls", PhoneIcon, 3],
              ["/settings", CogIcon, 4],
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
