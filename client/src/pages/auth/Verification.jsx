import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ThemeChangeDialog from "@/components/ThemeChangeDialog.jsx";
import { Loader2, Pencil } from "lucide-react";
import Logo from "@/assets/logo.png";
import { useParams } from "react-router-dom";
import { useVerifyUserMutation } from "@/redux/api/authApi.js";

const otpSchema = yup.object({
  otp: yup
    .string()
    .length(4, "OTP must be 4 digits")
    .required("OTP is required"),
});

const Verification = () => {
  const [verifyUser, { isLoading: loading }] = useVerifyUserMutation();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isLoading },
  } = useForm({
    resolver: yupResolver(otpSchema),
  });

  const [resendTimer, setResendTimer] = useState(30);
  const otpValues = watch("otp") || "";
  const inputsRef = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = otpValues.split("");
    newOtp[index] = value;
    setValue("otp", newOtp.join(""));
    if (value && index < 3) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const username = useParams().username;
  const onSubmit = async (data) => {
    await verifyUser({ ...data, username });
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-start pt-52 gap-y-3">
      <ThemeChangeDialog>
        <Button className="absolute bottom-5 right-5 w-fit" variant="outline">
          <Pencil />
        </Button>
      </ThemeChangeDialog>
      <img src={Logo} className="w-32 h-32" />
      <div className="flex flex-col w-[30%] gap-y-5 items-center">
        <h1 className="text-3xl font-semibold">Enter OTP</h1>
        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
          We've sent a 4-digit OTP to your email.
        </h3>
        <form
          className="flex flex-col items-center gap-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex gap-x-2">
            {[0, 1, 2, 3].map((index) => (
              <Controller
                key={index}
                name="otp"
                control={control}
                render={() => (
                  <input
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center border rounded-lg text-xl bg-transparent outline-none"
                    value={otpValues[index] || ""}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(el) => (inputsRef.current[index] = el)}
                  />
                )}
              />
            ))}
          </div>
          {errors.otp && (
            <p className="text-red-500 text-sm font-semibold">
              {errors.otp.message}
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
              Verify OTP
            </Button>
          )}
        </form>
        <div className="text-sm font-semibold">
          {resendTimer > 0 ? (
            <p>Resend OTP in {resendTimer}s</p>
          ) : (
            <Button
              variant="link"
              className="text-blue-500 dark:text-blue-400"
              onClick={() => setResendTimer(30)}
            >
              Resend OTP
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verification;
