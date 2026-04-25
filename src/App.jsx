import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts & Pages
import AdminLayout from './layouts/AdminLayout';
import ManageUsers from './pages/ManageUsers';
import Login from './pages/Login';
import ManageNews from './pages/ManageNews';


// 1. Import your new ProtectedRoute
import ProtectedRoute from './components/ProtectedRoute';

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
            <Route path="articles" element={<div className="p-4">Articles Module (Coming Soon)</div>} />
          </Route>
          
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;