import apiClient from "./apiClient";

export const authService = {
  checkSession: async () => {
    const response = await apiClient.get("/auth/checkSession");
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/profile/me");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.post("/profile/update", profileData);
    return response.data;
  },
};

