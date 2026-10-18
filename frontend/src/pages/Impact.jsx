import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import ImpactHero from "../components/impact/ImpactHero";
import AnalyticsGrid from "../components/impact/AnalyticsGrid";
import TripleBottomLine from "../components/impact/TripleBottomLine";
import ImpactCTA from "../components/impact/ImpactCTA";

const Impact = () => {
  return (
    <>
      <Navbar />

      <main className="pt-20">

        <ImpactHero />

        <AnalyticsGrid />

        <TripleBottomLine />

        <ImpactCTA />
      </main>

      <Footer />
    </>
  );
};

export default Impact;