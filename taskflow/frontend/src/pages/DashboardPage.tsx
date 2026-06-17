import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { useAuthStore } from '../store/authStore';
import type { TaskStats, Task } from '../types';
import { format } from 'date-fns';

const STAT_CARDS = [
  { key: 'totalTasks',      label: 'Total Tasks',    color: 'bg-indigo-50 text-indigo-700',  icon: '📋' },
  { key: 'todoCount',       label: 'To Do',          color: 'bg-slate-50 text-slate-700',    icon: '🔲' },
  { key: 'inProgressCount', label: 'In Progress',    color: 'bg-amber-50 text-amber-700',    icon: '🔄' },
  { key: 'doneCount',       label: 'Completed',      color: 'bg-green-50 text-green-700',    icon: '✅' },
  { key: 'overdueCount',    label: 'Overdue',        color: 'bg-red-50 text-red-700',        icon: '⚠️' },
  { key: 'dueSoonCount',    label: 'Due in 3 Days',  color: 'bg-orange-50 text-orange-700',  icon: '🕐' },
];

const PRIORITY_COLORS: Record<string, string> = {
  LOW:      'bg-slate-100 text-slate-600',
  MEDIUM:   'bg-blue-100 text-blue-700',
  HIGH:     'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats]       = useState<TaskStats | null>(null);
  const [recent, setRecent]     = useState<Task[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, tasksData] = await Promise.all([
          taskService.getStats(),
          taskService.getTasks(0, 5),
        ]);
        setStats(statsData);
        setRecent(tasksData.content);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          {greeting()}, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-20 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-12" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {STAT_CARDS.map(({ key, label, color, icon }) => (
            <div key={key} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 font-medium">{label}</span>
                <span className="text-lg">{icon}</span>
              </div>
              <p className="text-3xl font-bold text-slate-800">
                {stats ? stats[key as keyof TaskStats] : 0}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Tasks + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="md:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm text-indigo-600 hover:underline font-medium">
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">No tasks yet.</p>
              <Link to="/tasks" className="text-indigo-600 text-sm font-medium hover:underline">
                Create your first task
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                      {task.title}
                      {task.isOverdue && <span className="ml-1 text-xs font-normal">⚠️ overdue</span>}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {task.dueDate ? `Due ${format(new Date(task.dueDate), 'MMM d')}` : 'No due date'}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/tasks" className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors group">
                <span className="text-lg">➕</span>
                <div>
                  <p className="text-sm font-medium text-indigo-700">New Task</p>
                  <p className="text-xs text-indigo-400">Add to your task list</p>
                </div>
              </Link>
              <Link to="/ai" className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors group">
                <span className="text-lg">✨</span>
                <div>
                  <p className="text-sm font-medium text-purple-700">AI Assistant</p>
                  <p className="text-xs text-purple-400">Generate & summarize tasks</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Blockchain note */}
          <div className="card p-4 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🔗</span>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Blockchain Audit</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every task is fingerprinted with a SHA-256 hash for tamper-evident audit trails.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
