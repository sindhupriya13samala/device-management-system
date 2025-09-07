import React, { useState, useEffect } from 'react';
import { UtilizationLog } from '../types';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Plus, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export function UtilizationPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<UtilizationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const canAdd = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'technician';

  useEffect(() => {
    fetchUtilizationLogs();
  }, []);

  const fetchUtilizationLogs = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockLogs: UtilizationLog[] = [
        {
          id: '1',
          device_id: '1',
          device: {
            id: '1',
            name: 'Router RT-001',
            type: 'router',
            status: 'in_use',
            serial_number: 'RT001-2024-001',
            model: 'Cisco ISR 4321',
            purchase_date: '2024-01-15',
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z'
          },
          hours_used: 168,
          log_date: '2024-06-01',
          notes: 'Full month operation',
          created_by: 'tech1@telecom.com',
          created_at: '2024-06-01T10:00:00Z'
        },
        {
          id: '2',
          device_id: '2',
          device: {
            id: '2',
            name: 'Switch SW-001',
            type: 'switch',
            status: 'in_use',
            serial_number: 'SW001-2024-001',
            model: 'Juniper EX3400',
            purchase_date: '2024-02-10',
            created_at: '2024-02-10T10:00:00Z',
            updated_at: '2024-02-10T10:00:00Z'
          },
          hours_used: 152,
          log_date: '2024-06-01',
          notes: 'Minor downtime for updates',
          created_by: 'tech2@telecom.com',
          created_at: '2024-06-01T10:00:00Z'
        }
      ];
      setLogs(mockLogs);
    } catch (error) {
      toast.error('Failed to load utilization logs');
    } finally {
      setLoading(false);
    }
  };

  const chartData = logs.map(log => ({
    date: format(new Date(log.log_date), 'MMM dd'),
    hours: log.hours_used,
    device: log.device?.name || 'Unknown Device'
  }));

  const columns = [
    { 
      key: 'device_name', 
      header: 'Device',
      render: (log: UtilizationLog) => (
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{log.device?.name || 'Unknown Device'}</span>
        </div>
      )
    },
    { 
      key: 'hours_used', 
      header: 'Hours Used',
      render: (log: UtilizationLog) => (
        <span className="font-medium text-blue-600">{log.hours_used}h</span>
      )
    },
    { 
      key: 'log_date', 
      header: 'Date',
      render: (log: UtilizationLog) => format(new Date(log.log_date), 'MMM dd, yyyy')
    },
    { key: 'notes', header: 'Notes' },
    { key: 'created_by', header: 'Logged By' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Utilization Logs</h1>
          <p className="text-gray-600">Track and analyze device usage patterns</p>
        </div>
        {canAdd && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors hover:scale-105 transform transition-transform duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Usage
          </button>
        )}
      </div>

      {/* Usage Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="hours" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Table columns={columns} data={logs} loading={loading} />

      {/* Add Log Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Device Utilization"
      >
        <UtilizationForm
          onSubmit={async (data) => {
            const newLog: UtilizationLog = {
              ...data,
              id: Math.random().toString(36).substr(2, 9),
              created_by: user?.email || '',
              created_at: new Date().toISOString()
            };
            setLogs(prev => [newLog, ...prev]);
            setIsAddModalOpen(false);
            toast.success('Utilization logged successfully');
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

interface UtilizationFormProps {
  onSubmit: (data: Partial<UtilizationLog>) => Promise<void>;
  onCancel: () => void;
}

function UtilizationForm({ onSubmit, onCancel }: UtilizationFormProps) {
  const [formData, setFormData] = useState({
    device_id: '',
    hours_used: 0,
    log_date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  const mockDevices = [
    { id: '1', name: 'Router RT-001' },
    { id: '2', name: 'Switch SW-001' },
    { id: '3', name: 'Modem MD-001' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Device
        </label>
        <select
          required
          value={formData.device_id}
          onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a device</option>
          {mockDevices.map(device => (
            <option key={device.id} value={device.id}>{device.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hours Used
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.5"
            value={formData.hours_used}
            onChange={(e) => setFormData({ ...formData, hours_used: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            required
            value={formData.log_date}
            onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add any relevant notes about the usage..."
        />
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
          Log Usage
        </button>
      </div>
    </form>
  );
}