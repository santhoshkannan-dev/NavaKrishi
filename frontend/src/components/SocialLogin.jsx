const SocialLogin = () => {
  return (
    <>
      <div className="relative flex items-center my-8">
        
        <div className="flex-1 border-t border-gray-300"></div>

        <span className="px-4 text-sm text-gray-400">
          OR CONTINUE WITH
        </span>

        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        
        <button className="border border-gray-300 rounded-2xl py-4 font-semibold hover:bg-gray-50 transition">
          Google
        </button>

        <button className="border border-gray-300 rounded-2xl py-4 font-semibold hover:bg-gray-50 transition">
          Apple
        </button>
      </div>
    </>
  );
};

export default SocialLogin;