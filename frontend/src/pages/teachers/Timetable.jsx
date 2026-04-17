import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, DoorOpen } from 'lucide-react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
    '9:00-10:00', '10:00-11:00', '11:00-12:00',
    'LUNCH', '1:00-2:00', '2:00-3:00', '3:00-4:00'
];

export default function TeacherTimetable() {
    const { user } = useAuth();
    const [timetables, setTimetables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTimetables = async () => {
            try {
                const res = await API.get('/timetable/all');
                setTimetables(res.data);
            } catch (err) {
                setError('Could not load timetables.');
            } finally {
                setLoading(false);
            }
        };
        fetchTimetables();
    }, []);

    // Filter only slots that belong to this teacher
    const getMySlots = (timetable) => {
        const mySlots = [];
        for (const day of DAYS) {
            const dayData = timetable[day] || {};
            for (const [slot, entry] of Object.entries(dayData)) {
                if (
                    entry.subject_type !== 'break' &&
                    entry.teacher &&
                    entry.teacher.toLowerCase() === user?.name?.toLowerCase()
                ) {
                    mySlots.push({ day, slot, ...entry });
                }
            }
        }
        return mySlots;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-slate-400">
            Loading your timetable...
        </div>
    );

    if (error) return (
        <div className="glass rounded-2xl p-8 text-center text-red-400">{error}</div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6"
            >
                <h2 className="text-2xl font-bold text-white mb-1">My Timetable</h2>
                <p className="text-slate-400">Welcome, {user?.name} — here are all your scheduled lectures.</p>
            </motion.div>

            {timetables.length === 0 && (
                <div className="glass rounded-2xl p-8 text-center text-slate-400">
                    No timetable has been generated yet. Ask your admin to generate one.
                </div>
            )}

            {timetables.map((tt, index) => {
                const mySlots = getMySlots(tt.timetable);

                if (mySlots.length === 0) return null;

                return (
                    <motion.div
                        key={tt.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-4"
                    >
                        <h3 className="text-lg font-semibold text-white px-1">
                            Department ID: {tt.department_id} — Semester {tt.semester}
                        </h3>

                        {/* Grid View */}
                        <div className="glass rounded-2xl overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left px-4 py-3 text-slate-400 font-medium text-sm">Time</th>
                                        {DAYS.map(day => (
                                            <th key={day} className="text-left px-4 py-3 text-slate-400 font-medium text-sm">{day}</th>
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
                                                const entry = tt.timetable[day]?.[slot === 'LUNCH' ? 'LUNCH' : slot];
                                                const isMyClass = entry &&
                                                    entry.subject_type !== 'break' &&
                                                    entry.teacher?.toLowerCase() === user?.name?.toLowerCase();

                                                if (!entry) return <td key={day} className="px-4 py-3" />;

                                                if (entry.subject_type === 'break') {
                                                    return (
                                                        <td key={day} className="px-4 py-3">
                                                            <span className="text-xs text-slate-600 italic">Lunch</span>
                                                        </td>
                                                    );
                                                }

                                                return (
                                                    <td key={day} className="px-4 py-3">
                                                        {isMyClass ? (
                                                            <motion.div
                                                                whileHover={{ scale: 1.02 }}
                                                                className="bg-primary-600/30 border border-primary-500/40 rounded-xl p-2"
                                                            >
                                                                <p className="text-white text-xs font-semibold">{entry.subject}</p>
                                                                <p className="text-primary-300 text-xs mt-1 flex items-center gap-1">
                                                                    <DoorOpen size={10} /> {entry.room}
                                                                </p>
                                                                <span className={`text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block ${entry.subject_type === 'practical'
                                                                        ? 'bg-yellow-600/30 text-yellow-300'
                                                                        : 'bg-blue-600/30 text-blue-300'
                                                                    }`}>
                                                                    {entry.subject_type}
                                                                </span>
                                                            </motion.div>
                                                        ) : (
                                                            <div className="bg-white/5 rounded-xl p-2 opacity-30">
                                                                <p className="text-slate-400 text-xs">{entry.subject}</p>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* My Lectures Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {mySlots.map((slot, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass rounded-xl p-4 border border-primary-500/20"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="text-white font-semibold text-sm">{slot.subject}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${slot.subject_type === 'practical'
                                                ? 'bg-yellow-600/30 text-yellow-300'
                                                : 'bg-blue-600/30 text-blue-300'
                                            }`}>
                                            {slot.subject_type}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-xs flex items-center gap-1 mb-1">
                                        <Calendar size={11} /> {slot.day}
                                    </p>
                                    <p className="text-slate-400 text-xs flex items-center gap-1 mb-1">
                                        <Clock size={11} /> {slot.slot}
                                    </p>
                                    <p className="text-slate-400 text-xs flex items-center gap-1">
                                        <DoorOpen size={11} /> {slot.room}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}