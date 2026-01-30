import apiClient from './apiClient';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  conversation_id: string | null;
}

export interface SendMessageResponse {
  response: string;
  conversation_id: string;
  is_new_conversation: boolean;
}

export interface NewConversationResponse {
  conversation_id: string;
  greeting: string;
}

const aiCounsellorService = {
  // Get chat history for the current user
  getChatHistory: async (): Promise<ChatHistoryResponse> => {
    const response = await apiClient.get('/ai/counsellor/history');
    return response.data;
  },

  // Send a message to the AI counsellor
  sendMessage: async (
    message: string,
    conversationId?: string
  ): Promise<SendMessageResponse> => {
    const response = await apiClient.post('/ai/counsellor/chat', {
      message,
      conversation_id: conversationId || null
    });
    return response.data;
  },

  // Start a new conversation
  startNewConversation: async (): Promise<NewConversationResponse> => {
    const response = await apiClient.post('/ai/counsellor/new-conversation');
    return response.data;
  }
};

export default aiCounsellorService;

