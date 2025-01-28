import { useSelector } from "react-redux";
import { lazy, Suspense } from "react";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
const ProfileSidebar = lazy(() => import("./ProfileSidebar.jsx"));
const Chats = lazy(() => import("./Chats.jsx"));
const MessageView = lazy(() => import("./MessageView.jsx"));
const StarredSidebar = lazy(() => import("./StarredSidebar.jsx"));
const SharedSidebar = lazy(() => import("./SharedSidebar.jsx"));

const GeneralApp = () => {
  const sidebar = useSelector((state) => state.app.sidebar);
  return (
    <div className="flex h-screen w-full">
      {/* Chats */}
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen w-full">
            <LoadingSpinner />
          </div>
        }
      >
        <Chats />
      </Suspense>

      {/* Chat Messages */}
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen w-4/5">
            <LoadingSpinner />
          </div>
        }
      >
        <MessageView />
      </Suspense>

      {/* Chat Profile */}
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen w-1/4">
            <LoadingSpinner />
          </div>
        }
      >
        {sidebar.isOpen && sidebar.type === "PROFILE" && <ProfileSidebar />}
        {sidebar.isOpen && sidebar.type === "STARRED" && <StarredSidebar />}
        {sidebar.isOpen && sidebar.type === "SHARED" && <SharedSidebar />}
      </Suspense>
    </div>
  );
};
export default GeneralApp;
