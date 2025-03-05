import { Button } from "@/components/ui/button.jsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.jsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.jsx";
import users from "@/data/users.js";
import { CheckIcon, ChevronsUpDown, Phone, Video } from "lucide-react";
import { useEffect, useState } from "react";

const MakeCallDialog = ({ children }) => {
  const [user, setUser] = useState("");
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!dialogOpen) {
      setUser("");
    }
  }, [dialogOpen]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[40%]">
        <DialogHeader>
          <DialogTitle className="text-lg">Make a Call</DialogTitle>
        </DialogHeader>
        <DialogDescription className="w-full" asChild>
          <Popover open={open} onOpenChange={setOpen} className="!w-full">
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {user ? user : "Select Contact..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command className="w-full">
                <CommandInput
                  placeholder="Search Contacts..."
                  className="h-9 w-full"
                />
                <CommandList className="w-full">
                  <CommandEmpty>No User found.</CommandEmpty>
                  <CommandGroup className="w-full">
                    {users.map((contact, idx) => (
                      <CommandItem
                        className="w-full flex justify-between items-center"
                        key={idx}
                        name={contact.name}
                        onSelect={(currentUser) => {
                          setUser(currentUser);
                          setOpen(false);
                        }}
                      >
                        {contact.name}
                        <CheckIcon
                          className={
                            user === contact.name ? "opacity-100" : "opacity-0"
                          }
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            className="text-green-500 dark:text-green-400 border border-green-500 dark:border-green-400 hover:bg-green-500 dark:hover:bg-green-400 hover:text-white hover:dark:text-white"
          >
            <Phone /> Voice Call
          </Button>
          <Button
            variant="outline"
            className="text-green-500 dark:text-green-400 border border-green-500 dark:border-green-400 hover:bg-green-500 dark:hover:bg-green-400 hover:text-white hover:dark:text-white"
          >
            <Video /> Video Call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default MakeCallDialog;
