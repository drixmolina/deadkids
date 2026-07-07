export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function request(path, options = {}) {
  const token = localStorage.getItem('deadkids_token');
  const isFormData = options.body instanceof FormData;
  const headers = { ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  return request('/api/upload', { method: 'POST', body: formData });
}
