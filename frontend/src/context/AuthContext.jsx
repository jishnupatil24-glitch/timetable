import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            setLoading(false);
        } else if (token) {
            API.get('/auth/me')
                .then(res => {
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // ✅ FIXED LOGIN FUNCTION
    const login = async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const res = await API.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        localStorage.setItem('token', res.data.access_token);

        // Fetch full user profile
        const meRes = await API.get('/auth/me');
        const userData = meRes.data;

        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        return userData.role; // ✅ return role correctly
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
