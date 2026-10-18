import { Navigate } from "react-router-dom";

const Spices = () => {
  return <Navigate to="/marketplace?category=spices" replace />;
};

export default Spices;