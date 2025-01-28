import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { docsPreview, fakeImagesMedia, LinkPreviews } from "@/data/messages.js";
import { setSidebarType } from "@/redux/slices/appSlice.js";
import { ChevronLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import Text from "@/components/messages/Text.jsx";
import Document from "@/components/messages/Document.jsx";

// INFO: Shared Docs
const SharedSidebarDocs = () => {
  return (
    <div className="w-full grid grid-cols-1 gap-2 py-1 px-2">
      {docsPreview.map((doc, index) => (
        <Document
          key={index}
          fileName={doc.fileName}
          fileSize={doc.fileSize}
          incoming={doc.incoming}
        />
      ))}
    </div>
  );
};

// INFO: Shared Links
const SharedSidebarLinks = () => {
  return (
    <div className="w-full flex flex-col gap-2 py-1 px-2">
      {LinkPreviews.map((link, index) => (
        <Text key={index} content={link.content} incoming={link.incoming} />
      ))}
    </div>
  );
};

// INFO: Shared Media
const SharedSidebarMedia = () => {
  return (
    <div className="w-full grid grid-cols-3 gap-2 py-1 px-2">
      {fakeImagesMedia.map((image, index) =>
        image ? (
          <img
            src={image.url}
            alt={"test"}
            key={index}
            className="w-24 h-24 rounded-lg object-cover object-center"
          />
        ) : (
          <Skeleton key={index} className="w-24 h-24 rounded-lg" />
        )
      )}
    </div>
  );
};

// INFO: MAIN => SharedSidebar

const SharedSidebar = () => {
  const dispatch = useDispatch();

  const handleProfile = () => {
    dispatch(setSidebarType("PROFILE"));
  };

  return (
    <div className="flex flex-col shadow-light dark:shadow-dark w-1/4 h-screen">
      {/* //INFO: HEADER */}
      <div className="sticky flex-shrink-0 border-b border-gray-300 dark:border-gray-700 flex items-center justify-start gap-x-2 w-full p-6 ">
        <button onClick={handleProfile}>
          <ChevronLeft size={24} color="gray" />
        </button>
        <div className="font-semibold text-lg">Shared Media</div>
      </div>

      {/* //INFO: NAVIGATION MENU */}
      <Tabs defaultValue="media" className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-3 gap-2 p-1 rounded-none flex-shrink-0">
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="docs">Docs</TabsTrigger>
        </TabsList>
        <TabsContent
          value="media"
          className="flex-1 overflow-y-scroll no-scrollbar"
        >
          <SharedSidebarMedia />
        </TabsContent>
        <TabsContent
          value="links"
          className="flex-1 overflow-y-scroll no-scrollbar"
        >
          <SharedSidebarLinks />
        </TabsContent>
        <TabsContent
          value="docs"
          className="flex-1 overflow-y-scroll no-scrollbar"
        >
          <SharedSidebarDocs />
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default SharedSidebar;
