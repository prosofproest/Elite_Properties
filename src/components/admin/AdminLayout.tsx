/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Calendar, 
  Image as ImageIcon, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Mail
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { cn } from '../../lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Leads', path: '/admin/leads', icon: Users },
    { name: 'Projects', path: '/admin/projects', icon: Building2 },
    { name: 'Site Visits', path: '/admin/site-visits', icon: Calendar },
    { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Email Logs', path: '/admin/email-logs', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transition-transform duration-300 transform lg:relative lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center text-primary font-black">E</div>
              <span className="font-serif font-bold text-lg tracking-tight">Elite <span className="text-accent italic">Admin</span></span>
            </Link>
            <button 
              className="lg:hidden text-white/50 hover:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => cn(
                    "flex items-center justify-between px-4 py-3 rounded-sm text-sm font-bold uppercase tracking-widest transition-all group",
                    isActive 
                      ? "bg-accent text-primary" 
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={cn(isActive ? "text-primary" : "text-accent")} />
                    {link.name}
                  </div>
                  {isActive && <ChevronRight size={14} />}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-bold uppercase tracking-widest text-white/60 hover:bg-red-500/10 hover:text-red-500 transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <button 
            className="lg:hidden text-primary"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black uppercase tracking-widest text-primary">Administrator</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{auth.currentUser?.email}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-primary font-black uppercase shadow-inner">
              {auth.currentUser?.email?.[0] || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
