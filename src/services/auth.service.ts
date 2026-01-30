import apiClient from './apiClient';

/* ======================
   Request Payloads
====================== */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export interface ResendOtpPayload {
  email: string;
}

/* ======================
   Response Types
====================== */

export interface AuthUser {
  id: string;
  email: string;
  stage: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface SignupResponse {
  message: string;
}

export interface VerifyOtpResponse {
  message: string;
  email: string;
}

export interface ResendOtpResponse {
  message: string;
}

/* ======================
   API Calls with Error Handling
====================== */

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  try {
    const response = await apiClient.post<SignupResponse>('/auth/signup', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  try {
    const response = await apiClient.post<VerifyOtpResponse>('/auth/verify-otp', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function resendOtp(payload: ResendOtpPayload): Promise<ResendOtpResponse> {
  try {
    const response = await apiClient.post<ResendOtpResponse>('/auth/resend-otp', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

