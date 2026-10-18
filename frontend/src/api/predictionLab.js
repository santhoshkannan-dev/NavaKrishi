import API from "./axios";

export const analyzePredictionScenario = (payload) =>
  API.post("/farmer/prediction-lab/analyze/", payload);

export const getPredictionSimulations = () =>
  API.get("/farmer/prediction-lab/simulations/");

export const savePredictionSimulation = (payload) =>
  API.post("/farmer/prediction-lab/simulations/", payload);

export const comparePredictionSimulations = (currentId, previousId) =>
  API.post("/farmer/prediction-lab/compare/", {
    current_id: currentId,
    previous_id: previousId,
  });