import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const FarmerRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/sign-in" />;
  }

  if (user.role !== "farmer") {
    return <Navigate to="/" />;
  }

  return children;
};

export default FarmerRoute;