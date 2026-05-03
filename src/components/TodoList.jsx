import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Trash2, RotateCcw, Zap } from 'lucide-react';
import GlassSelect from './GlassSelect';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function isCompletedToday(todo) {
  return (todo.completedDates || []).some((d) => d.startsWith(getToday()));
}

function isCompleted(todo) {
  if (todo.type === 'daily') return isCompletedToday(todo);
  return (todo.completedDates || []).length > 0;
}

const TYPE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'oneoff', label: 'One-off' },
];

export default function TodoList({ todos, jars, onComplete, onDelete, onCreate, defaultJarId }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('daily');
  const [newJarId, setNewJarId] = useState(defaultJarId || '');

  const activeTodos = todos.filter((t) => !isCompleted(t));
  const completedTodos = todos.filter(isCompleted);
  const today = getToday();

  const handleAdd = () => {
    if (!newName.trim()) return;
    onCreate(newName.trim(), newType, newJarId);
    setNewName('');
    setNewType('daily');
    setShowAdd(false);
  };

  if (todos.length === 0 && !showAdd) {
    return (
      <div className="glass p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-casino-accent" />
            <h3 className="font-heading text-sm text-white tracking-tight">Quick Tasks</h3>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-ghost text-xs flex items-center gap-1.5 font-semibold text-casino-accent"
          >
            <Plus size={14} /> Add
          </button>
        </div>
        <p className="text-xs text-casino-text-tertiary text-center py-2">No tasks yet. Add quick one-off or daily tasks.</p>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 pt-2"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Task name..."
                className="input flex-1 text-sm"
                maxLength={80}
                autoFocus
              />
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="btn-pill btn-gold px-3 text-xs font-semibold disabled:opacity-40"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <GlassSelect
                  value={newType}
                  onChange={setNewType}
                  options={TYPE_OPTIONS}
                />
              </div>
              <div className="flex-1">
                <GlassSelect
                  value={newJarId}
                  onChange={setNewJarId}
                  options={[{ value: '', label: 'No jar' }, ...jars.map((j) => ({ value: j.id, label: j.name }))]}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-casino-accent" />
          <h3 className="font-heading text-sm text-white tracking-tight">Quick Tasks</h3>
          <span className="text-[10px] text-casino-text-tertiary tabular-nums">
            {activeTodos.length} left
          </span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-ghost text-xs flex items-center gap-1.5 font-semibold text-casino-accent"
        >
          {showAdd ? null : <Plus size={14} />}
          {showAdd ? 'Cancel' : 'Add'}
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 mb-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Task name..."
                className="input flex-1 text-sm"
                maxLength={80}
                autoFocus
              />
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="btn-pill btn-gold px-3 text-xs font-semibold disabled:opacity-40"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <GlassSelect
                  value={newType}
                  onChange={setNewType}
                  options={TYPE_OPTIONS}
                />
              </div>
              <div className="flex-1">
                <GlassSelect
                  value={newJarId}
                  onChange={setNewJarId}
                  options={[{ value: '', label: 'No jar' }, ...jars.map((j) => ({ value: j.id, label: j.name }))]}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active tasks */}
      <div className="space-y-1">
        {activeTodos.length === 0 && !showAdd && (
          <p className="text-xs text-casino-text-tertiary text-center py-2">All done!</p>
        )}
        {activeTodos.map((todo) => {
          const jar = jars.find((j) => j.id === todo.jarId);
          return (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8, height: 0 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-casino-card hover:bg-casino-card-hover transition-colors group"
            >
              <button
                onClick={() => onComplete(todo)}
                className="w-5 h-5 rounded-md border-2 border-casino-text-tertiary/30 flex items-center justify-center shrink-0 hover:border-casino-accent transition-colors"
                aria-label={`Complete ${todo.name}`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 0 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Check size={12} className="text-casino-accent opacity-0" />
                </motion.div>
              </button>
              <span className="flex-1 text-sm text-casino-text truncate">{todo.name}</span>
              <div className="flex items-center gap-1.5">
                {todo.type === 'daily' && (
                  <RotateCcw size={10} className="text-casino-text-tertiary/50" />
                )}
                <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                  todo.type === 'daily'
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-purple-500/10 text-purple-400'
                }`}>
                  {todo.type === 'daily' ? 'Daily' : 'One'}
                </span>
                {jar && (
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: jar.color, boxShadow: `0 0 6px ${jar.color}50` }}
                  />
                )}
              </div>
              <button
                onClick={() => onDelete(todo.id)}
                className="p-1 rounded-lg text-casino-text-tertiary/0 hover:text-casino-danger hover:bg-white/5 transition-all group-hover:text-casino-text-tertiary"
                aria-label={`Delete ${todo.name}`}
              >
                <Trash2 size={12} />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Completed tasks */}
      {completedTodos.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/5">
          {completedTodos.slice(0, 5).map((todo) => {
            const jar = jars.find((j) => j.id === todo.jarId);
            return (
              <div
                key={todo.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg opacity-40"
              >
                <div className="w-5 h-5 rounded-md border-2 border-casino-success/40 bg-casino-success/10 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-casino-success" />
                </div>
                <span className="flex-1 text-xs text-casino-text-secondary line-through truncate">{todo.name}</span>
                {todo.type === 'daily' && (
                  <RotateCcw size={9} className="text-casino-text-tertiary/30" />
                )}
                {jar && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: jar.color }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
