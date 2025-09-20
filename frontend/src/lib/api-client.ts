import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error handling
    if (error.response) {
      const { status, data } = error.response;
      
      // Create a more descriptive error message
      let message = data?.message || 'An error occurred';
      
      switch (status) {
        case 401:
          message = 'You need to be logged in to access this resource';
          break;
        case 403:
          message = 'You don\'t have permission to access this resource';
          break;
        case 404:
          message = 'The requested resource was not found';
          break;
        case 500:
          message = 'Server error. Please try again later';
          break;
        default:
          message = data?.message || `Request failed with status ${status}`;
      }
      
      // Create a new error with enhanced message
      const enhancedError = new Error(message);
      enhancedError.name = `HTTP_${status}`;
      (enhancedError as any).status = status;
      (enhancedError as any).response = error.response;
      
      return Promise.reject(enhancedError);
    } else if (error.request) {
      // Network error
      const networkError = new Error('Network error. Please check your connection');
      networkError.name = 'NETWORK_ERROR';
      return Promise.reject(networkError);
    } else {
      // Other error
      return Promise.reject(error);
    }
  }
);

export default apiClient;
