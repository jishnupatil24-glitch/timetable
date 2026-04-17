import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Building2, DoorOpen, GraduationCap } from 'lucide-react';
import API from '../../api';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="glass rounded-2xl p-6 flex items-center gap-4"
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
        <div>
            <p className="text-slate-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
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
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6"
            >
                <h2 className="text-2xl font-bold text-white mb-1">Welcome back, Admin 👋</h2>
                <p className="text-slate-400">Here's what's happening in your college today.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card, i) => (
                    <motion.div key={card.label} transition={{ delay: i * 0.1 }}>
                        <StatCard {...card} />
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6"
            >
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Add Teacher', href: '/admin/teachers' },
                        { label: 'Add Subject', href: '/admin/subjects' },
                        { label: 'Add Room', href: '/admin/rooms' },
                        { label: 'Generate Timetable', href: '/admin/timetable' },
                    ].map(action => (
                        <a
                            key={action.label}
                            href={action.href}
                            className="bg-primary-600/20 hover:bg-primary-600/40 border border-primary-500/30 text-primary-300 text-sm font-medium px-4 py-3 rounded-xl text-center transition-all"
                        >
                            {action.label}
                        </a>
                    ))}
                </div>
            </motion.div >
        </div >
    );
}