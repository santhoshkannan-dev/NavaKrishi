import { FiZap } from "react-icons/fi";

const ScenarioParameters = ({ value, onChange, onSubmit, loading }) => {
  const update = (key, nextValue) => onChange({ ...value, [key]: nextValue });

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
      <h2 className="mb-8 text-3xl font-bold text-[#012d1d]">Scenario Parameters</h2>
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-gray-500" htmlFor="prediction-season">Target Season</label>
          <select id="prediction-season" value={value.season} onChange={(event) => update("season", event.target.value)} className="w-full rounded-2xl border border-gray-300 px-5 py-4">
            <option value="summer">Summer</option><option value="winter">Winter</option><option value="monsoon">Monsoon</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-gray-500" htmlFor="expected-rainfall">Expected Rainfall: {value.expected_rainfall} mm/season</label>
          <input id="expected-rainfall" type="range" min="0" max="2000" step="10" value={value.expected_rainfall} onChange={(event) => update("expected_rainfall", Number(event.target.value))} className="w-full accent-[#1f6d1a]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="mb-2 block text-sm text-gray-500" htmlFor="min-temperature">Min temp (C)</label><input id="min-temperature" type="number" required min="-40" max="70" value={value.min_temperature} onChange={(event) => update("min_temperature", Number(event.target.value))} className="w-full rounded-2xl border border-gray-300 px-5 py-4" /></div>
          <div><label className="mb-2 block text-sm text-gray-500" htmlFor="max-temperature">Max temp (C)</label><input id="max-temperature" type="number" required min="-40" max="70" value={value.max_temperature} onChange={(event) => update("max_temperature", Number(event.target.value))} className="w-full rounded-2xl border border-gray-300 px-5 py-4" /></div>
        </div>
        <div>
          <label className="mb-2 block text-sm text-gray-500" htmlFor="soil-ph">Soil pH (0-14)</label>
          <input id="soil-ph" type="number" min="0" max="14" step="0.1" value={value.soil_ph} onChange={(event) => update("soil_ph", Number(event.target.value))} className="w-full rounded-2xl border border-gray-300 px-5 py-4" />
          <p className="mt-2 text-sm text-gray-500">Soil condition is evaluated from pH; no unsupported condition label is added.</p>
        </div>
        <button type="button" onClick={onSubmit} disabled={loading} className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#012d1d] py-5 font-semibold text-white transition hover:bg-[#021f15] disabled:opacity-50"><FiZap />{loading ? "Analyzing..." : "Run Analysis"}</button>
      </div>
    </section>
  );
};

export default ScenarioParameters;
