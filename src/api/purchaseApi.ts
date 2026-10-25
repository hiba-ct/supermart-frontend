import axios from "axios";

const API_URL =
  "http://localhost:5000/api/purchases";

// ======================================================
// AUTH HEADER
// ======================================================

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

// ======================================================
// GET ALL PURCHASES
// ======================================================

export const getPurchasesAPI = async () => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return response.data;
};

// ======================================================
// GET SINGLE PURCHASE
// ======================================================

export const getPurchaseByIdAPI = async (
  id: string
) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    getAuthHeader()
  );

  return response.data;
};

// ======================================================
// CREATE PURCHASE
// ======================================================

export const createPurchaseAPI = async (
  purchaseData: any
) => {
  const response = await axios.post(
    API_URL,
    purchaseData,
    getAuthHeader()
  );

  return response.data;
};

// ======================================================
// UPDATE PURCHASE
// ======================================================

export const updatePurchaseAPI = async (
  id: string,
  purchaseData: any
) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    purchaseData,
    getAuthHeader()
  );

  return response.data;
};

// ======================================================
// RECEIVE PURCHASE
// ======================================================

export const receivePurchaseAPI = async (
  id: string
) => {
  const response = await axios.post(
    `${API_URL}/${id}/receive`,
    {},
    getAuthHeader()
  );

  return response.data;
};

// ======================================================
// CANCEL PURCHASE
// ======================================================

export const cancelPurchaseAPI = async (
  id: string
) => {
  const response = await axios.post(
    `${API_URL}/${id}/cancel`,
    {},
    getAuthHeader()
  );

  return response.data;
};

// ======================================================
// DELETE PURCHASE
// ======================================================

export const deletePurchaseAPI = async (
  id: string
) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    getAuthHeader()
  );

  return response.data;
};