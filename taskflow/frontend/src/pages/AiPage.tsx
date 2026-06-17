import { useState } from 'react';
import { aiService } from '../services/aiService';
import type { AiGeneratedTask, AiSummaryResponse } from '../types';
import toast from 'react-hot-toast';

export default function AiPage() {
  // ── Task Generator ────────────────────────────────────────
  const [genTitle,   setGenTitle]   = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genResult,  setGenResult]  = useState<AiGeneratedTask | null>(null);

  // ── Productivity Summary ──────────────────────────────────
  const [sumLoading, setSumLoading] = useState(false);
  const [summary,    setSummary]    = useState<AiSummaryResponse | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTitle.trim()) return;
    setGenLoading(true);
    setGenResult(null);
    try {
      const result = await aiService.generateTaskDetails(genTitle);
      setGenResult(result);
    } catch {
      toast.error('AI generation failed. Check your API key configuration.');
    } finally {
      setGenLoading(false);
    }
  };

  const handleSummary = async () => {
    setSumLoading(true);
    setSummary(null);
    try {
      const result = await aiService.getProductivitySummary();
      setSummary(result);
    } catch {
      toast.error('Failed to generate summary');
    } finally {
      setSumLoading(false);
    }
  };

  const PRIORITY_COLOR: Record<string, string> = {
    LOW: 'text-slate-600', MEDIUM: 'text-blue-600',
    HIGH: 'text-orange-600', CRITICAL: 'text-red-600',
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">AI Assistant</h1>
        <p className="text-slate-500 text-sm mt-1">
          Powered by Google Gemini — automate task creation and get productivity insights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Feature A: Task Generator ─────────────────────── */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">✨</span>
            <h2 className="font-semibold text-slate-800">Task Description Generator</h2>
          </div>
          <p className="text-sm text-slate-500 mb-5">
            Enter a task title — AI generates a description, suggested priority, and time estimate.
          </p>

          <form onSubmit={handleGenerate} className="space-y-3">
            <input
              type="text"
              className="input-field"
              value={genTitle}
              onChange={(e) => setGenTitle(e.target.value)}
            />
            <button
              type="submit"
              disabled={genLoading || !genTitle.trim()}
              className="btn-primary w-full"
            >
              {genLoading ? '✨ Generating…' : '✨ Generate with AI'}
            </button>
          </form>

          {/* Result */}
          {genResult && (
            <div className="mt-5 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100 animate-slide-up space-y-3">
              <div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-slate-700 leading-relaxed">{genResult.description}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Priority</p>
                  <p className={`text-sm font-bold ${PRIORITY_COLOR[genResult.priority] || 'text-slate-700'}`}>
                    {genResult.priority}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Estimated Effort</p>
                  <p className="text-sm font-semibold text-slate-700">{genResult.estimatedEffort}</p>
                </div>
              </div>
              {genResult.reasoning && (
                <div>
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Reasoning</p>
                  <p className="text-xs text-slate-500 italic">{genResult.reasoning}</p>
                </div>
              )}
              <p className="text-xs text-purple-400 mt-1">
                 Tip: Use " AI Fill" button in New Task form to auto apply these suggestions.
              </p>
            </div>
          )}
        </div>

        {/* ── Feature B: Productivity Summary ──────────────── */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📊</span>
            <h2 className="font-semibold text-slate-800">Productivity Summary</h2>
          </div>
          <p className="text-sm text-slate-500 mb-5">
            Get an AI-generated summary of your tasks with personalized productivity insights.
          </p>

          <button
            onClick={handleSummary}
            disabled={sumLoading}
            className="btn-primary w-full mb-4"
          >
            {sumLoading ? '📊 Analyzing…' : '📊 Generate Summary'}
          </button>

          {summary && (
            <div className="space-y-4 animate-slide-up">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <p className="text-xl font-bold text-slate-800">{summary.totalTasks}</p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-xl font-bold text-green-700">{summary.completedToday}</p>
                  <p className="text-xs text-slate-500">Done</p>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded-lg">
                  <p className="text-xl font-bold text-orange-700">{summary.pendingHighPriority}</p>
                  <p className="text-xs text-slate-500">High Priority</p>
                </div>
              </div>

              {/* AI Summary */}
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-xs font-semibold text-indigo-600 mb-1">Summary</p>
                <p className="text-sm text-slate-700">{summary.summary}</p>
              </div>

              {/* Insight */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs font-semibold text-amber-600 mb-1">Key Insight</p>
                <p className="text-sm text-slate-700">{summary.productivityInsight}</p>
              </div>

              {/* Recommendations */}
              {summary.recommendations?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recommendations</p>
                  <ul className="space-y-2">
                    {summary.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-indigo-400 flex-shrink-0">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Blockchain Info Card */}
      <div className="mt-6 card p-5 bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700">
        <div className="flex items-start gap-4">
          <span className="text-2xl flex-shrink-0">🔗</span>
          <div>
            <h3 className="font-semibold text-white mb-1">Blockchain Audit Trail</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every task creation and update generates a SHA-256 hash stored on the task record. 
              This creates a lightweight, tamper-evident audit trail inspired by blockchain immutability. 
              Each hash incorporates the task's full state — title, description, status, priority, and user — 
              making unauthorized modifications detectable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
