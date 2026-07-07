import apiClient from "./apiClient";

export const perplexityService = {
  chat: async (userId, message) => {
    const response = await apiClient.post(`/perplexity/chat/${userId}`, { message });
    return response.data;
  },
};
