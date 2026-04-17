import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import API from '../../api';

export default function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', password: '', department_id: '', specialization: '', max_hours_per_week: 20
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        const [t, d] = await Promise.all([
            API.get('/admin/teachers'),
            API.get('/admin/departments')
        ]);
        setTeachers(t.data);
        setDepartments(d.data);
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = async () => {
        setLoading(true);
        setError('');
        try {
            await API.post('/admin/teachers', {
                ...form,
                department_id: parseInt(form.department_id),
                max_hours_per_week: parseInt(form.max_hours_per_week)
            });
            setForm({ name: '', email: '', password: '', department_id: '', specialization: '', max_hours_per_week: 20 });
            setShowModal(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this teacher?')) return;
        await API.delete(`/admin/teachers/${id}`);
        fetchData();
    };

    const getDeptName = (id) => departments.find(d => d.id === id)?.name || 'N/A';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Teachers</h2>
                    <p className="text-slate-400 text-sm mt-1">{teachers.length} teachers total</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-all font-medium"
                >
                    <Plus size={18} /> Add Teacher
                </button>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">#</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Name</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Email</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Department</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Specialization</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Max Hrs/Week</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-slate-500">
                                    No teachers yet. Add one!
                                </td>
                            </tr>
                        )}
                        {teachers.map((teacher, i) => (
                            <motion.tr
                                key={teacher.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-b border-white/5 hover:bg-white/5 transition-all"
                            >
                                <td className="px-6 py-4 text-slate-400 text-sm">{i + 1}</td>
                                <td className="px-6 py-4 text-white font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                                            {teacher.name[0].toUpperCase()}
                                        </div>
                                        {teacher.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-sm">{teacher.email}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                                        {getDeptName(teacher.department_id)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-sm">{teacher.specialization || 'N/A'}</td>
                                <td className="px-6 py-4 text-slate-400 text-sm">{teacher.max_hours_per_week}h</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDelete(teacher.id)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white">Add Teacher</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Full Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Dr. John Smith"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Email</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        placeholder="e.g. john@college.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Password</label>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        placeholder="Set login password"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Department</label>
                                    <select
                                        value={form.department_id}
                                        onChange={e => setForm({ ...form, department_id: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Specialization</label>
                                    <input
                                        type="text"
                                        value={form.specialization}
                                        onChange={e => setForm({ ...form, specialization: e.target.value })}
                                        placeholder="e.g. Machine Learning"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Max Hours Per Week</label>
                                    <input
                                        type="number"
                                        value={form.max_hours_per_week}
                                        onChange={e => setForm({ ...form, max_hours_per_week: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>

                                {error && <p className="text-red-400 text-sm">{error}</p>}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAdd}
                                        disabled={loading || !form.name || !form.email || !form.password || !form.department_id}
                                        className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3 rounded-xl transition-all font-medium"
                                    >
                                        {loading ? 'Adding...' : 'Add Teacher'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}