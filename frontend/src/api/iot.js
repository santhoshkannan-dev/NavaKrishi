import API from "./axios";

export const getLatestSensorData = () => API.get("/iot/latest/");

export const getSensorHistory = () => API.get("/iot/history/");

export const getPumpCommand = () => API.get("/iot/pump/");

export const setPumpCommand = (pumpOn, manualMode = true) =>
	API.post("/iot/pump/", { pump: pumpOn, manual_mode: manualMode });