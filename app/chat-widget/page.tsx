"use client";

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function ChatWidgetPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'system', 
      content: 'You are a helpful assistant for Clearinghouse CDFI.' 
    },
    { 
      role: 'assistant', 
      content: 'Hi! I\'m here to help you with questions about Clearinghouse CDFI. What would you like to know?' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

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
          model: 'firecrawl-www-clearinghousecdfi-com-1751001570474',
          messages: newMessages,
          stream: false
        })
      });

      setIsTyping(false);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
          <div className="absolute bottom-20 right-0 w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Chat Assistant</h3>
                  <p className="text-xs text-orange-100">Ask me anything about Clearinghouse CDFI</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-white hover:text-orange-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white space-y-4">
              {messages.slice(1).map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {message.role === 'user' ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2L7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2l-1.5 1.5z"/>
                        </svg>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`p-3 rounded-xl shadow-sm ${
                        message.role === 'user'
                          ? 'bg-orange-500 text-white rounded-br-md'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      ) : (
                        <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            className="markdown-content"
                            components={{
                              p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                              strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                              em: ({children}) => <em className="italic">{children}</em>,
                              code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                              ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                              li: ({children}) => <li className="text-gray-700">{children}</li>,
                              h1: ({children}) => <h1 className="text-lg font-semibold mb-2 text-gray-900">{children}</h1>,
                              h2: ({children}) => <h2 className="text-base font-semibold mb-1 text-gray-900">{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-semibold mb-1 text-gray-900">{children}</h3>,
                              blockquote: ({children}) => <blockquote className="border-l-2 border-gray-300 pl-2 italic text-gray-600">{children}</blockquote>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2L7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2l-1.5 1.5z"/>
                      </svg>
                    </div>
                    <div className="bg-white border border-gray-200 p-3 rounded-xl rounded-bl-md shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-3 items-end">
                <div className="flex-1">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 text-sm resize-none transition-all duration-200"
                    disabled={isTyping}
                    rows={1}
                    style={{
                      minHeight: '44px',
                      maxHeight: '100px',
                      height: 'auto'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 100) + 'px';
                    }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={isTyping || !inputValue.trim()}
                  className="w-11 h-11 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
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
        @keyframes slide-in-from-bottom-5 {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-in {
          animation: slide-in-from-bottom-5 0.3s ease-out;
        }
        
        /* Markdown styling */
        .markdown-content {
          color: inherit;
        }
        
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
          margin: 0;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .fixed.bottom-5.right-5 .w-96 {
            width: calc(100vw - 2.5rem);
            right: 1.25rem;
            left: 1.25rem;
          }
          
          .fixed.bottom-5.right-5 .h-\\[500px\\] {
            height: calc(100vh - 5rem);
            max-height: 600px;
          }
        }
        
        @media (max-width: 480px) {
          .fixed.bottom-5.right-5 .w-96 {
            width: calc(100vw - 1rem);
            right: 0.5rem;
            left: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
} 