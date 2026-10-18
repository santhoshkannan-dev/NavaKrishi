import { Navigate } from "react-router-dom";

const Grains = () => {
  return <Navigate to="/marketplace?category=grains-pulses" replace />;
};

export default Grains;