import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import AboutHero from "../components/about/AboutHero";
import AISection from "../components/about/AISection";
import FeaturedFarmers from "../components/about/FeaturedFarmers";
import Roadmap from "../components/about/Roadmap";
import AboutCTA from "../components/about/AboutCTA";

const About = () => {
  return (
    <>
      <Navbar />

      <main className="pt-20">

        <AboutHero />

        <AISection />

        <FeaturedFarmers />

        <Roadmap />

        <AboutCTA />
      </main>

      <Footer />
    </>
  );
};

export default About;