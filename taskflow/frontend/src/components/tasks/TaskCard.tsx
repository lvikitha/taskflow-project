import { useState } from 'react';
import type { Task, TaskStatus } from '../../types';
import { format } from 'date-fns';
import { taskService } from '../../services/taskService';
import toast from 'react-hot-toast';

const PRIORITY_STYLES: Record<string, string> = {
  LOW:      'bg-slate-100 text-slate-600 border-slate-200',
  MEDIUM:   'bg-blue-50 text-blue-700 border-blue-100',
  HIGH:     'bg-orange-50 text-orange-700 border-orange-100',
  CRITICAL: 'bg-red-50 text-red-700 border-red-100',
};

const STATUS_STYLES: Record<string, string> = {
  TODO:        'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  DONE:        'bg-green-100 text-green-700',
};

const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done',
};

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: Task) => void;
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'TODO',
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  const [updating, setUpdating] = useState(false);

  const handleQuickStatus = async () => {
    setUpdating(true);
    try {
      const next = NEXT_STATUS[task.status];
      const updated = await taskService.updateStatus(task.id, next);
      onStatusChange(updated);
      toast.success(`Moved to ${STATUS_LABELS[next]}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={`card p-4 hover:shadow-md transition-shadow animate-fade-in ${task.isOverdue ? 'border-red-200' : ''}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm leading-snug ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {task.title}
          </h3>
          {task.isOverdue && (
            <span className="text-xs text-red-500 font-medium">⚠️ Overdue</span>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded border font-medium flex-shrink-0 ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[task.status]}`}>
          {STATUS_LABELS[task.status]}
        </span>
        {task.dueDate && (
          <span className={`text-xs ${task.isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
            📅 {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </span>
        )}
        {task.estimatedEffort && (
          <span className="text-xs text-slate-400">⏱ {task.estimatedEffort}</span>
        )}
      </div>

      {/* Blockchain hash (truncated) */}
      {task.taskHash && (
        <div className="mb-3 px-2 py-1.5 bg-slate-50 rounded text-xs font-mono text-slate-400 truncate" title={task.taskHash}>
          🔗 {task.taskHash.slice(0, 12)}…{task.taskHash.slice(-8)}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleQuickStatus}
          disabled={updating}
          className="flex-1 text-xs py-1.5 px-3 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100
                     font-medium transition-colors disabled:opacity-50"
        >
          {updating ? '…' : `→ ${STATUS_LABELS[NEXT_STATUS[task.status]]}`}
        </button>
        <button
          onClick={() => onEdit(task)}
          className="text-xs py-1.5 px-3 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-xs py-1.5 px-3 rounded-lg text-red-500 hover:bg-red-50 font-medium transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
