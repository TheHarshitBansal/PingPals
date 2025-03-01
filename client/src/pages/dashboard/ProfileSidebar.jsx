import { Separator } from "@/components/ui/separator.jsx";
import { setSidebarType, toggleSidebar } from "@/redux/slices/appSlice.js";
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

const ProfileSidebar = () => {
  const dispatch = useDispatch();

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

  // Get media files from current conversation
  const mediaFiles =
    chat?.messages?.filter((msg) => msg.type === "Media") || [];
  const recentMedia = mediaFiles.slice(-3); // Get the last 3 media files

  return (
    <div className="flex flex-col shadow-light dark:shadow-dark w-1/4 h-full">
      {/* Profile Header */}
      <div className="sticky border-b border-gray-300 dark:border-gray-700 flex items-center justify-between w-full p-6 ">
        <div className="font-semibold text-lg">Profile</div>
        <button onClick={handleUserDetailsOpen}>
          <X size={24} color="gray" />
        </button>
      </div>

      {/* Profile Details */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-x-5 px-2">
          <LazyImage
            src={users[0]?.avatar}
            alt={users[0]?.name}
            className="w-16 h-16 rounded-full object-cover object-center"
          />
          <div>
            <h3 className="text-lg font-medium">{users[0]?.name}</h3>
            <h3 className="text-base">@{users[0]?.username}</h3>
          </div>
        </div>

        <div className="flex px-2 space-x-2 text-gray-500 dark:text-gray-400 text-sm">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded-md flex items-center justify-center hover:bg-gray-100 hover:dark:bg-gray-900">
                <UserMinus size={20} className="mr-3" />
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
                <AlertDialogAction
                  onClick={() => {
                    //INFO: Remove friend functionality
                    socket.emit("remove_friend", {
                      receiver: users[0]._id,
                    });
                  }}
                >
                  Unfriend User
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded-md flex items-center justify-center hover:bg-gray-100 hover:dark:bg-gray-900">
                <Trash size={20} className="mr-3 " />
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
                <AlertDialogAction onClick={() => deleteChat(chat?._id)}>
                  Delete User
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Separator />

        <div className="flex flex-col px-2 gap-y-1">
          <h2 className="text-base font-medium">About</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {users[0]?.about || "No bio available"}
          </p>
        </div>

        <Separator />

        {/* Shared Media */}
        <div className="flex flex-col gap-y-4 px-2">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium">Media</h3>
            <div
              className="flex items-center gap-x-1 text-blue-500 dark:text-blue-400 cursor-pointer"
              onClick={handleSharedOpen}
            >
              <span>{mediaFiles.length}</span> {/* Show media count */}
              <ChevronRight size={24} />
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
                    className="w-24 h-24 rounded-md object-cover object-center cursor-pointer"
                  />
                ) : isVideo ? (
                  <video
                    key={index}
                    src={file.path}
                    autoPlay={false}
                    className="w-24 h-24 rounded-md object-cover object-center cursor-pointer"
                  />
                ) : (
                  <LazyImage
                    key={index}
                    src={file.path}
                    alt="media"
                    className="w-24 h-24 rounded-md object-cover object-center cursor-pointer"
                  />
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No media available
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Separator />
          <div className="flex flex-col px-2 gap-y-4 py-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-x-2" htmlFor="mute">
                <BellOff strokeWidth={1.5} size={24} />
                <h2 className="text-base font-medium">Mute Notifications</h2>
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
