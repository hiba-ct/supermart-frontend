
import axios from "axios";

const API_URL = "http://localhost:5000/api/attendance";

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

export const getDailyAttendanceAPI = async (date: string) => {
  const response = await axios.get(
    `${API_URL}?date=${encodeURIComponent(date)}`,
    getAuthHeader()
  );

  return response.data;
};

export const markAttendanceAPI = async (attendanceData: {
  employeeId: string;
  attendanceDate: string;
  status: "Present" | "Absent" | "Late" | "On Leave";
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}) => {
  const response = await axios.post(
    API_URL,
    attendanceData,
    getAuthHeader()
  );

  return response.data;
};
