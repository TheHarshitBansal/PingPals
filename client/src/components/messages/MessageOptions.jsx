import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  ArrowBendDoubleUpRight,
  ArrowBendUpLeft,
  Star,
  Trash,
} from "@phosphor-icons/react";

const MessageOptions = ({ children }) => {
  const colorMode = JSON.parse(window.localStorage.getItem("colorMode"));

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem className="flex items-center space-x-2">
          <ArrowBendUpLeft />
          <p>Reply</p>
        </ContextMenuItem>
        <ContextMenuItem className="flex items-center space-x-2">
          <ArrowBendDoubleUpRight />
          <p>Forward</p>
        </ContextMenuItem>
        <ContextMenuItem className="flex items-center space-x-2">
          <Star />
          <p>Star</p>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="flex items-center space-x-2">
          <Trash />
          <p>Delete</p>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
export default MessageOptions;
