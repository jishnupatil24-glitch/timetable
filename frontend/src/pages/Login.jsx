import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // The user might have been redirected here after trying to access a protected route
    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const role = await login(email, password);
            // Ignore the history 'from', just route directly to role dashboard
            if (role === 'admin') navigate('/admin');
            else if (role === 'teacher') navigate('/teacher');
            else navigate('/student');
        } catch (err) {
            setError(err.message || 'Invalid login credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Animated Mesh Background */}
            <div className="mesh-bg pointer-events-none">
                <div className="orb primary"></div>
                <div className="orb secondary"></div>
                <div className="orb accent"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="glass-panel rounded-[2rem] p-10 w-full max-w-md relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div 
                        initial={{ scale: 0.9 }} 
                        animate={{ scale: 1 }} 
                        transition={{ repeat: Infinity, repeatType: "reverse", duration: 3 }}
                        className="inline-block"
                    >
                        <h1 className="text-4xl font-extrabold gradient-text tracking-tight mb-2">AI Timetable Pro</h1>
                    </motion.div>
                    <p className="text-slate-400 font-medium">Secure Portal Access</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="text-sm text-slate-400 mb-1.5 block font-medium pl-1">Email Address</label>
                        <div className="relative group">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00f3ff] transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@college.edu"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f3ff]/50 focus:ring-1 focus:ring-[#00f3ff]/50 transition-all backdrop-blur-md"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-slate-400 mb-1.5 block font-medium pl-1">Password</label>
                        <div className="relative group">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00f3ff] transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f3ff]/50 focus:ring-1 focus:ring-[#00f3ff]/50 transition-all backdrop-blur-md"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-pink-500 text-sm text-center font-medium bg-pink-500/10 py-2 rounded-lg border border-pink-500/20"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative overflow-hidden group bg-gradient-to-r from-[#00f3ff] via-purple-500 to-[#00f3ff] bg-[length:200%_auto] animate-shimmer hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] text-white font-bold py-4 mt-8 rounded-2xl transition-all transform active:scale-95 flex items-center justify-center"
                    >
                        {loading ? <Loader size={20} className="animate-spin" /> : 'Authenticate System'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
                    <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                        NEP 2020 Compliant • AI Optimized
                    </p>
                </div>
            </motion.div>
        </div>
    );
}