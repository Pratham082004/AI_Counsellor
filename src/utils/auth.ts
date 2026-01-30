import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  sub: string;
  email: string;
  stage: string;
  exp: number;
  iat: number;
}

/**
 * Get the JWT token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem("access_token");
}

/**
 * Get the decoded user information from the JWT token
 */
export function getUserFromToken(): DecodedToken | null {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getUserFromToken() !== null;
}

/**
 * Clear authentication and redirect to login
 */
export function logout(): void {
  localStorage.removeItem("access_token");
  window.location.href = "/login";
}

/**
 * Set the authentication token
 */
export function setToken(token: string): void {
  localStorage.setItem("access_token", token);
}
