import axios from "axios";

/*
  API Base URL
  - Local: http://localhost:5000
  - Production (Vercel): VITE_API_BASE_URL
*/
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API_URL = `${BASE_URL}/api/users`;

// Login
export const loginUser = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};

// Register
export const registerUser = async (data) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

// Profile
export const getProfile = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
