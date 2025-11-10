import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { toast } from 'react-toastify';

const AdminRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    toast.error('Nemate pristup ovoj stranici. Samo administratori mogu pristupiti.');
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};

export default AdminRoute;
