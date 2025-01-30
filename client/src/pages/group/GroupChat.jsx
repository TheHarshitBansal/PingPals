import { Input } from "@/components/ui/input.jsx";
import { ChatElement } from "../dashboard/Chats.jsx";
import users from "@/data/users.js";
import { Plus } from "lucide-react";
import CreateNewGroup from "./CreateNewGroup.jsx";

const GroupChat = () => {
  return (
    <div className="relative h-screen min-w-80 max-w-80 shadow-light dark:shadow-dark flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold">Groups</h1>
      </div>

      {/* Search Box */}
      <div className="px-5 flex-shrink-0">
        <Input placeholder="Search" className="mb-2" />
      </div>

      {/* Create New Group */}
      <CreateNewGroup>
        <div className="mx-5 px-5 rounded-sm flex items-center justify-between py-5 flex-shrink-0 text-blue-500 dark:text-blue-400 cursor-pointer font-medium hover:bg-gray-50 dark:hover:bg-gray-900">
          <h3>Create New Group</h3>
          <Plus size={24} />
        </div>
      </CreateNewGroup>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-5 no-scrollbar">
        {users.map((user, index) => (
          <ChatElement
            key={index}
            name={user.name}
            message={user.message}
            avatar={user.avatar}
            time={user.time}
            badge={user.badge}
            online={user.online}
          />
        ))}
      </div>
    </div>
  );
};
export default GroupChat;
