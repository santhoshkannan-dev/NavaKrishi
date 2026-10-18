import { FiCreditCard } from "react-icons/fi";

const SubscriptionBilling = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">

      <h2 className="text-4xl font-bold text-[#012d1d] mb-8">
        Subscription & Billing
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Plan */}
        <div className="bg-[#f5f5f3] rounded-3xl p-8 border border-gray-200">

          <div className="flex justify-between items-start">

            <div>

              <p className="text-gray-500">
                Current Plan
              </p>

              <h3 className="text-4xl font-bold text-[#012d1d] mt-3">
                AI Pro Farmer
              </h3>
            </div>

            <span className="bg-[#dff5d8] text-[#1f6d1a] px-4 py-2 rounded-full text-sm font-semibold">
              ACTIVE
            </span>
          </div>

          <p className="text-gray-500 mt-6">
            Next billing date: Jan 12, 2025
          </p>

          <button className="w-full mt-8 bg-[#012d1d] text-white py-4 rounded-2xl font-semibold hover:bg-[#021f14] transition">
            Manage Subscription
          </button>
        </div>

        {/* Payment */}
        <div>

          <p className="uppercase tracking-[2px] text-sm text-gray-500 mb-6">
            Payment Methods
          </p>

          <div className="border border-gray-200 rounded-2xl p-5 flex items-center justify-between">

            <div className="flex items-center gap-4">

              <FiCreditCard className="text-2xl text-gray-500" />

              <p className="font-medium">
                •••• 4242
              </p>
            </div>

            <span className="bg-[#f5f5f3] px-3 py-1 rounded-lg text-sm text-gray-500">
              Default
            </span>
          </div>

          <button className="mt-6 text-[#1f6d1a] font-semibold">
            + Add New Method
          </button>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionBilling;