import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Shield, ArrowRight, HelpCircle, Bot } from "lucide-react";

interface CopilotAssistantProps {
  onSendMessage: (message: string) => Promise<string>;
}

interface Message {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: Date;
}

const suggestedPrompts = [
  "How can I spot coordinated competitor review smears?",
  "What linguistic markers typify ChatGPT writing structures?",
  "Explain the difference between fake ratings and toxic reviews."
];

export default function CopilotAssistant({ onSendMessage }: CopilotAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-init-1",
      sender: "copilot",
      text: "Greetings. I am your ReviewShield Technical Forensic Copilot. Ask me anything to isolate deceptive seller listings or to translate customer feedback patterns.",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest bubbles
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const reply = await onSendMessage(userMsg.text);
      
      const copilotMsg: Message = {
        id: "msg-" + Math.random().toString(36).substr(2, 9),
        sender: "copilot",
        text: reply,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: "msg-err",
          sender: "copilot",
          text: "I experienced momentary communication loss to our AI nodes. Please verify internet sync and resubmit your prompt.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl h-[calc(100vh-12rem)] flex flex-col overflow-hidden shadow-sm font-sans">
      
      {/* Copilot Header */}
      <div className="bg-[#0b1329] border-b border-slate-850 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-teal-500/10 text-teal-400 p-2 rounded-xl border border-teal-500/20">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">ReviewShield Copilot</h4>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              <span>AI Engine Synced</span>
            </span>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-lg ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
            
            {/* Sender Badge */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 uppercase text-xs font-bold leading-normal ${
              msg.sender === "user" ? "bg-slate-950 text-teal-400 border-teal-500/20" : "bg-teal-500/10 text-teal-400 border-teal-500/20"
            }`}>
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${
              msg.sender === "user" ? "bg-teal-500 text-slate-950 border-teal-400 font-medium" : "bg-slate-950 text-slate-300 border-slate-855"
            }`}>
              
              {/* Splitting system lines to render pseudo-markdown paragraphs correctly */}
              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              <span className={`block text-[8px] text-right mt-1.5 ${msg.sender === "user" ? "text-slate-800" : "text-slate-500"}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-sm mr-auto items-center">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="bg-slate-950 text-slate-400 text-xs px-4 py-3 border border-slate-855 rounded-2xl animate-pulse">
              Translating linguistics indices...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts Bar */}
      {messages.length < 3 && (
        <div className="px-6 py-3 bg-slate-950/40 border-t border-slate-850 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold mr-1 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Suggested Queries:</span>
          </span>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-850 px-3 py-1.5 rounded-lg text-slate-300 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Typing Entry Bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-850 flex gap-3">
        <input
          type="text"
          placeholder="Query review indices, ask detection characteristics..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) handleSend(inputMessage);
          }}
          className="flex-1 bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
        />
        <button
          onClick={() => handleSend(inputMessage)}
          disabled={isLoading || !inputMessage.trim()}
          className="bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 p-3 rounded-xl text-slate-950 transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
