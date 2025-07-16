import { Avatar, AvatarImage } from "../ui/avatar.jsx";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Skeleton } from "../ui/skeleton.jsx";
import { Check, X } from "lucide-react";
import { socket } from "@/socket.js";
import { useDispatch, useSelector } from "react-redux";
import { useGetRequestsQuery } from "@/redux/api/authApi.js";
import { useEffect } from "react";
import { setRequests } from "@/redux/slices/appSlice.js";

const RequestList = () => {
  const dispatch = useDispatch();
  const { data, refetch, isSuccess, isLoading } =
    useGetRequestsQuery(undefined);
  const requests = useSelector((state) => state.app.requests);

  useEffect(() => {
    if (isSuccess && data?.requests) {
      dispatch(setRequests(data.requests));
    }
  }, [data, isSuccess, dispatch]);

  useEffect(() => {
    socket.on("database-updated", async () => {
      refetch();
    });

    return () => {
      socket.off("database-updated");
    };
  }, [refetch]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 pb-32 lg:pb-4">
        {isLoading && <div className="text-center mt-4">Loading...</div>}
        {requests?.length > 0 ? (
          <div className="space-y-4">
            {requests.map((person) => (
              <div
                key={person._id}
                className="border p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow duration-200"
              >
                <Avatar className="cursor-pointer h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                  <AvatarImage src={person.avatar} loading="lazy" />
                  <AvatarFallback>
                    <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-200 truncate">
                    {person.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                    @{person.username}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                    {person.about}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 w-full sm:w-auto sm:flex-shrink-0">
                  <button
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all flex-1 sm:flex-initial"
                    onClick={() => {
                      //INFO: Accept Request
                      socket.emit("accept_request", {
                        sender: person._id,
                      });
                    }}
                  >
                    <Check size={16} />
                    <span className="sm:inline">Accept</span>
                  </button>

                  <button
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all flex-1 sm:flex-initial"
                    onClick={() => {
                      //INFO: Reject Request
                      socket.emit("reject_request", {
                        sender: person._id,
                      });
                    }}
                  >
                    <X size={16} />
                    <span className="sm:inline">Discard</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center mt-6 text-gray-500">No request found</p>
        )}
      </div>
    </div>
  );
};

export default RequestList;
