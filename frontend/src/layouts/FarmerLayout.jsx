import FarmerSidebar from "../components/farmer/FarmerSidebar";
import FarmerHeader from "../components/farmer/FarmerHeader";

const FarmerLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#fbf9f8] flex">
      <FarmerSidebar />

      <div className="flex-1 ml-[270px] p-8">
        <FarmerHeader />

        <div className="mt-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FarmerLayout;