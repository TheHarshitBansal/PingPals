import { Separator } from "@/components/ui/separator.jsx";
import { setSidebarType, toggleSidebar } from "@/redux/slices/appSlice.js";
import { setCurrentConversation } from "@/redux/slices/conversationSlice.js";
import { ChevronRight, Star, Trash, UserMinus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
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
  const messages = useSelector((state) => state?.conversation?.currentMessages);
  const users = chat?.participants?.filter((person) => person._id !== user._id);

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

        // Invalidate cache to refresh friends list
        dispatch(
          authApi.util.invalidateTags(["User", "People", "Friends", "Requests"])
        );

        // Emit socket event to update other components
        if (socket && user?._id) {
          socket.emit("get_direct_chats", { user_id: user._id });
        }
      }
    } catch (error) {
      console.error("Error unfriending user:", error);
    }
  };

  // Get media files from current conversation - use currentMessages from Redux
  const allMessages = messages || chat?.messages || [];
  const mediaFiles = allMessages.filter((msg) => msg.type === "Media") || [];
  const recentMedia = mediaFiles.slice(-3); // Get the last 3 media files

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-gray-800 shadow-lg">
      {/* Profile Header */}
      <div className="sticky top-0 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between w-full p-5 bg-white dark:bg-gray-800 z-10">
        <div className="font-semibold text-lg lg:text-xl">Profile</div>
        <button
          onClick={handleUserDetailsOpen}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
        >
          <X size={20} className="lg:hidden" color="gray" />
          <X size={24} className="hidden lg:block" color="gray" />
        </button>
      </div>

      {/* Profile Details */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* User Profile Info */}
        <div className="flex items-center gap-x-4 lg:gap-x-5 px-2">
          <LazyImage
            src={users[0]?.avatar}
            alt={users[0]?.name}
            className="w-14 h-14 lg:w-16 lg:h-16 rounded-full object-cover object-center flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg lg:text-xl font-medium text-gray-900 dark:text-gray-100 truncate">
              {users[0]?.name}
            </h3>
            <h3 className="text-sm lg:text-base text-gray-600 dark:text-gray-400 truncate">
              @{users[0]?.username}
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex px-2 space-x-2 text-gray-500 dark:text-gray-400 text-sm">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full border border-gray-300 dark:border-gray-700 p-3 rounded-lg flex items-center justify-center hover:bg-gray-100 hover:dark:bg-gray-900 transition-colors">
                <UserMinus size={18} className="mr-2" />
                <span className="font-medium">Unfriend</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove {users[0]?.name} from your friends list and
                  you won't be able to message them anymore. You'll need to send
                  a friend request to them in order to chat again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all"
                    onClick={handleUnfriendUser}
                  >
                    Unfriend
                  </button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full border border-red-300 dark:border-red-700 p-3 rounded-lg flex items-center justify-center hover:bg-red-50 hover:dark:bg-red-900 text-red-600 dark:text-red-400 transition-colors">
                <Trash size={18} className="mr-2" />
                <span className="font-medium">Delete</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this chat? This action cannot
                  be undone and all messages will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all"
                    onClick={handleDeleteChat}
                  >
                    Delete Chat
                  </button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Separator className="my-2" />

        {/* About Section */}
        <div className="px-2">
          <h2 className="text-base lg:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            About
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base leading-relaxed">
            {users[0]?.about || "No bio available"}
          </p>
        </div>

        <Separator className="my-2" />

        {/* Shared Media Section */}
        <div className="px-2">
          <div
            className="flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
            onClick={handleSharedOpen}
          >
            <div>
              <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-gray-100">
                Shared Media
              </h3>
              <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                {mediaFiles.length} {mediaFiles.length === 1 ? "item" : "items"}
              </p>
            </div>
            <div className="flex items-center text-blue-500 dark:text-blue-400">
              <ChevronRight size={20} />
            </div>
          </div>

          {/* Media Preview Grid */}
          {recentMedia.length > 0 ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {recentMedia.map((media, index) => {
                const file = JSON.parse(media.file);
                const fileType = file.path.split(".").pop().toLowerCase();
                const isImage = /(jpg|jpeg|png|gif|webp)$/i.test(fileType);
                const isVideo = /(mp4|webm|ogg)$/i.test(fileType);

                return isImage ? (
                  <LazyImage
                    key={index}
                    src={file.path}
                    alt={`Media ${index + 1}`}
                    className="w-full h-20 lg:h-24 rounded-lg object-cover object-center cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ) : isVideo ? (
                  <video
                    key={index}
                    src={file.path}
                    className="w-full h-20 lg:h-24 rounded-lg object-cover object-center cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <LazyImage
                    key={index}
                    src={file.path}
                    alt={`File ${index + 1}`}
                    className="w-full h-20 lg:h-24 rounded-lg object-cover object-center cursor-pointer hover:opacity-80 transition-opacity"
                  />
                );
              })}
            </div>
          ) : (
            <div className="mt-3 text-center py-6">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <Star size={32} className="mx-auto opacity-50" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No media shared yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
