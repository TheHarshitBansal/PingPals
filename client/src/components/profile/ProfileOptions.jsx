import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileOptions = ({ children }) => {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <User size={20} />
            <p>My Profile</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <div className="flex items-center space-x-2 cursor-pointer">
            <LogOut size={20} />
            <p>Logout</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default ProfileOptions;
