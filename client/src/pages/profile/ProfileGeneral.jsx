import FriendRequestSection from "./FriendRequestSection.jsx";
import Profile from "./Profile.jsx";

const ProfileGeneral = () => {
  return (
    <div className="flex flex-col lg:flex-row h-full w-full">
      <Profile />
      <FriendRequestSection />
    </div>
  );
};
export default ProfileGeneral;
