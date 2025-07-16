import { Avatar, AvatarImage } from "../ui/avatar.jsx";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Skeleton } from "../ui/skeleton.jsx";
import { LucideUserMinus, MessageSquareMoreIcon } from "lucide-react";
import { socket } from "@/socket.js";
import { useDispatch, useSelector } from "react-redux";
import { useGetFriendsQuery } from "@/redux/api/authApi.js";
import { useEffect } from "react";
import { setFriends } from "@/redux/slices/appSlice.js";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast.js";
import { setCurrentConversation } from "@/redux/slices/conversationSlice.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const FriendList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, refetch, isSuccess, isLoading } = useGetFriendsQuery(undefined);
  const friends = useSelector((state) => state.app.friends);
  const directConversations = useSelector(
    (state) => state.conversation.directConversations
  );

  // Debug: Log conversation state
  useEffect(() => {
    console.log("FriendList: Direct conversations updated:", {
      count: directConversations?.length || 0,
      conversations:
        directConversations?.map((c) => ({
          id: c._id,
          participants: c.participants?.map((p) => p.name || p._id),
        })) || [],
    });
  }, [directConversations]);

  useEffect(() => {
    if (isSuccess && data?.friends) {
      dispatch(setFriends(data.friends));
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
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && <div className="text-center mt-4">Loading...</div>}
        {friends?.length > 0 ? (
          <div className="space-y-4">
            {friends.map((person) => (
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
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all flex-1 sm:flex-initial"
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
                          "Setting current conversation...",
                          existingConversation
                        );
                        console.log("About to dispatch setCurrentConversation");

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
                    <MessageSquareMoreIcon size={16} />
                    <span className="sm:inline">Message</span>
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all flex-1 sm:flex-initial">
                        <LucideUserMinus size={16} />
                        <span className="sm:inline">Remove</span>
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. You will have to send
                          friend request to them in order to chat again.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <button
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-600 transition-all"
                            onClick={() => {
                              //INFO: Remove friend functionality
                              socket.emit("remove_friend", {
                                receiver: person._id,
                              });
                              refetch();
                            }}
                          >
                            Remove
                          </button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center mt-6 text-gray-500">No friends found</p>
        )}
      </div>
    </div>
  );
};

export default FriendList;
