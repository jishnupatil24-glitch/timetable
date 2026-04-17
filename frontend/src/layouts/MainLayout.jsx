import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';

const pageTitles = {
    '/admin': 'Admin Dashboard',
    '/admin/departments': 'Departments',
    '/admin/teachers': 'Teachers',
    '/admin/students': 'Students',
    '/admin/subjects': 'Subjects',
    '/admin/rooms': 'Rooms',
    '/admin/timetable': 'Timetable Generator',
    '/teacher': 'Teacher Dashboard',
    '/teacher/timetable': 'My Timetable',
    '/student': 'Student Dashboard',
    '/student/timetable': 'My Timetable',
};

export default function MainLayout({ children }) {
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'Dashboard';

    return (
        <div className="min-h-screen text-slate-200 font-sans">
            {/* Animated Mesh Background Floor */}
            <div className="mesh-bg pointer-events-none">
                <div className="orb primary"></div>
                <div className="orb secondary"></div>
                <div className="orb accent"></div>
            </div>

            <Sidebar />
            <Navbar title={title} />
            <main className="ml-64 pt-24 px-8 pb-12 min-h-screen relative z-10">
                {children}
            </main>
        </div>
    );
}