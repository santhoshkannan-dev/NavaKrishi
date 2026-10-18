import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SeasonalHero from "../../components/seasonal/SeasonalHero";
import HarvestCalendar from "../../components/seasonal/HarvestCalendar";
import SeasonalProducts from "../../components/seasonal/SeasonalProducts";
import ScrollTriggered from "../../components/seasonal/ScrollTriggered";
import AIKitchenAssistant from "../../components/seasonal/AIKitchenAssistant";

const SeasonalDiscovery = () => {
  return (
    <>
      <Navbar />

      <main className="max-w-360 mx-auto px-6 pt-32 pb-24 space-y-24">
        <SeasonalHero />
        <HarvestCalendar />
        <SeasonalProducts />
        <ScrollTriggered />
        <AIKitchenAssistant />
      </main>

      <Footer />
    </>
  );
};

export default SeasonalDiscovery;