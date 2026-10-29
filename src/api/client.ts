import axios from "axios"

/** Base API URL from `.env`; trailing slashes are stripped to avoid `//beers`-style URLs. */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "")

/** Configured axios instance for all API requests */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})
