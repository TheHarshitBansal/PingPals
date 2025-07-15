import { Input } from "@/components/ui/input.jsx";
import users from "@/data/users.js";
import { ArrowDownLeft, ArrowUpRight, Phone, Plus, Video } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import MakeCallDialog from "./MakeCallDialog.jsx";

const CallElement = ({ name, incoming, missed, avatar, time, voice, date }) => {
  return (
    <div className="w-full h-16 sm:h-20 rounded-sm flex items-center justify-between px-2 sm:px-3 py-2 border-y border-gray-100 dark:border-gray-900">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-x-2 sm:gap-x-3 flex-1 min-w-0">
          <Avatar className="cursor-pointer h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
            <AvatarImage src={avatar} loading="lazy" />
            <AvatarFallback>
              <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base line-clamp-1 truncate">
              {name}
            </h3>
            <div className="flex items-center gap-x-1 sm:gap-x-2">
              <div className="text-sm line-clamp-1 flex-shrink-0">
                {incoming ? (
                  <ArrowDownLeft
                    size={16}
                    className={`sm:w-5 sm:h-5 ${
                      missed
                        ? "text-red-500 dark:text-red-400"
                        : "text-green-500 dark:text-green-400"
                    }`}
                  />
                ) : (
                  <ArrowUpRight
                    size={16}
                    className={`sm:w-5 sm:h-5 ${
                      missed
                        ? "text-red-500 dark:text-red-400"
                        : "text-green-500 dark:text-green-400"
                    }`}
                  />
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {date} {time}
              </p>
            </div>
          </div>
        </div>
        <div className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 sm:p-2 rounded-lg cursor-pointer flex-shrink-0">
          {voice ? (
            <Phone size={18} className="sm:w-6 sm:h-6" />
          ) : (
            <Video size={18} className="sm:w-6 sm:h-6" />
          )}
        </div>
      </div>
    </div>
  );
};

const CallLog = () => {
  return (
    <div className="relative h-screen w-full sm:min-w-80 sm:max-w-80 lg:min-w-96 lg:max-w-96 shadow-light dark:shadow-dark flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-10 py-5 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold">Calls</h1>
      </div>

      {/* Search Box */}
      <div className="px-3 sm:px-5 flex-shrink-0">
        <Input placeholder="Search" className="mb-2 text-sm sm:text-base" />
      </div>

      {/* New Call */}
      <MakeCallDialog>
        <div className="mx-3 sm:mx-5 px-3 sm:px-5 rounded-sm flex items-center justify-between py-4 sm:py-5 flex-shrink-0 text-blue-500 dark:text-blue-400 cursor-pointer font-medium hover:bg-gray-50 dark:hover:bg-gray-900">
          <h3 className="text-sm sm:text-base">Make a Call</h3>
          <Plus size={20} className="sm:w-6 sm:h-6" />
        </div>
      </MakeCallDialog>

      {/* Call Log */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 no-scrollbar">
        {users.map((user, index) => (
          <CallElement
            key={index}
            name={user.name}
            avatar={user.avatar}
            time={user.time}
            missed={user.missed}
            incoming={user.incoming}
            date={user.date}
            voice={user.voice}
          />
        ))}
      </div>
    </div>
  );
};
export default CallLog;
