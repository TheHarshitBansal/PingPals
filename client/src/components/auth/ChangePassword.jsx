import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EyeIcon, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "../ui/button.jsx";
import { useChangePasswordMutation } from "@/redux/api/authApi.js";

const ChangePassword = ({ children }) => {
  const [changePassword, { isLoading: loading }] = useChangePasswordMutation();

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [open, setOpen] = useState(false);

  const schema = yup
    .object({
      currentPassword: yup
        .string()
        .required("Current Password is required")
        .matches(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
          "Password must have an alphabet, a special symbol and a number"
        )
        .min(8, "Password must be at least 8 characters long"),
      newPassword: yup
        .string()
        .required("New Password is required")
        .min(8, "Password must be at least 8 characters long")
        .matches(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
          "Password must have an alphabet, a special symbol and a number"
        ),
      confirmPassword: yup
        .string()
        .required("Confirm Password is required")
        .oneOf([yup.ref("newPassword"), null], "Passwords must match"),
    })
    .required();

  const {
    register,
    clearErrors,
    watch,
    handleSubmit,
    resetField,
    formState: { isLoading, errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const values = watch();

  useEffect(() => {
    if (values.newPassword === "") {
      clearErrors("newPassword");
    }
    if (values.confirmPassword === "") {
      clearErrors("confirmPassword");
    }
    if (values.currentPassword === "") {
      clearErrors("currentPassword");
    }
  }, [
    values.confirmPassword,
    values.newPassword,
    values.currentPassword,
    clearErrors,
  ]);

  useEffect(() => {
    if (!open) {
      resetField("currentPassword");
      resetField("newPassword");
      resetField("confirmPassword");
    }
  }, [open, resetField]);

  const onSubmit = async (data) => {
    await changePassword(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <form
            className="flex flex-col gap-y-3"
            onSubmit={handleSubmit(onSubmit)}
          >
            <label className="bg-transparent flex items-center border pr-4 rounded-lg justify-between">
              <input
                type={showPassword.currentPassword ? "text" : "password"}
                placeholder="Current Password"
                {...register("currentPassword")}
                className="bg-transparent w-full border-none outline-none p-4 "
              />
              <span
                className="cursor-pointer"
                onClick={() => {
                  setShowPassword({
                    ...showPassword,
                    currentPassword: !showPassword.currentPassword,
                  });
                }}
              >
                {showPassword.currentPassword ? <EyeOff /> : <EyeIcon />}
              </span>
            </label>
            {errors.currentPassword && (
              <p className="text-red-500 text-xs font-semibold">
                {errors.currentPassword.message}
              </p>
            )}
            <label className="bg-transparent flex items-center border pr-4 rounded-lg justify-between">
              <input
                type={showPassword.newPassword ? "text" : "password"}
                placeholder="New Password"
                {...register("newPassword")}
                className="bg-transparent w-full border-none outline-none p-4 "
              />
              <span
                className="cursor-pointer"
                onClick={() => {
                  setShowPassword({
                    ...showPassword,
                    newPassword: !showPassword.newPassword,
                  });
                }}
              >
                {showPassword.newPassword ? <EyeOff /> : <EyeIcon />}
              </span>
            </label>
            {errors.newPassword && (
              <p className="text-red-500 text-xs font-semibold">
                {errors.newPassword.message}
              </p>
            )}
            <label className="bg-transparent flex items-center border pr-4 rounded-lg justify-between">
              <input
                type={showPassword.confirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                {...register("confirmPassword")}
                className="bg-transparent w-full border-none outline-none p-4 "
              />
              <span
                className="cursor-pointer"
                onClick={() => {
                  setShowPassword({
                    ...showPassword,
                    confirmPassword: !showPassword.confirmPassword,
                  });
                }}
              >
                {showPassword.confirmPassword ? <EyeOff /> : <EyeIcon />}
              </span>
            </label>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs font-semibold">
                {errors.confirmPassword.message}
              </p>
            )}
            {isSubmitting || loading ? (
              <Button className="py-6 text-base font-semibold" disabled>
                <Loader2 className="animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button
                type="submit"
                className="py-6 text-base font-semibold"
                disabled={isLoading}
              >
                Change Password
              </Button>
            )}
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
export default ChangePassword;
