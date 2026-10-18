import API from "./axios";

const post = async (url, payload) => {
  const response = await API.post(url, payload);
  return response.data;
};

export const assistantAPI = {
  chat: async ({ message, ...payload }) => post("/chat/", { message, ...payload }),
  weather: async ({ location, ...payload }) => post("/assistant/weather/", { location, ...payload }),
  search: async (query) => post("/assistant/search/", { query }),
  generateDescription: async (payload) => post("/assistant/product-description/", payload),
  cropRecommendation: async (payload) => post("/assistant/crop-recommendation/", payload),
};

export default assistantAPI;