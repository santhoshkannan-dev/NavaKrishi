const SettingsFooter = () => {
  return (
    <footer className="mt-16 border-t border-gray-200 pt-10">

      <div className="flex flex-col lg:flex-row justify-between gap-10">

        <div>

          <h2 className="text-2xl font-bold text-[#012d1d]">
            NavaKrishi Portal
          </h2>

          <p className="text-gray-500 mt-3">
            © 2026 NavaKrishi Platform. Empowering sustainable agriculture.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 text-gray-500">

          <p>Privacy Policy</p>

          <p>Terms of Service</p>

          <p>Sustainability Report</p>

          <p>Support</p>
        </div>
      </div>
    </footer>
  );
};

export default SettingsFooter;