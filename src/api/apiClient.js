import axios from "axios";
import { BASE_URL } from "../../config";

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export { BASE_URL };
export default apiClient;

