import { create } from "zustand";
import {
  login as loginApi,
  refreshToken as refreshTokenApi,
  logout as logoutApi,
} from "../src/api/login";
import { readPatients } from "../src/api/patient";
import { getWorkerInfo } from "../src/api/add-worker";

// Token decode helper (JWT içindən userId və ya username çıxartmaq üçün)
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    return null;
  }
}

// Check if token is expired
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return true;
    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  } catch (err) {
    return true;
  }
}

function readCachedUser() {
  try {
    const cached = localStorage.getItem("user");
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

const hasRoleList = (user) => Array.isArray(user?.permissions);

// İlk render-dən token/user hazır olsun ki, route guard səhifəni
// icazə yoxlanmadan göstərməsin.
const initialToken = localStorage.getItem("token");
const initialUser = initialToken ? readCachedUser() : null;

const useAuthStore = create((set) => ({
  user: initialUser,
  token: initialToken,
  // İstifadəçinin rolları (user.permissions) məlumdurmu: loading | loaded | failed
  userInfoStatus: hasRoleList(initialUser) ? "loaded" : initialToken ? "loading" : "idle",
  loading: false,
  error: null,

  login: async ({ username, password }) => {
    set({ loading: true, error: null });
    try {
      const response = await loginApi({ username, password });

      // ✅ Backend cavabına uyğun götürürük
      const token = response.tokenPair?.accessToken;
      const refreshToken = response.tokenPair?.refreshToken;

      // Əgər token JWT-dirsə, içindən məlumat çıxara bilərik
      const decoded = parseJwt(token);
      const userId = decoded?.sub || null;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        if (userId) {
          localStorage.setItem("userId", userId);
        }

        // Əvvəlki istifadəçinin keşlənmiş məlumatı (rolları) yeni sessiyaya keçməsin
        localStorage.removeItem("user");

        let userData = { id: userId, username: decoded?.username || username };
        let userInfoStatus = "failed";
        try {
          if (userId) {
            const workerInfo = await getWorkerInfo(userId);
            userData = { ...userData, ...workerInfo };
            localStorage.setItem("user", JSON.stringify(userData));
            userInfoStatus = "loaded";
          }
        } catch (err) {
          console.error("Failed to fetch user info during login:", err);
        }

        set({
          token,
          user: userData,
          userInfoStatus,
          loading: false,
        });

        // Login olduqdan sonra cache kontrolü yap
        // Əgər cache varsa istek atma, yoxdursa istek at və cache-ə yaddaşa saxla
        try {
          const cachedData = localStorage.getItem("patients_cache");
          if (!cachedData) {
            // Cache yoxdursa, API-dən gətir və cache-ə yaddaşa saxla
            await readPatients(true); // Cache kontrolü yap, yoxdursa API-dən gətir
          }
          // Cache varsa heç nə etmə, istek atma
        } catch (err) {
          console.error("Patients fetch xətası (login):", err);
          // Bu xəta login-i dayandırmamalıdır
        }

        return true;
      } else {
        throw new Error("Token tapılmadı");
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Login failed",
        loading: false,
      });
      return false;
    }
  },

  logout: () => {
    // Backend refresh tokeni silir və cari access tokeni etibarsız edir; cavabı gözləmirik
    const currentToken = localStorage.getItem("token");
    if (currentToken) {
      logoutApi(currentToken).catch(() => {});
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    // Patients cache-i sil
    localStorage.removeItem("patients_cache");
    localStorage.removeItem("patients_cache_timestamp");
    // Worker info cache-lərini sil (bütün user ID-ləri üçün)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("worker_info_")) {
        localStorage.removeItem(key);
      }
    });
    set({ user: null, token: null, userInfoStatus: "idle" });
  },

  loadTokenFromStorage: async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const cachedUser = readCachedUser();
    if (token) {
      let userData = cachedUser || { id: userId };
      set({ token, user: userData });

      if (userId) {
        try {
          const workerInfo = await getWorkerInfo(userId);
          userData = { ...userData, ...workerInfo };
          localStorage.setItem("user", JSON.stringify(userData));
          set({ user: userData, userInfoStatus: "loaded" });
        } catch (err) {
          console.error("Failed to fetch fresh user info on storage load:", err);
          // Keşdə rollar varsa onlarla davam et, yoxdursa guard xəta göstərsin
          set({ userInfoStatus: hasRoleList(userData) ? "loaded" : "failed" });
        }
      } else {
        set({ userInfoStatus: hasRoleList(userData) ? "loaded" : "failed" });
      }
    }
  },

  // Refresh access token using refresh token
  refreshAccessToken: async (accessTokenFromCaller) => {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken");
      const currentAccessToken =
        accessTokenFromCaller || localStorage.getItem("token");
      if (!refreshTokenValue) {
        throw new Error("Refresh token not found");
      }

      const response = await refreshTokenApi(
        refreshTokenValue,
        currentAccessToken
      );
      const status = response?.status;
      const payload = response?.data;
      const newAccessToken = payload?.tokenPair?.accessToken;
      const newRefreshToken = payload?.tokenPair?.refreshToken;

      if (status === 200 && newAccessToken) {
        localStorage.setItem("token", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        const decoded = parseJwt(newAccessToken);
        const userId = decoded?.sub || null;
        if (userId) {
          localStorage.setItem("userId", userId);
        }

        set({ token: newAccessToken });
        return newAccessToken;
      } else {
        throw new Error("New access token not received");
      }
    } catch (error) {
      console.error("Refresh token failed:", error);
      // Clear tokens and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      set({ token: null, user: null });
      throw error;
    }
  },

  setError: (error) => set({ error }),
}));

export default useAuthStore;
