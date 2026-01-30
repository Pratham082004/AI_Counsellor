import apiClient from "./apiClient";

// Types for shortlist operations
export interface ShortlistItem {
  id: string;
  name: string;
  country: string;
  degree: string;
  field: string;
  estimated_tuition: number;
  difficulty: string;
  shortlisted_at?: string;
}

export interface LockedUniversity {
  id: string;
  name: string;
  country: string;
  degree: string;
  field: string;
  estimated_tuition: number;
  difficulty: string;
  locked_at?: string;
}

export interface ShortlistResponse {
  count: number;
  shortlisted_universities: ShortlistItem[];
}

export interface LockedUniversityResponse {
  locked_university: LockedUniversity | null;
  stage: string;
}

// API URLs for debugging
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
console.log('[ShortlistService] API Base URL:', API_BASE_URL);

export const addToShortlist = async (universityId: string): Promise<any> => {
  console.log('[ShortlistService] Adding to shortlist:', universityId);
  try {
    const res = await apiClient.post(`/shortlist/${universityId}`);
    console.log('[ShortlistService] Add to shortlist success:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('[ShortlistService] Add to shortlist error:', error.response?.data || error.message);
    throw error;
  }
};

export const getShortlist = async (): Promise<ShortlistResponse> => {
  console.log('[ShortlistService] Fetching shortlist...');
  try {
    const res = await apiClient.get<ShortlistResponse>("/shortlist");
    console.log('[ShortlistService] Get shortlist success:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('[ShortlistService] Get shortlist error:', error.response?.data || error.message);
    throw error;
  }
};

export const removeFromShortlist = async (universityId: string): Promise<any> => {
  console.log('[ShortlistService] Removing from shortlist:', universityId);
  try {
    const res = await apiClient.delete(`/shortlist/${universityId}`);
    console.log('[ShortlistService] Remove from shortlist success:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('[ShortlistService] Remove from shortlist error:', error.response?.data || error.message);
    throw error;
  }
};

// Lock/Unlock University Functions
export const lockUniversity = async (universityId: string): Promise<any> => {
  console.log('[ShortlistService] Locking university:', universityId);
  try {
    const res = await apiClient.post(`/shortlist/lock/${universityId}`);
    console.log('[ShortlistService] Lock university success:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('[ShortlistService] Lock university error:', error.response?.data || error.message);
    throw error;
  }
};

export const unlockUniversity = async (): Promise<any> => {
  console.log('[ShortlistService] Unlocking university...');
  try {
    const res = await apiClient.delete('/shortlist/lock/');
    console.log('[ShortlistService] Unlock university success:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('[ShortlistService] Unlock university error:', error.response?.data || error.message);
    throw error;
  }
};

export const getLockedUniversity = async (): Promise<LockedUniversityResponse> => {
  console.log('[ShortlistService] Fetching locked university...');
  try {
    const res = await apiClient.get<LockedUniversityResponse>('/shortlist/lock/');
    console.log('[ShortlistService] Get locked university success:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('[ShortlistService] Get locked university error:', error.response?.data || error.message);
    throw error;
  }
};
