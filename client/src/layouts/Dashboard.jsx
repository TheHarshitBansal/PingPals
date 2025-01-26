import { Outlet } from "react-router-dom";
import Logo from "../assets/logo.png";
import {
  CogIcon,
  MessageSquareMoreIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";
import { Divider } from "@mui/material";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { faker } from "@faker-js/faker";
import DarkModeSwitcher from "@/components/DarkModeSwitcher.jsx";
import { useState } from "react";

const Dashboard = () => {
  const [active, setActive] = useState(1);

  return (
    <div className="flex">
      <div
        className={`h-screen w-[100px] bg-gray-100 dark:bg-gray-900 shadow-light dark:shadow-dark`}
      >
        <div className="h-full w-full flex flex-col items-center justify-between">
          <div className="w-full flex flex-col items-center justify-center gap-y-3">
            <div className="h-16 w-16 rounded-lg my-4 flex items-center justify-center">
              <img src={Logo} alt="Logo" />
            </div>
            <div
              className={`h-16 w-16 rounded-lg flex items-center cursor-pointer justify-center ${
                active === 1
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
              onClick={() => setActive(1)}
            >
              <MessageSquareMoreIcon size={28} />
            </div>
            <div
              className={`h-16 w-16 rounded-lg flex items-center cursor-pointer justify-center ${
                active === 2
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
              onClick={() => setActive(2)}
            >
              <UserIcon size={28} />
            </div>
            <div
              className={`h-16 w-16 rounded-lg flex items-center cursor-pointer justify-center ${
                active === 3
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
              onClick={() => setActive(3)}
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
              onClick={() => setActive(4)}
            >
              <CogIcon size={28} />
            </div>
          </div>
          <div className="w-full flex flex-col items-center justify-center mb-8 gap-y-3">
            <div className="h-16 w-16 rounded-lg flex items-center justify-center">
              <DarkModeSwitcher />
            </div>
            <Avatar className="cursor-pointer">
              <AvatarImage src={faker.image.avatar()} />
              <AvatarFallback>User</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};
export default Dashboard;
