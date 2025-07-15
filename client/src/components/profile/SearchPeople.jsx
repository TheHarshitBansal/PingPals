import { useFindPeopleQuery } from "@/redux/api/authApi.js";
import authApi from "@/redux/api/authApi.js";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage } from "../ui/avatar.jsx";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Skeleton } from "../ui/skeleton.jsx";
import {
  Check,
  MessageSquareMoreIcon,
  UserMinus2Icon,
  UserPlus2,
  X,
} from "lucide-react";
import { socket } from "@/socket.js";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "@/hooks/use-toast.js";

const SearchPeople = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data, isSuccess, isLoading, refetch } = useFindPeopleQuery({
    name: debouncedSearch,
  });

  useEffect(() => {
    if (socket) {
      // Handle database updates by invalidating cache
      const handleDatabaseUpdate = () => {
        // Invalidate all cache tags to ensure fresh data
        dispatch(
          authApi.util.invalidateTags(["User", "People", "Friends", "Requests"])
        );
      };

      // Handle socket errors
      const handleSocketError = (data) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "An error occurred",
        });
        // Invalidate cache to ensure data consistency
        dispatch(
          authApi.util.invalidateTags(["User", "People", "Friends", "Requests"])
        );
      };

      // Listen to database update events only (friend request events are handled in Dashboard)
      socket.on("database-updated", handleDatabaseUpdate);
      socket.on("database-changed", handleDatabaseUpdate);
      socket.on("error", handleSocketError);

      // Cleanup function
      return () => {
        socket.off("database-updated", handleDatabaseUpdate);
        socket.off("database-changed", handleDatabaseUpdate);
        socket.off("error", handleSocketError);
      };
    }
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div className="w-full">
      <form className="mt-10 w-4/5 mx-auto flex flex-col items-center justify-center gap-y-3">
        <input
          type="text"
          placeholder="Search People (Name or Username)"
          className="bg-transparent border border-input p-4 rounded-lg outline-none w-full focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          onChange={(e) => {
            setSearch(e.target.value);
            // Remove immediate refetch call - debounced search will handle it
          }}
          value={search}
        />
      </form>

      {isLoading && <div className="text-center mt-4">Loading...</div>}

      {isSuccess && data?.people?.length > 0 ? (
        <div className="mt-6 w-4/5 mx-auto grid grid-cols-2 gap-4">
          {data.people.map((person) => (
            <div
              key={person._id}
              className="border p-4 rounded-lg shadow-md flex items-center justify-between min-w-[50%]"
            >
              <div className="flex items-center gap-x-4">
                <Avatar className="cursor-pointer h-20 w-20">
                  <AvatarImage src={person.avatar} loading="lazy" />
                  <AvatarFallback>
                    <Skeleton className="h-16 w-16 rounded-full" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0">
                  <h3 className="font-semibold text-lg">{person.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    @{person.username}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-600">
                    {person.about}
                  </p>
                </div>
              </div>
              {/* //HACK: Show Add Friend Button */}
              {!person?.requests?.includes(user._id) &&
                !user?.requests?.includes(person._id) &&
                !user?.friends?.includes(person._id) && (
                  <button
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    onClick={() => {
                      //INFO: Add friend functionality
                      socket.emit("send-friend_request", {
                        receiver: person._id,
                        sender: user._id,
                      });
                      // Don't call refetch immediately - let socket event handle it
                    }}
                  >
                    <UserPlus2 size={24} className="cursor-pointer" />
                  </button>
                )}
              {/* //HACK: Show Unsend Friend Button */}
              {person?.requests?.includes(user._id) &&
                !user.requests.includes(person._id) &&
                !user?.friends?.includes(person._id) && (
                  <div
                    className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                    onClick={() => {
                      //INFO: Unsend friend request functionality
                      socket.emit("unsend_request", {
                        receiver: person._id,
                        sender: user._id,
                      });
                      // Don't call refetch immediately - let socket event handle it
                    }}
                  >
                    <UserMinus2Icon size={24} />
                  </div>
                )}

              {/* //HACK: Show Accept Friend Button */}
              {user?.requests?.includes(person._id) && (
                <div className="flex gap-x-4">
                  <button
                    className="text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 transition-colors"
                    onClick={() => {
                      //INFO: Accept friend request functionality
                      socket.emit("accept_request", {
                        sender: person._id,
                      });
                      // Don't call refetch immediately - let socket event handle it
                    }}
                  >
                    <Check />
                  </button>
                  <button
                    className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                    onClick={() => {
                      //INFO: Reject friend functionality
                      socket.emit("reject_request", {
                        sender: person._id,
                      });
                      // Don't call refetch immediately - let socket event handle it
                    }}
                  >
                    <X />
                  </button>
                </div>
              )}

              {/* //HACK: Show Message Button */}
              {user?.friends?.includes(person._id) && (
                <button
                  className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                  onClick={() => {
                    socket?.emit("start_chat", {
                      receiver: person._id,
                    });
                  }}
                >
                  <MessageSquareMoreIcon size={24} className="cursor-pointer" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        debouncedSearch &&
        !isLoading && (
          <p className="text-center mt-4 text-gray-500">No users found</p>
        )
      )}
    </div>
  );
};

export default SearchPeople;
