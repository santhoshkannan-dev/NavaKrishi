import { Navigate } from "react-router-dom";

const Fruits = () => {
  return <Navigate to="/marketplace?category=fruits" replace />;
};

export default Fruits;