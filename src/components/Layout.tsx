import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/dbService';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path ? 'text-brand-400 bg-brand-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 text-slate-200">
      {/* Sidebar / Navbar */}
      <nav className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex-shrink-0 flex flex-col sticky top-0 md:h-screen z-40">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 text-white text-xl font-bold">
            <span className="text-2xl">🔥</span> StreakMaster
          </Link>
        </div>

        <div className="flex-1 px-4 space-y-2 overflow-y-auto">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/')}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </Link>
          <Link to="/create" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/create')}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Habit
          </Link>
          <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/profile')}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Profile & Stats
          </Link>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-slate-400 hover:text-red-400 hover:bg-red-900/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;