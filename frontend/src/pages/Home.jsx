import Categories from "../components/Categories";
import Footer from "../components/Footer";
import HeroSection from "../components/HomeSection";
import MissionSection from "../components/MissionSection";
import Navbar from "../components/Navbar";
import ProductsSection from "../components/ProductsSection";
import WelcomeSplash from "../components/WelcomeSplash";


const Home = () => {
  return (
    <>
      <WelcomeSplash />
      <Navbar />

      <main className="max-w-360 mx-auto px-6 pt-28 pb-10 space-y-24">

        <HeroSection />

        <Categories />

        <MissionSection />

        <ProductsSection />

      </main>

      <Footer />
    </>
  );
};

export default Home;