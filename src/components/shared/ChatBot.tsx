/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { MessageSquare, X, Send, Bot, User, Phone, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useBooking } from '../../context/BookingContext';
import { cn } from '../../lib/utils';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: number;
}

const SYSTEM_PROMPT = `You are an expert real estate assistant for Elite Properties,
a premium developer in Mumbai, India.

Company Details:
- Name: Elite Properties
- City: Mumbai, Maharashtra, India
- Phone: +917304954717
- WhatsApp: +917304954717
- Property Types: Residential, Villas, Plots, Commercial
- Cities: Mumbai, Thane, Navi Mumbai, Pune, Nashik
- All projects RERA registered under MahaRERA

Your Rules:
1. Help users find properties by budget, BHK, location
2. For exact pricing always say call +917304954717
3. Calculate rough EMI when asked:
   Formula: P*r*(1+r)^n/((1+r)^n-1)
   Default: 8.75% rate, 20 year tenure
4. Explain RERA and Maharashtra stamp duty (5-6%)
5. Always respond in same language as user
   (Hindi/English/Hinglish all supported)
6. Keep replies short: max 3-4 lines per message
7. If user says call or agent:
   show: Call us: +917304954717
8. If user seems ready to buy:
   suggest booking a site visit
9. Never discuss competitor developers
10. Always be warm, professional, helpful`;

const QUICK_REPLIES = [
  "2BHK in Mumbai",
  "Calculate EMI",
  "Book Site Visit",
  "Call Agent"
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [docId, setDocId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { openBookingModal } = useBooking();

  const isRateLimited = messages.filter(m => m.role === 'user').length >= 20;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'model',
        parts: [{ text: "Namaste! 👋 I'm your Elite Properties assistant. I can help you find properties in Mumbai, calculate EMIs, answer RERA questions, or book a site visit. How can I help you today?" }],
        timestamp: Date.now()
      };
      setMessages([welcomeMessage]);
      saveToFirestore([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const saveToFirestore = async (newMessages: Message[]) => {
    try {
      if (!docId) {
        const docRef = await addDoc(collection(db, 'chatLogs'), {
          sessionId,
          messages: newMessages,
          createdAt: serverTimestamp(),
        });
        setDocId(docRef.id);
      } else {
        await updateDoc(doc(db, 'chatLogs', docId), {
          messages: newMessages,
        });
      }
    } catch (error) {
      console.error('Error saving chat log:', error);
    }
  };

  const calculateEMI = (amount: number) => {
    const P = amount;
    const r = 8.75 / 1200;
    const n = 20 * 12;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi).toLocaleString('en-IN');
  };

  const handleSmartTriggers = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('book') || lowerText.includes('visit')) {
      openBookingModal();
      return "Opening the site visit booking form for you...";
    }
    if (lowerText.includes('call')) {
      return "You can call our expert at +917304954717 for immediate assistance.";
    }
    if (lowerText.includes('whatsapp')) {
      window.open('https://wa.me/917304954717', '_blank');
      return "Opening WhatsApp to chat with our agent...";
    }
    const emiMatch = text.match(/emi\s+(\d+)/i);
    if (emiMatch) {
      const amount = parseInt(emiMatch[1]);
      if (!isNaN(amount)) {
        const emi = calculateEMI(amount);
        return `For a loan of ₹${amount.toLocaleString('en-IN')}, the estimated monthly EMI would be approximately ₹${emi} (at 8.75% for 20 years).`;
      }
    }
    return null;
  };

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input.trim();
    if (!messageText || isLoading || isRateLimited) return;

    const userMessage: Message = {
      role: 'user',
      parts: [{ text: messageText }],
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Check for smart triggers
    const triggerResponse = handleSmartTriggers(messageText);
    if (triggerResponse) {
      const botMessage: Message = {
        role: 'model',
        parts: [{ text: triggerResponse }],
        timestamp: Date.now()
      };
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      saveToFirestore(finalMessages);
      setIsLoading(false);
      return;
    }

    try {
      // Pass last 10 messages to Gemini
      const history = updatedMessages.slice(-10).map(m => ({
        role: m.role,
        parts: m.parts
      }));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: history
        })
      });

      const data = await response.json();
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I'm having trouble connecting. Please call us at +917304954717.";

      const botMessage: Message = {
        role: 'model',
        parts: [{ text: botText }],
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      saveToFirestore(finalMessages);
    } catch (error) {
      console.error('ChatBot Error:', error);
      const errorMessage: Message = {
        role: 'model',
        parts: [{ text: "Sorry, I encountered an error. Please call us at +917304954717 for assistance." }],
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "absolute bottom-20 right-0 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100",
              "max-md:fixed max-md:inset-0 max-md:w-full max-md:h-full max-md:rounded-none"
            )}
          >
            {/* Header */}
            <div className="bg-[#0A1931] p-4 flex items-center justify-between text-white border-b border-[#C9A84C]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C9A84C] rounded-full flex items-center justify-center shadow-lg">
                  <Home size={20} className="text-[#0A1931]" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm tracking-wide">Elite Assistant</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[10px] text-white/70 font-medium">Online now</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex flex-col gap-1 max-w-[85%]',
                    msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  )}
                >
                  <div className={cn(
                    'p-3 rounded-2xl text-xs leading-relaxed shadow-sm',
                    msg.role === 'user' 
                      ? 'bg-[#C9A84C] text-[#0A1931] rounded-tr-none font-medium' 
                      : 'bg-white text-[#0A1931] border border-gray-100 rounded-tl-none'
                  )}>
                    {msg.parts[0].text}
                  </div>
                  <span className="text-[8px] text-gray-400 font-medium">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleSend(reply)}
                      className="text-[10px] bg-white border border-[#C9A84C]/30 text-[#0A1931] px-3 py-1.5 rounded-full hover:bg-[#C9A84C] hover:text-white transition-all shadow-sm font-medium"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-2xl rounded-tl-none w-16 shadow-sm">
                  <div className="flex gap-1">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full" />
                  </div>
                </div>
              )}

              {isRateLimited && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[10px] font-bold text-center border border-red-100">
                  Please call us at +91 73049 54717 for more help!
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isRateLimited ? "Session limit reached" : "Type your message..."}
                disabled={isRateLimited || isLoading}
                className="flex-grow px-4 py-3 bg-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || isRateLimited || !input.trim()}
                className="p-3 bg-[#C9A84C] text-[#0A1931] rounded-xl hover:bg-[#B89740] transition-all disabled:opacity-50 shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#0A1931] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 flex items-center justify-center border-2 border-[#C9A84C] relative group"
      >
        {isOpen ? <X size={28} /> : <Home size={28} />}
        {!isOpen && (
          <span className="absolute right-full mr-4 bg-[#0A1931] text-[#C9A84C] px-3 py-1 rounded-md text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#C9A84C]/30">
            Elite Assistant
          </span>
        )}
      </button>
    </div>
  );
}

