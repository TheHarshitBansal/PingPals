import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useDeleteMessageMutation } from "@/redux/api/chatApi.js";
import { Star, Trash } from "@phosphor-icons/react";
import { useSelector } from "react-redux";

const MessageOptions = ({ children, messageId, incoming }) => {
  const [deleteMessage] = useDeleteMessageMutation();

  const chat = useSelector((state) => state.conversation.currentConversation);
  const chatId = chat?._id;

  const handleDelete = () => {
    deleteMessage({ chatId, messageId });
  };

  if (incoming) return children;

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem className="flex items-center space-x-2">
          <Star />
          <p>Star</p>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="flex items-center space-x-2"
          onClick={handleDelete}
        >
          <Trash />
          <p>Delete</p>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
export default MessageOptions;
