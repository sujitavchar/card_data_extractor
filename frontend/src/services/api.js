import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
});

export const getToken = () => localStorage.getItem("token");

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleError = (err) => {
  throw err.response?.data?.detail || "Something went wrong";
};

// AUTH
export const signup = async (name, email, password) => {
  try {
    await api.post("/auth/signup", { name, email, password });
  } catch (err) {
    handleError(err);
  }
};

export const signin = async (email, password) => {
  try {
    const res = await api.post("/auth/signin", { email, password });
    localStorage.setItem("token", res.data.access_token);
  } catch (err) {
    handleError(err);
  }
};

export const signout = () => {
  localStorage.removeItem("token");
};

export const getMe = async () => {
  try {
    const res = await api.get("/auth/me");
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// EXTRACT
export const extractSingle = async (file, note) => {
  const form = new FormData();
  form.append("file", file);
  if (note) form.append("note", note);

  try {
    const res = await api.post("/extract", form);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const extractBothSides = async (front, back, note) => {
  const form = new FormData();
  form.append("front", front);
  form.append("back", back);
  if (note) form.append("note", note);

  try {
    const res = await api.post("/extract/both-sides", form);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const getAllCards = async () => {
  try {
    const res = await api.get("/extract/cards");
    return res.data;
  } catch (err) {
    handleError(err);
  }
};
