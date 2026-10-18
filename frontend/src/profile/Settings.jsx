import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import SettingsSidebar from "../components/settings/SettingsSidebar";

import PersonalInfo from "../components/settings/PersonalInfo";
import ProfileCard from "../components/settings/ProfileCard";
import StorageCard from "../components/settings/StorageCard";
import SavedAddresses from "../components/settings/SavedAddresses";
import SecuritySettings from "../components/settings/SecuritySettings";
import OrderDetails from "../components/settings/OrderDetails";

const Settings = () => {
  return (
    <>
      <Navbar />

      <main className="max-w-360 mx-auto px-6 pt-28 pb-20">

        <div className="flex flex-col md:flex-row gap-8">

          <SettingsSidebar />

          <section className="flex-1 space-y-8">

            {/* Top Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

              <div id="personal-profile" className="xl:col-span-2">
                <PersonalInfo />
              </div>

              <div className="space-y-8">
                <ProfileCard />
                <StorageCard />
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

              <div id="shipping-addresses">
                <SavedAddresses />
              </div>

              <div id="security-privacy">
                <SecuritySettings />
              </div>
            </div>

            <div id="order-details">
              <OrderDetails />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Settings;