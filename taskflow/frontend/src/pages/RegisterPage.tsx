import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName || form.fullName.length < 2) e.fullName = 'Enter your full name';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password || form.password.length < 6) e.password = 'Minimum 6 characters required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authService.register(form);
      setAuth(res);
      toast.success('Account created! Welcome to TaskFlow 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
      : form.password.length < 9 ? 2
        : form.password.length < 12 ? 3 : 4;

  const pwLabel = ['', 'Too short', 'Fair', 'Good', 'Strong'][pwStrength];
  const pwColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'][pwStrength];

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-14 relative overflow-hidden bg-violet-700">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white opacity-5" />
        <div className="absolute -bottom-16 right-10 w-64 h-64 rounded-full bg-white opacity-5" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-lg">TF</span>
          </div>
          <span className="text-white font-semibold text-xl">TaskFlow</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">Start doing more<br />with less effort.</h1>
          <p className="text-violet-200 text-lg leading-relaxed mb-12">Join TaskFlow and let AI handle the planning — description, priority and time estimates, generated instantly.</p>
          <div className="space-y-6">
            {[
              { n: '01', title: 'Create an account', desc: 'Free, takes 30 seconds' },
              { n: '02', title: 'Add your first task', desc: 'Just type the title — AI does the rest' },
              { n: '03', title: 'Track and complete', desc: 'Stay on top of everything, effortlessly' },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-4">
                <span className="text-violet-400 text-xs font-mono font-bold mt-0.5 flex-shrink-0">{s.n}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{s.title}</p>
                  <p className="text-violet-300 text-xs mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-violet-300 text-sm italic">"Well begun is half done."</p>
          <p className="text-violet-400 text-xs mt-1">— Aristotle</p>
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
            <h2 className="text-3xl font-bold text-slate-900">Create account</h2>
            <p className="text-slate-500 mt-2 text-sm">Get started — it's completely free</p>
          </div>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full name</label>
              <input
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => { setForm({ ...form, fullName: e.target.value }); setErrors(er => ({ ...er, fullName: '' })); }}
                className={`w-full px-4 py-3 rounded-xl border-2 text-slate-800 text-sm bg-slate-50 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-indigo-500 ${errors.fullName ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.fullName}</p>}
            </div>
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password(minimum six characters)</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
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
              {form.password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength ? pwColor : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 min-w-fit">{pwLabel}</span>
                </div>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading ? (<><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account…</>) : 'Create my account'}
            </button>
          </form>
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-slate-400 text-xs">Already have an account?</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <Link to="/login"
            className="w-full py-3.5 rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold text-sm transition-all flex items-center justify-center">
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}