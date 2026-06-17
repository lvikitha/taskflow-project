import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',  icon: '⬛' },
  { to: '/tasks',     label: 'My Tasks',   icon: '✅' },
  { to: '/ai',        label: 'AI Assistant', icon: '✨' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">TF</span>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm leading-tight">TaskFlow</p>
              <p className="text-xs text-slate-400">AI-Powered</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-100 px-3 py-4">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-700 text-sm font-semibold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                       text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span>🚪</span> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
