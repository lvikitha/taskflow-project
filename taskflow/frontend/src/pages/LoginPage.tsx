import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authService.login(form);
      setAuth(res);
      toast.success(`Welcome back, ${res.fullName}!`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-14 relative overflow-hidden bg-indigo-600">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white opacity-5" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white opacity-5" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-lg">TF</span>
          </div>
          <span className="text-white font-semibold text-xl">TaskFlow</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">Get things<br />done smarter.</h1>
          <p className="text-indigo-200 text-lg leading-relaxed mb-12">AI-powered task management that plans, prioritizes, and tracks — so you stay focused on what matters.</p>
          <div className="space-y-4">
            {['AI writes your task descriptions instantly', 'Blockchain audit trail on every update', 'Daily productivity insights, automated'].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-indigo-100 text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-indigo-300 text-sm italic">"The secret of getting ahead is getting started."</p>
          <p className="text-indigo-400 text-xs mt-1">— Mark Twain</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">TF</span>
            </div>
            <span className="font-bold text-slate-800 text-xl">TaskFlow</span>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 mt-2 text-sm">Sign in to your account to continue</p>
          </div>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors(er => ({ ...er, email: '' })); }}
                className={`w-full px-4 py-3 rounded-xl border-2 text-slate-800 text-sm bg-slate-50 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-indigo-500 ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors(er => ({ ...er, password: '' })); }}
                  className={`w-full px-4 py-3 pr-20 rounded-xl border-2 text-slate-800 text-sm bg-slate-50 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-indigo-500 ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.password}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading ? (<><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in…</>) : 'Sign in'}
            </button>
          </form>
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-slate-400 text-xs">New to TaskFlow?</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <Link to="/register"
            className="w-full py-3.5 rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold text-sm transition-all flex items-center justify-center">
            Create a free account
          </Link>
        </div>
      </div>
    </div>
  );
}