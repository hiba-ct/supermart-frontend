import axios from "axios";

const API_URL =
  "http://localhost:5000/api/inventory";

// ======================================================
// AUTH HEADER
// ======================================================

const getAuthHeader = () => {
  const token =
    localStorage.getItem("token");

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
// GET INVENTORY
// GET /api/inventory
// ======================================================

export const getInventoryAPI =
  async () => {

    const response =
      await axios.get(
        API_URL,
        getAuthHeader()
      );

    return response.data;
  };


// ======================================================
// GET LOW STOCK
// GET /api/inventory/low-stock
// ======================================================

export const getLowStockAPI =
  async () => {

    const response =
      await axios.get(
        `${API_URL}/low-stock`,
        getAuthHeader()
      );

    return response.data;
  };


// ======================================================
// GET OUT OF STOCK
// GET /api/inventory/out-of-stock
// ======================================================

export const getOutOfStockAPI =
  async () => {

    const response =
      await axios.get(
        `${API_URL}/out-of-stock`,
        getAuthHeader()
      );

    return response.data;
  };


// ======================================================
// ADD / REMOVE / ADJUST STOCK
// POST /api/inventory/adjust
// ======================================================

export const adjustStockAPI =
  async (stockData: {
    productId: string;
    type:
      | "IN"
      | "OUT"
      | "ADJUSTMENT";
    quantity: number;
    reason?: string;
    reference?: string;
  }) => {

    const response =
      await axios.post(
        `${API_URL}/adjust`,
        stockData,
        getAuthHeader()
      );

    return response.data;
  };


// ======================================================
// GET STOCK HISTORY
// GET /api/inventory/history/:productId
// ======================================================

export const getStockHistoryAPI =
  async (productId: string) => {

    const response =
      await axios.get(
        `${API_URL}/history/${productId}`,
        getAuthHeader()
      );

    return response.data;
  };