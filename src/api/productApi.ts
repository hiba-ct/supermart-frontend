import axios from "axios";

const API_URL = "http://localhost:5000/api/products";

// ======================================================
// AUTH HEADER
// ======================================================

const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// ======================================================
// GET ALL PRODUCTS
// ======================================================

export const getProductsAPI = async () => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return response.data;
};

// ======================================================
// GET SINGLE PRODUCT
// ======================================================

export const getProductByIdAPI = async (id: string) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    getAuthHeader()
  );

  return response.data;
};

// ======================================================
// CREATE PRODUCT
// ======================================================

export const createProductAPI = async (productData: any) => {
  const response = await axios.post(
    API_URL,
    productData,
    getAuthHeader()
  );

  return response.data;
};

// ======================================================
// UPDATE PRODUCT
// ======================================================

export const updateProductAPI = async (
  id: string,
  productData: any
) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    productData,
    getAuthHeader()
  );

  return response.data;
};

// ======================================================
// DELETE PRODUCT
// ======================================================

export const deleteProductAPI = async (id: string) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    getAuthHeader()
  );

  return response.data;
};