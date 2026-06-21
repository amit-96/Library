import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  MessageSquareCode,
  Armchair,
  FileText,
  UserCheck,
  ClipboardList,
  Contact,
  Megaphone,
  Settings,
  Users,
  GraduationCap,
  Compass,
  Trophy,
  Award,
  Sparkles,
  Calendar,
  Shield,
  ChevronDown,
  ChevronRight,
  BookOpenCheck,
  DollarSign
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const [studentsOpen, setStudentsOpen] = useState(false);

  const getNavLinks = () => {
    const common = [
      { path: '/books/search', label: 'Catalog Search', icon: Search },
      { path: '/ai-librarian', label: 'AI Librarian', icon: MessageSquareCode },
      { path: '/seats', label: 'Seat Booking', icon: Armchair }
    ];

    if (user?.role === 'admin' || user?.role === 'librarian') {
      return [
        { path: '/dashboard', label: 'SaaS Dashboard', icon: LayoutDashboard },
        ...common,
        { path: '/books/manage', label: 'Manage Inventory', icon: BookOpen },
        { path: '/borrow/issue-desk', label: 'Issue & Return', icon: ClipboardList },
        { path: '/attendance/reports', label: 'Attendance logs', icon: UserCheck },
        { path: '/notices/manage', label: 'Publish Notices', icon: Megaphone },
        ...(user?.role === 'admin' ? [
          { path: '/users', label: 'Manage Users', icon: Users },
          { path: '/command-center', label: 'Command Center', icon: Shield }
        ] : [])
      ];
    } else {
      // Student specific links
      return [
        { path: '/dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
        ...common,
        { path: `/students/${user?.id || user?._id}`, label: 'My Library Profile', icon: Contact },
        { path: '/pdf-assistant', label: 'PDF Learning RAG', icon: FileText },
        { path: '/exam-prep', label: 'AI Exam Prep', icon: GraduationCap },
        { path: '/career-mentor', label: 'AI Career Mentor', icon: Compass },
        { path: '/interview-prep', label: 'AI Interview Prep', icon: Award },
        { path: '/resume-analyzer', label: 'AI Resume Analyzer', icon: FileText },
        { path: '/study-planner', label: 'AI Study Planner', icon: Calendar },
        { path: '/leaderboard', label: 'Leaderboard & Streaks', icon: Trophy },
        { path: '/premium', label: 'Upgrade Premium', icon: Sparkles }
      ];
    }
  };

  const navLinks = getNavLinks();

  const studentSubmenus = [
    { path: '/students/add', label: 'Add Student', icon: UserPlusIcon },
    { path: '/students/list', label: 'Student List', icon: Users },
    { path: '/students/membership', label: 'Membership Management', icon: Award },
    { path: '/students/fees', label: 'Fee Management', icon: DollarSign },
    { path: '/students/attendance', label: 'Attendance', icon: UserCheck },
    { path: '/students/timings', label: 'Shift Management', icon: ClockIcon },
    { path: '/students/reports', label: 'Reports Centre', icon: FileText }
  ];

  // Simple mock icons inside submenus to prevent extra imports complexity
  function UserPlusIcon(props) { return <Users size={16} {...props} />; }
  function ClockIcon(props) { return <Calendar size={16} {...props} />; }

  return (
    <aside className="w-64 flex flex-col border-r border-slate-200/50 bg-white/75 dark:border-slate-800/40 dark:bg-[#0f172a]/75 backdrop-blur-md h-screen select-none shrink-0 z-40">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2 px-5 border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0B2E6B] to-[#FFD700] text-white font-bold text-lg font-outfit shadow-md shrink-0 border border-white/20">
          N
        </div>
        <span className="text-sm font-extrabold font-outfit bg-gradient-to-r from-[#0B2E6B] to-[#FFD700] bg-clip-text text-transparent leading-tight block">
          Nalanda Library
        </span>
      </div>

      {/* Navigation Menu Links */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navLinks.map(link => {
          const IconComponent = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <IconComponent size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}

        {/* Collapsible Student Section (Admin & Librarian only) */}
        {(user?.role === 'admin' || user?.role === 'librarian') && (
          <div className="space-y-1 pt-2">
            <button
              onClick={() => setStudentsOpen(!studentsOpen)}
              className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <Users size={18} className="text-slate-500" />
                <span>Student Center</span>
              </div>
              {studentsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            
            {studentsOpen && (
              <div className="pl-4 space-y-1">
                {studentSubmenus.map(sub => {
                  const SubIcon = sub.icon;
                  return (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-brand-50 text-brand-650 dark:bg-brand-950/20 dark:text-brand-400'
                            : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40'
                        }`
                      }
                    >
                      <SubIcon size={14} />
                      <span>{sub.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer Info */}
      <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/40 text-[10px] text-slate-400">
        Nalanda Digital Library v1.0.0
        <div className="mt-0.5">B.Tech Capstone Project</div>
      </div>
    </aside>
  );
};

export default Sidebar;
