import FriendRequestSection from "./FriendRequestSection.jsx";
import Profile from "./Profile.jsx";

const ProfileGeneral = () => {
  return (
    <div className="flex flex-col xl:flex-row h-full w-full overflow-hidden">
      {/* Profile section - hidden on small screens, shown as sidebar on larger screens */}
      <div className="hidden xl:block xl:w-1/3 border-r border-gray-200 dark:border-gray-700">
        <Profile />
      </div>

      {/* Friend section - full width on mobile, 2/3 width on desktop */}
      <div className="flex-1 xl:w-2/3 pb-16 lg:pb-0">
        <FriendRequestSection />
      </div>
    </div>
  );
};
export default ProfileGeneral;
