import axios from "axios";

// ✅ use the correct env variable (NO localhost fallback)
const BASE_URL = import.meta.env.VITE_API_URL;

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
