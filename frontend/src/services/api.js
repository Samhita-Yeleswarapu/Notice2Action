import axios from 'axios';
import { API_BASE_URL } from './apiBaseUrl.js';

// VITE_API_URL is the only Anthropic/backend-related setting the frontend
// knows about, and it's just a URL — never a secret. The Anthropic API key
// lives only on the server (see backend/services/aiService.js) and this
// file never references it.
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Attach an auth token automatically if the optional auth module is used
// and a token has been stored after login.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('n2a_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function unwrapError(err) {
  const message = err?.response?.data?.error || err?.message || 'Something went wrong. Please try again.';
  const wrapped = new Error(message);
  wrapped.status = err?.response?.status;
  return wrapped;
}

export async function analyseText(text) {
  try {
    const { data } = await client.post('/notices/analyse-text', { text });
    return data.notice;
  } catch (err) {
    throw unwrapError(err);
  }
}

export async function analysePdf(file, onUploadProgress) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await client.post('/notices/analyse-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return data.notice;
  } catch (err) {
    throw unwrapError(err);
  }
}

export async function getNotices() {
  try {
    const { data } = await client.get('/notices');
    return data.notices;
  } catch (err) {
    throw unwrapError(err);
  }
}

export async function getNotice(id) {
  try {
    const { data } = await client.get(`/notices/${id}`);
    return data.notice;
  } catch (err) {
    throw unwrapError(err);
  }
}

export async function updateChecklist(noticeId, itemIndex, completed) {
  try {
    const { data } = await client.patch(`/notices/${noticeId}/checklist/${itemIndex}`, { completed });
    return data.notice;
  } catch (err) {
    throw unwrapError(err);
  }
}

export async function askNotice(noticeId, question, history = []) {
  try {
    const { data } = await client.post(`/notices/${noticeId}/ask`, { question, history });
    return data.answer;
  } catch (err) {
    throw unwrapError(err);
  }
}

export async function deleteNotice(id) {
  try {
    const { data } = await client.delete(`/notices/${id}`);
    return data.success;
  } catch (err) {
    throw unwrapError(err);
  }
}

export default {
  analyseText,
  analysePdf,
  getNotices,
  getNotice,
  updateChecklist,
  askNotice,
  deleteNotice,
};
