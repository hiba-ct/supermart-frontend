import axios from "axios";
import server_url from "./server_url";

const API_URL = `${server_url}/api/auth`;

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// LOGIN
export const loginAPI = async (
  loginData: LoginData
) => {
  const response = await axios.post<LoginResponse>(
    `${API_URL}/login`,
    loginData
  );

  return response.data;
};

// REGISTER
export const registerAPI = async (
  registerData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }
) => {
  const response = await axios.post(
    `${API_URL}/register`,
    registerData
  );

  return response.data;
};