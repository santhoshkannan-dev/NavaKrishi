const DecisionSupport = () => {
  return (
    <section className="bg-[#012d1d] rounded-3xl p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden relative">

      <div>

        <h2 className="text-4xl font-bold">
          Decision Support Hub
        </h2>

        <p className="text-gray-300 mt-4 text-lg max-w-2xl">
          Compare these simulation results with your
          previous seasonal crop performance data.
        </p>
      </div>

      <button className="bg-[#a4f792] text-[#012d1d] px-8 py-5 rounded-2xl font-bold hover:scale-105 transition">
        Compare with Previous
      </button>
    </section>
  );
};

export default DecisionSupport;