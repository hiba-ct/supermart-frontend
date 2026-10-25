import axios from "axios";
import server_url from "./server_url";

const API_URL =
 `${server_url}/api/suppliers`;

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
// GET ALL
// ======================================================

export const getSuppliersAPI = async () => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return response.data;
};

// ======================================================
// GET ONE
// ======================================================

export const getSupplierByIdAPI = async (
  id: string
) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    getAuthHeader()
  );

  return response.data;
};

// ======================================================
// CREATE
// ======================================================

export const createSupplierAPI = async (
  supplierData: any
) => {
  const response = await axios.post(
    API_URL,
    supplierData,
    getAuthHeader()
  );

  return response.data;
};

// ======================================================
// UPDATE
// ======================================================

export const updateSupplierAPI = async (
  id: string,
  supplierData: any
) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    supplierData,
    getAuthHeader()
  );

  return response.data;
};

// ======================================================
// DELETE
// ======================================================

export const deleteSupplierAPI = async (
  id: string
) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    getAuthHeader()
  );

  return response.data;
};