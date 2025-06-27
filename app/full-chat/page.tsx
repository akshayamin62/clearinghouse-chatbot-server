"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, UserIcon, X, MessageCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export default function ContactWidgetPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your Clearinghouse CDFI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCollectingContact, setIsCollectingContact] = useState(false);
  const [contactStep, setContactStep] = useState<'name' | 'email' | 'phone' | 'complete'>('name');
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ name: '', email: '', phone: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Check if user input is contact-related
  const isContactRequest = (userInput: string): boolean => {
    const contactTriggers = [
      'contact',
      'call me',
      'phone me',
      'reach out',
      'get in touch',
      'speak to someone',
      'talk to someone',
      'human help',
      'representative',
      'agent',
      'team member',
      'callback',
      'call back',
      'need help',
      'assistance',
      'support',
      'more information',
      'info',
      'details',
      'consultation',
      'meeting',
      'appointment'
    ];
    
    const lowerInput = userInput.toLowerCase();
    return contactTriggers.some(trigger => lowerInput.includes(trigger));
  };

  const handleContactCollection = async (userInput: string) => {
    const trimmedInput = userInput.trim();
    
    if (contactStep === 'name') {
      setContactInfo(prev => ({ ...prev, name: trimmedInput }));
      addMessage('user', trimmedInput);
      addMessage('assistant', `Nice to meet you, ${trimmedInput}! What's your email address?`);
      setContactStep('email');
    } else if (contactStep === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedInput)) {
        addMessage('user', trimmedInput);
        addMessage('assistant', 'Please enter a valid email address.');
        return;
      }
      
      setContactInfo(prev => ({ ...prev, email: trimmedInput }));
      addMessage('user', trimmedInput);
      addMessage('assistant', 'Great! And what\'s your phone number?');
      setContactStep('phone');
    } else if (contactStep === 'phone') {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = trimmedInput.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone) && cleanPhone.length < 10) {
        addMessage('user', trimmedInput);
        addMessage('assistant', 'Please enter a valid phone number.');
        return;
      }
      
      const finalContactInfo = { ...contactInfo, phone: trimmedInput };
      setContactInfo(finalContactInfo);
      addMessage('user', trimmedInput);
      
      // Submit contact info to API
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalContactInfo)
        });
        
        if (response.ok) {
          addMessage('assistant', '🎉 Perfect! Our team will reach out to you within 24 hours. Is there anything else I can help you with?');
        } else {
          addMessage('assistant', 'Got your information! Our team will be in touch soon. How else can I assist you?');
        }
      } catch (error) {
        console.error('Error submitting contact info:', error);
        addMessage('assistant', 'I\'ve noted your contact information. Our team will reach out to you soon!');
      }
      
      // Reset contact collection
      setIsCollectingContact(false);
      setContactStep('name');
      setContactInfo({ name: '', email: '', phone: '' });
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Handle contact information collection
    if (isCollectingContact) {
      handleContactCollection(userMessage);
      return;
    }

    // Add user message
    addMessage('user', userMessage);

    // Check if it's a contact request - trigger contact form directly
    if (isContactRequest(userMessage)) {
      setIsCollectingContact(true);
      setContactStep('name');
      addMessage('assistant', 'I\'d be happy to have someone from our team contact you! Let\'s start with your name.');
      return;
    }

    // For other questions, use the API
    setIsLoading(true);

    try {
      const apiMessages = [
        {
          role: 'system',
          content: `You are a helpful Clearinghouse CDFI assistant. Keep responses under 50 words. If users need more detailed help, suggest they contact your team.`
        },
        ...messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        {
          role: 'user',
          content: userMessage
        }
      ];

      const response = await fetch('/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'firecrawl-www-clearinghousecdfi-com-1751034876204',
          messages: apiMessages,
          max_tokens: 10,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.choices[0].message.content;
      
      addMessage('assistant', botResponse);
      
    } catch (error) {
      console.error('Error:', error);
      addMessage('assistant', 'I\'m having trouble connecting. Would you like me to have someone contact you instead?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Clearinghouse CDFI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Community Development Financial Institution
          </p>
          <p className="text-gray-500">
            Need help? Click the chat button in the bottom-right corner!
          </p>
        </div>
      </div>

      {/* Floating Chat Widget - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        
        {/* Chat Window */}
        {isChatOpen && (
          <div className="absolute bottom-20 right-0 w-96 h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 border border-gray-100">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Clearinghouse CDFI</h3>
                  <p className="text-xs text-orange-100 font-medium">Community Lending Assistant</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-white hover:text-orange-200 transition-all duration-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20 hover:scale-105"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' 
                        : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'
                    }`}>
                      {message.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    
                    {/* Message Content */}
                    <div className={`rounded-2xl p-4 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}>
                      <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                      <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-orange-100' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 text-white flex items-center justify-center shadow-md">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-75" />
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-150" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Contact collection indicator */}
              {isCollectingContact && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 text-orange-700">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <UserIcon size={12} className="text-white" />
                    </div>
                    <span className="font-semibold text-sm">
                      Contact Information - Step {contactStep === 'name' ? '1' : contactStep === 'email' ? '2' : '3'} of 3
                    </span>
                  </div>
                  <p className="text-sm text-orange-600 mt-2 ml-9 font-medium">
                    {contactStep === 'name' && 'Please provide your full name'}
                    {contactStep === 'email' && 'Please provide your email address'}
                    {contactStep === 'phone' && 'Please provide your phone number'}
                  </p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isCollectingContact 
                      ? `Enter your ${contactStep}...`
                      : "Ask about loans or type 'contact me'..."
                  }
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-medium placeholder-gray-400 shadow-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 disabled:scale-100"
                >
                  <Send size={16} />
                </button>
              </div>
              
              {/* Quick action buttons */}
              {!isCollectingContact && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setInputValue("What loans do you offer?")}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition-all duration-200 hover:shadow-sm"
                  >
                    💰 Loans
                  </button>
                  <button
                    onClick={() => setInputValue("Contact me")}
                    className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl text-xs font-medium transition-all duration-200 hover:shadow-sm"
                  >
                    📞 Contact Me
                  </button>
                  <button
                    onClick={() => setInputValue("How to apply?")}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition-all duration-200 hover:shadow-sm"
                  >
                    📋 Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Toggle Button */}
        <button
          onClick={toggleChat}
          className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group hover:scale-110 active:scale-95"
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
} 