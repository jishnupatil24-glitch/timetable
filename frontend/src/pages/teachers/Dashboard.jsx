import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Calendar, User, Clock, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-8"
            >
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/20">
                        <User size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name}!</h1>
                        <p className="text-slate-400">Teacher Portal Dashboard</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Link to="/teacher/timetable" className="block h-full group">
                        <div className="glass h-full rounded-2xl p-6 border border-white/5 group-hover:border-primary-500/50 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                                    <Calendar size={24} />
                                </div>
                                <Clock size={20} className="text-slate-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">My Timetable</h2>
                            <p className="text-slate-400 text-sm">
                                View your auto-generated weekly lecture schedule and upcoming classes.
                            </p>
                            <div className="mt-4 flex py-2 px-4 rounded-lg bg-primary-500/10 text-primary-400 text-sm font-medium w-max items-center gap-2 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                View Schedule &rarr;
                            </div>
                        </div>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl p-6 border border-white/5 opacity-70"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <Bell size={24} />
                        </div>
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-md">Coming Soon</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Announcements</h2>
                    <p className="text-slate-400 text-sm">
                        Broadcast messages to your students and manage class announcements.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
