const AuthLeftPanel = () => {
  return (
    <section className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden items-center justify-center p-20">
      
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#012d1d]/95 to-[#1f6d1a]/80"></div>

      {/* Content */}
      <div className="relative z-10 max-w-xl text-white">
        
        <h1 className="text-7xl font-bold">
          NavaKrishi
        </h1>

        <p className="text-3xl mt-6 text-[#c1ecd4] font-semibold">
          Join our organic community
        </p>

        <div className="space-y-8 mt-14">

          <div className="flex items-center gap-4">
            <span className="text-3xl">🌱</span>

            <p className="text-xl text-gray-100">
              Direct access to verified organic farmers
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl">🤖</span>

            <p className="text-xl text-gray-100">
              AI-powered yield and market insights
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl">🚜</span>

            <p className="text-xl text-gray-100">
              Sustainable farming ecosystem
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthLeftPanel;