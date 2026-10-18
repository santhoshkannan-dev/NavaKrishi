import { FiShield } from "react-icons/fi";

const AccountSecurity = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">

      <div className="flex items-center gap-3 mb-8">

        <FiShield className="text-[#1f6d1a] text-2xl" />

        <h2 className="text-4xl font-bold text-[#012d1d]">
          Account Security
        </h2>
      </div>

      <div className="space-y-8">

        <div className="flex items-center justify-between border-b border-gray-200 pb-6">

          <div>

            <h3 className="font-bold text-[#012d1d]">
              Email Address
            </h3>

            <p className="text-gray-500 mt-1">
              farmer@navakrishi.com
            </p>
          </div>

          <button className="text-[#1f6d1a] font-semibold">
            Change
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-gray-200 pb-6">

          <div>

            <h3 className="font-bold text-[#012d1d]">
              Password
            </h3>

            <p className="text-gray-500 mt-1">
              Last changed 3 months ago
            </p>
          </div>

          <button className="text-[#1f6d1a] font-semibold">
            Reset
          </button>
        </div>

        <div className="flex items-center justify-between">

          <div>

            <h3 className="font-bold text-[#012d1d]">
              Two-Factor Authentication
            </h3>

            <p className="text-gray-500 mt-1">
              Secure your account with SMS or Authenticator App
            </p>
          </div>

          <div className="w-14 h-8 bg-[#1f6d1a] rounded-full relative cursor-pointer">

            <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountSecurity;