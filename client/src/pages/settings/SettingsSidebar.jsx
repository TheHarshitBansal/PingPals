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
    <div className="flex items-center gap-4 py-4 px-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border-t rounded-md">
      {svg}
      <p className="text-lg font-normal">{title}</p>
    </div>
  );
};

const SettingsSidebar = () => {
  return (
    <div className="relative h-screen min-w-80 max-w-80 shadow-light dark:shadow-dark flex flex-col">
      {/* //INFO:Header */}
      <div className="flex items-center justify-between px-10 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* //INFO: User Details */}
      <div className="w-full rounded-sm flex items-center justify-between px-6 py-4 mb-5">
        <div className="flex items-center justify-between gap-x-5">
          <Avatar className="h-16 w-16 cursor-pointer">
            <AvatarImage src={users[0].avatar} loading="lazy" />
            <AvatarFallback>
              <Skeleton className="rounded-full" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-xl">{users[0].name}</h3>
            <p className="text-base text-gray-500 dark:text-gray-400">
              {users[0].bio}
            </p>
          </div>
        </div>
      </div>

      {/* //INFO: Settings List */}
      <div className="flex-1 overflow-y-auto px-5 no-scrollbar">
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
