import React, { createContext, useContext, useMemo } from 'react';
import axios from 'axios';

const ApiContext = createContext(null);


const rawBase = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || 'https://civarapi-efe8gfcjd0bqd8fu.westeurope-01.azurewebsites.net';
const normalized = rawBase.replace(/\/+$/, '');
const BASE_URL = normalized.toLowerCase().endsWith('/api') ? normalized : normalized + '/api';

export function ApiProvider({ children }) {
  const client = useMemo(() => {
    const instance = axios.create({
      baseURL: BASE_URL,
      withCredentials: true
    });
    instance.interceptors.request.use(cfg => {
      const token = localStorage.getItem('token');
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
      return cfg;
    });

    instance.getJson = async (path, config) => {
      const res = await instance.get(path, config);
      return res.data;
    };

    return instance;
  }, []);

  return <ApiContext.Provider value={{ client, BASE_URL }}>{children}</ApiContext.Provider>;
}

export function useApi() {
  return useContext(ApiContext);
}
