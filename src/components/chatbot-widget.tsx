'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function ChatbotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize or retrieve session ID
  const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
  };

  // Connect to WebSocket
  const connectWebSocket = async () => {
    if (!user) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        text: 'Please log in to use the chat.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      setIsConnected(true);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

      if (!baseUrl) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Chat service is not configured.',
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const userId = user.uid;
      const sessionId = getSessionId();

      userIdRef.current = userId;
      sessionIdRef.current = sessionId;

      // Convert http to ws, https to wss
      const wsUrl = baseUrl.replace(/^http/, 'ws');
      const wsEndpoint = `${wsUrl}/ws/${userId}/${sessionId}`;

      console.log('Connecting to WebSocket:', wsEndpoint);

      const ws = new WebSocket(wsEndpoint);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsLoading(false);
      };

      ws.onmessage = (event) => {
        const text = event.data;
        console.log('Received:', text);

        // Update the last bot message or create a new one
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.type === 'bot' && lastMessage.id === 'streaming') {
            // Append to existing streaming message
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                text: lastMessage.text + text,
              },
            ];
          } else {
            // Create new bot message
            return [
              ...prev,
              {
                id: 'streaming',
                type: 'bot',
                text: text,
              },
            ];
          }
        });

        scrollToBottom();
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Connection error. Please try again.',
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsConnected(false);
        setIsLoading(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };

      websocketRef.current = ws;
    } catch (error) {
      console.error('Failed to connect:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // Connect when widget opens
  useEffect(() => {
    if (isOpen && !isConnected && user) {
      connectWebSocket();
    }
  }, [isOpen, user]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        text: 'Not connected. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message through WebSocket
      websocketRef.current.send(input);

      // Reset the streaming message ID after sending
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === 'streaming' ? { ...msg, id: Date.now().toString() } : msg
          )
        );
        setIsLoading(false);
      }, 500);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        text: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Connection will be established in the useEffect
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-96 h-96 flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-t-lg flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <h3 className="font-semibold text-sm">Ask AI</h3>
              <span className={cn('w-2 h-2 rounded-full', isConnected ? 'bg-green-400' : 'bg-red-400')} />
            </div>
            <button
              onClick={handleClose}
              className="hover:bg-blue-800 p-1 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-8">
                <p>Hello! How can I help you today?</p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-xs px-4 py-2 rounded-lg text-sm',
                    message.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && !messages.some((m) => m.id === 'streaming') && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg text-sm rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg flex gap-2">
            <Input
              type="text"
              placeholder={isConnected ? 'Type your message...' : 'Connecting...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!isConnected || isLoading}
              className="text-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!isConnected || isLoading || !input.trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={handleOpen}
        className={cn(
          'rounded-full p-4 shadow-lg transition-all duration-300 flex items-center justify-center',
          isOpen
            ? 'bg-gray-600 hover:bg-gray-700'
            : 'bg-blue-600 hover:bg-blue-700'
        )}
      >
        <MessageCircle size={24} className="text-white" />
      </button>
    </div>
  );
}
