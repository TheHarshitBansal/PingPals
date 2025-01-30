import Logo from "@/assets/logo.png";
import ThemeChangeDialog from "@/components/ThemeChangeDialog.jsx";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator.jsx";
import { GoogleLogo, LinkedinLogo, GithubLogo } from "@phosphor-icons/react";
import { EyeIcon, EyeOff, Loader2, Pencil } from "lucide-react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = yup
    .object({
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
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
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
    resolver: yupResolver(loginSchema),
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

  useEffect(() => {
    if (emailValue === "") {
      clearErrors("email");
    }
    if (passwordValue === "") {
      clearErrors("password");
    }
  }, [emailValue, passwordValue, clearErrors]);

  const onSubmit = async (data) => {};

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-start pt-10 gap-y-3">
      <ThemeChangeDialog>
        <Button className="absolute bottom-5 right-5 w-fit" variant="outline">
          <Pencil />
        </Button>
      </ThemeChangeDialog>
      <img src={Logo} className="w-32 h-32" />
      <div className="flex flex-col w-[30%] gap-y-3">
        <h1 className="text-3xl font-semibold">Login to PingPals</h1>
        <h3 className="text-lg font-medium">
          New User?{" "}
          <Link to={"/auth/register"}>
            <span className="text-blue-600 dark:text-blue-500">
              Create an account
            </span>
          </Link>
        </h3>
        <form
          className="flex flex-col gap-y-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            type="text"
            placeholder="Email Address"
            className="bg-transparent border p-4 rounded-lg outline-none"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs font-semibold">
              {errors.email.message}
            </p>
          )}
          <label className="bg-transparent flex items-center border pr-4 rounded-lg justify-between">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password")}
              className="bg-transparent w-full border-none outline-none p-4"
            />
            <span
              className="cursor-pointer"
              onClick={() => {
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? <EyeOff /> : <EyeIcon />}
            </span>
          </label>
          {errors.password && (
            <p className="text-red-500 text-xs font-semibold">
              {errors.password.message}
            </p>
          )}
          <Link
            to={"/auth/forgot-password"}
            className="text-right underline cursor-pointer"
          >
            Forgot Password?
          </Link>
          {isSubmitting ? (
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
              Login
            </Button>
          )}
        </form>
        <div className="flex items-center justify-center gap-x-5 overflow-x-hidden my-5">
          <Separator /> <p>OR</p> <Separator />
        </div>
        <div className="flex justify-center gap-x-4">
          <button>
            <GoogleLogo className="w-8 h-8 text-red-400" />
          </button>
          <button>
            <GithubLogo className="w-8 h-8" />
          </button>
          <button>
            <LinkedinLogo className="w-8 h-8 text-blue-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login;
