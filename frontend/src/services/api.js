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
  // Profile Management
  getProfile: async () => {
    const response = await apiClient.get('/management/profile/');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await apiClient.put('/management/profile/', data);
    return response.data;
  },
  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.post('/management/change-password/', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  // Student Management
  getAllStudents: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await apiClient.get(`/management/students/?${params}`);
    return response.data;
  },
  getStudentCount: async () => {
    const response = await apiClient.get('/management/students/count/');
    return response.data && typeof response.data === 'object' && response.data.total !== undefined ? response.data.total : response.data;
  },

  // Faculty Management
  getAllFaculty: async () => {
    const response = await apiClient.get('/management/faculty/');
    return response.data;
  },
  getFacultyCount: async () => {
    const response = await apiClient.get('/management/faculty/count/');
    return response.data && typeof response.data === 'object' && response.data.total !== undefined ? response.data.total : response.data;
  },

  // Fee Management
  getFeeSummary: async () => {
    const response = await apiClient.get('/management/fees/summary/');
    return response.data;
  },
  getFeeStats: async () => {
    const response = await apiClient.get('/management/fees/stats/');
    return response.data;
  },
  getStudentFeeDetails: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await apiClient.get(`/management/fees/details/?${params}`);
    return response.data;
  },

  // Notification Management
  createNotification: async (notificationData) => {
    const response = await apiClient.post('/management/notifications/', notificationData);
    return response.data;
  },
  getSentNotifications: async () => {
    const response = await apiClient.get('/management/notifications/');
    return response.data;
  },
  getRecentNotifications: async (limit = 5) => {
    const response = await apiClient.get(`/management/notifications/recent/?limit=${limit}`);
    return response.data;
  },
};

export const tpcellService = {
  getProfile: async () => {
    const response = await apiClient.get('/tpcell/profile/');
    return response.data;
  },
  getStats: async () => {
    const response = await apiClient.get('/tpcell/stats/');
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
