import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Calendar, GraduationCap, BookOpen, Presentation } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-panel rounded-3xl p-8 relative overflow-hidden"
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
                <div className="flex items-center gap-6 mb-2">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        <GraduationCap size={36} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">{user?.name}</span>!</h1>
                        <p className="text-slate-400 font-medium tracking-wide">Student Portal Dashboard</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Link to="/student/timetable" className="block h-full group">
                        <div className="glass-card h-full p-8 border border-white/5 group-hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                    <Calendar size={28} />
                                </div>
                            </div>
                            <h2 className="text-2xl font-extrabold text-white mb-3">My Timetable</h2>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                View your class, lab schedule, and assigned rooms.
                            </p>
                            <div className="mt-6 flex py-2.5 px-5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-bold w-max items-center gap-2 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                                View Classes &rarr;
                            </div>
                        </div>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-8 border border-white/5 opacity-70"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                            <BookOpen size={28} />
                        </div>
                        <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg border border-white/10 font-bold uppercase tracking-wider">Coming Soon</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-white mb-3">Assignments</h2>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        Submit assignments and check your grades.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-8 border border-white/5 opacity-70"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/20">
                            <Presentation size={28} />
                        </div>
                        <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg border border-white/10 font-bold uppercase tracking-wider">Coming Soon</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-white mb-3">Attendance</h2>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        Track your lecture attendance percentage.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
