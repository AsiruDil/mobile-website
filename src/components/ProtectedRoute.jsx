import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // If there's no token, redirect to Login ("/")
  // The 'replace' and 'state' parts prevent the user from using the 
  // browser's "Back" button to magically get back into the admin panel.
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If they have a token, allow them to see the nested routes (the AdminLayout)
  return <Outlet />;
};

export default ProtectedRoute;