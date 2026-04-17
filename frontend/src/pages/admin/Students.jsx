import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import API from '../../api';

export default function Students() {
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', password: '', roll_number: '', department_id: '', semester: 1
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        const [s, d] = await Promise.all([
            API.get('/admin/students'),
            API.get('/admin/departments')
        ]);
        setStudents(s.data);
        setDepartments(d.data);
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = async () => {
        setLoading(true);
        setError('');
        try {
            await API.post('/admin/students', {
                ...form,
                department_id: parseInt(form.department_id),
                semester: parseInt(form.semester)
            });
            setForm({ name: '', email: '', password: '', roll_number: '', department_id: '', semester: 1 });
            setShowModal(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this student?')) return;
        await API.delete(`/admin/students/${id}`);
        fetchData();
    };

    const getDeptName = (id) => departments.find(d => d.id === id)?.name || 'N/A';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Students</h2>
                    <p className="text-slate-400 text-sm mt-1">{students.length} students total</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-all font-medium"
                >
                    <Plus size={18} /> Add Student
                </button>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">#</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Name</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Roll No.</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Email</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Department</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Semester</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-slate-500">
                                    No students yet. Add one!
                                </td>
                            </tr>
                        )}
                        {students.map((student, i) => (
                            <motion.tr
                                key={student.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-b border-white/5 hover:bg-white/5 transition-all"
                            >
                                <td className="px-6 py-4 text-slate-400 text-sm">{i + 1}</td>
                                <td className="px-6 py-4 text-white font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold">
                                            {student.name[0].toUpperCase()}
                                        </div>
                                        {student.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                                        {student.roll_number}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-sm">{student.email}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                                        {getDeptName(student.department_id)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-sm">Sem {student.semester}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDelete(student.id)}
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
                                <h3 className="text-lg font-bold text-white">Add Student</h3>
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
                                        placeholder="e.g. Rahul Sharma"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Email</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        placeholder="e.g. rahul@college.com"
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
                                    <label className="text-sm text-slate-400 mb-1 block">Roll Number</label>
                                    <input
                                        type="text"
                                        value={form.roll_number}
                                        onChange={e => setForm({ ...form, roll_number: e.target.value })}
                                        placeholder="e.g. CSE2024001"
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
                                    <label className="text-sm text-slate-400 mb-1 block">Semester</label>
                                    <select
                                        value={form.semester}
                                        onChange={e => setForm({ ...form, semester: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                            <option key={s} value={s}>Semester {s}</option>
                                        ))}
                                    </select>
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
                                        disabled={loading || !form.name || !form.email || !form.password || !form.roll_number || !form.department_id}
                                        className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3 rounded-xl transition-all font-medium"
                                    >
                                        {loading ? 'Adding...' : 'Add Student'}
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