import React, { useState, useEffect } from 'react';
import { 
  Lock, Search, RefreshCw, Download, Phone, 
  MessageSquare, Trash2, ArrowLeft, AlertCircle, 
  Clock, MapPin, Filter, LogOut
} from 'lucide-react';

const STATUS_OPTIONS = [
  'New Lead',
  'Contacted',
  'Site Visit Scheduled',
  'Site Visit Completed',
  'Token Advance Received',
  'Booked',
  'Closed / Dropped'
];

const STATUS_COLORS = {
  'New Lead': 'bg-blue-50 text-blue-700 border-blue-200',
  'Contacted': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Site Visit Scheduled': 'bg-amber-50 text-amber-800 border-amber-200',
  'Site Visit Completed': 'bg-purple-50 text-purple-700 border-purple-200',
  'Token Advance Received': 'bg-teal-50 text-teal-700 border-teal-200',
  'Booked': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Closed / Dropped': 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

const AdminPortal = ({ onBackToSite }) => {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('gv_admin_key') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch leads using key
  const fetchLeads = async (keyToUse) => {
    const key = keyToUse || adminKey;
    if (!key) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/enquiries?key=${encodeURIComponent(key)}`, {
        headers: { 'x-admin-key': key }
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to authenticate with Admin Key');
      }

      setLeads(data.data || []);
      setIsAuthenticated(true);
      localStorage.setItem('gv_admin_key', key);
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial check on mount without cascading setState in render
  useEffect(() => {
    let isMounted = true;
    const savedKey = localStorage.getItem('gv_admin_key');
    if (!savedKey) return;

    fetch(`/api/enquiries?key=${encodeURIComponent(savedKey)}`, {
      headers: { 'x-admin-key': savedKey }
    })
      .then(res => res.json())
      .then(data => {
        if (isMounted && data && data.success) {
          setLeads(data.data || []);
          setIsAuthenticated(true);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!adminKey.trim()) {
      setLoginError('Please enter your Admin Secret Key');
      return;
    }
    setLoginError('');
    setIsVerifying(true);

    try {
      const res = await fetch(`/api/enquiries?key=${encodeURIComponent(adminKey.trim())}`, {
        headers: { 'x-admin-key': adminKey.trim() }
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid Admin Secret Key');
      }

      setLeads(data.data || []);
      setIsAuthenticated(true);
      localStorage.setItem('gv_admin_key', adminKey.trim());
    } catch (err) {
      setLoginError(err.message);
      setIsAuthenticated(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gv_admin_key');
    setAdminKey('');
    setIsAuthenticated(false);
    setLeads([]);
  };

  // Update Status handler
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to update status');
        return;
      }

      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Lead handler
  const handleDeleteLead = async (id, code) => {
    if (!window.confirm(`Are you sure you want to permanently delete lead ${code}?`)) return;

    try {
      const res = await fetch(`/api/enquiries?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to delete');
        return;
      }
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert('Error deleting lead: ' + err.message);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!leads.length) return;
    const headers = ['Ref Code', 'Date', 'Name', 'Phone', 'Email', 'Location', 'Property Type', 'Budget', 'Status', 'Message'];
    const rows = filteredLeads.map(l => [
      `"${l.enquiry_code || ''}"`,
      `"${new Date(l.created_at).toLocaleString()}"`,
      `"${(l.full_name || '').replace(/"/g, '""')}"`,
      `"${l.phone_number || ''}"`,
      `"${l.email || ''}"`,
      `"${l.preferred_location || ''}"`,
      `"${l.property_type || ''}"`,
      `"${l.budget || ''}"`,
      `"${l.status || ''}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gubera-vasal-leads-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (lead.full_name && lead.full_name.toLowerCase().includes(q)) ||
      (lead.phone_number && lead.phone_number.includes(q)) ||
      (lead.email && lead.email.toLowerCase().includes(q)) ||
      (lead.enquiry_code && lead.enquiry_code.toLowerCase().includes(q)) ||
      (lead.preferred_location && lead.preferred_location.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesLocation = locationFilter === 'All' || lead.preferred_location === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Metrics
  const stats = {
    total: leads.length,
    newCount: leads.filter(l => l.status === 'New Lead').length,
    siteVisits: leads.filter(l => l.status === 'Site Visit Scheduled' || l.status === 'Site Visit Completed').length,
    booked: leads.filter(l => l.status === 'Booked' || l.status === 'Token Advance Received').length
  };

  // Unique locations from data
  const locationsList = ['All', ...Array.from(new Set(leads.map(l => l.preferred_location).filter(Boolean)))];

  // -------------------------------------------------------------
  // Render: Login Screen
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-canvas flex flex-col justify-center items-center px-4 py-12 font-sans selection:bg-brand-dark selection:text-white">
        <div className="w-full max-w-md bg-brand-white border border-brand-divider p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-brand-dark text-white mx-auto flex items-center justify-center mb-4">
              <Lock size={22} />
            </div>
            <span className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-brand-accent block mb-1">
              GUBERA VASAL REAL ESTATE
            </span>
            <h1 className="text-2xl font-display font-semibold text-brand-dark tracking-tight">
              Admin Console
            </h1>
            <p className="text-xs text-brand-muted mt-2">
              Enter your Admin Secret Key to access live leads from Neon PostgreSQL (<code className="text-brand-dark font-mono font-semibold">estate</code>).
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-1.5">
                Admin Secret Key
              </label>
              <input
                type="password"
                required
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="e.g. gubera_vasal_secret_admin_2026"
                className="w-full bg-brand-canvas text-brand-dark text-sm px-4 py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-brand-dark text-white font-sans text-xs tracking-widest uppercase font-semibold py-3.5 hover:bg-brand-accent transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                'Unlock Admin Dashboard'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-brand-divider/70 flex justify-between items-center text-xs text-brand-muted">
            <button
              onClick={onBackToSite}
              className="hover:text-brand-dark transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Website
            </button>
            <span className="font-mono text-[10px] text-brand-light-muted">Neon DB: estate</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: Authenticated Dashboard
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-brand-canvas text-brand-dark font-sans selection:bg-brand-dark selection:text-white">
      {/* Top Navigation Bar */}
      <header className="bg-brand-white border-b border-brand-divider sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToSite}
              className="text-xs text-brand-muted hover:text-brand-dark flex items-center gap-1.5 py-1.5 px-2.5 border border-brand-divider hover:border-brand-dark transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Website</span>
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-base font-display font-bold tracking-tight text-brand-dark">
                GUBERA VASAL
              </span>
              <span className="px-2 py-0.5 bg-brand-dark text-white text-[10px] font-mono tracking-widest uppercase font-semibold">
                ADMIN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">Neon PostgreSQL Connected (<code className="font-mono font-bold">estate</code>)</span>
            </div>

            <button
              onClick={() => fetchLeads()}
              disabled={isLoading}
              className="p-2 border border-brand-divider hover:border-brand-dark text-brand-dark transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={handleExportCSV}
              disabled={!leads.length}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-brand-white border border-brand-divider hover:border-brand-dark text-xs font-semibold text-brand-dark transition-colors cursor-pointer disabled:opacity-40"
            >
              <Download size={14} />
              Export CSV
            </button>

            <button
              onClick={handleLogout}
              className="p-2 border border-brand-divider hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-brand-muted transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-brand-white border border-brand-divider p-5">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-brand-muted block mb-1">
              Total Inquiries
            </span>
            <div className="text-3xl font-display font-semibold text-brand-dark">
              {stats.total}
            </div>
            <span className="text-[11px] text-brand-light-muted mt-1 block">Live in Neon database</span>
          </div>

          <div className="bg-brand-white border border-blue-200 p-5 bg-gradient-to-br from-white to-blue-50/30">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-700 block mb-1">
              New Leads
            </span>
            <div className="text-3xl font-display font-semibold text-blue-900">
              {stats.newCount}
            </div>
            <span className="text-[11px] text-blue-600 mt-1 block">Awaiting initial call</span>
          </div>

          <div className="bg-brand-white border border-amber-200 p-5 bg-gradient-to-br from-white to-amber-50/30">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-800 block mb-1">
              Site Visits
            </span>
            <div className="text-3xl font-display font-semibold text-amber-900">
              {stats.siteVisits}
            </div>
            <span className="text-[11px] text-amber-700 mt-1 block">Scheduled or completed</span>
          </div>

          <div className="bg-brand-white border border-emerald-200 p-5 bg-gradient-to-br from-white to-emerald-50/30">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-800 block mb-1">
              Booked / Advances
            </span>
            <div className="text-3xl font-display font-semibold text-emerald-900">
              {stats.booked}
            </div>
            <span className="text-[11px] text-emerald-700 mt-1 block">Converted plot buyers</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-brand-white border border-brand-divider p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, code, location..."
                className="w-full bg-brand-canvas text-sm pl-9 pr-4 py-2.5 border border-brand-divider outline-none focus:border-brand-dark transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-muted hover:text-brand-dark"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Export on mobile */}
            <button
              onClick={handleExportCSV}
              className="sm:hidden flex items-center justify-center gap-1.5 px-4 py-2.5 border border-brand-divider text-xs font-semibold"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-divider/60 text-xs">
            <span className="text-brand-muted text-[11px] font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter size={12} /> Status:
            </span>
            {['All', ...STATUS_OPTIONS].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs border transition-colors cursor-pointer ${
                  statusFilter === status 
                    ? 'bg-brand-dark text-white border-brand-dark font-medium' 
                    : 'bg-brand-canvas border-brand-divider text-brand-muted hover:border-brand-dark hover:text-brand-dark'
                }`}
              >
                {status}
              </button>
            ))}

            {locationsList.length > 2 && (
              <div className="w-full sm:w-auto flex items-center gap-2 mt-2 sm:mt-0 sm:ml-auto">
                <span className="text-brand-muted text-[11px] font-semibold uppercase tracking-wider">
                  Location:
                </span>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="bg-brand-canvas text-xs border border-brand-divider px-2.5 py-1 outline-none"
                >
                  {locationsList.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Leads Table / List */}
        <div className="bg-brand-white border border-brand-divider overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-divider flex items-center justify-between">
            <div className="text-sm font-semibold text-brand-dark">
              Showing {filteredLeads.length} of {leads.length} Inquiries
            </div>
            {error && (
              <span className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> {error}
              </span>
            )}
          </div>

          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-brand-muted">
              <div className="w-12 h-12 rounded-full bg-brand-canvas mx-auto flex items-center justify-center mb-3 text-brand-light-muted">
                <Search size={20} />
              </div>
              <p className="text-sm font-medium text-brand-dark">No inquiries found</p>
              <p className="text-xs text-brand-muted mt-1">
                {searchQuery || statusFilter !== 'All' 
                  ? 'Try adjusting your search query or status filter.' 
                  : 'Submitted website leads will show up here automatically.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-canvas/70 border-b border-brand-divider text-[11px] uppercase tracking-wider text-brand-muted">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Ref Code & Date</th>
                    <th className="py-3 px-4 font-semibold">Client</th>
                    <th className="py-3 px-4 font-semibold">Contact & Quick Dial</th>
                    <th className="py-3 px-4 font-semibold">Location & Type</th>
                    <th className="py-3 px-4 font-semibold">Budget</th>
                    <th className="py-3 px-4 font-semibold">Status (Click to update)</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-divider/70">
                  {filteredLeads.map((lead) => {
                    const cleanPhone = (lead.phone_number || '').replace(/\D/g, '');
                    const formattedDate = new Date(lead.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });
                    const formattedTime = new Date(lead.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <tr key={lead.id} className="hover:bg-brand-canvas/50 transition-colors">
                        {/* Ref Code & Date */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <span className="font-mono font-bold text-brand-dark block">
                            {lead.enquiry_code}
                          </span>
                          <span className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
                            <Clock size={11} /> {formattedDate} {formattedTime}
                          </span>
                        </td>

                        {/* Client Name & Message */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-semibold text-brand-dark block text-sm">
                            {lead.full_name}
                          </span>
                          {lead.email && (
                            <span className="text-[11px] text-brand-muted block truncate max-w-[180px]">
                              {lead.email}
                            </span>
                          )}
                          {lead.message && (
                            <p className="text-[11px] text-brand-muted mt-1 bg-brand-canvas p-2 border border-brand-divider/50 max-w-xs leading-relaxed italic">
                              "{lead.message}"
                            </p>
                          )}
                        </td>

                        {/* Phone & Quick Actions */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <div className="font-mono text-xs font-semibold text-brand-dark mb-1.5">
                            {lead.phone_number}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${cleanPhone}`}
                              className="px-2 py-1 bg-brand-canvas hover:bg-brand-dark hover:text-white border border-brand-divider text-[11px] font-medium flex items-center gap-1 transition-colors"
                              title="Call Customer"
                            >
                              <Phone size={11} /> Call
                            </a>
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(lead.full_name || '')},%20greetings%20from%20Gubera%20Vasal.%20Regarding%20your%20inquiry%20${encodeURIComponent(lead.enquiry_code || '')}:`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-1 transition-colors"
                              title="WhatsApp Customer"
                            >
                              <MessageSquare size={11} /> WhatsApp
                            </a>
                          </div>
                        </td>

                        {/* Location & Property Type */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <span className="font-medium text-brand-dark flex items-center gap-1">
                            <MapPin size={12} className="text-brand-accent shrink-0" />
                            {lead.preferred_location}
                          </span>
                          <span className="text-[11px] text-brand-muted block mt-0.5">
                            {lead.property_type || 'Gated Community Plots'}
                          </span>
                        </td>

                        {/* Budget */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <span className="font-semibold text-brand-dark">
                            {lead.budget || 'Flexible'}
                          </span>
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <select
                            value={lead.status}
                            disabled={updatingId === lead.id}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className={`text-xs px-2.5 py-1 border font-medium outline-none cursor-pointer ${
                              STATUS_COLORS[lead.status] || 'bg-brand-canvas text-brand-dark border-brand-divider'
                            } ${updatingId === lead.id ? 'opacity-50' : ''}`}
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt} value={opt} className="bg-white text-black">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Delete Action */}
                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.enquiry_code)}
                            className="p-1.5 text-brand-muted hover:text-red-700 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                            title="Delete Lead"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPortal;
