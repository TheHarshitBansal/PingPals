import React, { lazy, useEffect, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import HomePage from "./pages/HomePage.jsx";
import Settings from "./pages/settings/Settings.jsx";
import Login from "./pages/auth/Login.jsx";
const Dashboard = lazy(() => import("./layouts/Dashboard.jsx"));
const GeneralApp = lazy(() => import("./pages/dashboard/GeneralApp.jsx"));

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
        <Route path="/auth/login" element={<Login />} />
        <Route path="/" element={<Dashboard />}>
          <Route index element={<HomePage />} />
          <Route path="chat" element={<GeneralApp />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </Suspense>
  );
};

export default App;
