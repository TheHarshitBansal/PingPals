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
import { useNavigate } from "react-router-dom";
import { setCurrentConversation } from "@/redux/slices/conversationSlice.js";

const SearchPeople = () => {
  const user = useSelector((state) => state.auth.user);
  const directConversations = useSelector(
    (state) => state.conversation.directConversations
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    <div className="w-full h-full flex flex-col overflow-y-scroll">
      <div className="flex-shrink-0 p-4">
        <form className="w-full mx-auto flex flex-col items-center justify-center gap-y-3">
          <input
            type="text"
            placeholder="Search People (Name or Username)"
            className="bg-transparent border border-input p-3 md:p-4 rounded-lg outline-none w-full focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-sm md:text-base"
            onChange={(e) => {
              setSearch(e.target.value);
              // Remove immediate refetch call - debounced search will handle it
            }}
            value={search}
          />
        </form>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32 lg:pb-4">
        {isLoading && <div className="text-center mt-4">Loading...</div>}

        {isSuccess && data?.people?.length > 0 ? (
          <div className="space-y-4 px-2">
            {data.people.map((person) => (
              <div
                key={person._id}
                className="border p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-gray-900"
              >
                <div className="flex items-center gap-x-4 flex-1 min-w-0">
                  <Avatar className="cursor-pointer h-12 w-12 md:h-16 md:w-16 flex-shrink-0">
                    <AvatarImage src={person.avatar} loading="lazy" />
                    <AvatarFallback>
                      <Skeleton className="h-full w-full rounded-full" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 min-w-0 flex-1">
                    <h3 className="font-semibold text-base md:text-lg truncate">
                      {person.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                      @{person.username}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400 dark:text-gray-600 line-clamp-2">
                      {person.about}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* //HACK: Show Add Friend Button */}
                  {!person?.requests?.includes(user._id) &&
                    !user?.requests?.includes(person._id) &&
                    !user?.friends?.includes(person._id) && (
                      <button
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                        onClick={() => {
                          //INFO: Add friend functionality
                          socket.emit("send-friend_request", {
                            receiver: person._id,
                            sender: user._id,
                          });
                          // Don't call refetch immediately - let socket event handle it
                        }}
                      >
                        <UserPlus2 size={20} />
                      </button>
                    )}
                  {/* //HACK: Show Unsend Friend Button */}
                  {person?.requests?.includes(user._id) &&
                    !user.requests.includes(person._id) &&
                    !user?.friends?.includes(person._id) && (
                      <button
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        onClick={() => {
                          //INFO: Unsend friend request functionality
                          socket.emit("unsend_request", {
                            receiver: person._id,
                            sender: user._id,
                          });
                          // Don't call refetch immediately - let socket event handle it
                        }}
                      >
                        <UserMinus2Icon size={20} />
                      </button>
                    )}

                  {/* //HACK: Show Accept Friend Button */}
                  {user?.requests?.includes(person._id) && (
                    <div className="flex gap-2">
                      <button
                        className="p-2 text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                        onClick={() => {
                          //INFO: Accept friend request functionality
                          socket.emit("accept_request", {
                            sender: person._id,
                          });
                          // Don't call refetch immediately - let socket event handle it
                        }}
                      >
                        <Check size={20} />
                      </button>
                      <button
                        className="p-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        onClick={() => {
                          //INFO: Reject friend functionality
                          socket.emit("reject_request", {
                            sender: person._id,
                          });
                          // Don't call refetch immediately - let socket event handle it
                        }}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}

                  {/* //HACK: Show Message Button */}
                  {user?.friends?.includes(person._id) && (
                    <button
                      className="p-2 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                      onClick={() => {
                        console.log(
                          "Starting chat with:",
                          person.name,
                          person._id
                        );

                        // Debug: Log available conversations
                        console.log(
                          "Available direct conversations:",
                          directConversations
                        );
                        console.log(
                          "Looking for participant with ID:",
                          person._id
                        );

                        // First, check if conversation already exists
                        const existingConversation = directConversations?.find(
                          (conv) => {
                            console.log(
                              "Checking conversation:",
                              conv._id,
                              "participants:",
                              conv.participants?.map((p) => ({
                                id: p._id,
                                name: p.name,
                              }))
                            );
                            return conv.participants?.some(
                              (p) => p._id === person._id
                            );
                          }
                        );

                        if (existingConversation) {
                          console.log(
                            "Found existing conversation:",
                            existingConversation._id
                          );
                          console.log(
                            "About to dispatch setCurrentConversation"
                          );

                          const result = dispatch(
                            setCurrentConversation(existingConversation)
                          );
                          console.log("Dispatch result:", result);

                          // Add a small delay to let Redux update
                          setTimeout(() => {
                            console.log("After dispatch - navigating to chat");
                            navigate("/chat");
                          }, 100);

                          toast({
                            title: "Chat opened",
                            description: `Conversation with ${person.name} ready!`,
                          });
                        } else {
                          // If no existing conversation, emit start_chat
                          socket?.emit("start_chat", {
                            receiver: person._id,
                          });

                          // Navigate to chat immediately
                          navigate("/chat");

                          // Show toast notification
                          toast({
                            title: "Starting chat...",
                            description: `Opening conversation with ${person.name}`,
                          });
                        }
                      }}
                    >
                      <MessageSquareMoreIcon size={20} />
                    </button>
                  )}
                </div>
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
    </div>
  );
};

export default SearchPeople;
