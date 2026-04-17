import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Building2, DoorOpen, GraduationCap } from 'lucide-react';
import API from '../../api';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="glass-card p-6 flex items-center gap-5 relative overflow-hidden group cursor-default"
    >
        <div className={`absolute -right-4 -top-4 w-24 h-24 ${color}/10 rounded-full blur-2xl group-hover:${color}/30 transition-all duration-500`} />
        
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
            <Icon size={24} className={`text-white drop-shadow-md`} />
        </div>
        <div className="z-10">
            <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-1">{label}</p>
            <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
        </div>
    </motion.div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        teachers: 0, students: 0, subjects: 0,
        rooms: 0, departments: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [t, s, sub, r, d] = await Promise.all([
                    API.get('/admin/teachers'),
                    API.get('/admin/students'),
                    API.get('/admin/subjects'),
                    API.get('/admin/rooms'),
                    API.get('/admin/departments'),
                ]);
                setStats({
                    teachers: t.data.length,
                    students: s.data.length,
                    subjects: sub.data.length,
                    rooms: r.data.length,
                    departments: d.data.length,
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { icon: Building2, label: 'Departments', value: stats.departments, color: 'bg-blue-600' },
        { icon: Users, label: 'Teachers', value: stats.teachers, color: 'bg-purple-600' },
        { icon: GraduationCap, label: 'Students', value: stats.students, color: 'bg-green-600' },
        { icon: BookOpen, label: 'Subjects', value: stats.subjects, color: 'bg-yellow-600' },
        { icon: DoorOpen, label: 'Rooms', value: stats.rooms, color: 'bg-red-600' },
    ];

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-panel rounded-3xl p-8 relative overflow-hidden"
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome back, <span className="gradient-text">Admin</span> 👋</h2>
                <p className="text-slate-400 font-medium">College management command center.</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cards.map((card, i) => (
                    <motion.div key={card.label} transition={{ delay: i * 0.1 }}>
                        <StatCard {...card} />
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel rounded-3xl p-8"
            >
                <h3 className="text-xl font-bold text-white mb-6 tracking-tight">Quick Actions</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Add Teacher', href: '/admin/teachers' },
                        { label: 'Add Subject', href: '/admin/subjects' },
                        { label: 'Add Room', href: '/admin/rooms' },
                        { label: 'Generate Timetable', href: '/admin/timetable' },
                    ].map(action => (
                        <a
                            key={action.label}
                            href={action.href}
                            className="bg-black/20 hover:bg-primary-600/20 border border-white/5 hover:border-primary-500/40 text-slate-300 hover:text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] text-sm font-bold px-4 py-4 rounded-2xl text-center transition-all duration-300"
                        >
                            {action.label}
                        </a>
                    ))}
                </div>
            </motion.div >
        </div >
    );
}