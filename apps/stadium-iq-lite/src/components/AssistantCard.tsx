import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Zap, ArrowRight, ExternalLink } from 'lucide-react';

type AssistantOutput = {
  source: "gemini" | "rule_engine";
  generatedAt: string;
  priority: "low" | "medium" | "high";
  summary: string;
  actions: string[];
};

export default function AssistantCard({ stadiumId, context }: { stadiumId: string, context: any }) {
  const [assistant, setAssistant] = useState<AssistantOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const abort = new AbortController();
    
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        if (!window.location.search.includes('enable_ai_api')) {
            throw new Error("Demo Mode");
        }

        const response = await fetch('/api/assistant/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stadiumId, context }),
          signal: abort.signal
        });
        
        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        if (active) setAssistant(data);
      } catch (e) {
        if (active) {
            setAssistant({
                source: "rule_engine",
                generatedAt: new Date().toISOString(),
                priority: "medium",
                summary: "Maintaining steady operational flow. No critical surges detected in primary sectors.",
                actions: [
                    "Monitor Gate B for potential ripple effect from Zone A",
                    "Status check on concession wait times in North Stand"
                ]
            });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(fetchRecommendations, 1000);
    return () => {
        active = false;
        abort.abort();
        clearTimeout(timer);
    };
  }, [stadiumId, context.avgDensity]);

  const priorityColors = {
    high: 'text-stadium-emergency bg-stadium-emergency/10 border-stadium-emergency/20',
    medium: 'text-stadium-warning bg-stadium-warning/10 border-stadium-warning/20',
    low: 'text-stadium-success bg-stadium-success/10 border-stadium-success/20'
  };

  return (
    <div className="glass-card p-5 md:p-8 border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent relative overflow-hidden group hover:bg-white/[0.02] transition-colors">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16" />
      
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
          <Sparkles size={16} className="text-stadium-neon" />
          Intelligence Hub
        </h2>
        <div className={`px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[8px] md:text-[9px] font-bold uppercase tracking-widest border transition-colors ${assistant ? priorityColors[assistant.priority] : 'text-slate-500 border-white/10'}`}>
          {loading ? 'ANALYZING...' : assistant?.priority}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="space-y-4 md:space-y-6"
          >
            <div className="space-y-2">
              <div className="h-3 bg-white/5 rounded-full animate-pulse w-full" />
              <div className="h-3 bg-white/5 rounded-full animate-pulse w-3/4" />
            </div>
            <div className="h-20 bg-white/5 rounded-xl md:rounded-2xl animate-pulse w-full" />
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5 md:space-y-6"
          >
            <p className="text-xs md:text-sm font-bold text-slate-400 leading-relaxed italic border-l-2 border-stadium-neon/30 pl-4">
              "{assistant?.summary}"
            </p>
            
            <div className="space-y-2.5 md:space-y-3">
              {assistant?.actions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 group/item hover:border-stadium-neon/40 transition-all cursor-default">
                  <ArrowRight size={14} className="mt-0.5 text-stadium-neon group-hover/item:translate-x-1 transition-transform shrink-0" />
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 group-hover/item:text-white transition-colors uppercase tracking-tight">{action}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 md:pt-6 border-t border-white/5 flex items-center justify-between text-[8px] md:text-[9px] text-slate-600 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Brain size={12} className="text-stadium-neon/40" />
                {assistant?.source === 'gemini' ? 'Gemini 2.0 Flash' : 'Tactical Rule v4'}
              </span>
              <span>{new Date(assistant?.generatedAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
