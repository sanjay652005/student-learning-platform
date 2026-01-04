import axios from "axios";

/*
  API Base URL
  - Local: http://localhost:5000
  - Production: VITE_API_BASE_URL (Vercel)
*/
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API_URL = `${BASE_URL}/api/notes`;

/* ============================
   🔓 PUBLIC APIs
   ============================ */

// Get all notes (search & browse)
export const getNotes = async (params = {}) => {
  const res = await axios.get(API_URL, { params });
  return res.data;
};

// Get single note preview
export const getNoteById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

/* ============================
   🔒 PROTECTED APIs
   ============================ */

// Get logged-in user's notes
export const getMyNotes = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_URL}/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// Create a new note (upload)
export const createNote = async (noteData) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(API_URL, noteData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// Update note
export const updateNote = async (id, noteData) => {
  const token = localStorage.getItem("token");

  const res = await axios.put(`${API_URL}/${id}`, noteData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// Download note
export const downloadNote = async (id) => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_URL}/${id}/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });

  return res.data;
};

// Delete note
export const deleteNote = async (id) => {
  const token = localStorage.getItem("token");

  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

