import Logo from "@/assets/logo.png";
import ThemeChangeDialog from "@/components/ThemeChangeDialog.jsx";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, Pencil } from "lucide-react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const forgotSchema = yup
    .object({
      email: yup
        .string()
        .email("Enter a valid Email Address")
        .required("Email is required")
        .trim(),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading },
  } = useForm({
    resolver: yupResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    console.log(data);
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-start pt-10 gap-y-3">
      <ThemeChangeDialog>
        <Button className="absolute bottom-5 right-5 w-fit" variant="outline">
          <Pencil />
        </Button>
      </ThemeChangeDialog>
      <img src={Logo} className="w-32 h-32" />
      <div className="flex flex-col w-[30%] gap-y-3">
        <h1 className="text-3xl font-semibold">Forgot Password?</h1>
        <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Kindly enter the email address associated with your account to receive
          the password reset link.
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
              Send Link
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
export default ForgotPassword;
