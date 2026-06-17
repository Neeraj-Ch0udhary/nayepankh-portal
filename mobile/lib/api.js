import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Replace with your computer's local IP if testing on a physical phone
// Find it with `ipconfig` in terminal (look for IPv4 Address)
const BASE_URL = "http://localhost:5000";
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;