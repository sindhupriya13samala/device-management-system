import React, { useState, useEffect } from 'react';
import { Alert } from '../types';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';

export function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    type: 'all'
  });

  const canResolve = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, filters]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockAlerts: Alert[] = [
        {
          id: '1',
          title: 'Router maintenance due',
          description: 'Cisco Router #RT-001 requires scheduled maintenance within 48 hours',
          type: 'maintenance',
          severity: 'high',
          status: 'active',
          device_id: '1',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Low cable inventory',
          description: 'Ethernet cables running critically low in main warehouse',
          type: 'low_stock',
          severity: 'critical',
          status: 'active',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'Device warranty expiring',
          description: 'Switch #SW-012 warranty expires in 30 days',
          type: 'end_of_life',
          severity: 'medium',
          status: 'active',
          device_id: '2',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          title: 'System backup completed',
          description: 'Weekly system backup completed successfully',
          type: 'system',
          severity: 'low',
          status: 'resolved',
          resolved_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          resolved_by: 'admin@telecom.demo',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    if (filters.status !== 'all') {
      filtered = filtered.filter(alert => alert.status === filters.status);
    }

    if (filters.severity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filters.severity);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(alert => alert.type === filters.type);
    }

    setFilteredAlerts(filtered);
  };

  const handleResolve = async (alertId: string) => {
    if (!canResolve) return;

    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'resolved',
              resolved_at: new Date().toISOString(),
              resolved_by: user?.email || ''
            }
          : alert
      ));
      toast.success('Alert marked as resolved');
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'info',
      medium: 'warning',
      high: 'warning',
      critical: 'error'
    } as const;

    return <Badge variant={variants[severity as keyof typeof variants]}>{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'resolved' 
      ? <Badge variant="success">Resolved</Badge>
      : <Badge variant="error">Active</Badge>;
  };

  const columns = [
    { 
      key: 'title', 
      header: 'Alert',
      render: (alert: Alert) => (
        <div>
          <div className="font-medium text-gray-900">{alert.title}</div>
          <div className="text-sm text-gray-500 mt-1">{alert.description}</div>
        </div>
      )
    },
    { 
      key: 'type', 
      header: 'Type',
      render: (alert: Alert) => (
        <span className="capitalize">{alert.type.replace('_', ' ')}</span>
      )
    },
    { 
      key: 'severity', 
      header: 'Severity',
      render: (alert: Alert) => getSeverityBadge(alert.severity)
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (alert: Alert) => getStatusBadge(alert.status)
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (alert: Alert) => (
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (alert: Alert) => (
        <div className="flex space-x-2">
          {alert.status === 'active' && canResolve && (
            <button
              onClick={() => handleResolve(alert.id)}
              className="flex items-center px-3 py-1 text-sm text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors hover:scale-105 transform transition-transform duration-200"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Resolve
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">System Alerts</h1>
        <p className="text-gray-600">Monitor and manage system notifications and alerts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="maintenance">Maintenance</option>
              <option value="low_stock">Low Stock</option>
              <option value="end_of_life">End of Life</option>
              <option value="system">System</option>
              <option value="security">Security</option>
            </select>
          </div>
        </div>
      </div>

      <Table columns={columns} data={filteredAlerts} loading={loading} />
    </div>
  );
}