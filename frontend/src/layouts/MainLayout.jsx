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
        <div className="min-h-screen bg-slate-900">
            <Sidebar />
            <Navbar title={title} />
            <main className="ml-64 pt-16 p-6 min-h-screen">
                {children}
            </main>
        </div>
    );
}