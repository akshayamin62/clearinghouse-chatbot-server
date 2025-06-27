"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Phone, Mail, UserIcon } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export default function FullChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your Clearinghouse CDFI assistant. I can help you with information about our lending programs, community development initiatives, and more. How can I assist you today?',
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

  const handleContactCollection = async (userInput: string) => {
    const trimmedInput = userInput.trim();
    
    if (contactStep === 'name') {
      setContactInfo(prev => ({ ...prev, name: trimmedInput }));
      addMessage('user', trimmedInput);
      addMessage('assistant', `Nice to meet you, ${trimmedInput}! What's your email address?`);
      setContactStep('email');
    } else if (contactStep === 'email') {
      // Simple email validation
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
      // Simple phone validation
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
          addMessage('assistant', '🎉 Perfect! I\'ve got your contact information. Our team will reach out to you within 24 hours. Is there anything else I can help you with in the meantime?');
        } else {
          addMessage('assistant', 'I received your contact information. Our team will be in touch soon! How else can I assist you?');
        }
      } catch (error) {
        console.error('Error submitting contact info:', error);
        addMessage('assistant', 'I\'ve noted your contact information. Our team will reach out to you soon! What else can I help you with?');
      }
      
      // Reset contact collection
      setIsCollectingContact(false);
      setContactStep('name');
      setContactInfo({ name: '', email: '', phone: '' });
    }
  };

  const checkForContactTriggers = (botResponse: string): boolean => {
    const triggers = [
      'contact information',
      'provide your contact',
      'connect you with our team',
      'someone reach out',
      'contact you',
      'get in touch',
      'speak to someone',
      'talk to our team',
      'human assistance',
      'more information',
      'follow up'
    ];
    
    const lowerResponse = botResponse.toLowerCase();
    return triggers.some(trigger => lowerResponse.includes(trigger));
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
    setIsLoading(true);

    try {
      // Create messages array for API
      const apiMessages = [
        {
          role: 'system',
          content: `You are a helpful Clearinghouse CDFI assistant. You help users with questions about:
- Community development financial institution services
- Loan programs and financing options
- Application processes and eligibility
- Impact investing and community development
- Small business lending and real estate financing

When users ask for help, want to speak to someone, need more information, or want to be contacted, respond with: "I'd be happy to connect you with our team! Let me get your contact information."

Keep responses informative but concise (under 100 words when possible).`
        },
        ...messages.filter(m => m.role !== 'system').map(m => ({
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
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.choices[0].message.content;
      
      // Add bot response
      addMessage('assistant', botResponse);
      
      // Check if we should start contact collection
      if (checkForContactTriggers(botResponse)) {
        setIsCollectingContact(true);
        setContactStep('name');
        addMessage('assistant', 'Let\'s start with your name.');
      }
      
    } catch (error) {
      console.error('Error:', error);
      addMessage('assistant', 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or if you need immediate assistance, you can contact our team directly.');
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

  const triggerContactForm = () => {
    setIsCollectingContact(true);
    setContactStep('name');
    addMessage('assistant', 'I\'d be happy to have someone from our team contact you! Let\'s start with your name.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Clearinghouse CDFI</h1>
              <p className="text-gray-600">Community Development Financial Institution</p>
            </div>
            <button
              onClick={triggerContactForm}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Phone size={16} />
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          
          {/* Messages Area */}
          <div className="h-[600px] overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 opacity-70`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Contact collection indicator */}
            {isCollectingContact && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <UserIcon size={16} />
                  <span className="font-medium">
                    Collecting Contact Information - Step {contactStep === 'name' ? '1' : contactStep === 'email' ? '2' : '3'} of 3
                  </span>
                </div>
                <p className="text-sm text-orange-600 mt-1">
                  {contactStep === 'name' && 'Please provide your full name'}
                  {contactStep === 'email' && 'Please provide your email address'}
                  {contactStep === 'phone' && 'Please provide your phone number'}
                </p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isCollectingContact 
                      ? `Enter your ${contactStep}...`
                      : "Ask me about loans, programs, or how we can help..."
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-3 rounded-lg transition-colors duration-200"
              >
                <Send size={18} />
              </button>
            </div>
            
            {/* Quick action buttons */}
            {!isCollectingContact && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setInputValue("What loan programs do you offer?")}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                >
                  Loan Programs
                </button>
                <button
                  onClick={() => setInputValue("How do I apply for financing?")}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                >
                  Application Process
                </button>
                <button
                  onClick={() => setInputValue("I need help with my business")}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                >
                  Business Help
                </button>
                <button
                  onClick={triggerContactForm}
                  className="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full text-sm transition-colors"
                >
                  Contact Team
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 