import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import GlassSelect from './GlassSelect';

export default function QuickTaskModal({ jars, onComplete, onClose }) {
  const [name, setName] = useState('');
  const [jarId, setJarId] = useState(jars[0]?.id || '');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onComplete(name.trim(), jarId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Just Done</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">What did you do?</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g., Walked the dog"
              className="input"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Link to Jar (optional)</label>
            <GlassSelect
              value={jarId}
              onChange={setJarId}
              options={[{ value: '', label: 'No jar' }, ...jars.map((j) => ({ value: j.id, label: j.name }))]}
              placeholder="No jar"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button onClick={handleSubmit} disabled={!name.trim()} className="btn btn-primary flex-1">
              <Check size={16} /> Complete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
