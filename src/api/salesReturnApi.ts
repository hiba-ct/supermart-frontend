
import axios from "axios";

const API_URL = "http://localhost:5000/api/sales-returns";

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

export interface SalesReturnItem {
  product: string | {
    _id: string;
    name: string;
    sku?: string;
  };
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  restock: boolean;
}

export interface SalesReturn {
  _id: string;
  returnNumber: string;
  invoiceNumber: string;
  items: SalesReturnItem[];
  reason: string;
  refundAmount: number;
  refundMethod: string;
  status: "Completed" | "Cancelled";
  notes?: string;
  createdAt: string;
}

export interface CreateSalesReturnData {
  invoiceNumber: string;
  items: {
    product: string;
    quantity: number;
  }[];
  reason: string;
  refundMethod: string;
  notes?: string;
}

export const getSalesReturnsAPI = async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
};

export const createSalesReturnAPI = async (
  data: CreateSalesReturnData
) => {
  const response = await axios.post(
    API_URL,
    data,
    getAuthConfig()
  );

  return response.data;
};

export const getSalesReturnByIdAPI = async (id: string) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    getAuthConfig()
  );
  

  return response.data;
};

 
export const getSaleForReturnAPI = async (invoiceNumber: string) => {
  const response = await axios.get(
    `${API_URL}/invoice/${encodeURIComponent(invoiceNumber)}`,
    getAuthConfig()
  );

  return response.data;
};
