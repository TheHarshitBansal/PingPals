import Logo from "@/assets/logo.png";
import ThemeChangeDialog from "@/components/ThemeChangeDialog.jsx";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOff, InfoIcon, Loader2, Moon, Sun } from "lucide-react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRegisterUserMutation } from "@/redux/api/authApi.js";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [registerUser, { isLoading: loading, isSuccess }] =
    useRegisterUserMutation();

  const registerSchema = yup
    .object({
      name: yup.string().required("Name is required").trim(),
      username: yup
        .string()
        .required("Username is required")
        .matches("^[a-z0-9_-]{3,30}$", "Invalid Username")
        .trim(),
      email: yup
        .string()
        .email("Enter a valid Email Address")
        .required("Email is required")
        .trim(),
      password: yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters long")
        .matches(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
          "Password must have an alphabet, a special symbol and a number"
        ),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading },
    watch,
    clearErrors,
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const values = watch();

  useEffect(() => {
    if (values.email === "") {
      clearErrors("email");
    }
    if (values.password === "") {
      clearErrors("password");
    }
    if (values.name === "") {
      clearErrors("name");
    }
    if (values.username === "") {
      clearErrors("username");
    }
  }, [
    values.email,
    values.name,
    values.password,
    values.username,
    clearErrors,
  ]);

  useEffect(() => {
    if (isSuccess) {
      navigate(`/auth/verify/${values.username}`);
    }
  }, [isSuccess]);

  const onSubmit = async (data) => {
    await registerUser(data);
  };

  return (
    <div className="relative w-screen min-h-screen flex flex-col items-center justify-start pt-6 sm:pt-10 gap-y-3 px-4 sm:px-6">
      <ThemeChangeDialog>
        <Button className="absolute bottom-5 right-5 w-fit" variant="outline">
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
        </Button>
      </ThemeChangeDialog>
      <img src={Logo} className="w-24 h-24 sm:w-32 sm:h-32" />
      <div className="flex flex-col w-full max-w-sm sm:max-w-md lg:max-w-lg gap-y-3">
        <h1 className="text-2xl sm:text-3xl font-semibold">
          Register for PingPals
        </h1>
        <h3 className="text-base sm:text-lg font-medium">
          Existing User?{" "}
          <Link to={"/auth/login"}>
            <span className="text-blue-600 dark:text-blue-500">Login Here</span>
          </Link>
        </h3>
        <form
          className="flex flex-col gap-y-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-x-2">
            <div className="flex flex-col w-full sm:w-1/2 space-y-2">
              <input
                type="text"
                placeholder="Your Name"
                className="bg-transparent border p-3 sm:p-4 rounded-lg outline-none text-sm sm:text-base"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-xs font-semibold">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="flex flex-col w-full sm:w-1/2 space-y-2">
              <div className="flex items-center gap-x-2">
                <input
                  type="text"
                  placeholder="Username"
                  className="bg-transparent border p-3 sm:p-4 rounded-lg outline-none text-sm sm:text-base flex-1"
                  {...register("username")}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <InfoIcon
                        strokeWidth={1.5}
                        size={18}
                        className="sm:w-5 sm:h-5"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-xs font-semibold">
                        Users can find you using this username
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {errors.username && (
                <p className="text-red-500 text-xs font-semibold">
                  {errors.username.message}
                </p>
              )}
            </div>
          </div>

          <input
            type="text"
            placeholder="Email Address"
            className="bg-transparent border p-3 sm:p-4 rounded-lg outline-none text-sm sm:text-base"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs font-semibold">
              {errors.email.message}
            </p>
          )}
          <label className="bg-transparent flex items-center border pr-3 sm:pr-4 rounded-lg justify-between">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password")}
              className="bg-transparent w-full border-none outline-none p-3 sm:p-4 text-sm sm:text-base"
            />
            <span
              className="cursor-pointer"
              onClick={() => {
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? (
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
              Create Account
            </Button>
          )}
          <p className="text-xs text-center">
            By signing up, I agree to{" "}
            <Link className="font-semibold underline">Terms of Service</Link>{" "}
            and <Link className="font-semibold underline">Privacy Policy</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
export default Register;
