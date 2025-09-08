import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export function UserPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user?.email}</h1>
          <p className="text-gray-600">You are logged in as a User.</p>
        </div>
      </div>
    </div>
  );
}
