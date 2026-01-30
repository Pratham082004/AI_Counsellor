import apiClient from "./apiClient";
import { University, UniversityResponse } from "../types/university";

// API Base URL for debugging
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
console.log('[UniversityService] API Base URL:', API_BASE_URL);

// Structured logging helper
const logRequest = (method: string, url: string, params?: any) => {
  console.log(`[UniversityService] 📤 ${method} ${url}`, {
    timestamp: new Date().toISOString(),
    params: params || 'none'
  });
};

const logSuccess = (method: string, url: string, data: any) => {
  console.log(`[UniversityService] ✅ ${method} ${url} SUCCESS`, {
    timestamp: new Date().toISOString(),
    dataCount: Array.isArray(data) ? data.length : 'N/A',
    sample: Array.isArray(data) && data.length > 0 ? data[0] : data
  });
};

const logError = (method: string, url: string, error: any) => {
  console.error(`[UniversityService] ❌ ${method} ${url} ERROR`, {
    timestamp: new Date().toISOString(),
    status: error.response?.status || 'Network Error',
    message: error.response?.data?.detail || error.message || error,
    stack: error.stack
  });
};

export async function fetchUniversities(): Promise<University[]> {
  const url = '/universities/discover';
  logRequest('GET', url);
  
  try {
    const response = await apiClient.get<UniversityResponse>(url);
    logSuccess('GET', url, response.data.universities);
    return response.data.universities;
  } catch (error: any) {
    logError('GET', url, error);
    throw error;
  }
}

export async function refreshUniversities(): Promise<University[]> {
  const url = '/universities/discover/refresh';
  logRequest('POST', url);
  
  try {
    const response = await apiClient.post<UniversityResponse>(url);
    logSuccess('POST', url, response.data.universities);
    return response.data.universities;
  } catch (error: any) {
    logError('POST', url, error);
    throw error;
  }
}

// Helper function to format tuition for display
export function formatTuition(tuitionStr: string | number): string {
  const tuition = typeof tuitionStr === 'string' ? parseInt(tuitionStr) : tuitionStr;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(tuition);
}

// Helper function to get difficulty badge class
export function getDifficultyClass(difficulty: string): string {
  switch (difficulty) {
    case 'LOW':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'HIGH':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

// Helper function to get difficulty label
export function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'LOW':
      return 'Easy';
    case 'MEDIUM':
      return 'Moderate';
    case 'HIGH':
      return 'Competitive';
    default:
      return difficulty;
  }
}

