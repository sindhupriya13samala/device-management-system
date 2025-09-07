import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Alert } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface RecentAlertsProps {
  alerts: Alert[];
}

export function RecentAlerts({ alerts }: RecentAlertsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'resolved' ? CheckCircle : AlertTriangle;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent alerts</p>
        ) : (
          alerts.slice(0, 5).map((alert) => {
            const StatusIcon = getStatusIcon(alert.status);
            return (
              <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                  <StatusIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.description}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}