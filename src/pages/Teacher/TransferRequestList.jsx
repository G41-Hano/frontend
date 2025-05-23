import { useState, useEffect } from 'react';
import api from '../../api';
import { useNotifications } from '../../contexts/NotificationContext';

const TransferRequestList = () => {
  const [transferRequests, setTransferRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const { refreshNotifications } = useNotifications();

  useEffect(() => {
    fetchTransferRequests();
  }, []);

  const fetchTransferRequests = async () => {
    try {
      const response = await api.get('/api/transfer-requests/');
      setTransferRequests(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching transfer requests:', error);
      setError('Failed to load transfer requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await api.post(`/api/transfer-requests/${requestId}/approve/`);
      await fetchTransferRequests();
      refreshNotifications();
    } catch (error) {
      console.error('Error approving transfer request:', error);
      setError('Failed to approve transfer request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.post(`/api/transfer-requests/${requestId}/reject/`);
      await fetchTransferRequests();
      refreshNotifications();
    } catch (error) {
      console.error('Error rejecting transfer request:', error);
      setError('Failed to reject transfer request');
    }
  };

  const filteredRequests = transferRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = searchTerm === '' || 
      request.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.from_classroom_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.to_classroom_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch animate-spin text-[#4C53B4] text-4xl mb-4"></i>
          <p className="text-gray-600">Loading transfer requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl animate-fade-in">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-12 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Transfer Requests</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search requests..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-100 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all"
            />
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  filter === status
                    ? 'bg-[#4C53B4] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl animate-fade-in">
          <i className="fa-solid fa-inbox text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500 text-lg">No transfer requests found</p>
          {searchTerm && (
            <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map(request => (
            <div
              key={request.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all animate-fade-in"
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#4C53B4]/10 flex items-center justify-center">
                      <i className="fa-solid fa-user-graduate text-[#4C53B4] text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {request.student_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fa-solid fa-arrow-right-from-bracket text-gray-400"></i>
                      <span className="text-gray-600">From: {request.from_classroom_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fa-solid fa-arrow-right-to-bracket text-gray-400"></i>
                      <span className="text-gray-600">To: {request.to_classroom_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fa-solid fa-user text-gray-400"></i>
                      <span className="text-gray-600">By: {request.requested_by_name}</span>
                    </div>
                  </div>

                  {request.reason && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600">
                        <i className="fa-solid fa-comment-dots text-gray-400 mr-2"></i>
                        {request.reason}
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}
                    >
                      <i className={`fa-solid ${
                        request.status === 'approved' ? 'fa-check' :
                        request.status === 'rejected' ? 'fa-xmark' :
                        'fa-clock'
                      } mr-2`}></i>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-check"></i>
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-xmark"></i>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransferRequestList; 