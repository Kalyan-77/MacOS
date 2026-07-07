import apiClient from "./apiClient";

export const appStoreService = {
  getAllApps: async () => {
    const response = await apiClient.get("/apps/all");
    return response.data;
  },

  getAppsWithoutSystem: async () => {
    const response = await apiClient.get("/apps/without-system");
    return response.data;
  },
};
