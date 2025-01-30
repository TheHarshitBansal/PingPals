import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const list = [
  {
    key: 0,
    title: "Mark as unread",
    combination: ["Cmd", "Shift", "U"],
  },
  {
    key: 1,
    title: "Mute",
    combination: ["Cmd", "Shift", "M"],
  },
  {
    key: 2,
    title: "Archive Chat",
    combination: ["Cmd", "Shift", "E"],
  },
  {
    key: 3,
    title: "Delete Chat",
    combination: ["Cmd", "Shift", "D"],
  },
  {
    key: 4,
    title: "Pin Chat",
    combination: ["Cmd", "Shift", "P"],
  },
  {
    key: 5,
    title: "Search",
    combination: ["Cmd", "F"],
  },
  {
    key: 6,
    title: "Search Chat",
    combination: ["Cmd", "Shift", "F"],
  },
  {
    key: 7,
    title: "Next Chat",
    combination: ["Cmd", "N"],
  },
  {
    key: 8,
    title: "Next Step",
    combination: ["Cmd", "Tab"],
  },
  {
    key: 9,
    title: "Previous Step",
    combination: ["Cmd", "Shift", "Tab"],
  },
  {
    key: 10,
    title: "New Group",
    combination: ["Cmd", "Shift", "N"],
  },
  {
    key: 11,
    title: "Profile & About",
    combination: ["Cmd", "P"],
  },
  {
    key: 12,
    title: "Increase speed of voice message",
    combination: ["Shift", "."],
  },
  {
    key: 13,
    title: "Decrease speed of voice message",
    combination: ["Shift", ","],
  },
  {
    key: 14,
    title: "Settings",
    combination: ["Shift", "S"],
  },
  {
    key: 15,
    title: "Emoji Panel",
    combination: ["Cmd", "E"],
  },
  {
    key: 16,
    title: "Sticker Panel",
    combination: ["Cmd", "S"],
  },
];

const Shortcut = ({ title, combination }) => {
  return (
    <div className="flex items-center justify-between w-full gap-x-10">
      <p className="text-base font-medium">{title}</p>
      <div className="flex gap-x-1">
        {combination.map((el) => (
          <div className="px-2 py-1 rounded-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-default">
            {el}
          </div>
        ))}
      </div>
    </div>
  );
};

const KeyboardShortcuts = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger className="w-full">{children}</DialogTrigger>
      <DialogContent className="max-w-[50vw] w-full">
        {" "}
        {/* Adjust width here */}
        <DialogHeader className="mb-5">
          <DialogTitle className="text-xl">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="grid grid-cols-2 gap-x-10 gap-y-4">
            {list.map((item) => (
              <Shortcut
                key={item.key}
                title={item.title}
                combination={item.combination}
              />
            ))}
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
export default KeyboardShortcuts;
