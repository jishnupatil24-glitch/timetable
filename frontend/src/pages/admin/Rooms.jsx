import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, DoorOpen } from 'lucide-react';
import API from '../../api';

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', capacity: 60, room_type: 'classroom' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchRooms = async () => {
        const res = await API.get('/admin/rooms');
        setRooms(res.data);
    };

    useEffect(() => { fetchRooms(); }, []);

    const handleAdd = async () => {
        setLoading(true);
        setError('');
        try {
            await API.post('/admin/rooms', {
                ...form,
                capacity: parseInt(form.capacity)
            });
            setForm({ name: '', capacity: 60, room_type: 'classroom' });
            setShowModal(false);
            fetchRooms();
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this room?')) return;
        await API.delete(`/admin/rooms/${id}`);
        fetchRooms();
    };

    const typeColor = (type) => type === 'lab'
        ? 'bg-yellow-600/20 text-yellow-300'
        : 'bg-blue-600/20 text-blue-300';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Rooms</h2>
                    <p className="text-slate-400 text-sm mt-1">{rooms.length} rooms total</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-all font-medium"
                >
                    <Plus size={18} /> Add Room
                </button>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">#</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Room Name</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Type</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Capacity</th>
                            <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-slate-500">
                                    No rooms yet. Add one!
                                </td>
                            </tr>
                        )}
                        {rooms.map((room, i) => (
                            <motion.tr
                                key={room.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-b border-white/5 hover:bg-white/5 transition-all"
                            >
                                <td className="px-6 py-4 text-slate-400 text-sm">{i + 1}</td>
                                <td className="px-6 py-4 text-white font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center">
                                            <DoorOpen size={16} className="text-red-400" />
                                        </div>
                                        {room.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${typeColor(room.room_type)}`}>
                                        {room.room_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-sm">{room.capacity} seats</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDelete(room.id)}
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
                            className="glass rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white">Add Room</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Room Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Room 101 or Lab A"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Room Type</label>
                                    <select
                                        value={form.room_type}
                                        onChange={e => setForm({ ...form, room_type: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                                    >
                                        <option value="classroom">Classroom</option>
                                        <option value="lab">Lab</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Capacity</label>
                                    <input
                                        type="number"
                                        value={form.capacity}
                                        onChange={e => setForm({ ...form, capacity: e.target.value })}
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
                                        disabled={loading || !form.name}
                                        className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3 rounded-xl transition-all font-medium"
                                    >
                                        {loading ? 'Adding...' : 'Add Room'}
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