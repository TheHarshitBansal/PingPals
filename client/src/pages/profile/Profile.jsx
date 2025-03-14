import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { User } from "lucide-react";
import { useState } from "react";
import * as yup from "yup";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSelector } from "react-redux";
import { useUpdateProfileMutation } from "@/redux/api/authApi.js";

const Profile = () => {
  const auth = useSelector((state) => state.auth);
  const [updateProfile, { isLoading: loading }] = useUpdateProfileMutation();

  const profileSchema = yup
    .object({
      name: yup.string().required("Name is required"),
      username: yup
        .string()
        .required("Username is required")
        .matches(/^[a-z0-9_-]{3,30}$/, "Invalid username"),
      about: yup.string(),
      avatar: yup.mixed(),
    })
    .required();

  const initialValues = {
    name: auth?.user?.name,
    username: auth?.user?.username,
    about: auth?.user?.about,
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: initialValues,
  });

  const [avatar, setAvatar] = useState(auth?.user?.avatar || null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setAvatar(reader.result);
    };

    setValue("avatar", file);
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("username", data.username);
    formData.append("about", data.about);

    if (data.avatar instanceof File) {
      formData.append("avatar", data.avatar);
    }
    updateProfile(formData);
  };

  return (
    <div className="relative h-screen min-w-80 max-w-80 shadow-light dark:shadow-dark flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-5 flex-shrink-0 mb-10">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col px-5 items-center justify-center space-y-5">
          <label htmlFor="image" className="mb-5 hover:opacity-70">
            {avatar ? (
              <Avatar className="cursor-pointer h-32 w-32">
                <AvatarImage src={avatar} loading="lazy" />
                <AvatarFallback>
                  <Skeleton className="h-32 w-32 rounded-full" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <User className="h-24 w-24 p-2 cursor-pointer text-gray-500 rounded-full border-2 border-gray-500 dark:border-gray-400 dark:text-gray-400" />
            )}
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <div className="flex flex-col w-full space-y-2">
            <Input
              type="text"
              placeholder="Username"
              className="py-6 px-4"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-red-500 text-xs font-semibold">
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Input
              type="text"
              placeholder="Name"
              className="py-6 px-4"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-xs font-semibold">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Input
              type="text"
              placeholder="About"
              className="py-6 px-4"
              {...register("about")}
            />
            {errors.about && (
              <p className="text-red-500 text-xs font-semibold">
                {errors.about.message}
              </p>
            )}
          </div>
          {isSubmitting || loading ? (
            <Button className="py-4 text-sm font-semibold self-end" disabled>
              <Loader2 className="animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              type="submit"
              className="py-4 text-sm font-semibold self-end"
            >
              Update Profile
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
export default Profile;
