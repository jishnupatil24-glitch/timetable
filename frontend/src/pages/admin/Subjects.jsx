import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, BookOpen } from 'lucide-react';
import API from '../../api';

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        name: '', code: '', credits: 3, subject_type: 'theory',
        hours_per_week: 3, department_id: '', semester: 1, teacher_id: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [s, d, t] = await Promise.all([
                API.get('/admin/subjects'),
                API.get('/admin/departments'),
                API.get('/admin/teachers')
            ]);
            console.log('Subjects:', s.data);
            console.log('Departments:', d.data);
            console.log('Teachers:', t.data);
            setSubjects(s.data);
            setDepartments(d.data);
            setTeachers(t.data);
        } catch (err) {
            console.error('fetchData error:', err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = async () => {
        setLoading(true);
        setError('');
        try {
            await API.post('/admin/subjects', {
                ...form,
                department_id: parseInt(form.department_id),
                semester: parseInt(form.semester),
                credits: parseInt(form.credits),
                hours_per_week: parseInt(form.hours_per_week),
                teacher_id: form.teacher_id ? parseInt(form.teacher_id) : null
            });
            setForm({
                name: '', code: '', credits: 3, subject_type: 'theory',
                hours_per_week: 3, department_id: '', semester: 1, teacher_id: ''
            });
            setShowModal(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this subject?')) return;
        await API.delete(`/admin/subjects/${id}`);
        fetchData();
    };

    const getDeptName = (id) => departments.find(d => d.id === id)?.name || 'N/A';
    const getTeacherName = (id) => teachers.find(t => t.id === id)?.name || 'Unassigned';

    // Filter teachers by selected department
    const filteredTeachers = form.department_id
        ? teachers.filter(t => t.department_id === parseInt(form.department_id))
        : teachers;

    const typeColor = (type) =>
        type === 'practical'
            ? 'bg-yellow-600/20 text-yellow-300'
            : type === 'elective'
                ? 'bg-purple-600/20 text-purple-300'
                : 'bg-blue-600/20 text-blue-300';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Subjects</h2>
                    <p className="text-slate-400 text-sm mt-1">{subjects.length} subjects total</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-all font-medium"
                >
                    <Plus size={18} /> Add Subject
                </button>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">#</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Name</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Code</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Type</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Dept</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Sem</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Teacher</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-12 text-slate-500">
                                    No subjects yet. Add one!
                                </td>
                            </tr>
                        )}
                        {subjects.map((sub, i) => (
                            <motion.tr
                                key={sub.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-b border-white/5 hover:bg-white/5 transition-all"
                            >
                                <td className="px-6 py-4 text-slate-400 text-sm">{i + 1}</td>
                                <td className="px-6 py-4 text-white font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                                            <BookOpen size={16} className="text-indigo-400" />
                                        </div>
                                        {sub.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
                                        {sub.code}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${typeColor(sub.subject_type)}`}>
                                        {sub.subject_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-sm">{getDeptName(sub.department_id)}</td>
                                <td className="px-6 py-4 text-slate-400 text-sm">Sem {sub.semester}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${sub.teacher_id ? 'bg-green-600/20 text-green-300' : 'bg-slate-600/20 text-slate-400'}`}>
                                        {sub.teacher_id ? getTeacherName(sub.teacher_id) : 'Unassigned'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDelete(sub.id)}
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
                                <h3 className="text-lg font-bold text-white">Add Subject</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Subject Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Data Structures"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Subject Code</label>
                                    <input
                                        type="text"
                                        value={form.code}
                                        onChange={e => setForm({ ...form, code: e.target.value })}
                                        placeholder="e.g. CS201"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Subject Type</label>
                                    <select
                                        value={form.subject_type}
                                        onChange={e => setForm({ ...form, subject_type: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                                    >
                                        <option value="theory">Theory</option>
                                        <option value="practical">Practical</option>
                                        <option value="elective">Elective</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-slate-400 mb-1 block">Credits</label>
                                        <input
                                            type="number"
                                            value={form.credits}
                                            onChange={e => setForm({ ...form, credits: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-400 mb-1 block">Hours/Week</label>
                                        <input
                                            type="number"
                                            value={form.hours_per_week}
                                            onChange={e => setForm({ ...form, hours_per_week: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Department</label>
                                    <select
                                        value={form.department_id}
                                        onChange={e => setForm({ ...form, department_id: e.target.value, teacher_id: '' })}
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
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Assign Teacher</label>
                                    <select
                                        value={form.teacher_id}
                                        onChange={e => setForm({ ...form, teacher_id: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                                    >
                                        <option value="">Unassigned</option>
                                        {filteredTeachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.specialization || 'General'})</option>
                                        ))}
                                    </select>
                                    {form.department_id && filteredTeachers.length === 0 && (
                                        <p className="text-yellow-400 text-xs mt-1">No teachers in this department yet.</p>
                                    )}
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
                                        disabled={loading || !form.name || !form.code || !form.department_id}
                                        className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3 rounded-xl transition-all font-medium"
                                    >
                                        {loading ? 'Adding...' : 'Add Subject'}
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
