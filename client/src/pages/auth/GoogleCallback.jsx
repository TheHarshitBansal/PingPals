import React, { useEffect, useState } from "react";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "@/redux/slices/authSlice.js";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Processing your request...");
  const dispatch = useDispatch();

  useEffect(() => {
    const processGoogleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        if (error) {
          setStatus("error");
          setMessage("Authentication was cancelled or failed.");
          setTimeout(() => navigate("/auth/login"), 3000);
          return;
        }

        if (!code) {
          setStatus("error");
          setMessage("No authorization code received.");
          setTimeout(() => navigate("/auth/login"), 3000);
          return;
        }

        setMessage("Verifying your Google account...");

        const result = await fetch(
          `${import.meta.env.VITE_BASE_URL}/auth/google`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          }
        )
          .then((res) => res.json())
          .then((data) => {
            dispatch(
              addUser({
                user: data.user,
                token: data.token,
                isAuthenticated: true,
              })
            );
            navigate("/");
          })
          .catch((err) => {
            console.error("Login error", err);
            navigate("/login?error=auth_failed");
          });

        setStatus("success");
        setMessage("Successfully authenticated! Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      } catch (err) {
        console.error("Google Auth Error:", err);
        setStatus("error");
        setMessage(
          err?.data?.message || "Authentication failed. Please try again."
        );
        setTimeout(() => navigate("/auth/login"), 3000);
      }
    };

    processGoogleCallback();
  }, [navigate]);

  const renderStatusIcon = () => {
    switch (status) {
      case "processing":
        return (
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
            <div className="relative rounded-full bg-blue-500/10 p-4">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
          </div>
        );
      case "success":
        return (
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-pulse"></div>
            <div className="relative rounded-full bg-green-500/10 p-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
        );
      case "error":
        return (
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse"></div>
            <div className="relative rounded-full bg-red-500/10 p-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-6">
          <div className="flex justify-center">{renderStatusIcon()}</div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {status === "processing" && "Connecting to Google"}
              {status === "success" && "Authentication Successful!"}
              {status === "error" && "Authentication Failed"}
            </h1>
            <p className="text-muted-foreground text-lg">{message}</p>
          </div>

          {status === "processing" && (
            <div className="space-y-3">
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your credentials...
              </p>
            </div>
          )}

          {status === "success" && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Welcome to PingPals! Taking you to your dashboard...
            </p>
          )}

          {status === "error" && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Redirecting you back to the login page...
            </p>
          )}
        </div>

        {status === "processing" && (
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
