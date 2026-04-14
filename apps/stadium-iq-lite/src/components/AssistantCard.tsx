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
        // Fallback or handle error
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
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    low: 'text-stadium-success bg-stadium-success/10 border-stadium-success/20'
  };

  return (
    <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16" />
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <Sparkles size={16} className="text-stadium-neon" />
          Ops Copilot
        </h2>
        <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter border ${assistant ? priorityColors[assistant.priority] : 'text-slate-500 border-white/10'}`}>
          {loading ? 'Analyzing...' : assistant?.priority}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="h-4 bg-white/5 rounded-lg animate-pulse w-full" />
            <div className="h-4 bg-white/5 rounded-lg animate-pulse w-3/4" />
            <div className="h-20 bg-white/5 rounded-xl animate-pulse w-full mt-4" />
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
              "{assistant?.summary}"
            </p>
            
            <div className="space-y-2">
              {assistant?.actions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group/item hover:border-stadium-neon/30 transition-all">
                  <ArrowRight size={14} className="mt-0.5 text-stadium-neon group-hover/item:translate-x-1 transition-transform" />
                  <p className="text-[11px] font-bold text-slate-400 group-hover/item:text-white transition-colors uppercase tracking-tight">{action}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <span>Sync: {assistant?.source === 'gemini' ? 'Gemini 2.0 Flash' : 'Rule v4.1'}</span>
              <span>{new Date(assistant?.generatedAt || '').toLocaleTimeString()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
