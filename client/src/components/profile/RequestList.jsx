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
    <div className="w-full">
      {isLoading && <div className="text-center mt-4">Loading...</div>}
      {requests?.length > 0 ? (
        <div className="mt-6 w-4/5 mx-auto grid grid-cols-2 gap-6">
          {requests.map((person) => (
            <div
              key={person._id}
              className="border p-6 rounded-2xl shadow-md flex items-center gap-x-6 min-w-[50%] bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow duration-200"
            >
              <Avatar className="cursor-pointer h-20 w-20">
                <AvatarImage src={person.avatar} loading="lazy" />
                <AvatarFallback>
                  <Skeleton className="h-20 w-20 rounded-full" />
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col flex-1 min-w-fit">
                <h3 className="font-semibold text-xl text-gray-800 dark:text-gray-200">
                  {person.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  @{person.username}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {person.about}
                </p>

                {/* Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all"
                    onClick={() => {
                      //INFO: Accept Request
                      socket.emit("accept_request", {
                        sender: person._id,
                      });
                    }}
                  >
                    <Check size={18} />
                    Accept
                  </button>

                  <button
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
                    onClick={() => {
                      //INFO: Reject Request
                      socket.emit("reject_request", {
                        sender: person._id,
                      });
                    }}
                  >
                    <X size={18} />
                    Discard
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center mt-6 text-gray-500">No request found</p>
      )}
    </div>
  );
};

export default RequestList;
