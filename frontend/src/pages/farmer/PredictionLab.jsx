import { useEffect, useState } from "react";
import PredictionHeader from "../../components/farmer/prediction/PredictionHeader";
import ScenarioParameters from "../../components/farmer/prediction/ScenarioParameters";
import AccuracyCard from "../../components/farmer/prediction/AccuracyCard";
import RevenueProjection from "../../components/farmer/prediction/RevenueProjection";
import RiskAssessment from "../../components/farmer/prediction/RiskAssessment";
import CropRecommendations from "../../components/farmer/prediction/CropRecommendations";
import DecisionSupport from "../../components/farmer/prediction/DecisionSupport";
import {
  analyzePredictionScenario,
  comparePredictionSimulations,
  getPredictionSimulations,
  savePredictionSimulation,
} from "../../api/predictionLab";

const initialScenario = {
  season: "summer",
  expected_rainfall: 650,
  min_temperature: 22,
  max_temperature: 34,
  soil_ph: 6.5,
};

const PredictionLab = () => {
  const [scenario, setScenario] = useState(initialScenario);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    getPredictionSimulations().then(({ data }) => setHistory(data)).catch(() => setHistory([]));
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { data } = await analyzePredictionScenario(scenario);
      setResults(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "The analysis could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  const saveSimulation = async () => {
    if (!results) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await savePredictionSimulation({ ...scenario, scenario_name: `${scenario.season} scenario` });
      setHistory((current) => [data, ...current]);
      setMessage("Simulation saved to your farmer account.");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "The simulation could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const reopenSimulation = (simulation) => {
    setScenario({
      season: simulation.season,
      expected_rainfall: simulation.expected_rainfall,
      min_temperature: simulation.min_temperature,
      max_temperature: simulation.max_temperature,
      soil_ph: simulation.soil_ph,
    });
    setResults(simulation.results);
    setShowHistory(false);
  };

  const compareWithPrevious = async () => {
    if (history.length < 2) return;
    try {
      const { data } = await comparePredictionSimulations(history[0].id, history[1].id);
      setComparison(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "The comparison could not be loaded.");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <PredictionHeader onHistory={() => setShowHistory(true)} onSave={saveSimulation} saving={saving} canSave={Boolean(results)} />
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error}</div>}
      {message && <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">{message}</div>}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-4">
          <ScenarioParameters value={scenario} onChange={setScenario} onSubmit={runAnalysis} loading={loading} />
          <AccuracyCard data={results?.accuracy} />
        </div>
        <div className="space-y-8 lg:col-span-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <RevenueProjection data={results} />
            <RiskAssessment risks={results?.risks} />
          </div>
          <CropRecommendations recommendations={results?.recommendations} />
          <DecisionSupport onCompare={compareWithPrevious} comparison={comparison} hasPrevious={history.length > 1} />
        </div>
      </div>
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="prediction-history-title">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4"><h2 id="prediction-history-title" className="text-2xl font-bold text-[#012d1d]">Prediction history</h2><button type="button" onClick={() => setShowHistory(false)} className="rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100">Close</button></div>
            {history.length === 0 ? <p className="py-10 text-gray-500">No saved simulations yet.</p> : <div className="mt-5 space-y-3">{history.map((simulation) => <button type="button" key={simulation.id} onClick={() => reopenSimulation(simulation)} className="w-full rounded-xl border border-gray-200 p-4 text-left hover:border-[#1f6d1a]"><div className="flex items-center justify-between gap-3"><strong>{simulation.scenario_name}</strong><span className="text-sm text-gray-500">{new Date(simulation.created_at).toLocaleDateString()}</span></div><p className="mt-1 text-sm text-gray-600">{simulation.season} · {simulation.expected_rainfall} mm · pH {simulation.soil_ph}</p><p className="mt-2 text-sm font-medium text-[#1f6d1a]">Top crop: {simulation.results.recommendations?.[0]?.name || "Unavailable"}</p></button>)}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionLab;
