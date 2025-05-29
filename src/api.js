import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const authService = {
  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await api.post('/api/password-reset/', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to request password reset');
    }
  },

  // Reset password with token
  async resetPassword(token, newPassword, confirmPassword) {
    try {
      const response = await api.post(`/api/reset-password/${token}/`, {
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Failed to reset password');
    }
  }
};

const importStudentsFromCsv = async (classroomId, file) => {
  const formData = new FormData();
  formData.append('csv_file', file);

  try {
    const response = await api.post(
      `/api/classrooms/${classroomId}/import-students/`,
      formData
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

export default api
export { importStudentsFromCsv }