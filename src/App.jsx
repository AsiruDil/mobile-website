import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LiveCamera from './pages/LiveCamera';

// Layouts & Pages
import AdminLayout from './layouts/AdminLayout';
import ManageUsers from './pages/ManageUsers';
import Login from './pages/Login';
import ManageNews from './pages/ManageNews';
import ProtectedRoute from './components/ProtectedRoute';
import Articles from './pages/Articles';
import MapAdmin from './pages/MapAdmin';

function App() {
  return (
    <BrowserRouter>
      {/* Global Toaster for popups everywhere */}
      
      
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
            <Route path="camera" element={<LiveCamera />} />
            <Route path="map" element={<MapAdmin />} />
          </Route>
          
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;