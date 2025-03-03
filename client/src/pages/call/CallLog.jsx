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
import { useFetchCallLogsQuery } from "@/redux/api/callApi.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setCallLogs } from "@/redux/slices/appSlice.js";

const CallElement = ({ name, incoming, missed, avatar, time, voice, date }) => {
  return (
    <div className="w-full h-20 rounded-sm flex items-center justify-between px-3 py-2 border-y border-gray-100 dark:border-gray-900">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-x-2">
          <Avatar className="cursor-pointer">
            <AvatarImage src={avatar} loading="lazy" />
            <AvatarFallback>
              <Skeleton className="h-16 w-16 rounded-full" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold line-clamp-1">{name}</h3>
            <div className="flex items-center gap-x-2">
              <div className="text-sm line-clamp-1">
                {incoming ? (
                  <ArrowDownLeft
                    size={20}
                    className={`${
                      missed
                        ? "text-red-500 dark:text-red-400"
                        : "text-green-500 dark:text-green-400"
                    }`}
                  />
                ) : (
                  <ArrowUpRight
                    size={20}
                    className={`${
                      missed
                        ? "text-red-500 dark:text-red-400"
                        : "text-green-500 dark:text-green-400"
                    }`}
                  />
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {date} {time}
              </p>
            </div>
          </div>
        </div>
        <div className="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg cursor-pointer">
          {voice ? <Phone size={24} /> : <Video size={24} />}
        </div>
      </div>
    </div>
  );
};

const CallLog = () => {
  const dispatch = useDispatch();
  const { data, refetch, isSuccess } = useFetchCallLogsQuery(undefined);

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setCallLogs(data.data));
    }
  }, [isSuccess, data, dispatch, refetch]);

  const callLogs = useSelector((state) => state.app.callLogs);

  return (
    <div className="relative h-screen min-w-96 max-w-96 shadow-light dark:shadow-dark flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold">Calls</h1>
      </div>

      {/* Search Box */}
      <div className="px-5 flex-shrink-0">
        <Input placeholder="Search" className="mb-2" />
      </div>

      {/* New Call */}
      <MakeCallDialog>
        <div className="mx-5 px-5 rounded-sm flex items-center justify-between py-5 flex-shrink-0 text-blue-500 dark:text-blue-400 cursor-pointer font-medium hover:bg-gray-50 dark:hover:bg-gray-900">
          <h3>Make a Call</h3>
          <Plus size={24} />
        </div>
      </MakeCallDialog>

      {/* Call <Log> */}
      <div className="flex-1 overflow-y-auto px-5 no-scrollbar">
        {callLogs.map((log, index) => (
          <CallElement
            key={log.id}
            name={log.name}
            avatar={log.img}
            missed={log.missed}
            incoming={log.incoming}
            voice={log.type === "Voice"}
          />
        ))}
      </div>
    </div>
  );
};
export default CallLog;
