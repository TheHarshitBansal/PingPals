import Profile from "./Profile.jsx";

const ProfileGeneral = () => {
  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Profile section - now takes full width */}
      <div className="w-full pb-16 lg:pb-0">
        <Profile />
      </div>
    </div>
  );
};
export default ProfileGeneral;
