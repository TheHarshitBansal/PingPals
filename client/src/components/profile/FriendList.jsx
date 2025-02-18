import { Avatar, AvatarImage } from "../ui/avatar.jsx";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Skeleton } from "../ui/skeleton.jsx";
import { LucideUserMinus, MessageSquareMoreIcon } from "lucide-react";
import { socket } from "@/socket.js";
import { useDispatch, useSelector } from "react-redux";
import { useGetFriendsQuery } from "@/redux/api/authApi.js";
import { useEffect } from "react";
import { setFriends } from "@/redux/slices/appSlice.js";
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
  const { data, refetch, isSuccess, isLoading } = useGetFriendsQuery(undefined);
  const friends = useSelector((state) => state.app.friends);

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
    <div className="w-full">
      {isLoading && <div className="text-center mt-4">Loading...</div>}
      {friends?.length > 0 ? (
        <div className="mt-6 w-4/5 mx-auto grid grid-cols-2 gap-6">
          {friends.map((person) => (
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
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all"
                    onClick={() => {
                      // navigate(`/chat/${person._id}`);
                    }}
                  >
                    <MessageSquareMoreIcon size={18} />
                    Message
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all">
                        <LucideUserMinus size={18} />
                        Remove
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
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center mt-6 text-gray-500">No friends found</p>
      )}
    </div>
  );
};

export default FriendList;
