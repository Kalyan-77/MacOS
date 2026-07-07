import apiClient from "./apiClient";

export const configService = {
  getDockConfig: async (userId) => {
    const response = await apiClient.get(`/config/get/${userId}`);
    return response.data;
  },

  saveDockConfig: async (userId, configData) => {
    const response = await apiClient.post(`/config/save/${userId}`, configData);
    return response.data;
  },
};

