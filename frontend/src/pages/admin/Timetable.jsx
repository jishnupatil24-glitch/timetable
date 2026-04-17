import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, BookOpen, User, DoorOpen, ChevronDown, AlertCircle, CheckCircle2, Brain, RotateCcw } from 'lucide-react';
import API from '../../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
    '9:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-1:00',
    '1:00-2:00', '2:00-3:00', '3:00-4:00'
];

const slotColor = (entry) => {
    if (!entry || entry.subject_type === 'break') return 'bg-slate-800/50 border-slate-700/50';
    if (entry.subject_type === 'practical') return 'bg-yellow-600/10 border-yellow-500/30';
    if (entry.subject_type === 'elective') return 'bg-purple-600/10 border-purple-500/30';
    return 'bg-blue-600/10 border-blue-500/30';
};

export default function Timetable() {
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedSem, setSelectedSem] = useState('1');
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [savedTimetable, setSavedTimetable] = useState(null);
    const [error, setError] = useState('');
    const [showAI, setShowAI] = useState(false);
    const [activeTab, setActiveTab] = useState('best');

    useEffect(() => {
        API.get('/admin/departments').then(r => setDepartments(r.data)).catch(() => {});
    }, []);

    // Load existing timetable when dept/sem changes
    useEffect(() => {
        if (!selectedDept || !selectedSem) return;
        setSavedTimetable(null);
        setResult(null);
        setError('');
        API.get(`/timetable/department/${selectedDept}/semester/${selectedSem}`)
            .then(r => setSavedTimetable(r.data))
            .catch(() => {});
    }, [selectedDept, selectedSem]);

    const handleGenerate = async () => {
        if (!selectedDept || !selectedSem) {
            setError('Please select department and semester');
            return;
        }
        setGenerating(true);
        setError('');
        setResult(null);
        try {
            const res = await API.post('/timetable/generate', {
                department_id: parseInt(selectedDept),
                semester: parseInt(selectedSem)
            });
            setResult(res.data);
            setSavedTimetable({
                timetable: res.data.timetable,
                ai_explanation: res.data.ai_explanation,
                created_at: new Date().toISOString()
            });
            setActiveTab('best');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to generate timetable. Make sure you have subjects, teachers, and rooms set up.');
        } finally {
            setGenerating(false);
        }
    };

    const getDeptName = (id) => departments.find(d => d.id === parseInt(id))?.name || '';

    const renderTimetableGrid = (timetable) => {
        if (!timetable) return null;
        return (
            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-24 bg-slate-800/30">
                                <Clock size={14} className="inline mr-1" /> Time
                            </th>
                            {DAYS.map(day => (
                                <th key={day} className="px-3 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/30">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {TIME_SLOTS.map(slot => {
                            const isLunch = slot === '12:00-1:00';
                            return (
                                <tr key={slot}>
                                    <td className="px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap border-b border-white/5">
                                        {slot}
                                    </td>
                                    {DAYS.map(day => {
                                        // Match slot key in timetable data
                                        const dayData = timetable[day] || {};
                                        let entry = dayData[slot];
                                        // Check for lunch
                                        if (isLunch || (dayData['LUNCH'] && !entry)) {
                                            if (isLunch) {
                                                return (
                                                    <td key={day} className="px-2 py-2 border-b border-white/5">
                                                        <div className="rounded-lg px-3 py-3 text-center bg-emerald-900/20 border border-emerald-600/20">
                                                            <p className="text-emerald-400 text-xs font-bold">🍽 LUNCH</p>
                                                        </div>
                                                    </td>
                                                );
                                            }
                                        }
                                        if (!entry) {
                                            return (
                                                <td key={day} className="px-2 py-2 border-b border-white/5">
                                                    <div className="rounded-lg px-3 py-4 text-center bg-slate-800/20 border border-white/5">
                                                        <p className="text-slate-600 text-xs">Free</p>
                                                    </div>
                                                </td>
                                            );
                                        }
                                        if (entry.subject_type === 'break') {
                                            return (
                                                <td key={day} className="px-2 py-2 border-b border-white/5">
                                                    <div className="rounded-lg px-3 py-3 text-center bg-emerald-900/20 border border-emerald-600/20">
                                                        <p className="text-emerald-400 text-xs font-bold">🍽 LUNCH</p>
                                                    </div>
                                                </td>
                                            );
                                        }
                                        return (
                                            <td key={day} className="px-2 py-2 border-b border-white/5">
                                                <div className={`rounded-lg px-3 py-2 border ${slotColor(entry)} transition-all hover:scale-[1.02]`}>
                                                    <p className="text-white text-xs font-bold truncate" title={entry.subject}>
                                                        {entry.subject}
                                                    </p>
                                                    <p className="text-slate-400 text-[10px] mt-0.5">
                                                        <span className="capitalize">{entry.subject_type}</span>
                                                        {entry.subject_code && ` • ${entry.subject_code}`}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                                                            <User size={8} /> {entry.teacher}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                                                            <DoorOpen size={8} /> {entry.room}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-primary-400" size={24} />
                        AI Timetable Generator
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Generates 5 NEP 2020 compliant timetables • Gemini AI picks the best one
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="glass rounded-2xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Department</label>
                        <select
                            value={selectedDept}
                            onChange={e => setSelectedDept(e.target.value)}
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
                            value={selectedSem}
                            onChange={e => setSelectedSem(e.target.value)}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                <option key={s} value={s}>Semester {s}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={generating || !selectedDept}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-all font-medium h-[48px]"
                    >
                        {generating ? (
                            <>
                                <RotateCcw size={18} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Generate Timetable
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-xl"
                    >
                        <AlertCircle size={16} /> {error}
                    </motion.div>
                )}
            </div>

            {/* Generation Loading */}
            <AnimatePresence>
                {generating && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass rounded-2xl p-8 text-center"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 flex items-center justify-center animate-pulse">
                                    <Brain size={28} className="text-white" />
                                </div>
                                <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-primary-400 border-t-transparent animate-spin"></div>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">AI is thinking...</h3>
                                <p className="text-slate-400 text-sm mt-1">Generating 5 timetables & asking Gemini to pick the best one</p>
                            </div>
                            <div className="flex gap-2 mt-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0.3 }}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                                        className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs text-white font-bold"
                                    >
                                        v{i}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Result: NEP Score + Version tabs */}
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {/* Status Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="glass rounded-2xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center">
                                <CheckCircle2 size={20} className="text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Best Version</p>
                                <p className="text-white font-bold text-lg">v{result.best_version}</p>
                            </div>
                        </div>
                        <div className="glass rounded-2xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
                                <Sparkles size={20} className="text-primary-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">NEP Score</p>
                                <p className="text-white font-bold text-lg">{result.nep_score}/100</p>
                            </div>
                        </div>
                        <div className="glass rounded-2xl p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.nep_compliant ? 'bg-green-600/20' : 'bg-red-600/20'}`}>
                                {result.nep_compliant ? <CheckCircle2 size={20} className="text-green-400" /> : <AlertCircle size={20} className="text-red-400" />}
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">NEP 2020</p>
                                <p className={`font-bold text-lg ${result.nep_compliant ? 'text-green-400' : 'text-red-400'}`}>
                                    {result.nep_compliant ? 'Compliant' : 'Issues Found'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Version Tabs */}
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="flex border-b border-white/10 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('best')}
                                className={`px-5 py-3 text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'best' ? 'text-primary-400 border-b-2 border-primary-400 bg-primary-600/10' : 'text-slate-400 hover:text-white'}`}
                            >
                                ⭐ Best (v{result.best_version})
                            </button>
                            {result.all_versions?.map(v => (
                                <button
                                    key={v.version}
                                    onClick={() => setActiveTab(v.version)}
                                    className={`px-5 py-3 text-sm font-medium transition-all whitespace-nowrap ${activeTab === v.version ? 'text-primary-400 border-b-2 border-primary-400 bg-primary-600/10' : 'text-slate-400 hover:text-white'}`}
                                >
                                    v{v.version}
                                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${v.nep_compliant ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}`}>
                                        {v.nep_score}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="p-4">
                            {activeTab === 'best'
                                ? renderTimetableGrid(result.timetable)
                                : renderTimetableGrid(result.all_versions?.find(v => v.version === activeTab)?.timetable)
                            }
                        </div>
                    </div>

                    {/* AI Explanation */}
                    <div className="glass rounded-2xl overflow-hidden">
                        <button
                            onClick={() => setShowAI(!showAI)}
                            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <Brain size={20} className="text-purple-400" />
                                <span className="text-white font-medium">Gemini AI Analysis</span>
                            </div>
                            <ChevronDown size={18} className={`text-slate-400 transition-transform ${showAI ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {showAI && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-6 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed border-t border-white/5 pt-4">
                                        {result.ai_explanation}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}

            {/* Show saved timetable if no new result */}
            {!result && savedTimetable && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                >
                    <div className="glass rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={20} className="text-green-400" />
                            <div>
                                <p className="text-white font-medium">
                                    Active Timetable — {getDeptName(selectedDept)}, Semester {selectedSem}
                                </p>
                                <p className="text-slate-400 text-xs">
                                    Generated {savedTimetable.created_at ? new Date(savedTimetable.created_at).toLocaleString() : 'previously'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAI(!showAI)}
                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                            <Brain size={14} /> AI Reason
                        </button>
                    </div>

                    <div className="glass rounded-2xl p-4">
                        {renderTimetableGrid(savedTimetable.timetable)}
                    </div>

                    <AnimatePresence>
                        {showAI && savedTimetable.ai_explanation && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="glass rounded-2xl p-6 overflow-hidden"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Brain size={18} className="text-purple-400" />
                                    <h4 className="text-white font-medium">Gemini AI Analysis</h4>
                                </div>
                                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                    {savedTimetable.ai_explanation}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Empty State */}
            {!result && !savedTimetable && !generating && selectedDept && (
                <div className="glass rounded-2xl p-12 text-center">
                    <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-white font-bold text-lg">No timetable yet</h3>
                    <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                        Select a department and semester, then click "Generate Timetable" to create an AI-optimized schedule following NEP 2020 guidelines.
                    </p>
                </div>
            )}
        </div>
    );
}
