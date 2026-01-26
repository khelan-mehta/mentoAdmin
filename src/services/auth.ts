import { BASE_URL } from "../components/Constants";

const API_BASE_URL = BASE_URL;

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    access_token: string;
    refresh_token: string;
    user: AdminUser;
  };
  message?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

// Token storage keys
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "adminUser";

// Get stored auth state
export const getStoredAuth = (): AuthState => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  const user = userStr ? JSON.parse(userStr) : null;

  return {
    isAuthenticated: !!accessToken && !!user,
    user,
    accessToken,
    refreshToken,
  };
};

// Store auth data
export const storeAuth = (
  accessToken: string,
  refreshToken: string,
  user: AdminUser
) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Also store in the old key for backward compatibility
  localStorage.setItem("token", accessToken);
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("user", JSON.stringify({ email: user.email, name: user.name }));
};

// Clear auth data
export const clearAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("user");
};

// Get access token
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Register new admin
export const register = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (data.success && data.data) {
      storeAuth(data.data.access_token, data.data.refresh_token, data.data.user);
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
};

// Login
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success && data.data) {
      storeAuth(data.data.access_token, data.data.refresh_token, data.data.user);
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
};

// Refresh token
export const refreshToken = async (): Promise<boolean> => {
  try {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!storedRefreshToken) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/admin/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: storedRefreshToken }),
    });

    const data = await response.json();

    if (data.success && data.data) {
      storeAuth(data.data.access_token, data.data.refresh_token, data.data.user);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

// Logout
export const logout = () => {
  clearAuth();
};

// Authenticated fetch wrapper with automatic token refresh
export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const accessToken = getAccessToken();

  const headers = new Headers(options.headers as HeadersInit);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(url, { ...options, headers });

  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const refreshed = await refreshToken();

    if (refreshed) {
      const newAccessToken = getAccessToken();
      if (newAccessToken) {
        headers.set("Authorization", `Bearer ${newAccessToken}`);
      } else {
        headers.delete("Authorization");
      }
      response = await fetch(url, { ...options, headers });
    } else {
      // Refresh failed, logout
      logout();
      window.location.reload();
    }
  }

  return response;
};

// Get current admin info
export const getCurrentAdmin = async (): Promise<AdminUser | null> => {
  try {
    const response = await authFetch(`${API_BASE_URL}/admin/auth/me`);

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};
