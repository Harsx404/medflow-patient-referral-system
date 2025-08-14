import { useState } from 'react';

export interface LogEntry {
  id: string;
  timestamp: string;
  userType: 'doctor' | 'employee';
  userId: string;
  userName: string;
  action: string;
  details: string;
  category: 'patient' | 'system' | 'security' | 'other';
}

export interface LogsFilter {
  userType?: 'doctor' | 'employee';
  startDate?: Date;
  endDate?: Date;
  category?: string;
  searchTerm?: string;
}

export const useLogsService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (filters: LogsFilter = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters.userType) queryParams.append('userType', filters.userType);
      if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.searchTerm) queryParams.append('search', filters.searchTerm);

      const response = await fetch(`/api/logs?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();
      return data as LogEntry[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchLogs,
    loading,
    error,
  };
};
