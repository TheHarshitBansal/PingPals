import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./layouts/Dashboard.jsx";
import GeneralApp from "./pages/dashboard/GeneralApp.jsx";

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
    <Routes>
      <Route path="/" element={<Dashboard />}>
        <Route index element={<GeneralApp />} />
      </Route>
    </Routes>
  );
};

export default App;
