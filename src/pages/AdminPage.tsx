import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Plus, Edit, Trash2, Users, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export function AdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@telecom.demo',
          role: 'admin',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        },
        {
          id: '2',
          email: 'manager@telecom.demo',
          role: 'manager',
          created_at: '2024-01-02T10:00:00Z',
          updated_at: '2024-01-02T10:00:00Z'
        },
        {
          id: '3',
          email: 'tech1@telecom.demo',
          role: 'technician',
          created_at: '2024-01-03T10:00:00Z',
          updated_at: '2024-01-03T10:00:00Z'
        },
        {
          id: '4',
          email: 'tech2@telecom.demo',
          role: 'technician',
          created_at: '2024-01-04T10:00:00Z',
          updated_at: '2024-01-04T10:00:00Z'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    if (userId === currentUser?.id) {
      toast.error('You cannot delete your own account');
      return;
    }

    try {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'error',
      manager: 'warning',
      technician: 'info'
    } as const;

    return <Badge variant={variants[role as keyof typeof variants]}>{role}</Badge>;
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Shield : Users;
  };

  const columns = [
    { 
      key: 'email', 
      header: 'User',
      render: (user: User) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-700">
              {user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium">{user.email}</span>
        </div>
      )
    },
    { 
      key: 'role', 
      header: 'Role',
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          {React.createElement(getRoleIcon(user.role), { className: "w-4 h-4 text-gray-400" })}
          {getRoleBadge(user.role)}
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (user: User) => format(new Date(user.created_at), 'MMM dd, yyyy')
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: User) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(user)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors hover:scale-105 transform transition-transform duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          {user.id !== currentUser?.id && (
            <button
              onClick={() => handleDelete(user.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors hover:scale-105 transform transition-transform duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts and role assignments</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors hover:scale-105 transform transition-transform duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Administrators</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Managers</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'manager').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Technicians</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'technician').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Table columns={columns} data={users} loading={loading} />

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
      >
        <UserForm
          onSubmit={async (data) => {
            const newUser: User = {
              ...data,
              id: Math.random().toString(36).substr(2, 9),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setUsers(prev => [...prev, newUser]);
            setIsAddModalOpen(false);
            toast.success('User added successfully');
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
      >
        <UserForm
          user={selectedUser}
          onSubmit={async (data) => {
            setUsers(prev => prev.map(user => 
              user.id === selectedUser?.id 
                ? { ...user, ...data, updated_at: new Date().toISOString() }
                : user
            ));
            setIsEditModalOpen(false);
            setSelectedUser(null);
            toast.success('User updated successfully');
          }}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
        />
      </Modal>
    </div>
  );
}

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: Partial<User>) => Promise<void>;
  onCancel: () => void;
}

function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    role: user?.role || 'technician'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={!!user}
        />
        {user && (
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed after creation</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="technician">Technician</option>
          <option value="manager">Manager</option>
          <option value="admin">Administrator</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Choose the appropriate role for this user's responsibilities
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors hover:scale-105 transform transition-transform duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors hover:scale-105 transform transition-transform duration-200"
        >
          {user ? 'Update User' : 'Add User'}
        </button>
      </div>
    </form>
  );
}