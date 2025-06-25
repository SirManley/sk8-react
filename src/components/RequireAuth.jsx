// src/components/RequireAuth.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';

export default function RequireAuth({ children }) {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);

  console.log("RequireAuth → loading:", loading);
  console.log("RequireAuth → user:", user);
  console.log("RequireAuth → error:", error);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
