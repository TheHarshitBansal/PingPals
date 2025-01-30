import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import users from "@/data/users.js";
import { Avatar, AvatarImage } from "@/components/ui/avatar.jsx";

const CreateNewGroup = ({ children }) => {
  const [open, setOpen] = useState(false);

  const createSchema = yup
    .object({
      name: yup.string().required("Group name is required"),
      description: yup
        .string()
        .min(20, "Group description must have 20 letters")
        .required("Group description is required"),
      members: yup.array().min(1, "Group must have at least one member"),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
    clearErrors,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(createSchema),
  });

  const [members, setMembers] = useState([]);

  // INFO:Handle adding members
  const addMember = (member) => {
    if (!members.includes(member)) {
      const updatedMembers = [...members, member];
      setMembers(updatedMembers);
      setValue("members", updatedMembers);
      clearErrors("members");
    }
  };

  const nameValue = watch("name");
  const descriptionValue = watch("description");

  useEffect(() => {
    if (nameValue === "") clearErrors("name");
    if (descriptionValue === "") clearErrors("description");
    if (members.length === 0) clearErrors("members");
  }, [nameValue, descriptionValue, members]);

  useEffect(() => {
    if (!open) {
      reset();
      setMembers([]);
    }
  }, [open, reset]);

  const onSubmit = async (data) => {
    console.log(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="min-w-[40vw] w-fit max-w-[80vw]">
        <DialogHeader>
          <DialogTitle className="text-lg">Create New Group</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <form
            className="flex flex-col gap-y-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              placeholder="Group Name"
              className="px-4 py-6"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-xs font-semibold">
                {errors.name.message}
              </p>
            )}
            <Textarea
              placeholder="Group Description"
              className="p-4"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-red-500 text-xs font-semibold">
                {errors.description.message}
              </p>
            )}
            {/* Show selected members */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {members.map((member) => (
                <span
                  key={member.bio}
                  className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-lg flex items-center gap-1"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={member.avatar} alt={member.name} />
                  </Avatar>
                  {member.name}
                </span>
              ))}
            </div>

            {/* Member Selection */}
            <Command>
              <CommandInput placeholder="Search members..." />
              <CommandList>
                <CommandEmpty>No members found</CommandEmpty>
                <CommandGroup>
                  {users.map((member) => (
                    <CommandItem
                      key={member.name}
                      onSelect={() => addMember(member)}
                    >
                      {member.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>

            {errors.members && (
              <p className="text-red-500 text-xs font-semibold">
                {errors.members.message}
              </p>
            )}

            {isSubmitting ? (
              <Button className="py-6 text-base font-semibold" disabled>
                <Loader2 className="animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" className="py-6 text-base font-semibold">
                Create Group
              </Button>
            )}
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewGroup;
