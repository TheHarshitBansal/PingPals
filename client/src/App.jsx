import React, { lazy, useEffect, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import RequireAuth from "./components/auth/RequireAuth.jsx";
import NotRequireAuth from "./components/auth/NotRequireAuth.jsx";
import NotFound from "./pages/NotFound.jsx";
const ProfileGeneral = lazy(() => import("./pages/profile/ProfileGeneral.jsx"));
const Verification = lazy(() => import("./pages/auth/Verification.jsx"));
const CallLog = lazy(() => import("./pages/call/CallLog.jsx"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword.jsx"));
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const Settings = lazy(() => import("./pages/settings/Settings.jsx"));
const Login = lazy(() => import("./pages/auth/Login.jsx"));
const Dashboard = lazy(() => import("./layouts/Dashboard.jsx"));
const GeneralApp = lazy(() => import("./pages/dashboard/GeneralApp.jsx"));
const Register = lazy(() => import("./pages/auth/Register.jsx"));

const App = () => {
  useEffect(() => {
    const colorMode = JSON.parse(window.localStorage.getItem("colorMode"));
    const className = "dark";

    const bodyClass = window.document.body.classList;

    colorMode === "dark"
      ? bodyClass.add(className)
      : bodyClass.remove(className);
  }, []);
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      }
    >
      <Routes>
        <Route element={<NotRequireAuth />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/verify/:username" element={<Verification />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/auth/reset-password/:resetToken"
            element={<ResetPassword />}
          />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Dashboard />}>
            <Route index element={<HomePage />} />
            <Route path="chat" element={<GeneralApp />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<ProfileGeneral />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
