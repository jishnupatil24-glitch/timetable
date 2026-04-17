import { motion } from 'framer-motion';
import { Bell, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title }) {
    const { user } = useAuth();
    const [dark, setDark] = useState(true);

    const toggleDark = () => {
        setDark(!dark);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-64 right-0 h-16 glass border-b border-white/10 z-40 flex items-center justify-between px-6"
        >
            {/* Title */}
            <h2 className="text-lg font-semibold text-white">{title}</h2>

            {/* Right side */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleDark}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all relative">
                    <Bell size={18} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
                </button>

                <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                        {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300">{user?.name}</span>
                </div>
            </div>
        </motion.div>
    );
}