import apiClient from "./apiClient";

export const configService = {
  getDockConfig: async (userId) => {
    const response = await apiClient.get(`/config/get/${userId}`);
    return response.data;
  },
};
