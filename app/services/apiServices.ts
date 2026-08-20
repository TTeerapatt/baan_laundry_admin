import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const base_url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const axiosConfig: AxiosRequestConfig = {
  baseURL: base_url,
  timeout: 40000,
};

const apiServices = axios.create(axiosConfig);

apiServices.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("baan_laundry_token");
    if (token) {
      config.headers = Object.assign({}, config.headers, {
        Authorization: `Bearer ${token}`,
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiServices.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error?.response?.data || error);
  }
);

export default apiServices;
