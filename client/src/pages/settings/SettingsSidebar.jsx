import KeyboardShortcuts from "@/components/settings/KeyboardShortcuts.jsx";
import ThemeChangeDialog from "@/components/ThemeChangeDialog.jsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import users from "@/data/users.js";
import {
  Bell,
  KeyboardIcon,
  KeyRound,
  Layout,
  LucideInfo,
  LucideLockKeyhole,
  PencilIcon,
  ReceiptText,
} from "lucide-react";
import { useSelector } from "react-redux";

const settings = [
  { svg: <Bell strokeWidth={1.5} />, title: "Notifications" },
  { svg: <LucideLockKeyhole strokeWidth={1.5} />, title: "Privacy" },
  { svg: <KeyRound strokeWidth={1.5} />, title: "Security" },
  { svg: <PencilIcon strokeWidth={1.5} />, title: "Theme" },
  { svg: <Layout strokeWidth={1.5} />, title: "Chat Wallpaper" },
  { svg: <ReceiptText strokeWidth={1.5} />, title: "Request Account Info" },
  { svg: <KeyboardIcon strokeWidth={1.5} />, title: "Keyboard Shortcuts" },
  { svg: <LucideInfo strokeWidth={1.5} />, title: "Help" },
];

const SidebarElement = ({ svg, title }) => {
  return (
    <div className="flex items-center gap-2 md:gap-3 lg:gap-4 py-3 md:py-4 px-3 md:px-4 lg:px-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border-t rounded-md">
      <div className="w-5 h-5 md:w-6 md:h-6">{svg}</div>
      <p className="text-sm md:text-base lg:text-lg font-normal truncate">
        {title}
      </p>
    </div>
  );
};

const SettingsSidebar = () => {
  const user = useSelector((state) => state.auth.user);
  return (
    <div className="relative h-screen w-full md:min-w-80 md:max-w-80 lg:min-w-96 lg:max-w-96 xl:min-w-[26rem] xl:max-w-[26rem] shadow-light dark:shadow-dark flex flex-col">
      {/* //INFO:Header */}
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 xl:px-10 py-4 md:py-5 flex-shrink-0">
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold">Settings</h1>
      </div>

      {/* //INFO: User Details */}
      <div className="w-full rounded-sm flex items-center justify-between px-3 md:px-4 lg:px-6 py-4 mb-5">
        <div className="flex items-center justify-between gap-x-3 md:gap-x-4 lg:gap-x-5 w-full">
          <Avatar className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 cursor-pointer flex-shrink-0">
            <AvatarImage src={user?.avatar} loading="lazy" />
            <AvatarFallback>
              <Skeleton className="rounded-full" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base md:text-lg lg:text-xl truncate">
              {user?.name}
            </h3>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 truncate">
              {user?.about}
            </p>
          </div>
        </div>
      </div>

      {/* //INFO: Settings List */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 lg:px-5 no-scrollbar">
        {settings.map((setting, index) => {
          switch (setting.title) {
            case "Keyboard Shortcuts":
              return (
                <KeyboardShortcuts key={index}>
                  <SidebarElement svg={setting.svg} title={setting.title} />
                </KeyboardShortcuts>
              );
            case "Theme":
              return (
                <ThemeChangeDialog key={index}>
                  <SidebarElement svg={setting.svg} title={setting.title} />
                </ThemeChangeDialog>
              );
            default:
              return (
                <SidebarElement
                  key={index}
                  svg={setting.svg}
                  title={setting.title}
                />
              );
          }
        })}
      </div>
    </div>
  );
};
export default SettingsSidebar;
