import { useState, useEffect } from 'react';
import type { Task, CreateTaskRequest, UpdateTaskRequest, AiGeneratedTask } from '../../types';
import { aiService } from '../../services/aiService';
import toast from 'react-hot-toast';

interface Props {
  task?: Task | null;
  onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => Promise<void>;
  onClose: () => void;
}

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES   = [
  { value: 'TODO',        label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE',        label: 'Done' },
];

export default function TaskForm({ task, onSubmit, onClose }: Props) {
  const isEdit = !!task;
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading,  setAiLoading]  = useState(false);
  const [aiResult,   setAiResult]   = useState<AiGeneratedTask | null>(null);

  const [form, setForm] = useState({
    title:           task?.title           || '',
    description:     task?.description     || '',
    priority:        task?.priority        || 'MEDIUM',
    status:          task?.status          || 'TODO',
    dueDate:         task?.dueDate         || '',
    estimatedEffort: task?.estimatedEffort || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title || form.title.length < 3) e.title = 'Title must be at least 3 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Auto-run AI generation when creating a new task with a title
  const handleAiGenerate = async () => {
    if (!form.title.trim()) {
      toast.error('Enter a task title first');
      return;
    }
    setAiLoading(true);
    try {
      const result = await aiService.generateTaskDetails(form.title);
      setAiResult(result);
      // Auto-fill the form with AI suggestions
      setForm(prev => ({
        ...prev,
        description: result.description,
        priority: (result.priority as any) || prev.priority,
        estimatedEffort: result.estimatedEffort,
      }));
      toast.success('AI suggestions applied!');
    } catch {
      toast.error('AI generation failed. Using fallback.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        title:           form.title,
        description:     form.description || undefined,
        priority:        form.priority as any,
        status:          form.status as any,
        dueDate:         form.dueDate || undefined,
        estimatedEffort: form.estimatedEffort || undefined,
      };
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title + AI Button */}
          <div>
            <label className="label">Title *</label>
            <div className="flex gap-2">
              <input
                type="text"
                className={`input-field flex-1 ${errors.title ? 'border-red-400' : ''}`}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              {!isEdit && (
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                  className="flex-shrink-0 px-3 py-2.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100
                             text-xs font-medium transition-colors border border-purple-100 whitespace-nowrap"
                  title="Auto-fill with AI"
                >
                  {aiLoading ? '✨ …' : 'AI Fill'}
                </button>
              )}
            </div>
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* AI Suggestion Banner */}
          {aiResult && !isEdit && (
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-xs text-purple-700">
              <p className="font-medium mb-1">AI Reasoning</p>
              <p>{aiResult.reasoning}</p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              rows={3}
              placeholder="What does this task involve?"
              className="input-field resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select
                className="input-field"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input-field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Effort */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                className="input-field"
                value={form.dueDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Estimated Effort</label>
              <input
                type="text"
                className="input-field"
                value={form.estimatedEffort}
                onChange={(e) => setForm({ ...form, estimatedEffort: e.target.value })}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
