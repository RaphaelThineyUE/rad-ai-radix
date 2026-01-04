import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { User, LogOut, Home, Users, BarChart, HelpCircle } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                RadReport AI
              </h1>
            </div>

            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
              >
                <Home size={20} />
                Home
              </Link>
              <Link
                to="/patients"
                className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
              >
                <Users size={20} />
                Patients
              </Link>
              <Link
                to="/analytics"
                className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
              >
                <BarChart size={20} />
                Analytics
              </Link>
              <Link
                to="/how-to"
                className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
              >
                <HelpCircle size={20} />
                How-To
              </Link>
            </nav>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-100 hover:bg-pink-200 transition-colors">
                <User size={20} className="text-pink-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.full_name || 'User'}
                </span>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[200px] bg-white rounded-xl shadow-lg p-2 z-50"
                  sideOffset={5}
                >
                  <DropdownMenu.Item className="px-4 py-2 text-sm text-gray-700 outline-none">
                    <div className="font-medium">{user?.full_name}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </DropdownMenu.Item>
                  
                  <DropdownMenu.Separator className="h-px bg-gray-200 my-2" />
                  
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg cursor-pointer outline-none"
                    onSelect={logout}
                  >
                    <LogOut size={16} />
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
