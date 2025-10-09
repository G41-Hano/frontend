import axios from "axios"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// ===============================================================================================
//     For Token Handling 
// ===============================================================================================

// Function to refresh the token 
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN)
  // if no Refresh token is found == exit function
  if (!refreshToken) return null

  try {
    // call API to Refresh token
    const res = await axios.post(`${api.defaults.baseURL}/api/token/refresh`, {
      refresh: refreshToken,
    })
    const newAccess = res.data.access
    // update new Access token
    localStorage.setItem(ACCESS_TOKEN, newAccess);
    api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
    return newAccess;
  } catch (err) {
    console.error("Refresh token invalid or expired:", err);
    return null;
  }
}

// Axios response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Safety check: some errors may not have a response object
    if (!error.response) {
      return Promise.reject(error);
    }
    
    // Skip handling 401s for token endpoints
    const isAuthEndpoint =
      originalRequest.url.includes("/api/token/") ||
      originalRequest.url.includes("/api/token/refresh");
    
      // Only retry once per request
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      const newAccess = await refreshAccessToken();

      if (newAccess) {
        // Retry the failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } else {
        // Refresh token is invalid/expired - force logout
        window.location.href = "/logout-ex";
      }
    }

    return Promise.reject(error);
  }
);


// ===============================================================================================
//     For Forgot Password 
// ===============================================================================================


api.interceptors.request.use(
  (config) => {
    // Do NOT attach Authorization for endpoints that must be anonymous
    const noAuthPaths = [
      '/api/password-reset/',       // request reset email
      '/api/reset-password/'        // submit new password with reset token
    ];

    const urlPath = config?.url || '';
    const shouldSkipAuth = noAuthPaths.some((p) => urlPath.startsWith(p));

    if (!shouldSkipAuth) {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else if (config.headers && config.headers.Authorization) {
      // Ensure no stale auth header leaks into anonymous endpoints
      delete config.headers.Authorization;
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


// ===============================================================================================
//    For enrolling Students in a Classroom via CSV
// ===============================================================================================

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