import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Alert } from '../components';
import aiCounsellorService, { ChatMessage } from '../services/aiCounsellorService';
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// Reusable Components
const ChatMessageComponent: React.FC<{ message: ChatMessage }> = ({ message }) => (
  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
    <div
      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
        message.role === 'user'
          ? 'bg-blue-600 text-white rounded-br-md'
          : 'bg-gray-100 text-gray-900 rounded-bl-md'
      }`}
    >
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      <span className={`text-xs mt-1 block ${
        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
      }`}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  </div>
);

// Suggestion Button Component
const SuggestionButton: React.FC<{ text: string; onClick: (text: string) => void; disabled?: boolean }> = ({ text, onClick, disabled }) => (
  <button
    onClick={() => onClick(text)}
    disabled={disabled}
    className="w-full p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
        <Sparkles className="w-4 h-4 text-gray-600" />
      </div>
      <span className="text-sm text-gray-700 leading-relaxed">{text}</span>
    </div>
  </button>
);

// Main Component
export default function AICounsellorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await aiCounsellorService.getChatHistory();
      
      if (response.messages && response.messages.length > 0) {
        setMessages(response.messages);
        setConversationId(response.conversation_id);
      }
    } catch (err: any) {
      console.error('[AICounsellor] Failed to load chat history:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    // If no conversation exists, start a new one
    if (!conversationId) {
      await startNewConversation();
    }

    // Add user message optimistically
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await aiCounsellorService.sendMessage(content.trim(), conversationId || undefined);
      
      // Update conversation ID if this was a new conversation
      if (response.conversation_id && !conversationId) {
        setConversationId(response.conversation_id);
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('[AICounsellor] API Error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to get AI response';
      setError(errorMessage);

      // Remove the user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsTyping(false);
    }
  };

  const startNewConversation = async () => {
    try {
      const response = await aiCounsellorService.startNewConversation();
      
      const greetingMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.greeting,
        timestamp: new Date().toISOString()
      };

      setMessages([greetingMessage]);
      setConversationId(response.conversation_id);
    } catch (err: any) {
      console.error('[AICounsellor] Failed to start new conversation:', err);
      setError('Failed to start new conversation');
    }
  };

  const suggestions = [
    "Analyze my profile and suggest improvements",
    "Recommend universities that fit my profile",
    "What should I focus on next?",
    "Help me understand my chances at top universities"
  ];

  const hasMessages = messages.length > 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your chat...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="flex items-center justify-between p-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Counsellor</h1>
              <p className="text-sm text-gray-600">Your personal study abroad advisor</p>
            </div>
          </div>
          
          {hasMessages && (
            <Button
              variant="secondary"
              size="sm"
              onClick={startNewConversation}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              New Conversation
            </Button>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {!hasMessages ? (
            /* Empty/Welcome State */
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Welcome to AI Counsellor
              </h2>
              <p className="text-gray-600 text-center max-w-md mb-8">
                I&apos;m here to guide your study abroad journey. Ask me about universities, profile improvements, or next steps.
              </p>

              {/* Error Display */}
              {error && (
                <div className="w-full max-w-lg mb-6">
                  <Alert type="error" title="Connection Error">
                    {error}
                  </Alert>
                </div>
              )}

              {/* Start Chat Button */}
              <Button
                size="lg"
                onClick={startNewConversation}
                className="flex items-center gap-2 mb-8"
              >
                <Sparkles className="w-5 h-5" />
                Start Chatting
              </Button>

              {/* Suggested Prompts */}
              <div className="w-full max-w-lg space-y-3">
                <p className="text-sm text-gray-500 mb-2">Or try asking:</p>
                {suggestions.map((suggestion, index) => (
                  <SuggestionButton
                    key={index}
                    text={suggestion}
                    onClick={handleSendMessage}
                    disabled={isTyping}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="max-w-4xl mx-auto">
                {messages.map((message) => (
                  <ChatMessageComponent key={message.id} message={message} />
                ))}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Chat Input - Always at bottom */}
          <div className="flex-shrink-0 border-t border-gray-200">
            <div className="flex items-center gap-3 p-4 bg-white">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about universities, your profile, or next steps..."
                  onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage(inputValue)}
                  disabled={isTyping}
                  className="w-full"
                />
              </div>
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isTyping || !inputValue.trim()}
                size="md"
                className="px-4"
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

