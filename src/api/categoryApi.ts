import axios from "axios";
import server_url from "./server_url";

const API_URL =
  `${server_url}/api/categories`;

// ==========================================
// AUTH HEADER
// ==========================================

const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Authentication token not found. Please login again."
    );
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// ==========================================
// GET ALL CATEGORIES
// ==========================================

export const getCategoriesAPI = async () => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return response.data;
};

// ==========================================
// GET SINGLE CATEGORY
// ==========================================

export const getCategoryByIdAPI = async (
  id: string
) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    getAuthHeader()
  );

  return response.data;
};

// ==========================================
// CREATE CATEGORY
// ==========================================

export const createCategoryAPI = async (
  categoryData: any
) => {
  const response = await axios.post(
    API_URL,
    categoryData,
    getAuthHeader()
  );

  return response.data;
};

// ==========================================
// UPDATE CATEGORY
// ==========================================

export const updateCategoryAPI = async (
  id: string,
  categoryData: any
) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    categoryData,
    getAuthHeader()
  );

  return response.data;
};

// ==========================================
// DELETE CATEGORY
// ==========================================

export const deleteCategoryAPI = async (
  id: string
) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    getAuthHeader()
  );

  return response.data;
};