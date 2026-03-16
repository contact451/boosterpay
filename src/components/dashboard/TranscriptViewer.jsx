import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown } from 'lucide-react';

export default function TranscriptViewer({ transcript }) {
  const [open, setOpen] = useState(false);

  if (!transcript) return null;

  const lines = transcript.split('\n').filter(Boolean).map((line) => {
    const match = line.match(/^(assistant|user):\s*(.*)/i);
    if (match) return { role: match[1].toLowerCase(), text: match[2] };
    return { role: 'system', text: line };
  });

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>{open ? 'Masquer' : 'Voir'} la transcription</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 max-h-64 overflow-y-auto">
              {lines.map((line, i) => (
                <div key={i} className={`text-sm leading-relaxed ${line.role === 'assistant' ? 'text-blue-300/80 pl-0' : 'text-white font-medium pl-4 border-l-2 border-white/20'}`}>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 mr-2">
                    {line.role === 'assistant' ? 'IA' : line.role === 'user' ? 'Débiteur' : ''}
                  </span>
                  {line.text}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
