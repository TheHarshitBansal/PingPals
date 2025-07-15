import Logo from "@/assets/logo.png";
import ThemeChangeDialog from "@/components/ThemeChangeDialog.jsx";
import { Button } from "@/components/ui/button";
import { ChevronLeft, EyeIcon, EyeOff, Loader2, Moon, Sun } from "lucide-react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useResetPasswordMutation } from "@/redux/api/authApi.js";

const ResetPassword = () => {
  const [resetPassword, { isLoading: loading, isSuccess }] =
    useResetPasswordMutation();

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const navigate = useNavigate();

  const resetSchema = yup
    .object({
      password: yup
        .string()
        .matches(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
          "Password must have an alphabet, a special symbol and a number"
        )
        .required("Password is required")
        .min(8, "Password must be at least 8 characters long"),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password"), null], "Passwords must match"),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading },
  } = useForm({
    resolver: yupResolver(resetSchema),
  });

  const { resetToken } = useParams();

  useEffect(() => {
    if (isSuccess) {
      navigate("/auth/login");
    }
  }, [isSuccess]);

  const onSubmit = async (data) => {
    await resetPassword({ ...data, token: resetToken });
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-start pt-6 sm:pt-10 gap-y-3 px-4 sm:px-6">
      <ThemeChangeDialog>
        <Button className="absolute bottom-5 right-5 w-fit" variant="outline">
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
        </Button>
      </ThemeChangeDialog>
      <img src={Logo} className="w-24 h-24 sm:w-32 sm:h-32" />
      <div className="flex flex-col w-full max-w-sm sm:max-w-md lg:max-w-lg gap-y-3">
        <h1 className="text-2xl sm:text-3xl font-semibold">Reset Password</h1>
        <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Kindly set your new password below.
        </h3>
        <form
          className="flex flex-col gap-y-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <label className="bg-transparent flex items-center border pr-3 sm:pr-4 rounded-lg justify-between">
            <input
              type={showPassword.password ? "text" : "password"}
              placeholder="New Password"
              {...register("password")}
              className="bg-transparent w-full border-none outline-none p-3 sm:p-4 text-sm sm:text-base"
            />
            <span
              className="cursor-pointer"
              onClick={() => {
                setShowPassword({
                  ...showPassword,
                  password: !showPassword.password,
                });
              }}
            >
              {showPassword.password ? (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </span>
          </label>
          {errors.password && (
            <p className="text-red-500 text-xs font-semibold">
              {errors.password.message}
            </p>
          )}

          <label className="bg-transparent flex items-center border pr-3 sm:pr-4 rounded-lg justify-between">
            <input
              type={showPassword.confirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              {...register("confirmPassword")}
              className="bg-transparent w-full border-none outline-none p-3 sm:p-4 text-sm sm:text-base"
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
              {showPassword.confirmPassword ? (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </span>
          </label>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs font-semibold">
              {errors.confirmPassword.message}
            </p>
          )}

          {isSubmitting || loading ? (
            <Button
              className="py-4 sm:py-6 text-sm sm:text-base font-semibold"
              disabled
            >
              <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
              Please wait
            </Button>
          ) : (
            <Button
              type="submit"
              className="py-4 sm:py-6 text-sm sm:text-base font-semibold"
              disabled={isLoading}
            >
              Reset Password
            </Button>
          )}

          <Link
            to="/auth/login"
            className="font-semibold underline flex items-center text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Return to Login
          </Link>
        </form>
      </div>
    </div>
  );
};
export default ResetPassword;
