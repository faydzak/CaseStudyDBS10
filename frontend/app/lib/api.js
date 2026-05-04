import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Token helpers ─────────────────────────────────────────
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
export function setToken(t) {
  localStorage.setItem("token", t);
}
export function removeToken() {
  localStorage.removeItem("token");
}

export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}
export function setUser(u) {
  localStorage.setItem("user", JSON.stringify(u));
}
export function removeUser() {
  localStorage.removeItem("user");
}

export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  removeToken();
  removeUser();
  window.location.href = "/login";
}

// ── Auth ──────────────────────────────────────────────────
export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  if (data.token) setToken(data.token);
  if (data.user)  setUser(data.user);
  return data;
}

export async function register(name, email, password) {
  const { data } = await api.post("/user/register", { name, email, password });
  return data;
}

// ── Items ─────────────────────────────────────────────────
export async function getItems() {
  const { data } = await api.get("/items");
  return Array.isArray(data) ? data : (data.items ?? []);
}

// ── Transactions ──────────────────────────────────────────
export async function createTransaction(item_id, quantity) {
  const { data } = await api.post("/transaction/create", { item_id, quantity });
  return data;
}

export async function getUserHistory() {
  const { data } = await api.get("/user/history");
  return Array.isArray(data) ? data : (data.history ?? data.transactions ?? []);
}

export async function getUserTotalSpent() {
  try {
    const { data } = await api.get("/user/total-spent");
    return data.total_spent ?? data.total ?? data.amount ?? null;
  } catch {
    return null;
  }
}

// ── Formatters ────────────────────────────────────────────
export function formatRupiah(num) {
  return "Rp " + Number(num).toLocaleString("id-ID");
}

export function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}