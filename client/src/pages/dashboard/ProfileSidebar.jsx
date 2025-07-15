import { Separator } from "@/components/ui/separator.jsx";
import { setSidebarType, toggleSidebar } from "@/redux/slices/appSlice.js";
import { setCurrentConversation } from "@/redux/slices/conversationSlice.js";
import { BellOff, ChevronRight, Star, Trash, UserMinus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import LazyImage from "@/components/LazyImage.jsx";
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
import { useDeleteChatMutation } from "@/redux/api/chatApi.js";
import { socket } from "@/socket.js";
import authApi from "@/redux/api/authApi.js";
import { useNavigate } from "react-router-dom";

const ProfileSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleUserDetailsOpen = () => {
    dispatch(toggleSidebar());
  };

  const handleSharedOpen = () => {
    dispatch(setSidebarType("SHARED"));
  };

  const [deleteChat] = useDeleteChatMutation();

  const chat = useSelector((state) => state?.conversation?.currentConversation);
  const user = useSelector((state) => state?.auth?.user);
  const users = chat?.participants?.filter((person) => person._id !== user._id);

  // Handle unfriend user
  const handleUnfriendUser = async () => {
    try {
      if (socket && users[0]?._id) {
        // Emit remove_friend socket event
        socket.emit("remove_friend", { receiver: users[0]._id });

        // Close the current conversation
        dispatch(setCurrentConversation(null));

        // Close the sidebar
        dispatch(toggleSidebar());

        // Navigate back to chat list
        navigate("/chat");

        // Invalidate cache to refresh all data
        dispatch(
          authApi.util.invalidateTags(["User", "People", "Friends", "Requests"])
        );

        // Emit socket event to update chat list
        socket.emit("get_direct_chats", { user_id: user._id });
      }
    } catch (error) {
      console.error("Error unfriending user:", error);
    }
  };

  // Handle chat deletion
  const handleDeleteChat = async () => {
    try {
      // Delete the chat
      await deleteChat(chat?._id);

      // Close the current conversation
      dispatch(setCurrentConversation(null));

      // Close the sidebar
      dispatch(toggleSidebar());

      // Navigate back to chat list
      navigate("/chat");

      // Invalidate cache to refresh chat list
      dispatch(
        authApi.util.invalidateTags(["User", "People", "Friends", "Requests"])
      );

      // Emit socket event to update other components
      if (socket && user?._id) {
        socket.emit("get_direct_chats", { user_id: user._id });
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Get media files from current conversation
  const mediaFiles =
    chat?.messages?.filter((msg) => msg.type === "Media") || [];
  const recentMedia = mediaFiles.slice(-3); // Get the last 3 media files

  return (
    <div className="flex flex-col shadow-light dark:shadow-dark w-full xl:w-1/4 h-full">
      {/* Profile Header */}
      <div className="sticky border-b border-gray-300 dark:border-gray-700 flex items-center justify-between w-full p-3 md:p-4 lg:p-6">
        <div className="font-semibold text-base md:text-lg lg:text-xl">
          Profile
        </div>
        <button onClick={handleUserDetailsOpen}>
          <X size={18} className="md:hidden" color="gray" />
          <X size={20} className="hidden md:block lg:hidden" color="gray" />
          <X size={24} className="hidden lg:block" color="gray" />
        </button>
      </div>

      {/* Profile Details */}
      <div className="p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4 lg:space-y-6 overflow-y-auto">
        <div className="flex items-center gap-x-3 md:gap-x-4 lg:gap-x-5 px-2">
          <LazyImage
            src={users[0]?.avatar}
            alt={users[0]?.name}
            className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full object-cover object-center flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-base md:text-lg lg:text-xl font-medium truncate">
              {users[0]?.name}
            </h3>
            <h3 className="text-sm md:text-base text-gray-600 dark:text-gray-400 truncate">
              @{users[0]?.username}
            </h3>
          </div>
        </div>

        <div className="flex px-2 space-x-2 text-gray-500 dark:text-gray-400 text-sm">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded-md flex items-center justify-center hover:bg-gray-100 hover:dark:bg-gray-900 text-xs sm:text-sm">
                <UserMinus size={16} className="sm:hidden mr-2" />
                <UserMinus size={20} className="hidden sm:block mr-3" />
                <span>Unfriend</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will have to send a friend request again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleUnfriendUser}>
                  Unfriend User
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded-md flex items-center justify-center hover:bg-gray-100 hover:dark:bg-gray-900 text-xs sm:text-sm">
                <Trash size={16} className="sm:hidden mr-2" />
                <Trash size={20} className="hidden sm:block mr-3" />
                <span>Delete</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteChat}>
                  Delete Chat
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Separator />

        <div className="flex flex-col px-2 gap-y-1">
          <h2 className="text-sm sm:text-base font-medium">About</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            {users[0]?.about || "No bio available"}
          </p>
        </div>

        <Separator />

        {/* Shared Media */}
        <div className="flex flex-col gap-y-3 sm:gap-y-4 px-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm sm:text-base font-medium">Media</h3>
            <div
              className="flex items-center gap-x-1 text-blue-500 dark:text-blue-400 cursor-pointer text-xs sm:text-sm"
              onClick={handleSharedOpen}
            >
              <span>{mediaFiles.length}</span> {/* Show media count */}
              <ChevronRight size={20} className="sm:hidden" />
              <ChevronRight size={24} className="hidden sm:block" />
            </div>
          </div>
          <div className="flex gap-x-2 overflow-clip">
            {recentMedia.length > 0 ? (
              recentMedia.map((media, index) => {
                const file = JSON.parse(media.file);
                const fileType = file.path.split(".").pop().toLowerCase();

                const isImage = /(jpg|jpeg|png|gif|webp)$/i.test(fileType);
                const isVideo = /(mp4|webm|ogg)$/i.test(fileType);

                return isImage ? (
                  <LazyImage
                    key={index}
                    src={file.path}
                    alt="media"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover object-center cursor-pointer flex-shrink-0"
                  />
                ) : isVideo ? (
                  <video
                    key={index}
                    src={file.path}
                    autoPlay={false}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover object-center cursor-pointer flex-shrink-0"
                  />
                ) : (
                  <LazyImage
                    key={index}
                    src={file.path}
                    alt="media"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover object-center cursor-pointer flex-shrink-0"
                  />
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                No media available
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Separator />
          <div className="flex flex-col px-2 gap-y-3 sm:gap-y-4 py-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-x-2" htmlFor="mute">
                <BellOff strokeWidth={1.5} size={20} className="sm:hidden" />
                <BellOff
                  strokeWidth={1.5}
                  size={24}
                  className="hidden sm:block"
                />
                <h2 className="text-sm sm:text-base font-medium">
                  Mute Notifications
                </h2>
              </Label>
              <Switch id={"mute"} />
            </div>
          </div>
          <Separator />
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
