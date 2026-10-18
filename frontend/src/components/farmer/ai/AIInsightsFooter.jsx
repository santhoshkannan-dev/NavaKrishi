const AIInsightsFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200 pt-8">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#012d1d]">
            NavaKrishi AI Portal
          </h2>

          <p className="text-gray-500 mt-3">
            © {year} NavaKrishi Platform. Empowering sustainable agriculture.
          </p>
        </div>

        <nav className="flex flex-wrap gap-6 text-sm text-gray-500" aria-label="AI insights footer links">
          <a href="/support" className="transition hover:text-[#1f6d1a]">Support</a>
          <a href="/about" className="transition hover:text-[#1f6d1a]">About</a>
          <a href="/impact" className="transition hover:text-[#1f6d1a]">Sustainability</a>
        </nav>
      </div>
    </footer>
  );
};

export default AIInsightsFooter;