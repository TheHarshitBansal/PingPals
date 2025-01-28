import React, { lazy, useEffect, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
const Dashboard = lazy(() => import("./layouts/Dashboard.jsx"));
const GeneralApp = lazy(() => import("./pages/dashboard/GeneralApp.jsx"));
const Profile = lazy(() => import("./pages/profile/Profile.jsx"));

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
        <Route path="/" element={<Dashboard />}>
          <Route index element={<GeneralApp />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
