
import axios from "axios";

const API_URL = "http://localhost:5000/api/employees";

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
// GET ALL EMPLOYEES
// ==========================================

export const getEmployeesAPI = async () => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return response.data;
};

// ==========================================
// GET SINGLE EMPLOYEE
// ==========================================

export const getEmployeeByIdAPI = async (id: string) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    getAuthHeader()
  );

  return response.data;
};

// ==========================================
// CREATE EMPLOYEE
// ==========================================

export const addEmployeeAPI = async (
  employeeData: any
) => {
  const response = await axios.post(
    API_URL,
    employeeData,
    getAuthHeader()
  );

  return response.data;
};

// ==========================================
// UPDATE EMPLOYEE
// ==========================================

export const updateEmployeeAPI = async (
  id: string,
  employeeData: any
) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    employeeData,
    getAuthHeader()
  );

  return response.data;
};
