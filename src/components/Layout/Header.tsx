import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';

export default function Header() {
  const auth = useAuth();
  const user = (auth && typeof auth === 'object' && 'user' in auth) ? (auth as any).user : undefined;
  const userName = user?.fullName || 'User';
  const userType = user?.type;
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <header className="w-full flex items-center justify-end px-8 py-4 bg-white border-b min-h-[48px] dark:bg-gray-900 dark:border-gray-800">
      <span className="text-muted-foreground mr-4">
        Welcome, <span className="font-semibold">{userName}</span>{userType === 'assignee' && ' (Assignee)'}
      </span>
      <Link
        to="/create-ticket"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all"
      >
        Create Ticket
      </Link>
      <button
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ml-2"
        aria-label="Toggle theme"
        onClick={toggleTheme}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      <button
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ml-2"
        aria-label="User profile"
        onClick={() => navigate('/profile')}
      >
        <User className="w-5 h-5" />
      </button>
      <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ml-2" aria-label="Sign out" onClick={handleLogout}>
        <LogOut className="w-5 h-5" />
      </button>
    </header>
  );
}
