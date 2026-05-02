import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './layouts/AdminLayout';
import ManageUsers from './pages/ManageUsers';
import Login from './pages/Login';
import ManageNews from './pages/ManageNews';
import ProtectedRoute from './components/ProtectedRoute';
import Articles from './pages/Articles';

function App() {
  return (
    <BrowserRouter>
      {/* Global Toaster for popups everywhere */}
      <Toaster position="top-right" />
      
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />
        
        {/* 2. WRAP ALL ADMIN ROUTES IN THE PROTECTED ROUTE */}
        <Route element={<ProtectedRoute />}>
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/users" replace />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="news" element={<ManageNews />} />
            <Route path="articles" element={<Articles />} />
          </Route>
          
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;