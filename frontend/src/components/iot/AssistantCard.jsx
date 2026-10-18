import React, { useState } from 'react';
import { Bot, Send, Sparkles, Loader2 } from 'lucide-react';
import { queryAgroAssistant } from '../../services/iotApi';

export default function AssistantCard() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'assistant',
      text: 'Hello Farmer 👋 I analyze your live soil moisture, DHT11 temperature, and rain detection telemetry. How can I help explain your field conditions?',
      time: 'Just now'
    }
  ]);

  const suggestions = [
    'Is my field condition good?',
    'Why is my soil dry?',
    'What is the temperature?',
    'Did it rain?'
  ];

  const handleSend = async (textToSend) => {
    const message = textToSend || query;
    if (!message.trim() || loading) return;

    const userMsg = { sender: 'user', text: message, time: 'Now' };
    setChatHistory((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await queryAgroAssistant(message);
      let reply = res.data?.response || res.error?.detail || "Could not retrieve sensor answer from server.";
      const botMsg = {
        sender: 'assistant',
        text: reply,
        time: 'Now',
        intent: res.data?.intent
      };
      setChatHistory((prev) => [...prev, botMsg]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: "I couldn't reach the NavaKrishi IoT NLP service. Please check your backend connection.",
          time: 'Now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ask NavaKrishi</h3>
              <p className="text-[11px] text-slate-400">Context-Aware Agro-NLP Telemetry Assistant</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Sparkles className="w-3 h-3" /> Live Telemetry NLP
          </span>
        </div>

        {/* Chat Messages Area */}
        <div className="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1">
          {chatHistory.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  item.sender === 'user'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100/90 text-slate-700 border border-slate-200/50'
                }`}
              >
                {item.text}
              </div>
              <span className="mt-1 text-[10px] text-slate-400 px-1">{item.time}</span>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Analyzing live field telemetry...</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        {/* Suggested Quick Prompts */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              disabled={loading}
              className="text-[11px] font-medium text-slate-600 bg-slate-100/70 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 px-2.5 py-1 rounded-full border border-slate-200/60 transition-colors"
            >
              • {s}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your field status..."
            disabled={loading}
            className="w-full pl-4 pr-11 py-2.5 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800 placeholder-slate-400 transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !query.trim()}
            className="absolute right-1.5 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white shadow-sm transition-transform active:scale-95"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
