import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: data => api.post('/auth/register', data),
  login: data => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Notes
export const notesAPI = {
  upload: formData => api.post('/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: params => api.get('/notes', { params }),
  getBookmarks: params => api.get('/notes/bookmarks', { params }),
  getOne: id => api.get(`/notes/${id}`),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: id => api.delete(`/notes/${id}`),
  generateSummary: id => api.post(`/notes/${id}/summary`),
  chat: (id, question) => api.post(`/notes/${id}/chat`, { question }),
  quiz: id => api.get(`/notes/${id}/quiz`),
  bookmark: id => api.post(`/notes/${id}/bookmark`),
  share: (id, email) => api.post(`/notes/${id}/share`, { email }),
};

// Search
export const searchAPI = {
  search: (q, type = 'text') => api.get('/search', { params: { q, type } }),
};

export default api;
