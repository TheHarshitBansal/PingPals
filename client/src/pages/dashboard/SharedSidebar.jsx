import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setSidebarType } from "@/redux/slices/appSlice.js";
import { ChevronLeft, Image, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Text from "@/components/messages/Text.jsx";
import LazyImage from "@/components/LazyImage.jsx";

const SharedSidebarLinks = ({ links }) => {
  const user = useSelector((state) => state?.auth?.user);
  return (
    <div className="w-full flex flex-col gap-2 py-1 px-2">
      {links.length > 0 ? (
        links.map((link, index) => (
          <Text
            key={index}
            content={link.content}
            incoming={link.receiver === user._id}
          />
        ))
      ) : (
        <p className="text-gray-500 text-center text-sm">No shared links</p>
      )}
    </div>
  );
};

const SharedSidebarMedia = ({ media }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const handleOpenMedia = (media) => {
    setSelectedMedia(media);
  };

  const handleCloseMedia = () => {
    setSelectedMedia(null);
  };

  return (
    <>
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 py-1 px-2">
        {media.length > 0 ? (
          media.map((file, index) => {
            const parsedFile = JSON.parse(file.file);
            const fileUrl = parsedFile.path;
            const fileType = fileUrl.split(".").pop().toLowerCase();

            return fileType.match(/(jpg|jpeg|png|gif|webp)$/) ? (
              // Render Image
              <div
                onClick={() => handleOpenMedia(file)}
                className="cursor-pointer"
              >
                <LazyImage
                  src={fileUrl}
                  alt="media"
                  key={index}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover cursor-pointer"
                />
              </div>
            ) : fileType.match(/(mp4|webm|ogg)$/) ? (
              // Render Video
              <video
                key={index}
                src={fileUrl}
                autoPlay={false}
                onClick={() => handleOpenMedia(file)}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover cursor-pointer"
              />
            ) : (
              <LazyImage
                src={fileUrl}
                alt="media"
                key={index}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover cursor-pointer"
              />
            );
          })
        ) : (
          <p className="text-gray-500 text-center col-span-2 sm:col-span-3 text-sm">
            No shared media
          </p>
        )}
      </div>

      {/* Fullscreen Media Viewer */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          {/* Close Button */}
          <button
            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-gray-700 text-white p-1.5 sm:p-2 rounded-full"
            onClick={handleCloseMedia}
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>

          <div className="flex items-center justify-center w-[95vw] h-[90vh] sm:w-[90vw]">
            {(() => {
              const fileUrl = JSON.parse(selectedMedia.file).path;
              const fileType = fileUrl.split(".").pop().toLowerCase();

              if (fileType.match(/(jpg|jpeg|png|gif|webp)$/)) {
                return (
                  <img
                    src={fileUrl}
                    alt="media"
                    className="w-auto h-auto max-w-[95vw] max-h-[85vh] sm:max-w-[90vw] sm:max-h-[90vh] object-contain rounded-lg"
                  />
                );
              } else if (fileType.match(/(mp4|webm|ogg)$/)) {
                return (
                  <video
                    src={fileUrl}
                    controls
                    autoPlay
                    className="w-auto h-auto max-w-[95vw] max-h-[85vh] sm:max-w-[90vw] sm:max-h-[90vh] object-contain rounded-lg"
                  />
                );
              } else {
                return (
                  <p className="text-white text-sm sm:text-base">
                    Unsupported file type
                  </p>
                );
              }
            })()}
          </div>
        </div>
      )}
    </>
  );
};

const SharedSidebar = () => {
  const dispatch = useDispatch();
  const chat = useSelector((state) => state?.conversation?.currentConversation);

  const links = chat?.messages?.filter((msg) =>
    msg.content?.match(/https?:\/\/\S+/)
  );
  const media = chat?.messages?.filter((msg) => msg.type === "Media");

  const handleProfile = () => {
    dispatch(setSidebarType("PROFILE"));
  };

  return (
    <div className="flex flex-col shadow-light dark:shadow-dark w-full xl:w-1/4 h-screen">
      <div className="sticky flex-shrink-0 border-b border-gray-300 dark:border-gray-700 flex items-center justify-start gap-x-2 w-full p-3 md:p-4 lg:p-6">
        <button onClick={handleProfile}>
          <ChevronLeft size={18} className="md:hidden" color="gray" />
          <ChevronLeft
            size={20}
            className="hidden md:block lg:hidden"
            color="gray"
          />
          <ChevronLeft size={24} className="hidden lg:block" color="gray" />
        </button>
        <div className="font-semibold text-base md:text-lg lg:text-xl">
          Shared Media
        </div>
      </div>

      <Tabs defaultValue="media" className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-2 gap-2 p-1 rounded-none flex-shrink-0">
          <TabsTrigger value="media" className="text-sm md:text-base">
            Media
          </TabsTrigger>
          <TabsTrigger value="links" className="text-sm md:text-base">
            Links
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="media"
          className="flex-1 overflow-y-scroll no-scrollbar"
        >
          <SharedSidebarMedia media={media} />
        </TabsContent>
        <TabsContent
          value="links"
          className="flex-1 overflow-y-scroll no-scrollbar"
        >
          <SharedSidebarLinks links={links} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SharedSidebar;
