import API from "./axios";

export const accountAPI = {
  getProfile: async () => {
    const response = await API.get("/auth/profile/");
    return response.data;
  },

  updateProfile: async (payload) => {
    const response = await API.put("/auth/profile/", payload);
    return response.data;
  },

  changePassword: async (payload) => {
    const response = await API.post("/auth/change-password/", payload);
    return response.data;
  },
};

export default accountAPI;