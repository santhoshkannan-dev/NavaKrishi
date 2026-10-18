import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import SupportHero from "../components/support/SupportHero";
import SupportCategories from "../components/support/SupportCategories";
import ContactSupport from "../components/support/ContactSupport";
import SupportFAQ from "../components/support/SupportFAQ";
import SupportFeaturedArticles from "../components/support/SupportFeaturedArticles";

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <Navbar />

      <main className="pt-20">

        <SupportHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <SupportCategories onSelectTopic={setSearchQuery} />

        <SupportFeaturedArticles onSelectTopic={setSearchQuery} />

        <SupportFAQ searchQuery={searchQuery} />

        <ContactSupport />
      </main>

      <Footer />
    </>
  );
};

export default Support;