// src/services/api.js
import axios from 'axios';

// Create an axios instance with base URL from environment variables
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for handling errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (expired token)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location = '/login';
    }
    return Promise.reject(error);
  }
);

// Trello API specific methods
const trelloService = {
  getBoard: async (boardId) => {
    return api.get(`/api/trello/boards/${boardId}`);
  },
  getLists: async (boardId) => {
    return api.get(`/api/trello/boards/${boardId}/lists`);
  },
  sendToGoogleChat: async (cardId, data) => {
    return api.post(`/api/google/chat/send/${cardId}`, data);
  },
  refreshBoard: async (boardId) => {
    return api.post(`/api/trello/boards/${boardId}/refresh`);
  },
  getWebhooks: async () => {
    return api.get('/api/google/chat/webhooks');
  },
  // Create a new webhook
  createWebhook: async (webhookData) => {
    return api.post('/api/google/chat/webhooks', webhookData);
  },
  // Update an existing webhook
  updateWebhook: async (webhookId, webhookData) => {
    return api.put(`/api/google/chat/webhooks/${webhookId}`, webhookData);
  },
  deleteWebhook: async (webhookId) => {
    return api.delete(`/api/google/chat/webhooks/${webhookId}`);
  },

};

export { trelloService };
export default api;