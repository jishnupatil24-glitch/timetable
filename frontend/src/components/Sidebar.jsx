import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, BookOpen, Building2,
  Calendar, LogOut, GraduationCap, DoorOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/departments', icon: Building2, label: 'Departments' },
  { to: '/admin/teachers', icon: Users, label: 'Teachers' },
  { to: '/admin/students', icon: GraduationCap, label: 'Students' },
  { to: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
  { to: '/admin/rooms', icon: DoorOpen, label: 'Rooms' },
  { to: '/admin/timetable', icon: Calendar, label: 'Timetable' },
];

const teacherLinks = [
  { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/timetable', icon: Calendar, label: 'My Timetable' },
];

const studentLinks = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/timetable', icon: Calendar, label: 'My Timetable' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'teacher' ? teacherLinks
    : studentLinks;

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 z-50 flex flex-col"
    >
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold gradient-text">TimeTable AI</h1>
        <p className="text-xs text-slate-400 mt-1 capitalize">{user?.role} Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </motion.div>
  );
}