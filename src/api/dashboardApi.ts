
import axios from "axios";

const API_URL = "http://localhost:5000/api/dashboard";

const getAuthConfig = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("serviceToken");

  if (!token) {
    throw new Error("Please login again.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Dashboard statistics API
export const getDashboardStatsAPI = async () => {
  const response = await axios.get(
    `${API_URL}/stats`,
    getAuthConfig()
  );

  return response.data;
};

// Sales analytics API
export const getSalesAnalyticsAPI = async () => {
  const response = await axios.get(
    `${API_URL}/analytics`,
    getAuthConfig()
  );

  return response.data;
};

// Finance API
export const getFinanceAPI = async () => {
  const response = await axios.get(
    `${API_URL}/stats`,
    getAuthConfig()
  );

  return response.data;
};
