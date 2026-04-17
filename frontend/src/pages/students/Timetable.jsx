import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, DoorOpen, AlertCircle, User } from 'lucide-react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
    '9:00-10:00', '10:00-11:00', '11:00-12:00',
    'LUNCH', '1:00-2:00', '2:00-3:00', '3:00-4:00'
];

export default function StudentTimetable() {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTimetable = async () => {
            if (!user?.department_id || !user?.semester) {
                setError("Your profile doesn't have a department or semester assigned.");
                setLoading(false);
                return;
            }
            try {
                const res = await API.get(`/timetable/department/${user.department_id}/semester/${user.semester}`);
                setTimetable(res.data.timetable);
            } catch (err) {
                setError(err.response?.data?.detail || 'No active timetable found for your department and semester.');
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, [user]);

    const getMySlots = () => {
        if (!timetable) return [];
        const mySlots = [];
        for (const day of DAYS) {
            const dayData = timetable[day] || {};
            for (const [slot, entry] of Object.entries(dayData)) {
                if (entry && entry.subject_type !== 'break') {
                    mySlots.push({ day, slot, ...entry });
                }
            }
        }
        return mySlots;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mr-3"></div>
            Loading your schedule...
        </div>
    );

    if (error) return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-8 text-center flex flex-col items-center">
            <AlertCircle size={32} className="text-red-400 mb-3" />
            <p className="text-red-400 font-medium">{error}</p>
        </motion.div>
    );

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6"
            >
                <h2 className="text-2xl font-bold text-white mb-1">My Class Timetable</h2>
                <p className="text-slate-400">Semester {user?.semester} Schedule</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Grid View */}
                <div className="glass rounded-2xl overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left px-4 py-4 text-slate-400 font-medium text-sm bg-slate-800/30">Time</th>
                                {DAYS.map(day => (
                                    <th key={day} className="text-center px-4 py-4 text-slate-400 font-medium text-sm bg-slate-800/30 w-[18%]">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {TIME_SLOTS.map(slot => (
                                <tr key={slot} className="border-b border-white/5">
                                    <td className="px-4 py-3 text-slate-400 text-xs font-medium whitespace-nowrap">
                                        {slot === 'LUNCH' ? '12:00-1:00' : slot}
                                    </td>
                                    {DAYS.map(day => {
                                        const entry = timetable[day]?.[slot === 'LUNCH' ? '12:00-1:00' : slot];

                                        if (slot === 'LUNCH') {
                                            return (
                                                <td key={day} className="px-3 py-2">
                                                    <div className="rounded-lg px-2 py-2 text-center bg-emerald-900/10 border border-emerald-500/10">
                                                        <span className="text-[10px] text-emerald-500 font-medium tracking-wider">LUNCH BREAK</span>
                                                    </div>
                                                </td>
                                            );
                                        }

                                        if (!entry) {
                                            return (
                                                <td key={day} className="px-3 py-2">
                                                    <div className="h-16 rounded-xl bg-slate-800/20 border border-white/5 flex items-center justify-center">
                                                        <span className="text-[10px] text-slate-600">Free</span>
                                                    </div>
                                                </td>
                                            );
                                        }

                                        return (
                                            <td key={day} className="px-3 py-2 min-w-[140px]">
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    className="h-full bg-emerald-600/20 border border-emerald-500/30 rounded-xl p-3 flex flex-col justify-center text-center items-center"
                                                >
                                                    <p className="text-white text-xs font-bold leading-tight" title={entry.subject}>
                                                        {entry.subject}
                                                    </p>
                                                    <div className="flex flex-wrap items-center justify-center gap-2 mt-2 w-full">
                                                        <span className="text-emerald-300 text-[10px] flex items-center gap-1 font-medium">
                                                            <DoorOpen size={10} /> {entry.room}
                                                        </span>
                                                        <span className="text-slate-400 text-[10px] flex items-center gap-1 font-medium">
                                                            <User size={10} /> {entry.teacher}
                                                        </span>
                                                    </div>
                                                    <span className={`mt-2 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${entry.subject_type === 'practical'
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : entry.subject_type === 'elective' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {entry.subject_type}
                                                    </span>
                                                </motion.div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
