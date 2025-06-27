"use client";

import Link from 'next/link';

export default function ChatbotLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800 flex items-center justify-center">
      <div className="text-center text-white max-w-2xl mx-auto px-6">
        <h1 className="text-6xl font-bold mb-6 text-shadow-lg">
          Clearinghouse CDFI
        </h1>
        <p className="text-2xl opacity-90 font-light mb-8">
          Mission-Driven Lending Assistant
        </p>
        <p className="text-lg opacity-80 mb-12 leading-relaxed">
          Get instant answers about our community development financial institution, 
          lending programs, and how we support underserved communities.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/chat-widget"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Start Chat 💬
          </Link>
          
          <div className="text-sm opacity-70 mt-4">
            <p>Ask me about:</p>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs">Loan Programs</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs">Community Impact</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs">Application Process</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs">Eligibility</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .text-shadow-lg {
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
} 