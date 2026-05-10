const config = {
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
    endpoints: {
      products: '/products/',
    }
  }
};

export default config;