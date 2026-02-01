import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import authService from '../services/authService';

const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<AxiosError> => {
    if (error.response?.status === 401) {
      authService.clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
