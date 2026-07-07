import apiClient from "./apiClient";

export const chatService = {
  getUsers: async () => {
    const response = await apiClient.get("/chat/users");
    return response.data;
  },
  
  getOrCreateRoom: async (payload) => {
    const response = await apiClient.post("/chat/room", payload);
    return response.data;
  },
  
  getMessages: async (roomId) => {
    const response = await apiClient.get(`/chat/messages/${roomId}`);
    return response.data;
  },
  
  uploadFile: async (formData) => {
    const response = await apiClient.post("/chat/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  
  deleteMessageEveryone: async (messageId) => {
    const response = await apiClient.delete(`/chat/message/everyone/${messageId}`);
    return response.data;
  },
  
  deleteMessageMe: async (messageId) => {
    const response = await apiClient.delete(`/chat/message/me/${messageId}`);
    return response.data;
  },
  
  clearChat: async (roomId) => {
    const response = await apiClient.delete(`/chat/chat/me/${roomId}`);
    return response.data;
  },
};
