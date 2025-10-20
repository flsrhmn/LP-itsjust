'use client';

import { useState } from 'react';

interface EmailEntry {
  id: number;
  email: string;
  country: string;
  created_at: string;
}

export default function AdminPage() {
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEmails = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/admin/emails';
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
        } catch {
          throw new Error(`Server returned ${response.status}: ${errorText}`);
        }
      }
      
      const data = await response.json();
      console.log('API response:', data);
      
      if (data.success) {
        setEmails(data.emails || []);
        if (data.emails && data.emails.length === 0) {
          setError('No emails found for the selected date range');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch emails');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      if (errorMessage.includes('Failed to connect to database')) {
        setError('Database connection failed. Please check if MySQL is running and credentials are correct.');
      } else if (errorMessage.includes('404')) {
        setError('API endpoint not found. Please check if the server is running correctly.');
      } else {
        setError(errorMessage);
      }
      
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ['ID', 'Email', 'Country', 'Date Added'],
      ...emails.map(email => [email.id, email.email, email.country, email.created_at])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emails-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setEmails([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Email Subscriptions Admin</h1>
        
        {/* <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
            <h2 className="font-semibold text-blue-800 mb-2">API Endpoint Information</h2>
            <p className="text-blue-700 text-sm">
              Expected API URL: <code>/api/admin/emails</code>
            </p>
            <p className="text-blue-700 text-sm mt-1">
              Current URL: <code>{typeof window !== 'undefined' ? window.location.origin : ''}/api/admin/emails</code>
            </p>
          </div>
        </div> */}
        
        <div className="mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchEmails}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Filter'}
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Clear
            </button>
            <button
              onClick={exportCSV}
              disabled={emails.length === 0}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Loading emails...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Total emails: <span className="font-semibold">{emails.length}</span>
              </p>
              {emails.length > 0 && (
                <p className="text-sm text-gray-600">
                  Showing records from {startDate || 'the beginning'} to {endDate || 'now'}
                </p>
              )}
            </div>
            
            {emails.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {emails.map((email) => (
                      <tr key={email.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{email.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.country || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(email.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !error && (
                <div className="text-center py-8 text-gray-500">
                  No emails found. {startDate || endDate ? 'Try adjusting your filters.' : 'Click "Filter" to load all emails.'}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}