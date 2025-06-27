"use client";

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function ChatWidgetPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hi! I\'m here to help you with questions about Clearinghouse CDFI. What would you like to know?' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [namespace, setNamespace] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Check for existing namespace or create one
  useEffect(() => {
    const initializeNamespace = async () => {
      try {
        // First check if there's already an index
        const checkResponse = await fetch('/api/indexes');
        if (checkResponse.ok) {
          const indexData = await checkResponse.json();
          // Look for any clearinghouse namespace in the indexes
          if (indexData.indexes && indexData.indexes.length > 0) {
            const clearinghouseIndex = indexData.indexes.find((idx: any) => 
              idx.namespace && idx.namespace.includes('clearinghousecdfi')
            );
            if (clearinghouseIndex) {
              setNamespace(clearinghouseIndex.namespace);
              setIsLoading(false);
              return;
            }
          }
        }

        // If no index exists, create one
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Setting up your chatbot for the first time. This may take a moment...' 
        }]);

        const createResponse = await fetch('/api/firestarter/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            url: 'https://www.clearinghousecdfi.com',
            limit: 25
          })
        });

        const createData = await createResponse.json();
        
        if (createData.success && createData.namespace) {
          setNamespace(createData.namespace);
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'Ready! I now have access to information about Clearinghouse CDFI. What would you like to know?' 
          }]);
        } else {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'I\'m having trouble accessing the Clearinghouse CDFI information right now. Please try refreshing the page.' 
          }]);
        }
      } catch (error) {
        console.error('Error initializing namespace:', error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'I\'m experiencing some technical difficulties. Please try again later.' 
        }]);
      }
      setIsLoading(false);
    };

    initializeNamespace();
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !namespace) return;

    const userMessage: Message = { role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: `firecrawl-${namespace}`,
          messages: newMessages,
          stream: false
        })
      });

      setIsTyping(false);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.choices[0].message.content;
      
      setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
      
    } catch (error) {
      setIsTyping(false);
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800 flex items-center justify-center">
      {/* Main Content */}
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4 text-shadow-lg">
          Clearinghouse CDFI
        </h1>
        <p className="text-xl opacity-90 font-light">
          Mission-Driven Lending
        </p>
      </div>

      {/* Chatbot Widget */}
      <div className="fixed bottom-5 right-5 z-50">
        {/* Chat Toggle Button */}
        <button
          onClick={toggleChat}
          className="w-16 h-16 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
        >
          <svg 
            className="w-6 h-6 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        </button>

        {/* Chat Window */}
        {isChatOpen && (
          <div className="absolute bottom-20 right-0 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-orange-500 text-white rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">CDFI Assistant</div>
                  <div className="text-xs opacity-90">
                    {isLoading ? 'Setting up...' : 'Online'}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-white/80 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                    <div className="flex space-x-1">
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
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isLoading ? "Setting up..." : "Ask about loans, programs, eligibility..."}
                  disabled={isLoading || !namespace}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 disabled:bg-gray-100"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !namespace || !inputValue.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .text-shadow-lg {
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
} 