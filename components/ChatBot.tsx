
import React, { useState, useRef, useEffect } from 'react';
import { pNodeService } from '../services/pNodeService';
import { ChatMessage } from '../types';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am XandBot. Ask me anything about the Xandeum Network status or metrics.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API (exclude last user message which is sent as prompt)
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      
      const responseText = await pNodeService.chatWithAI(userMsg.text, history);
      
      const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { role: 'model', text: "Sorry, I couldn't process that request.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      <div className={`pointer-events-auto bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden mb-4 ${isOpen ? 'scale-100 opacity-100 h-[500px]' : 'scale-90 opacity-0 h-0'}`}>
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-xand-500 rounded-full flex items-center justify-center text-white">
               <i className="fas fa-robot"></i>
            </div>
            <div>
               <h3 className="font-bold text-sm">XandBot AI</h3>
               <span className="text-xs text-slate-300 flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
               </span>
            </div>
          </div>
          <button onClick={toggleChat} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 bg-slate-50 p-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
             {messages.map((msg, idx) => (
               <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap ${
                      msg.role === 'user' 
                      ? 'bg-xand-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                  }`}>
                     {msg.text}
                  </div>
               </div>
             ))}
             {isLoading && (
               <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                     <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                     </div>
                  </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
             <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about network status..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-xand-500 text-slate-800 placeholder-slate-400"
             />
             <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 bg-xand-600 hover:bg-xand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
             >
                <i className="fas fa-paper-plane text-xs"></i>
             </button>
          </div>
          <div className="text-[10px] text-center text-slate-400 mt-2">
             Powered by Gemini Pro Preview
          </div>
        </form>
      </div>

      {/* Floating Button */}
      <button 
        onClick={toggleChat}
        className={`pointer-events-auto w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50
          ${isOpen ? 'bg-slate-700 text-slate-300 rotate-90' : 'bg-gradient-to-r from-xand-500 to-xand-600 text-white'}`}
      >
         {isOpen ? <i className="fas fa-times text-xl"></i> : <i className="fas fa-comment-dots text-2xl"></i>}
      </button>

    </div>
  );
};
