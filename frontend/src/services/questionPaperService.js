import axios from "axios";

/*
  API Base URL
  - Local: http://localhost:5000
  - Production (Vercel): VITE_API_BASE_URL
*/
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API_URL = `${BASE_URL}/api/question-papers`;

/* =========================
   🔓 PUBLIC
   ========================= */

// Browse & search
export const getQuestionPapers = async (params = {}) => {
  const res = await axios.get(API_URL, { params });
  return res.data;
};

// Preview
export const getQuestionPaperById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

/* =========================
   🔒 PROTECTED
   ========================= */

// Upload
export const createQuestionPaper = async (data) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(API_URL, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// Download
export const downloadQuestionPaper = async (id) => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_URL}/${id}/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });

  return res.data;
};

// Delete
export const deleteQuestionPaper = async (id) => {
  const token = localStorage.getItem("token");

  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
