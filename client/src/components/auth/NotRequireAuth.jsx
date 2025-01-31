import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const NotRequireAuth = () => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <Outlet />;
  } else {
    return <Navigate to="/" />;
  }
};
export default NotRequireAuth;
