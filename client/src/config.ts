const rawUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const cleanUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
export const API_BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
