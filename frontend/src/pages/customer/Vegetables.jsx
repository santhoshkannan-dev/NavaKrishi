import { Navigate } from "react-router-dom";

const Vegetables = () => {
  return <Navigate to="/marketplace?category=vegetables" replace />;
};

export default Vegetables;