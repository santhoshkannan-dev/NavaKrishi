import PredictionHeader from "../../components/farmer/prediction/PredictionHeader";
import ScenarioParameters from "../../components/farmer/prediction/ScenarioParameters";
import AccuracyCard from "../../components/farmer/prediction/AccuracyCard";
import RevenueProjection from "../../components/farmer/prediction/RevenueProjection";
import RiskAssessment from "../../components/farmer/prediction/RiskAssessment";
import CropRecommendations from "../../components/farmer/prediction/CropRecommendations";
import DecisionSupport from "../../components/farmer/prediction/DecisionSupport";

const PredictionLab = () => {
  return (
    <div className="space-y-8 pb-20">

      <PredictionHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-4 space-y-8">

          <ScenarioParameters />

          <AccuracyCard />
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-8 space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <RevenueProjection />

            <RiskAssessment />
          </div>

          <CropRecommendations />

          <DecisionSupport />
        </div>
      </div>
    </div>
  );
};

export default PredictionLab;