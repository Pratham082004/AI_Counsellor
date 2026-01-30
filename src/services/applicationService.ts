import apiClient from "./apiClient";

// API Base URL for debugging
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
console.log('[ApplicationService] API Base URL:', API_BASE_URL);

// =========================
// STRUCTURED LOGGING HELPERS
// =========================
const logRequest = (method: string, url: string, params?: any) => {
  console.log(`[ApplicationService] 📤 ${method} ${url}`, {
    timestamp: new Date().toISOString(),
    params: params || 'none'
  });
};

const logSuccess = (method: string, url: string, data: any) => {
  console.log(`[ApplicationService] ✅ ${method} ${url} SUCCESS`, {
    timestamp: new Date().toISOString(),
    data: typeof data === 'object' ? data : data
  });
};

const logError = (method: string, url: string, error: any) => {
  console.error(`[ApplicationService] ❌ ${method} ${url} ERROR`, {
    timestamp: new Date().toISOString(),
    status: error.response?.status || 'Network Error',
    message: error.response?.data?.detail || error.message || error,
    stack: error.stack
  });
};

// =========================
// TYPES
// =========================

// Locked University
export interface LockedUniversity {
  id: string;
  name: string;
  country: string;
  degree: string;
  field: string;
  estimated_tuition?: number;
  difficulty?: string;
}

// Checklist Item
export interface ChecklistItem {
  id: string;
  item_name: string;
  status: 'pending' | 'submitted' | 'approved';
  notes?: string;
  submitted_at?: string;
  approved_at?: string;
}

// Checklist Progress
export interface ChecklistProgress {
  total: number;
  pending: number;
  submitted: number;
  approved: number;
  completion_percentage: number;
}

// Application Checklist Response
export interface ApplicationChecklistResponse {
  locked_university: LockedUniversity | null;
  checklist: ChecklistItem[];
  progress: ChecklistProgress;
}

// Task (boolean completion style)
export interface Task {
  task: string;
  completed: boolean;
}

// Tasks Response
export interface TasksResponse {
  locked_university_id: string;
  tasks: Task[];
  stage: string;
}

// Complete Task Response
export interface CompleteTaskResponse {
  message: string;
  task: string;
  stage: string;
}

// Update Checklist Item Payload
export interface UpdateChecklistItemPayload {
  status: 'pending' | 'submitted' | 'approved';
  notes?: string;
}

// Update Checklist Item Response
export interface UpdateChecklistItemResponse {
  message: string;
  item: ChecklistItem;
}

// Application Document
export interface ApplicationDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  notes?: string;
  is_final?: boolean;
  created_at: string;
  updated_at?: string;
}

// Documents Response
export interface DocumentsResponse {
  documents: ApplicationDocument[];
}

// Upload Document Payload
export interface UploadDocumentPayload {
  file: File;
  document_type: string;
  checklist_item_id?: string;
  notes?: string;
}

// Upload Document Response
export interface UploadDocumentResponse {
  message: string;
  document: ApplicationDocument;
}

// SOP Draft
export interface SOPDraft {
  id: string;
  title: string;
  content: string;
  version: number;
  is_draft: boolean;
  created_at: string;
  updated_at?: string;
}

// SOP Drafts Response
export interface SOPDraftsResponse {
  drafts: SOPDraft[];
}

// Create SOP Draft Payload
export interface CreateSOPDraftPayload {
  title: string;
  content: string;
}

// Create SOP Draft Response
export interface CreateSOPDraftResponse {
  message: string;
  draft: SOPDraft;
}

// Update SOP Draft Payload
export interface UpdateSOPDraftPayload {
  title?: string;
  content?: string;
}

// Update SOP Draft Response
export interface UpdateSOPDraftResponse {
  message: string;
  draft: SOPDraft;
}

// Generate SOP with AI Payload
export interface GenerateSOPPayload {
  prompt: string;
}

// Generate SOP Response
export interface GenerateSOPResponse {
  message: string;
  draft: SOPDraft;
}

// Delete SOP Draft Response
export interface DeleteSOPDraftResponse {
  message: string;
}

// Delete Document Response
export interface DeleteDocumentResponse {
  message: string;
}

// Initialize Checklist Response
export interface InitializeChecklistResponse {
  message: string;
  items?: string[];
  status: string;
}

// =========================
// CHECKLIST FUNCTIONS
// =========================

/**
 * Initialize checklist items for locked university
 */
export const initializeChecklist = async (): Promise<InitializeChecklistResponse> => {
  const url = '/applications/initialize';
  logRequest('POST', url);
  
  try {
    const res = await apiClient.post<InitializeChecklistResponse>(url);
    logSuccess('POST', url, res.data);
    return res.data;
  } catch (error: any) {
    logError('POST', url, error);
    throw error;
  }
};

/**
 * Get application checklist for current user
 */
export const getApplicationChecklist = async (): Promise<ApplicationChecklistResponse> => {
  const url = '/applications/checklist';
  logRequest('GET', url);
  
  try {
    const res = await apiClient.get<ApplicationChecklistResponse>(url);
    logSuccess('GET', url, res.data);
    return res.data;
  } catch (error: any) {
    logError('GET', url, error);
    throw error;
  }
};

/**
 * Get a specific checklist item
 */
export const getChecklistItem = async (itemId: string): Promise<{ item: ChecklistItem }> => {
  const url = `/applications/checklist/${itemId}`;
  logRequest('GET', url);
  
  try {
    const res = await apiClient.get<{ item: ChecklistItem }>(url);
    logSuccess('GET', url, res.data);
    return res.data;
  } catch (error: any) {
    logError('GET', url, error);
    throw error;
  }
};

// =========================
// TASKS FUNCTIONS
// =========================

/**
 * Get tasks with boolean completion status
 */
export const getTasks = async (): Promise<TasksResponse> => {
  const url = '/applications/tasks';
  logRequest('GET', url);
  
  try {
    const res = await apiClient.get<TasksResponse>(url);
    logSuccess('GET', url, res.data);
    return res.data;
  } catch (error: any) {
    logError('GET', url, error);
    throw error;
  }
};

/**
 * Complete a task (mark as submitted)
 */
export const completeTask = async (task: string): Promise<CompleteTaskResponse> => {
  const url = `/applications/tasks/${task}/complete`;
  logRequest('POST', url, { task });
  
  try {
    const res = await apiClient.post<CompleteTaskResponse>(url);
    logSuccess('POST', url, res.data);
    return res.data;
  } catch (error: any) {
    logError('POST', url, error);
    throw error;
  }
};

/**
 * Update a checklist item status
 */
export const updateChecklistItem = async (
  itemId: string,
  payload: UpdateChecklistItemPayload
): Promise<UpdateChecklistItemResponse> => {
  const url = `/applications/checklist/${itemId}`;
  logRequest('PUT', url, payload);
  
  try {
    const res = await apiClient.put<UpdateChecklistItemResponse>(url, payload);
    logSuccess('PUT', url, res.data);
    return res.data;
  } catch (error: any) {
    logError('PUT', url, error);
    throw error;
  }
};

// =========================
// DOCUMENT FUNCTIONS
// =========================

/**
 * Upload a document for application checklist
 * Note: Uses FormData for file upload
 */
export const uploadDocument = async (payload: UploadDocumentPayload): Promise<UploadDocumentResponse> => {
  const url = '/applications/documents/upload';
  logRequest('POST', url, {
    document_type: payload.document_type,
    file_name: payload.file.name,
    checklist_item_id: payload.checklist_item_id,
    notes: payload.notes
  });
  
  try {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('document_type', payload.document_type);
    if (payload.checklist_item_id) {
      formData.append('checklist_item_id', payload.checklist_item_id);
    }
    if (payload.notes) {
      formData.append('notes', payload.notes);
    }

    const res = await apiClient.post<UploadDocumentResponse>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    logSuccess('POST', url, res.data);
    return res.data;
  } catch (error: any) {
    logError('POST', url, error);
    throw error;
  }
};

/**
 * Get all documents for current user
 */
export const getUserDocuments = async (): Promise<DocumentsResponse> => {
  const url = '/applications/documents';
  logRequest('GET', url);
  
  try {
    const res = await apiClient.get<DocumentsResponse>(url);
    logSuccess('GET', url, res.data);
    return res.data;
  } catch (error: any) {
    logError('GET', url, error);
    throw error;
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (documentId: string): Promise<DeleteDocumentResponse> => {
  const url = `/applications/documents/${documentId}`;
  logRequest('DELETE', url);
  
  try {
    const res = await apiClient.delete<DeleteDocumentResponse>(url);
    logSuccess('DELETE', url, res.data);
    return res.data;
  } catch (error: any) {
    logError('DELETE', url, error);
    throw error;
  }
};

// =========================
// SOP DRAFT FUNCTIONS
// =========================

/**
 * Create a new SOP draft
 */
export const createSOPDraft = async (payload: CreateSOPDraftPayload): Promise<CreateSOPDraftResponse> => {
  const url = '/applications/sop/drafts';
  logRequest('POST', url, payload);
  
  try {
    const res = await apiClient.post<CreateSOPDraftResponse>(url, payload);
    logSuccess('POST', url, res.data);
    return res.data;
  } catch (error: any) {
    logError('POST', url, error);
    throw error;
  }
};

/**
 * Get all SOP drafts for current user
 */
export const getSOPDrafts = async (): Promise<SOPDraftsResponse> => {
  const url = '/applications/sop/drafts';
  logRequest('GET', url);
  
  try {
    const res = await apiClient.get<SOPDraftsResponse>(url);
    logSuccess('GET', url, res.data);
    return res.data;
  } catch (error: any) {
    logError('GET', url, error);
    throw error;
  }
};

/**
 * Update an SOP draft
 */
export const updateSOPDraft = async (
  draftId: string,
  payload: UpdateSOPDraftPayload
): Promise<UpdateSOPDraftResponse> => {
  const url = `/applications/sop/drafts/${draftId}`;
  logRequest('PUT', url, payload);
  
  try {
    const res = await apiClient.put<UpdateSOPDraftResponse>(url, payload);
    logSuccess('PUT', url, res.data);
    return res.data;
  } catch (error: any) {
    logError('PUT', url, error);
    throw error;
  }
};

/**
 * Delete an SOP draft
 */
export const deleteSOPDraft = async (draftId: string): Promise<DeleteSOPDraftResponse> => {
  const url = `/applications/sop/drafts/${draftId}`;
  logRequest('DELETE', url);
  
  try {
    const res = await apiClient.delete<DeleteSOPDraftResponse>(url);
    logSuccess('DELETE', url, res.data);
    return res.data;
  } catch (error: any) {
    logError('DELETE', url, error);
    throw error;
  }
};

/**
 * Generate SOP content using AI
 */
export const generateSOPWithAI = async (prompt: string): Promise<GenerateSOPResponse> => {
  const url = '/applications/sop/generate';
  logRequest('POST', url, { prompt });
  
  try {
    const formData = new FormData();
    formData.append('prompt', prompt);

    const res = await apiClient.post<GenerateSOPResponse>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    logSuccess('POST', url, res.data);
    return res.data;
  } catch (error: any) {
    logError('POST', url, error);
    throw error;
  }
};

