import { useEffect, useState, useCallback } from 'react';
import { taskService } from '../services/taskService';
import type { Task, TaskStatus } from '../types';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import toast from 'react-hot-toast';

const STATUS_FILTERS: { label: string; value: TaskStatus | 'ALL' }[] = [
  { label: 'All',         value: 'ALL' },
  { label: 'To Do',       value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done',        value: 'DONE' },
];

export default function TasksPage() {
  const [tasks,       setTasks]       = useState<Task[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editTask,    setEditTask]    = useState<Task | null>(null);
  const [filter,      setFilter]      = useState<TaskStatus | 'ALL'>('ALL');
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [searching,   setSearching]   = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await taskService.getTasks(page, 12);
      setTasks(data.content);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleSearch = async (keyword: string) => {
    setSearch(keyword);
    if (!keyword.trim()) { loadTasks(); return; }
    setSearching(true);
    try {
      const results = await taskService.searchTasks(keyword);
      setTasks(results);
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      const task = await taskService.createTask(data);
      setTasks(prev => [task, ...prev]);
      setShowForm(false);
      toast.success('Task created!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create task');
      throw err;
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editTask) return;
    try {
      const updated = await taskService.updateTask(editTask.id, data);
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      setEditTask(null);
      toast.success('Task updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update task');
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Tasks</h1>
          <p className="text-slate-500 text-sm mt-0.5">{tasks.length} tasks total</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> New Task
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search tasks by title or description…"
          className="input-field max-w-md"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
        {STATUS_FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Task Grid */}
      {loading || searching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-200 rounded w-full mb-2" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-5xl mb-4">📭</p>
          <p className="font-medium">
            {search ? 'No tasks match your search.' : 'No tasks in this category.'}
          </p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-indigo-600 text-sm font-medium hover:underline">
            Create a task
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={setEditTask}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && !search && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="flex items-center px-4 text-sm text-slate-600">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showForm && (
        <TaskForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}

      {/* Edit Modal */}
      {editTask && (
        <TaskForm task={editTask} onSubmit={handleUpdate} onClose={() => setEditTask(null)} />
      )}
    </div>
  );
}
