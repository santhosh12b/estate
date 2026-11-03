import React, { useState, useEffect } from 'react';
import { 
  Lock, Search, RefreshCw, Download, Phone, 
  MessageSquare, Trash2, ArrowLeft, AlertCircle, 
  Clock, MapPin, Filter, LogOut, Plus, Edit3, 
  Play, Film, X, Check
} from 'lucide-react';
import { saveProject, deleteProject } from '../services/api';

const LEAD_STATUS_OPTIONS = [
  'New Lead',
  'Contacted',
  'Site Visit Scheduled',
  'Site Visit Completed',
  'Token Advance Received',
  'Booked',
  'Closed / Dropped'
];

const LEAD_STATUS_COLORS = {
  'New Lead': 'bg-blue-50 text-blue-700 border-blue-200',
  'Contacted': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Site Visit Scheduled': 'bg-amber-50 text-amber-800 border-amber-200',
  'Site Visit Completed': 'bg-purple-50 text-purple-700 border-purple-200',
  'Token Advance Received': 'bg-teal-50 text-teal-700 border-teal-200',
  'Booked': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Closed / Dropped': 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

const PLOT_STATUS_OPTIONS = [
  'Available',
  'Fast Selling',
  'Ready for Construction',
  'Coming Soon',
  'Sold Out'
];

const PLOT_STATUS_COLORS = {
  'Available': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Fast Selling': 'bg-amber-50 text-amber-800 border-amber-200',
  'Ready for Construction': 'bg-blue-50 text-blue-700 border-blue-200',
  'Coming Soon': 'bg-purple-50 text-purple-700 border-purple-200',
  'Sold Out': 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

const INITIAL_PLOT_FORM = {
  id: '',
  name: '',
  location: 'Coimbatore',
  subLocation: '',
  startingPrice: '₹24.5 Lakhs',
  plotSizes: '1.75 to 8.0 Cents',
  sqftRange: '762 – 3,485 Sq.Ft',
  status: 'Available',
  imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  videoUrl: '',
  videoTitle: '',
  description: '',
  loanEligibility: '80% to 90% Bank Loan Approved by All Major Banks'
};

const AdminPortal = ({ onBackToSite, onRefreshPlots }) => {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('gv_admin_key') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Tabs: 'leads' | 'plots'
  const [activeTab, setActiveTab] = useState('leads');

  // Leads State
  const [leads, setLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [leadsError, setLeadsError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('All');
  const [leadLocationFilter, setLeadLocationFilter] = useState('All');
  const [updatingLeadId, setUpdatingLeadId] = useState(null);

  // Plots & Video CMS State
  const [plots, setPlots] = useState([]);
  const [isLoadingPlots, setIsLoadingPlots] = useState(false);
  const [plotsError, setPlotsError] = useState('');
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [plotFormData, setPlotFormData] = useState(INITIAL_PLOT_FORM);
  const [isSavingPlot, setIsSavingPlot] = useState(false);
  const [plotActionMessage, setPlotActionMessage] = useState('');

  // Video Preview Modal
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');

  // -------------------------------------------------------------
  // Data Fetching
  // -------------------------------------------------------------
  const fetchLeads = async (keyToUse) => {
    const key = keyToUse || adminKey;
    if (!key) return;

    setIsLoadingLeads(true);
    setLeadsError('');

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
      setLeadsError(err.message);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const fetchPlots = async () => {
    setIsLoadingPlots(true);
    setPlotsError('');
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        setPlots(data.data);
      }
    } catch (err) {
      setPlotsError('Failed to fetch plots: ' + err.message);
    } finally {
      setIsLoadingPlots(false);
    }
  };

  // Initial check on mount
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
          fetch('/api/projects')
            .then(r => r.json())
            .then(p => {
              if (isMounted && p && Array.isArray(p.data)) setPlots(p.data);
            })
            .catch(() => {});
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
      fetchPlots();
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
    setPlots([]);
  };

  // -------------------------------------------------------------
  // Leads Actions
  // -------------------------------------------------------------
  const handleLeadStatusChange = async (id, newStatus) => {
    setUpdatingLeadId(id);
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
      setUpdatingLeadId(null);
    }
  };

  const handleDeleteLead = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete lead ${code}?`)) return;

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

  // -------------------------------------------------------------
  // Plots & Video CMS Actions
  // -------------------------------------------------------------
  const handleOpenNewPlotModal = () => {
    setPlotFormData(INITIAL_PLOT_FORM);
    setPlotActionMessage('');
    setIsPlotModalOpen(true);
  };

  const handleEditPlotClick = (plot) => {
    setPlotFormData({
      id: plot.id,
      name: plot.name || '',
      location: plot.location || 'Coimbatore',
      subLocation: plot.subLocation || '',
      startingPrice: plot.startingPrice || '',
      plotSizes: plot.plotSizes || '1.75 to 8.0 Cents',
      sqftRange: plot.sqftRange || '762 – 3,485 Sq.Ft',
      status: plot.status || 'Available',
      imageUrl: plot.imageUrl || '',
      videoUrl: plot.videoUrl || '',
      videoTitle: plot.videoTitle || '',
      description: plot.description || '',
      loanEligibility: plot.loanEligibility || '80% to 90% Bank Loan Approved by All Major Banks'
    });
    setPlotActionMessage('');
    setIsPlotModalOpen(true);
  };

  const handlePlotFormSubmit = async (e) => {
    e.preventDefault();
    if (!plotFormData.name.trim()) {
      alert('Please enter a layout name.');
      return;
    }

    setIsSavingPlot(true);
    setPlotActionMessage('');

    try {
      await saveProject(plotFormData, adminKey);
      await fetchPlots();
      if (onRefreshPlots) onRefreshPlots();
      setIsPlotModalOpen(false);
      setPlotFormData(INITIAL_PLOT_FORM);
    } catch (err) {
      setPlotActionMessage('Error: ' + err.message);
    } finally {
      setIsSavingPlot(false);
    }
  };

  const handleDeletePlot = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete plot layout "${name}"?`)) return;

    try {
      await deleteProject(id, adminKey);
      setPlots(prev => prev.filter(p => p.id !== id));
      if (onRefreshPlots) onRefreshPlots();
    } catch (err) {
      alert('Error deleting plot: ' + err.message);
    }
  };

  const handlePlotStatusChange = async (id, newStatus) => {
    try {
      await saveProject({ id, status: newStatus }, adminKey);
      setPlots(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      if (onRefreshPlots) onRefreshPlots();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // -------------------------------------------------------------
  // Computations
  // -------------------------------------------------------------
  const filteredLeads = leads.filter(lead => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (lead.full_name && lead.full_name.toLowerCase().includes(q)) ||
      (lead.phone_number && lead.phone_number.includes(q)) ||
      (lead.email && lead.email.toLowerCase().includes(q)) ||
      (lead.enquiry_code && lead.enquiry_code.toLowerCase().includes(q)) ||
      (lead.preferred_location && lead.preferred_location.toLowerCase().includes(q));

    const matchesStatus = leadStatusFilter === 'All' || lead.status === leadStatusFilter;
    const matchesLocation = leadLocationFilter === 'All' || lead.preferred_location === leadLocationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const leadStats = {
    total: leads.length,
    newCount: leads.filter(l => l.status === 'New Lead').length,
    siteVisits: leads.filter(l => l.status === 'Site Visit Scheduled' || l.status === 'Site Visit Completed').length,
    booked: leads.filter(l => l.status === 'Booked' || l.status === 'Token Advance Received').length
  };

  const leadLocationsList = ['All', ...Array.from(new Set(leads.map(l => l.preferred_location).filter(Boolean)))];

  // Helper to extract YouTube embed URL for preview
  const getEmbedUrl = (rawUrl) => {
    if (!rawUrl) return null;
    const url = rawUrl.trim();
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    if (url.includes('/embed/')) return url;
    return null;
  };

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
              Admin Console & CMS
            </h1>
            <p className="text-xs text-brand-muted mt-2">
              Manage customer inquiries, create new plot layouts, and upload YouTube video walkthroughs.
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
            <span className="font-mono text-[10px] text-brand-light-muted">Neon DB: Connected</span>
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
      {/* Top Header */}
      <header className="bg-brand-white border-b border-brand-divider sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToSite}
              className="text-xs text-brand-muted hover:text-brand-dark flex items-center gap-1.5 py-1.5 px-2.5 border border-brand-divider hover:border-brand-dark transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back to Website</span>
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-base font-display font-bold tracking-tight text-brand-dark">
                GUBERA VASAL
              </span>
              <span className="px-2 py-0.5 bg-brand-dark text-white text-[10px] font-mono tracking-widest uppercase font-semibold">
                ADMIN CONSOLE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">Neon PostgreSQL Connected</span>
            </div>

            <button
              onClick={() => {
                if (activeTab === 'leads') fetchLeads();
                else fetchPlots();
              }}
              disabled={isLoadingLeads || isLoadingPlots}
              className="p-2 border border-brand-divider hover:border-brand-dark text-brand-dark transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={(isLoadingLeads || isLoadingPlots) ? 'animate-spin' : ''} />
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

        {/* Tab Switcher Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center border-t border-brand-divider/60">
          <button
            onClick={() => setActiveTab('leads')}
            className={`py-3 px-5 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'leads' 
                ? 'border-brand-dark text-brand-dark bg-brand-canvas/40' 
                : 'border-transparent text-brand-muted hover:text-brand-dark'
            }`}
          >
            <span>Customer Inquiries</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-canvas border border-brand-divider">
              {leads.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('plots');
              fetchPlots();
            }}
            className={`py-3 px-5 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'plots' 
                ? 'border-brand-dark text-brand-dark bg-brand-canvas/40' 
                : 'border-transparent text-brand-muted hover:text-brand-dark'
            }`}
          >
            <Film size={14} className="text-brand-accent" />
            <span>Manage Plots & Video Tours</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-canvas border border-brand-divider">
              {plots.length}
            </span>
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* ========================================================= */}
        {/* TAB 1: CUSTOMER LEADS & INQUIRIES                         */}
        {/* ========================================================= */}
        {activeTab === 'leads' && (
          <>
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-brand-white border border-brand-divider p-5">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-brand-muted block mb-1">
                  Total Inquiries
                </span>
                <div className="text-3xl font-display font-semibold text-brand-dark">
                  {leadStats.total}
                </div>
                <span className="text-[11px] text-brand-light-muted mt-1 block">Saved in Neon database</span>
              </div>

              <div className="bg-brand-white border border-blue-200 p-5 bg-gradient-to-br from-white to-blue-50/30">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-700 block mb-1">
                  New Leads
                </span>
                <div className="text-3xl font-display font-semibold text-blue-900">
                  {leadStats.newCount}
                </div>
                <span className="text-[11px] text-blue-600 mt-1 block">Awaiting initial call</span>
              </div>

              <div className="bg-brand-white border border-amber-200 p-5 bg-gradient-to-br from-white to-amber-50/30">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-800 block mb-1">
                  Site Visits
                </span>
                <div className="text-3xl font-display font-semibold text-amber-900">
                  {leadStats.siteVisits}
                </div>
                <span className="text-[11px] text-amber-700 mt-1 block">Scheduled or completed</span>
              </div>

              <div className="bg-brand-white border border-emerald-200 p-5 bg-gradient-to-br from-white to-emerald-50/30">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-800 block mb-1">
                  Booked / Advances
                </span>
                <div className="text-3xl font-display font-semibold text-emerald-900">
                  {leadStats.booked}
                </div>
                <span className="text-[11px] text-emerald-700 mt-1 block">Converted plot buyers</span>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-brand-white border border-brand-divider p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
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

                <button
                  onClick={handleExportCSV}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-white border border-brand-divider hover:border-brand-dark text-xs font-semibold text-brand-dark transition-colors cursor-pointer"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-divider/60 text-xs">
                <span className="text-brand-muted text-[11px] font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter size={12} /> Status:
                </span>
                {['All', ...LEAD_STATUS_OPTIONS].map(status => (
                  <button
                    key={status}
                    onClick={() => setLeadStatusFilter(status)}
                    className={`px-3 py-1 text-xs border transition-colors cursor-pointer ${
                      leadStatusFilter === status 
                        ? 'bg-brand-dark text-white border-brand-dark font-medium' 
                        : 'bg-brand-canvas border-brand-divider text-brand-muted hover:border-brand-dark hover:text-brand-dark'
                    }`}
                  >
                    {status}
                  </button>
                ))}

                {leadLocationsList.length > 2 && (
                  <div className="w-full sm:w-auto flex items-center gap-2 mt-2 sm:mt-0 sm:ml-auto">
                    <span className="text-brand-muted text-[11px] font-semibold uppercase tracking-wider">
                      Location:
                    </span>
                    <select
                      value={leadLocationFilter}
                      onChange={(e) => setLeadLocationFilter(e.target.value)}
                      className="bg-brand-canvas text-xs border border-brand-divider px-2.5 py-1 outline-none"
                    >
                      {leadLocationsList.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-brand-white border border-brand-divider overflow-hidden">
              <div className="px-5 py-4 border-b border-brand-divider flex items-center justify-between">
                <div className="text-sm font-semibold text-brand-dark">
                  Showing {filteredLeads.length} of {leads.length} Inquiries
                </div>
                {leadsError && (
                  <span className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {leadsError}
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
                    Customer inquiries from website forms will appear here.
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
                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <span className="font-mono font-bold text-brand-dark block">
                                {lead.enquiry_code}
                              </span>
                              <span className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
                                <Clock size={11} /> {formattedDate} {formattedTime}
                              </span>
                            </td>

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

                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <span className="font-medium text-brand-dark flex items-center gap-1">
                                <MapPin size={12} className="text-brand-accent shrink-0" />
                                {lead.preferred_location}
                              </span>
                              <span className="text-[11px] text-brand-muted block mt-0.5">
                                {lead.property_type || 'Gated Community Plots'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <span className="font-semibold text-brand-dark">
                                {lead.budget || 'Flexible'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <select
                                value={lead.status}
                                disabled={updatingLeadId === lead.id}
                                onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                                className={`text-xs px-2.5 py-1 border font-medium outline-none cursor-pointer ${
                                  LEAD_STATUS_COLORS[lead.status] || 'bg-brand-canvas text-brand-dark border-brand-divider'
                                } ${updatingLeadId === lead.id ? 'opacity-50' : ''}`}
                              >
                                {LEAD_STATUS_OPTIONS.map(opt => (
                                  <option key={opt} value={opt} className="bg-white text-black">
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </td>

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
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MANAGE PLOTS & VIDEO TOURS (CMS)                   */}
        {/* ========================================================= */}
        {activeTab === 'plots' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-white border border-brand-divider p-5">
              <div>
                <h2 className="text-lg font-display font-semibold text-brand-dark">
                  Layout & Plot Listings (CMS)
                </h2>
                <p className="text-xs text-brand-muted mt-0.5">
                  Add new gated community layouts, edit prices, and attach YouTube drone tour videos.
                </p>
              </div>

              <button
                onClick={handleOpenNewPlotModal}
                className="bg-brand-dark text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-brand-accent transition-colors cursor-pointer"
              >
                <Plus size={16} />
                <span>Add New Layout</span>
              </button>
            </div>

            {plotsError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{plotsError}</span>
              </div>
            )}

            {/* Plots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plots.map((plot) => (
                <div key={plot.id} className="bg-brand-white border border-brand-divider overflow-hidden flex flex-col group">
                  {/* Photo & Video Badge */}
                  <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden">
                    <img
                      src={plot.imageUrl}
                      alt={plot.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />

                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border ${
                        PLOT_STATUS_COLORS[plot.status] || 'bg-white text-brand-dark'
                      }`}>
                        {plot.status}
                      </span>
                    </div>

                    {plot.videoUrl ? (
                      <button
                        onClick={() => setPreviewVideoUrl(plot.videoUrl)}
                        className="absolute bottom-3 left-3 bg-black/80 hover:bg-red-600 text-white text-[11px] font-medium px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-xs"
                      >
                        <Play size={12} className="fill-white" />
                        <span>Video Tour Attached</span>
                      </button>
                    ) : (
                      <span className="absolute bottom-3 left-3 bg-black/60 text-white/70 text-[10px] px-2 py-0.5 font-mono">
                        No video attached
                      </span>
                    )}

                    <span className="absolute top-3 right-3 bg-brand-dark/90 text-white text-[11px] font-mono px-2 py-0.5">
                      {plot.startingPrice}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-brand-accent font-semibold uppercase tracking-wider mb-1">
                        <MapPin size={12} />
                        <span>{plot.location}</span>
                      </div>
                      <h3 className="text-base font-display font-semibold text-brand-dark line-clamp-1">
                        {plot.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-brand-muted font-medium">
                        <span>Sizes: {plot.plotSizes}</span>
                        <span>•</span>
                        <span>80%–90% Loan</span>
                      </div>
                      {plot.videoTitle && (
                        <div className="mt-2 text-[11px] text-brand-muted bg-brand-canvas p-2 border border-brand-divider/60 line-clamp-1 italic">
                          🎬 {plot.videoTitle}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-4 mt-4 border-t border-brand-divider/70 flex items-center justify-between">
                      <select
                        value={plot.status}
                        onChange={(e) => handlePlotStatusChange(plot.id, e.target.value)}
                        className="text-xs bg-brand-canvas border border-brand-divider px-2 py-1 outline-none font-medium cursor-pointer"
                      >
                        {PLOT_STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPlotClick(plot)}
                          className="p-1.5 border border-brand-divider hover:border-brand-dark text-brand-dark hover:bg-brand-canvas transition-colors cursor-pointer"
                          title="Edit Layout & Video"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePlot(plot.id, plot.name)}
                          className="p-1.5 border border-brand-divider hover:border-red-300 text-brand-muted hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Layout"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT PLOT & VIDEO TOUR                       */}
      {/* ========================================================= */}
      {isPlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-brand-white border border-brand-divider w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto">
            {/* Header */}
            <div className="sticky top-0 bg-brand-white px-6 py-4 border-b border-brand-divider flex items-center justify-between z-10">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-brand-accent block">
                  {plotFormData.id ? 'EDIT LAYOUT' : 'NEW LAYOUT LAUNCH'}
                </span>
                <h3 className="text-xl font-display font-semibold text-brand-dark">
                  {plotFormData.id ? `Edit: ${plotFormData.name}` : 'Add New Gated Community Layout'}
                </h3>
              </div>
              <button
                onClick={() => setIsPlotModalOpen(false)}
                className="w-8 h-8 border border-brand-divider flex items-center justify-center hover:bg-brand-dark hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePlotFormSubmit} className="p-6 space-y-4 text-xs">
              {plotActionMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700">
                  {plotActionMessage}
                </div>
              )}

              {/* Layout Name */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-brand-dark mb-1">
                  Layout Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={plotFormData.name}
                  onChange={(e) => setPlotFormData({ ...plotFormData, name: e.target.value })}
                  placeholder="e.g. Gubera Vasal - Green Enclave"
                  className="w-full bg-brand-canvas px-3 py-2.5 border border-brand-divider text-sm outline-none focus:border-brand-dark"
                />
              </div>

              {/* Location & Micro-market */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-brand-dark mb-1">
                    Micro-Market Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={plotFormData.location}
                    onChange={(e) => setPlotFormData({ ...plotFormData, location: e.target.value })}
                    className="w-full bg-brand-canvas px-3 py-2.5 border border-brand-divider text-sm outline-none"
                  >
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Karamadai">Karamadai</option>
                    <option value="Annur">Annur</option>
                    <option value="Kovilpalayam">Kovilpalayam</option>
                    <option value="Pollachi">Pollachi</option>
                    <option value="Avinashi">Avinashi (Coming Soon)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-brand-dark mb-1">
                    Specific Landmark / Sub-Location
                  </label>
                  <input
                    type="text"
                    value={plotFormData.subLocation}
                    onChange={(e) => setPlotFormData({ ...plotFormData, subLocation: e.target.value })}
                    placeholder="e.g. Pollachi Highway, near Achipatti"
                    className="w-full bg-brand-canvas px-3 py-2.5 border border-brand-divider text-sm outline-none"
                  />
                </div>
              </div>

              {/* Price & Plot Sizes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-brand-dark mb-1">
                    Starting Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={plotFormData.startingPrice}
                    onChange={(e) => setPlotFormData({ ...plotFormData, startingPrice: e.target.value })}
                    placeholder="e.g. ₹24.5 Lakhs"
                    className="w-full bg-brand-canvas px-3 py-2.5 border border-brand-divider text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-brand-dark mb-1">
                    Plot Sizes
                  </label>
                  <input
                    type="text"
                    value={plotFormData.plotSizes}
                    onChange={(e) => setPlotFormData({ ...plotFormData, plotSizes: e.target.value })}
                    placeholder="1.75 to 8.0 Cents"
                    className="w-full bg-brand-canvas px-3 py-2.5 border border-brand-divider text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-brand-dark mb-1">
                    Status
                  </label>
                  <select
                    value={plotFormData.status}
                    onChange={(e) => setPlotFormData({ ...plotFormData, status: e.target.value })}
                    className="w-full bg-brand-canvas px-3 py-2.5 border border-brand-divider text-sm outline-none"
                  >
                    {PLOT_STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Layout Photo / Image URL */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-brand-dark mb-1">
                  Layout Image / Photo URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={plotFormData.imageUrl}
                  onChange={(e) => setPlotFormData({ ...plotFormData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-brand-canvas px-3 py-2.5 border border-brand-divider text-sm outline-none"
                />
                <span className="text-[11px] text-brand-muted mt-1 block">
                  Paste any public image link or Unsplash photo URL.
                </span>
              </div>

              {/* VIDEO TOUR & YOUTUBE LINK SECTION */}
              <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded space-y-3">
                <div className="flex items-center gap-2">
                  <Film size={16} className="text-amber-800" />
                  <span className="font-semibold uppercase tracking-wider text-amber-900">
                    Video Walkthrough & YouTube Link
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-amber-950 mb-1">
                    YouTube URL or MP4 Video Link
                  </label>
                  <input
                    type="text"
                    value={plotFormData.videoUrl}
                    onChange={(e) => setPlotFormData({ ...plotFormData, videoUrl: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
                    className="w-full bg-white px-3 py-2.5 border border-amber-300 text-sm outline-none font-mono"
                  />
                  <span className="text-[11px] text-amber-800 mt-1 block">
                    Paste any YouTube video link (e.g. from your drone shoot or site walkthrough). It will automatically embed in the customer video player modal.
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-amber-950 mb-1">
                    Video Tour Title
                  </label>
                  <input
                    type="text"
                    value={plotFormData.videoTitle}
                    onChange={(e) => setPlotFormData({ ...plotFormData, videoTitle: e.target.value })}
                    placeholder="e.g. Aerial Drone Tour & 33ft Blacktop Road Walkthrough"
                    className="w-full bg-white px-3 py-2 border border-amber-300 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-brand-dark mb-1">
                  Layout Description & Key Highlights
                </label>
                <textarea
                  rows={3}
                  value={plotFormData.description}
                  onChange={(e) => setPlotFormData({ ...plotFormData, description: e.target.value })}
                  placeholder="Prime residential layout with 33ft blacktop tar roads, sweet drinking water connection, fully compounded gated perimeter, street lights, and avenue trees..."
                  className="w-full bg-brand-canvas px-3 py-2.5 border border-brand-divider text-sm outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-brand-divider flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlotModalOpen(false)}
                  className="px-4 py-2.5 border border-brand-divider hover:bg-brand-canvas transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlot}
                  className="bg-brand-dark text-white px-6 py-2.5 font-semibold uppercase tracking-wider hover:bg-brand-accent transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingPlot ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Save Layout to Database
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIDEO PREVIEW MODAL                                       */}
      {/* ========================================================= */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-brand-white border border-brand-divider w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <div className="px-5 py-3 border-b border-brand-divider flex items-center justify-between bg-brand-white">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-dark">
                Video Tour Preview
              </span>
              <button
                onClick={() => setPreviewVideoUrl('')}
                className="p-1 hover:bg-brand-dark hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="relative aspect-[16/9] w-full bg-black">
              {getEmbedUrl(previewVideoUrl) ? (
                <iframe
                  src={getEmbedUrl(previewVideoUrl)}
                  title="Video Preview"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video src={previewVideoUrl} controls autoPlay className="w-full h-full object-cover">
                  Your browser does not support HTML5 video.
                </video>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPortal;
