import apiClient from "./apiClient";

export const finderService = {
  getUserItems: async (userId) => {
    const response = await apiClient.get(`/finder/user/${userId}/items`);
    return response.data;
  },

  getFolderContents: async (folderId, owner, trash = false) => {
    const response = await apiClient.get(`/finder/folders/${folderId}`, {
      params: { owner, trash },
    });
    return response.data;
  },

  getFilesByType: async (type) => {
    const response = await apiClient.get(`/cloud/files/type`, {
      params: { type },
    });
    return response.data;
  },

  createFolder: async ({ name, parentId, owner }) => {
    const response = await apiClient.post("/finder/folders", {
      name,
      parentId,
      owner,
    });
    return response.data;
  },

  createTextFile: async ({ name, content, parentId, owner }) => {
    const response = await apiClient.post("/finder/textfile", {
      name,
      content,
      parentId,
      owner,
    });
    return response.data;
  },

  uploadFile: async (formData) => {
    const response = await apiClient.post("/finder/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  moveToTrash: async (itemId, type) => {
    const endpoint = type === "folder"
      ? `/finder/trash/folder/${itemId}`
      : `/finder/trash/file/${itemId}`;
    const response = await apiClient.put(endpoint);
    return response.data;
  },

  restoreItem: async (itemId) => {
    const response = await apiClient.put(`/finder/restore/${itemId}`);
    return response.data;
  },

  deleteItem: async (itemId, type) => {
    const endpoint = type === "folder"
      ? `/finder/delete/folder/${itemId}`
      : `/finder/delete/${itemId}`;
    const response = await apiClient.delete(endpoint);
    return response.data;
  },

  renameItem: async (itemId, newName) => {
    const response = await apiClient.put(`/finder/rename/${itemId}`, { newName });
    return response.data;
  },

  duplicateItem: async (itemId) => {
    const response = await apiClient.post(`/finder/duplicate/${itemId}`);
    return response.data;
  },

  searchItems: async (name, includeTrashed) => {
    const response = await apiClient.get(`/finder/search`, {
      params: { name, includeTrashed },
    });
    return response.data;
  },

  getTrashLocal: async (owner) => {
    const response = await apiClient.get(`/finder/trash/local`, {
      params: { owner },
    });
    return response.data;
  },

  getTrashDrive: async (owner) => {
    const response = await apiClient.get(`/finder/trash/drive`, {
      params: { owner },
    });
    return response.data;
  },

  downloadFile: async (itemId) => {
    const response = await apiClient.get(`/finder/download/${itemId}`, {
      responseType: "blob",
    });
    return response.data;
  },

  copyItem: async (sourceId, targetId) => {
    const response = await apiClient.post("/finder/copy", {
      sourceId,
      targetId,
    });
    return response.data;
  },

  pasteItem: async (sourceId, targetId) => {
    const response = await apiClient.post("/finder/paste", {
      sourceId,
      targetId,
    });
    return response.data;
  },
};
