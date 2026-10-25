import axios from "axios";

const API_URL = "http://localhost:5000/api/sales";

// ==========================================
// AUTH HEADER
// ==========================================

const getAuthHeader = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("serviceToken");

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ==========================================
// TYPES
// ==========================================

export interface SaleItem {
  product: string;
  name?: string;
  quantity: number;
  price?: number;
  subtotal?: number;
}

export interface CreateSaleData {
  items: SaleItem[];
  tax?: number;
  paymentMethod?: string;
  customerName?: string;
  customerPhone?: string;
}

// ==========================================
// GET ALL SALES
// GET /api/sales
// ==========================================

export const getSalesAPI = async () => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return response.data;
};

// ==========================================
// GET SINGLE SALE
// GET /api/sales/:id
// ==========================================

export const getSaleByIdAPI = async (id: string) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    getAuthHeader()
  );

  return response.data;
};

// ==========================================
// CREATE SALE
// POST /api/sales
// ==========================================

export const createSaleAPI = async (
  saleData: CreateSaleData
) => {
  const response = await axios.post(
    API_URL,
    saleData,
    getAuthHeader()
  );

  return response.data;
};

// ==========================================
// DELETE SALE
// DELETE /api/sales/:id
// ==========================================

export const deleteSaleAPI = async (id: string) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    getAuthHeader()
  );

  return response.data;
};