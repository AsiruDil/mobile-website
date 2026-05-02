import React, { useState, useEffect } from 'react';
import { Search, Trash2, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import ConfirmModal from '../components/ConfirmModal';

const Articles = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  const incidentTypes = ['All', 'Property Damage', 'Elephant Sighting', 'Poaching Activity', 'Fire/Smoke', 'Injured Animal', 'Other'];

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/incidents/admin/all');
      const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReports(sorted);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/api/incidents/admin/${id}/status`, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchReports();
      if (selectedReport?.id === id) {
        setSelectedReport(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/incidents/admin/${id}`);
      toast.success('Report deleted');
      setModalConfig({ isOpen: false });
      if (selectedReport?.id === id) setSelectedReport(null);
      fetchReports();
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const filtered = reports.filter(r => {
    const matchSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'All' || r.incidentType === filterType;
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Incident Reports</h1>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
          {reports.length} Total Reports
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm w-64"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          {incidentTypes.map(t => <option key={t}>{t}</option>)}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option>All</option>
          <option>Pending</option>
          <option>Reviewed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600 text-sm">Reporter</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Type</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Location</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading reports...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No reports found.</td></tr>
            ) : (
              filtered.map((report) => (
                <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {report.photoUrl ? (
                        <img src={report.photoUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{report.name || '—'}</p>
                        <p className="text-xs text-gray-400">{report.contactNumber || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {report.incidentType}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{report.location}</td>
                  <td className="p-4 text-gray-500 text-xs">{formatDate(report.createdAt)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === 'Reviewed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {report.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setModalConfig({
                        isOpen: true,
                        title: 'Delete Report',
                        message: `Are you sure you want to delete this report from "${report.name}"?`,
                        confirmText: 'Delete',
                        isDanger: true,
                        onConfirm: () => handleDelete(report.id),
                      })}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Report Details</h2>
              <button onClick={() => setSelectedReport(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {selectedReport.photoUrl && (
              <img src={selectedReport.photoUrl} alt="Incident" className="w-full h-52 object-cover" />
            )}

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {selectedReport.incidentType}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedReport.status === 'Reviewed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedReport.status || 'Pending'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Reporter Name</p>
                  <p className="font-medium text-gray-800">{selectedReport.name || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Contact</p>
                  <p className="font-medium text-gray-800">{selectedReport.contactNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Location</p>
                  <p className="font-medium text-gray-800">{selectedReport.location}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Reported At</p>
                  <p className="font-medium text-gray-800">{formatDate(selectedReport.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Username</p>
                  <p className="font-medium text-gray-800">{selectedReport.username || '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs mb-1">Description</p>
                <p className="text-gray-700 text-sm leading-relaxed">{selectedReport.description}</p>
              </div>

              {/* Status Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleStatusChange(selectedReport.id, 'Reviewed')}
                  disabled={selectedReport.status === 'Reviewed'}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-40"
                >
                  Mark as Reviewed
                </button>
                <button
                  onClick={() => handleStatusChange(selectedReport.id, 'Pending')}
                  disabled={selectedReport.status === 'Pending'}
                  className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium disabled:opacity-40"
                >
                  Mark as Pending
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        isDanger={modalConfig.isDanger}
      />
    </div>
  );
};

export default Articles;