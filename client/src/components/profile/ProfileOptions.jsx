import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast.js";
import { removeUser } from "@/redux/slices/authSlice.js";
import { LogOut, RectangleEllipsis, User } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ChangePassword from "../auth/ChangePassword.jsx";

const ProfileOptions = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(removeUser());
    toast({ variant: "success", title: "Logged Out Successfully" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="cursor-pointer">
          <div
            className="flex items-center space-x-2"
            onClick={() => navigate("/profile")}
          >
            <User size={20} />
            <p>My Profile</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ChangePassword>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(e) => e.preventDefault()}
          >
            <button className="flex items-center space-x-2">
              <RectangleEllipsis size={20} />
              <p>Change Password</p>
            </button>
          </DropdownMenuItem>
        </ChangePassword>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
          <div className="flex items-center space-x-2">
            <LogOut size={20} />
            <p>Logout</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default ProfileOptions;
