import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  // Don't attach Authorization header for auth endpoints (handle variants)
  config.headers = config.headers || {};
  const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
  const authPaths = ['/users/login', '/users/register', '/token/refresh'];
  if (authPaths.some((p) => fullUrl.includes(p))) {
    // ensure any existing auth header is removed
    if (config.headers.Authorization) delete config.headers.Authorization;
    return config;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, role, password) => {
    const response = await apiClient.post('/users/login/', {
      email,
      password,
      role,
    });
    return response.data;
  },
};

export const studentService = {
  getProfile: async () => {
    const response = await apiClient.get('/students/profile/');
    return response.data;
  },
  getAcademics: async () => {
    const response = await apiClient.get('/students/academics/');
    return response.data;
  },
  getBacklogs: async () => {
    const response = await apiClient.get('/students/backlogs/');
    return response.data;
  },
  getExamData: async () => {
    const response = await apiClient.get('/students/exam-data/');
    return response.data;
  },
};

export const facultyService = {
  getProfile: async () => {
    const response = await apiClient.get('/faculty/profile/');
    return response.data;
  },
  getAssignments: async () => {
    const response = await apiClient.get('/faculty/assignments/');
    return response.data;
  },
};

export const managementService = {
  getProfile: async () => {
    const response = await apiClient.get('/management/profile/');
    return response.data;
  },
};

export const tpcellService = {
  getProfile: async () => {
    const response = await apiClient.get('/tpcell/profile/');
    return response.data;
  },
};

export const notificationService = {
  getNotifications: async () => {
    const response = await apiClient.get('/notifications/');
    return response.data;
  },
};

export default apiClient;
