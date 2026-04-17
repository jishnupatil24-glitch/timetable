import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Departments from './pages/admin/Departments';
import Teachers from './pages/admin/Teachers';
import Students from './pages/admin/Students';
import Rooms from './pages/admin/Rooms';
import Subjects from './pages/admin/Subjects';
import Timetable from './pages/admin/Timetable';
import MainLayout from './layouts/MainLayout';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
};

const ComingSoon = ({ page }) => (
  <div className="glass rounded-2xl p-8 text-center">
    <h2 className="text-2xl font-bold text-white mb-2">{page}</h2>
    <p className="text-slate-400">This page is coming soon...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <MainLayout><AdminDashboard /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/departments" element={
            <ProtectedRoute role="admin">
              <MainLayout><Departments /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/teachers" element={
            <ProtectedRoute role="admin">
              <MainLayout><Teachers /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute role="admin">
              <MainLayout><Students /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/subjects" element={
            <ProtectedRoute role="admin">
              <MainLayout><Subjects /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/rooms" element={
            <ProtectedRoute role="admin">
              <MainLayout><Rooms /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/timetable" element={
            <ProtectedRoute role="admin">
              <MainLayout><Timetable /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;