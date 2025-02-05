import FriendRequestSection from "./FriendRequestSection.jsx";
import Profile from "./Profile.jsx";

const ProfileGeneral = () => {
  return (
    <div className="flex h-full w-full">
      <Profile />
      <FriendRequestSection />
    </div>
  );
};
export default ProfileGeneral;
