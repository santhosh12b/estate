import React, { useState, useEffect } from 'react';
import { 
  Lock, Search, RefreshCw, Download, Phone, 
  MessageSquare, Trash2, ArrowLeft, AlertCircle, 
  Clock, MapPin, Filter, LogOut, Plus, Edit3, 
  Play, Film, X, Check, Eye, EyeOff,
  Copy, Sparkles, CheckCircle2,
  ChevronRight, Building2, Users, Compass,
  Lightbulb, Info, KeyRound
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

const LEAD_STATUS_DESCRIPTIONS = {
  'New Lead': 'Fresh website submission, awaiting first phone call',
  'Contacted': 'Spoke with client, sent layout brochure and pricing',
  'Site Visit Scheduled': 'Date fixed for layout inspection with free cab',
  'Site Visit Completed': 'Client has physically walked and inspected the plot',
  'Token Advance Received': 'Token booking amount received, plot on hold',
  'Booked': 'Sale agreement executed or registered',
  'Closed / Dropped': 'Not interested or budget mismatch'
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

const SAMPLE_PHOTO_PRESETS = [
  {
    label: 'Grand Gated Entrance',
    url: '/images/kubera-hero-layout.jpg'
  },
  {
    label: 'Foothill Green Layout',
    url: '/images/kubera-annur-layout.jpg'
  },
  {
    label: 'Sathy Road Avenue',
    url: '/images/kubera-kovilpalayam-layout.jpg'
  },
  {
    label: 'City Residential Plots',
    url: '/images/property-estate-plot.jpg'
  }
];

const INITIAL_PLOT_FORM = {
  id: '',
  name: '',
  location: 'Coimbatore',
  subLocation: '',
  startingPrice: '₹24.5 Lakhs',
  plotSizes: '1.75 to 8.0 Cents',
  sqftRange: '762 – 3,485 Sq.Ft',
  status: 'Available',
  imageUrl: '/images/kubera-hero-layout.jpg',
  videoUrl: '',
  videoTitle: '',
  description: '',
  loanEligibility: '80% to 90% Bank Loan Approved by All Major Banks'
};

// Helper to extract YouTube or Vimeo embed URL
function getEmbedUrl(rawUrl) {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  if (url.includes('/embed/')) {
    return url;
  }
  return null;
}

// Helper to generate export filename
function getCsvDownloadFileName() {
  const today = new Date().toISOString().slice(0, 10);
  return `gubera-vasal-leads-${today}.csv`;
}

const AdminPortal = ({ onBackToSite, onRefreshPlots }) => {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('gv_admin_key') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Tabs: 'leads' | 'plots'
  const [activeTab, setActiveTab] = useState('leads');

  // Interactive Quick Guide banner toggle
  const [showQuickGuide, setShowQuickGuide] = useState(false);

  // Leads State
  const [leads, setLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [leadsError, setLeadsError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('All');
  const [leadLocationFilter, setLeadLocationFilter] = useState('All');
  const [updatingLeadId, setUpdatingLeadId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

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
  const [previewVideoTitle, setPreviewVideoTitle] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  };

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
        throw new Error(data.error || 'Invalid Admin Secret Key. Please check and try again.');
      }

      setLeads(data.data || []);
      setIsAuthenticated(true);
      localStorage.setItem('gv_admin_key', adminKey.trim());
      fetchPlots();
      triggerToast('Signed in successfully to Gubera Vasal Admin Hub');
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
    triggerToast('Logged out of Admin Console');
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
      triggerToast(`Lead status updated to "${newStatus}"`);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const handleDeleteLead = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete lead ${code}? This action cannot be undone.`)) return;

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
      triggerToast(`Lead ${code} deleted.`);
    } catch (err) {
      alert('Error deleting lead: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    if (!leads.length) return;
    const headers = ['Ref Code', 'Date', 'Name', 'Phone', 'Email', 'Location', 'Property Type', 'Budget', 'Status', 'Message'];
    const rows = filteredLeads.map(l => [
      `"${l.enquiry_code || ''}"`,
      `"${new Date(l.created_at).toLocaleString('en-IN')}"`,
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
    link.setAttribute('download', getCsvDownloadFileName());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Leads CSV exported successfully');
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
    triggerToast(`Copied to clipboard: ${text}`);
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
      imageUrl: plot.imageUrl || '/images/kubera-hero-layout.jpg',
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
      triggerToast(plotFormData.id ? 'Layout updated successfully on website!' : 'New layout added & live on website!');
    } catch (err) {
      setPlotActionMessage('Error: ' + err.message);
    } finally {
      setIsSavingPlot(false);
    }
  };

  const handleDeletePlot = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove plot layout "${name}" from the live website?`)) return;

    try {
      await deleteProject(id, adminKey);
      setPlots(prev => prev.filter(p => p.id !== id));
      if (onRefreshPlots) onRefreshPlots();
      triggerToast(`Removed "${name}" from website catalog.`);
    } catch (err) {
      alert('Error deleting plot: ' + err.message);
    }
  };

  const handlePlotStatusChange = async (id, newStatus) => {
    try {
      await saveProject({ id, status: newStatus }, adminKey);
      setPlots(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      if (onRefreshPlots) onRefreshPlots();
      triggerToast(`Layout status updated to "${newStatus}"`);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // -------------------------------------------------------------
  // Computations & Filter
  // -------------------------------------------------------------
  const filteredLeads = leads.filter(lead => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (lead.full_name && lead.full_name.toLowerCase().includes(q)) ||
      (lead.phone_number && lead.phone_number.includes(q)) ||
      (lead.enquiry_code && lead.enquiry_code.toLowerCase().includes(q)) ||
      (lead.preferred_location && lead.preferred_location.toLowerCase().includes(q)) ||
      (lead.message && lead.message.toLowerCase().includes(q));

    const matchesStatus = leadStatusFilter === 'All' || lead.status === leadStatusFilter;
    const matchesLocation = leadLocationFilter === 'All' || lead.preferred_location === leadLocationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const leadStats = {
    total: leads.length,
    newCount: leads.filter(l => l.status === 'New Lead').length,
    siteVisits: leads.filter(l => l.status?.includes('Site Visit')).length,
    booked: leads.filter(l => l.status === 'Booked' || l.status === 'Token Advance Received').length
  };

  const leadLocationsList = ['All', ...Array.from(new Set(leads.map(l => l.preferred_location).filter(Boolean)))];

  // -------------------------------------------------------------
  // Render: Toast Alert
  // -------------------------------------------------------------
  const renderToast = () => {
    if (!toastMessage) return null;
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-brand-dark text-white px-5 py-3 rounded-none shadow-2xl border-l-4 border-brand-accent flex items-center gap-3 text-xs font-medium animate-bounce-in">
        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    );
  };

  // -------------------------------------------------------------
  // Render: Login Screen
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-canvas flex flex-col justify-center items-center px-4 py-12 font-sans selection:bg-brand-dark selection:text-white">
        {renderToast()}
        
        <div className="w-full max-w-md bg-brand-white border border-brand-divider p-8 sm:p-10 shadow-2xl relative">
          {/* Brand Monogram */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-brand-dark text-white mx-auto flex items-center justify-center mb-4 shadow-md">
              <Building2 size={26} className="text-brand-accent" />
            </div>
            <span className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-brand-accent block mb-1">
              GUBERA VASAL REAL ESTATE
            </span>
            <h1 className="text-2xl font-display font-bold text-brand-dark tracking-tight">
              Admin & CMS Portal
            </h1>
            <p className="text-xs text-brand-muted mt-2 leading-relaxed">
              Sign in to manage incoming customer leads and update plot layouts with YouTube video tours.
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-brand-dark">
                  Admin Master Key
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-brand-muted hover:text-brand-dark flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter administrator password..."
                  className="w-full bg-brand-canvas text-brand-dark text-sm px-4 py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors font-mono"
                />
              </div>
            </div>

            {/* Quick Helper Button to Auto-fill Default Key */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setAdminKey('gubera_vasal_secret_admin_2026')}
                className="text-[11px] text-brand-accent hover:text-brand-dark font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Click to fill default master key"
              >
                <KeyRound size={12} />
                <span>Auto-fill Demo Master Key</span>
              </button>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-mono">
                Neon DB Active
              </span>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-brand-dark text-white font-sans text-xs tracking-widest uppercase font-semibold py-3.5 hover:bg-brand-btn transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isVerifying ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Verifying Master Key...
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Unlock Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-brand-divider/70 flex justify-between items-center text-xs text-brand-muted">
            <button
              onClick={onBackToSite}
              className="hover:text-brand-dark transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <ArrowLeft size={14} />
              <span>Back to Website</span>
            </button>
            <span className="font-mono text-[10px] text-brand-light-muted">v3.5 • DTCP & RERA</span>
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
      {renderToast()}

      {/* Top Header */}
      <header className="bg-brand-white border-b border-brand-divider sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Branding & Back Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onBackToSite}
              className="text-xs text-brand-muted hover:text-brand-dark flex items-center gap-1.5 py-1.5 px-3 border border-brand-divider hover:border-brand-dark transition-colors cursor-pointer bg-brand-canvas/50"
              title="Return to the public homepage"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline font-medium">Public Website</span>
            </button>
            
            <div className="flex items-center gap-2.5">
              <span className="text-base sm:text-lg font-display font-bold tracking-tight text-brand-dark">
                GUBERA VASAL
              </span>
              <span className="hidden xs:inline-block px-2 py-0.5 bg-brand-dark text-white text-[10px] font-mono tracking-widest uppercase font-semibold">
                ADMIN HUB
              </span>
            </div>
          </div>

          {/* Right: Quick Guide, DB Status, Refresh, Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Guide Toggle */}
            <button
              onClick={() => setShowQuickGuide(!showQuickGuide)}
              className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                showQuickGuide 
                  ? 'bg-brand-dark text-white border-brand-dark' 
                  : 'bg-brand-canvas hover:bg-brand-white border-brand-divider text-brand-dark'
              }`}
              title="Toggle simple instructions guide"
            >
              <Lightbulb size={14} className={showQuickGuide ? 'text-amber-300' : 'text-brand-accent'} />
              <span className="hidden md:inline">How It Works</span>
            </button>

            {/* Neon DB Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Neon PostgreSQL Live</span>
            </div>

            {/* Refresh */}
            <button
              onClick={() => {
                if (activeTab === 'leads') fetchLeads();
                else fetchPlots();
                triggerToast('Data refreshed from Neon DB');
              }}
              disabled={isLoadingLeads || isLoadingPlots}
              className="p-2 border border-brand-divider hover:border-brand-dark bg-brand-canvas hover:bg-white text-brand-dark transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh database records"
            >
              <RefreshCw size={15} className={(isLoadingLeads || isLoadingPlots) ? 'animate-spin' : ''} />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 border border-brand-divider hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-brand-muted transition-colors cursor-pointer bg-brand-canvas"
              title="Log out of Admin Console"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Tab Switcher Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center border-t border-brand-divider/70">
          <button
            onClick={() => setActiveTab('leads')}
            className={`py-3.5 px-6 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'leads' 
                ? 'border-brand-dark text-brand-dark bg-brand-canvas/60 font-bold' 
                : 'border-transparent text-brand-muted hover:text-brand-dark hover:bg-brand-canvas/20'
            }`}
          >
            <Users size={15} className={activeTab === 'leads' ? 'text-brand-dark' : 'text-brand-muted'} />
            <span>1. Customer Leads & Inquiries</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              leadStats.newCount > 0 ? 'bg-blue-600 text-white' : 'bg-brand-canvas border border-brand-divider text-brand-dark'
            }`}>
              {leads.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('plots');
              fetchPlots();
            }}
            className={`py-3.5 px-6 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'plots' 
                ? 'border-brand-dark text-brand-dark bg-brand-canvas/60 font-bold' 
                : 'border-transparent text-brand-muted hover:text-brand-dark hover:bg-brand-canvas/20'
            }`}
          >
            <Film size={15} className={activeTab === 'plots' ? 'text-brand-accent' : 'text-brand-muted'} />
            <span>2. Manage Plots & Video Tours (CMS)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-brand-canvas border border-brand-divider text-brand-dark">
              {plots.length}
            </span>
          </button>
        </div>
      </header>

      {/* QUICK GUIDE COLLAPSIBLE BANNER */}
      {showQuickGuide && (
        <div className="bg-gradient-to-r from-stone-900 to-zinc-900 text-white border-b border-stone-800 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <h3 className="text-sm font-display font-bold uppercase tracking-wider text-amber-200">
                  Admin Quick Guide — 3 Simple Steps
                </h3>
              </div>
              <button 
                onClick={() => setShowQuickGuide(false)}
                className="text-xs text-white/60 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Close Guide</span>
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Card 1 */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center font-mono text-[11px] font-bold">1</span>
                  <span>Respond to Leads in 1-Click</span>
                </div>
                <p className="text-white/70 leading-relaxed text-[11px]">
                  Click the green <strong>"WhatsApp"</strong> button to immediately open a pre-written WhatsApp chat with the client's name and enquiry code, or click <strong>"Call"</strong> to dial on your mobile.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center font-mono text-[11px] font-bold">2</span>
                  <span>Paste Any YouTube Video</span>
                </div>
                <p className="text-white/70 leading-relaxed text-[11px]">
                  Under <em>"Manage Plots"</em>, click <strong>"+ Add New Layout"</strong> or <strong>Edit</strong>. Paste any YouTube video link from your drone or phone. You can preview it right inside the form before saving!
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center font-mono text-[11px] font-bold">3</span>
                  <span>Instant Website Synchronization</span>
                </div>
                <p className="text-white/70 leading-relaxed text-[11px]">
                  Whenever you update prices, change status to <em>"Fast Selling"</em> or <em>"Ready for Construction"</em>, or add a new layout, the public website updates instantly without needing code changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================= */}
        {/* TAB 1: CUSTOMER LEADS & INQUIRIES                         */}
        {/* ========================================================= */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Total */}
              <div className="bg-brand-white border border-brand-divider p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-brand-muted block">
                    Total Inquiries
                  </span>
                  <Users size={16} className="text-brand-muted" />
                </div>
                <div className="text-3xl font-display font-bold text-brand-dark mt-2">
                  {leadStats.total}
                </div>
                <span className="text-[11px] text-brand-light-muted mt-1 block">Live in Neon database</span>
              </div>

              {/* New Leads */}
              <div className="bg-brand-white border border-blue-200 p-5 bg-gradient-to-br from-white to-blue-50/40 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-blue-700 block">
                    New Leads (Action Needed)
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
                </div>
                <div className="text-3xl font-display font-bold text-blue-900 mt-2">
                  {leadStats.newCount}
                </div>
                <span className="text-[11px] text-blue-600 mt-1 block font-medium">Awaiting first phone call</span>
              </div>

              {/* Site Visits */}
              <div className="bg-brand-white border border-amber-200 p-5 bg-gradient-to-br from-white to-amber-50/40 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-amber-800 block">
                    Site Visits
                  </span>
                  <MapPin size={16} className="text-amber-700" />
                </div>
                <div className="text-3xl font-display font-bold text-amber-900 mt-2">
                  {leadStats.siteVisits}
                </div>
                <span className="text-[11px] text-amber-700 mt-1 block font-medium">Scheduled / Completed</span>
              </div>

              {/* Booked / Advances */}
              <div className="bg-brand-white border border-emerald-200 p-5 bg-gradient-to-br from-white to-emerald-50/40 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-800 block">
                    Booked / Advances
                  </span>
                  <CheckCircle2 size={16} className="text-emerald-700" />
                </div>
                <div className="text-3xl font-display font-bold text-emerald-900 mt-2">
                  {leadStats.booked}
                </div>
                <span className="text-[11px] text-emerald-700 mt-1 block font-medium">Plot reserved / Token paid</span>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-brand-white border border-brand-divider p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, phone, code (e.g. GV-), location..."
                    className="w-full bg-brand-canvas text-sm pl-9 pr-8 py-2.5 border border-brand-divider outline-none focus:border-brand-dark transition-colors"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-muted hover:text-brand-dark p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Export Button */}
                <button
                  onClick={handleExportCSV}
                  disabled={leads.length === 0}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-white border border-brand-divider hover:border-brand-dark text-xs font-bold uppercase tracking-wider text-brand-dark transition-colors cursor-pointer disabled:opacity-40"
                  title="Download all leads as an Excel-compatible CSV file"
                >
                  <Download size={14} />
                  <span>Export to Excel / CSV</span>
                </button>
              </div>

              {/* Status Filter Chips with Counts */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-brand-divider/60 text-xs">
                <span className="text-brand-muted text-[11px] font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter size={12} /> Status:
                </span>
                
                <button
                  onClick={() => setLeadStatusFilter('All')}
                  className={`px-3 py-1.5 text-xs border font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    leadStatusFilter === 'All' 
                      ? 'bg-brand-dark text-white border-brand-dark font-bold' 
                      : 'bg-brand-canvas border-brand-divider text-brand-muted hover:border-brand-dark hover:text-brand-dark'
                  }`}
                >
                  <span>All Inquiries</span>
                  <span className="font-mono text-[10px] opacity-80">({leads.length})</span>
                </button>

                {LEAD_STATUS_OPTIONS.map(status => {
                  const count = leads.filter(l => l.status === status).length;
                  return (
                    <button
                      key={status}
                      onClick={() => setLeadStatusFilter(status)}
                      className={`px-3 py-1.5 text-xs border font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        leadStatusFilter === status 
                          ? 'bg-brand-dark text-white border-brand-dark font-bold shadow-xs' 
                          : 'bg-brand-canvas border-brand-divider text-brand-muted hover:border-brand-dark hover:text-brand-dark'
                      }`}
                    >
                      <span>{status}</span>
                      {count > 0 && (
                        <span className="font-mono text-[10px] px-1 rounded-full bg-black/10">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Location Filter Dropdown */}
                {leadLocationsList.length > 2 && (
                  <div className="w-full sm:w-auto flex items-center gap-2 mt-2 sm:mt-0 sm:ml-auto">
                    <span className="text-brand-muted text-[11px] font-bold uppercase tracking-wider">
                      Location:
                    </span>
                    <select
                      value={leadLocationFilter}
                      onChange={(e) => setLeadLocationFilter(e.target.value)}
                      className="bg-brand-canvas text-xs border border-brand-divider px-3 py-1.5 outline-none font-medium"
                    >
                      {leadLocationsList.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Pipeline Guide Strip */}
            <div className="bg-amber-50/70 border border-amber-200/80 px-4 py-2.5 text-xs text-amber-900 flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <Info size={13} className="text-amber-800" /> Pipeline Stages:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-amber-850">
                <span className="font-semibold">New Lead</span>
                <ChevronRight size={12} className="text-amber-500" />
                <span className="font-semibold">Contacted</span>
                <ChevronRight size={12} className="text-amber-500" />
                <span className="font-semibold">Site Visit Scheduled</span>
                <ChevronRight size={12} className="text-amber-500" />
                <span className="font-semibold">Site Visit Completed</span>
                <ChevronRight size={12} className="text-amber-500" />
                <span className="font-semibold text-emerald-800">Token Advance / Booked</span>
              </div>
            </div>

            {/* Leads Table Container */}
            <div className="bg-brand-white border border-brand-divider overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-brand-divider flex items-center justify-between bg-brand-canvas/30">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-dark flex items-center gap-2">
                  <span>Customer Lead Records</span>
                  <span className="text-brand-muted font-normal">
                    (Showing {filteredLeads.length} of {leads.length})
                  </span>
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
                    <Search size={22} />
                  </div>
                  <p className="text-sm font-semibold text-brand-dark">No inquiries found matching your filter</p>
                  <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
                    Try clearing your search query or switching to "All Inquiries" to see existing records.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-canvas/80 border-b border-brand-divider text-[11px] uppercase tracking-wider text-brand-muted">
                      <tr>
                        <th className="py-3 px-4 font-bold">Client Ref & Date</th>
                        <th className="py-3 px-4 font-bold">Customer Name</th>
                        <th className="py-3 px-4 font-bold">Quick Contact Action</th>
                        <th className="py-3 px-4 font-bold">Location & Requirement</th>
                        <th className="py-3 px-4 font-bold">Budget</th>
                        <th className="py-3 px-4 font-bold">Stage / Status</th>
                        <th className="py-3 px-4 font-bold text-right">Delete</th>
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
                          <tr key={lead.id} className="hover:bg-brand-canvas/40 transition-colors">
                            {/* Ref Code & Date */}
                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-brand-dark">
                                  {lead.enquiry_code}
                                </span>
                                <button
                                  onClick={() => handleCopyText(lead.enquiry_code, lead.id)}
                                  className="text-brand-muted hover:text-brand-dark p-0.5"
                                  title="Copy reference code"
                                >
                                  {copiedCode === lead.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                </button>
                              </div>
                              <span className="text-[11px] text-brand-muted flex items-center gap-1 mt-1 font-mono">
                                <Clock size={11} /> {formattedDate} • {formattedTime}
                              </span>
                            </td>

                            {/* Client Name & Message */}
                            <td className="py-3.5 px-4 align-top">
                              <span className="font-bold text-brand-dark block text-sm">
                                {lead.full_name}
                              </span>
                              {lead.email && (
                                <span className="text-[11px] text-brand-muted block truncate max-w-[190px]">
                                  {lead.email}
                                </span>
                              )}
                              {lead.message && (
                                <div className="text-[11px] text-stone-700 mt-1.5 bg-amber-50/60 p-2 border-l-2 border-amber-400 max-w-xs leading-relaxed italic">
                                  "{lead.message}"
                                </div>
                              )}
                            </td>

                            {/* Contact Action Buttons */}
                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <div className="font-mono text-xs font-bold text-brand-dark mb-1.5">
                                {lead.phone_number}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${cleanPhone}`}
                                  className="px-2.5 py-1.5 bg-brand-canvas hover:bg-brand-dark hover:text-white border border-brand-divider text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                                  title="Direct Dial Phone Number"
                                >
                                  <Phone size={11} />
                                  <span>Call</span>
                                </a>
                                
                                <a
                                  href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(lead.full_name || '')},%20greetings%20from%20Gubera%20Vasal%20Real%20Estate.%20We%20received%20your%20inquiry%20(Ref:%20${encodeURIComponent(lead.enquiry_code || '')})%20for%20plots%20in%20${encodeURIComponent(lead.preferred_location || 'Coimbatore')}.%20When%20is%20a%20convenient%20time%20to%20discuss?`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                                  title="Open WhatsApp Chat with Pre-filled greeting"
                                >
                                  <MessageSquare size={11} />
                                  <span>WhatsApp</span>
                                </a>
                              </div>
                            </td>

                            {/* Location & Property Type */}
                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <span className="font-bold text-brand-dark flex items-center gap-1">
                                <MapPin size={12} className="text-brand-accent shrink-0" />
                                {lead.preferred_location}
                              </span>
                              <span className="text-[11px] text-brand-muted block mt-0.5">
                                {lead.property_type || 'Gated Community Plots'}
                              </span>
                            </td>

                            {/* Budget */}
                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <span className="font-bold text-brand-dark bg-brand-canvas px-2 py-0.5 border border-brand-divider">
                                {lead.budget || 'Flexible'}
                              </span>
                            </td>

                            {/* Status Changer Dropdown */}
                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <div className="space-y-1">
                                <select
                                  value={lead.status}
                                  disabled={updatingLeadId === lead.id}
                                  onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                                  className={`text-xs px-2.5 py-1.5 border font-bold outline-none cursor-pointer w-full transition-all ${
                                    LEAD_STATUS_COLORS[lead.status] || 'bg-brand-canvas text-brand-dark border-brand-divider'
                                  } ${updatingLeadId === lead.id ? 'opacity-40 animate-pulse' : ''}`}
                                  title={LEAD_STATUS_DESCRIPTIONS[lead.status] || 'Select status'}
                                >
                                  {LEAD_STATUS_OPTIONS.map(opt => (
                                    <option key={opt} value={opt} className="bg-white text-brand-dark">
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                                <span className="text-[10px] text-brand-muted block max-w-[150px] truncate">
                                  {LEAD_STATUS_DESCRIPTIONS[lead.status]}
                                </span>
                              </div>
                            </td>

                            {/* Delete Action */}
                            <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteLead(lead.id, lead.enquiry_code)}
                                className="p-1.5 text-brand-muted hover:text-red-700 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200 cursor-pointer"
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
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MANAGE PLOTS & VIDEO TOURS (CMS)                   */}
        {/* ========================================================= */}
        {activeTab === 'plots' && (
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-white border border-brand-divider p-6 shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent block mb-1">
                  CONTENT MANAGEMENT SYSTEM (CMS)
                </span>
                <h2 className="text-xl font-display font-bold text-brand-dark">
                  Gated Community Layouts & Video Tours
                </h2>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed max-w-xl">
                  Add new project layouts, edit starting prices and plot sizes, or attach YouTube drone walkthrough videos. All changes update instantly on the public website.
                </p>
              </div>

              <button
                onClick={handleOpenNewPlotModal}
                className="bg-brand-dark hover:bg-brand-btn text-white px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md shrink-0"
              >
                <Plus size={16} />
                <span>+ Add New Layout</span>
              </button>
            </div>

            {plotsError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{plotsError}</span>
              </div>
            )}

            {/* Plots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plots.map((plot) => (
                <div key={plot.id} className="bg-brand-white border border-brand-divider overflow-hidden flex flex-col group shadow-xs hover:shadow-md transition-shadow">
                  
                  {/* Photo & Video Tour Overlay */}
                  <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden">
                    <img
                      src={plot.imageUrl}
                      alt={plot.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/images/kubera-hero-layout.jpg';
                      }}
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider border shadow-xs ${
                        PLOT_STATUS_COLORS[plot.status] || 'bg-white text-brand-dark'
                      }`}>
                        {plot.status}
                      </span>
                    </div>

                    {/* Starting Price Pill */}
                    <span className="absolute top-3 right-3 bg-brand-dark text-white text-xs font-mono font-bold px-2.5 py-1 shadow-xs">
                      {plot.startingPrice}
                    </span>

                    {/* Video Attachment Pill */}
                    {plot.videoUrl ? (
                      <button
                        onClick={() => {
                          setPreviewVideoUrl(plot.videoUrl);
                          setPreviewVideoTitle(plot.videoTitle || plot.name);
                        }}
                        className="absolute bottom-3 left-3 bg-black/85 hover:bg-red-600 text-white text-[11px] font-bold px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-xs shadow-md"
                        title="Click to preview YouTube video player"
                      >
                        <Play size={12} className="fill-white" />
                        <span>▶ Watch Attached Video</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditPlotClick(plot)}
                        className="absolute bottom-3 left-3 bg-black/60 hover:bg-black/85 text-white/90 text-[10px] px-2.5 py-1 font-sans flex items-center gap-1 transition-colors cursor-pointer"
                        title="Click to attach a YouTube video tour"
                      >
                        <Plus size={10} />
                        <span>Attach YouTube Video</span>
                      </button>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-brand-accent font-bold uppercase tracking-wider mb-1">
                        <MapPin size={12} />
                        <span>{plot.location}</span>
                        {plot.subLocation && (
                          <span className="text-brand-muted font-normal">• {plot.subLocation}</span>
                        )}
                      </div>

                      <h3 className="text-base font-display font-bold text-brand-dark line-clamp-1">
                        {plot.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-2 text-xs text-brand-muted font-medium">
                        <span className="bg-brand-canvas px-2 py-0.5 border border-brand-divider text-[11px]">
                          Sizes: {plot.plotSizes}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold text-[11px]">
                          80%–90% Bank Loan
                        </span>
                      </div>

                      {plot.videoTitle && (
                        <div className="mt-3 text-[11px] text-stone-700 bg-amber-50/70 p-2 border border-amber-200/60 line-clamp-1 flex items-center gap-1.5">
                          <Film size={12} className="text-amber-800 shrink-0" />
                          <span className="font-medium truncate">{plot.videoTitle}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="pt-3 border-t border-brand-divider/70 flex items-center justify-between">
                      {/* Inline Status Dropdown */}
                      <select
                        value={plot.status}
                        onChange={(e) => handlePlotStatusChange(plot.id, e.target.value)}
                        className="text-xs bg-brand-canvas border border-brand-divider px-2.5 py-1.5 outline-none font-bold cursor-pointer"
                        title="Update plot availability status on website"
                      >
                        {PLOT_STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditPlotClick(plot)}
                          className="px-3 py-1.5 border border-brand-divider hover:border-brand-dark bg-brand-canvas hover:bg-brand-dark hover:text-white text-xs font-semibold text-brand-dark transition-colors cursor-pointer flex items-center gap-1"
                          title="Edit layout details and video"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
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
      {/* MODAL: ADD / EDIT PLOT & YOUTUBE VIDEO TOUR               */}
      {/* ========================================================= */}
      {isPlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-brand-white border border-brand-divider w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-brand-white px-6 py-4 border-b border-brand-divider flex items-center justify-between z-10 shadow-2xs">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-brand-accent block">
                  {plotFormData.id ? 'EDIT EXISTING LAYOUT' : 'NEW LAYOUT LAUNCH'}
                </span>
                <h3 className="text-xl font-display font-bold text-brand-dark">
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

            {/* Modal Form */}
            <form onSubmit={handlePlotFormSubmit} className="p-6 space-y-5 text-xs">
              {plotActionMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-medium">
                  {plotActionMessage}
                </div>
              )}

              {/* SECTION 1: BASIC INFORMATION */}
              <div className="space-y-3 pb-4 border-b border-brand-divider">
                <div className="flex items-center gap-2 text-brand-dark font-bold text-xs uppercase tracking-wider">
                  <Building2 size={14} className="text-brand-accent" />
                  <span>1. Layout Name & Location</span>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-brand-dark mb-1">
                    Layout Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={plotFormData.name}
                    onChange={(e) => setPlotFormData({ ...plotFormData, name: e.target.value })}
                    placeholder="e.g. Gubera Vasal — Greenfield Enclave"
                    className="w-full bg-brand-canvas px-3.5 py-2.5 border border-brand-divider text-sm outline-none focus:border-brand-dark font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Micro-Market Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={plotFormData.location}
                      onChange={(e) => setPlotFormData({ ...plotFormData, location: e.target.value })}
                      className="w-full bg-brand-canvas px-3.5 py-2.5 border border-brand-divider text-sm outline-none font-medium cursor-pointer"
                    >
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Karamadai">Karamadai</option>
                      <option value="Annur">Annur</option>
                      <option value="Kovilpalayam">Kovilpalayam</option>
                      <option value="Pollachi">Pollachi</option>
                      <option value="Avinashi">Avinashi (Future Project)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Specific Landmark / Sub-Location
                    </label>
                    <input
                      type="text"
                      value={plotFormData.subLocation}
                      onChange={(e) => setPlotFormData({ ...plotFormData, subLocation: e.target.value })}
                      placeholder="e.g. Near Karamadai Foothills / Mettupalayam Highway"
                      className="w-full bg-brand-canvas px-3.5 py-2.5 border border-brand-divider text-sm outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRICING & SPECIFICATIONS */}
              <div className="space-y-3 pb-4 border-b border-brand-divider">
                <div className="flex items-center gap-2 text-brand-dark font-bold text-xs uppercase tracking-wider">
                  <Compass size={14} className="text-brand-accent" />
                  <span>2. Pricing & Plot Sizes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Starting Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={plotFormData.startingPrice}
                      onChange={(e) => setPlotFormData({ ...plotFormData, startingPrice: e.target.value })}
                      placeholder="e.g. ₹18.5 Lakhs"
                      className="w-full bg-brand-canvas px-3.5 py-2.5 border border-brand-divider text-sm outline-none font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Plot Sizes (Cents)
                    </label>
                    <input
                      type="text"
                      value={plotFormData.plotSizes}
                      onChange={(e) => setPlotFormData({ ...plotFormData, plotSizes: e.target.value })}
                      placeholder="1.75 to 8.0 Cents"
                      className="w-full bg-brand-canvas px-3.5 py-2.5 border border-brand-divider text-sm outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Availability Status
                    </label>
                    <select
                      value={plotFormData.status}
                      onChange={(e) => setPlotFormData({ ...plotFormData, status: e.target.value })}
                      className="w-full bg-brand-canvas px-3.5 py-2.5 border border-brand-divider text-sm outline-none font-bold cursor-pointer"
                    >
                      {PLOT_STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bank Loan Note */}
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                  <span>Pre-approved: <strong>80% to 90% Bank Loan Approved by All Major Banks</strong></span>
                </div>
              </div>

              {/* SECTION 3: YOUTUBE VIDEO TOUR (INTERACTIVE PREVIEW!) */}
              <div className="p-4 bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-300 rounded-none space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film size={16} className="text-amber-800" />
                    <span className="font-bold uppercase tracking-wider text-amber-950 text-xs">
                      3. YouTube Drone Walkthrough Video
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-800 bg-amber-200/60 px-2 py-0.5 font-bold uppercase">
                    Auto-Embeds
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-amber-950 mb-1">
                    YouTube URL (Watch link or Share link)
                  </label>
                  <input
                    type="text"
                    value={plotFormData.videoUrl}
                    onChange={(e) => setPlotFormData({ ...plotFormData, videoUrl: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
                    className="w-full bg-white px-3.5 py-2.5 border border-amber-300 text-sm outline-none font-mono text-stone-900"
                  />
                  <span className="text-[11px] text-amber-900 mt-1 block">
                    Copy and paste any YouTube link from your videographer or smartphone.
                  </span>
                </div>

                {/* Live YouTube Preview inside the Modal! */}
                {getEmbedUrl(plotFormData.videoUrl) ? (
                  <div className="mt-3 p-3 bg-white border border-amber-300 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-[11px]">
                      <CheckCircle2 size={14} />
                      <span>✓ Valid YouTube Video Detected! Live Player Preview:</span>
                    </div>
                    <div className="relative aspect-[16/9] w-full bg-black overflow-hidden shadow-inner">
                      <iframe
                        src={getEmbedUrl(plotFormData.videoUrl)}
                        title="Live Video Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ) : plotFormData.videoUrl ? (
                  <div className="text-[11px] text-amber-800 bg-white p-2 border border-amber-200">
                    ℹ️ Direct video link entered. It will play via HTML5 video player.
                  </div>
                ) : null}

                <div>
                  <label className="block font-bold text-amber-950 mb-1">
                    Video Walkthrough Title
                  </label>
                  <input
                    type="text"
                    value={plotFormData.videoTitle}
                    onChange={(e) => setPlotFormData({ ...plotFormData, videoTitle: e.target.value })}
                    placeholder="e.g. Aerial Drone Tour & 33ft Tar Road Walkthrough"
                    className="w-full bg-white px-3.5 py-2 border border-amber-300 text-sm outline-none text-stone-900"
                  />
                </div>
              </div>

              {/* SECTION 4: COVER IMAGE */}
              <div className="space-y-3 pb-4 border-b border-brand-divider">
                <div className="flex items-center justify-between">
                  <label className="block font-bold uppercase tracking-wider text-brand-dark">
                    4. Layout Cover Image URL <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-brand-muted">Or pick a sample preset below:</span>
                </div>

                <input
                  type="text"
                  required
                  value={plotFormData.imageUrl}
                  onChange={(e) => setPlotFormData({ ...plotFormData, imageUrl: e.target.value })}
                  placeholder="https://... or /images/kubera-hero-layout.jpg"
                  className="w-full bg-brand-canvas px-3.5 py-2.5 border border-brand-divider text-sm outline-none font-mono"
                />

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-brand-muted uppercase mr-1">Presets:</span>
                  {SAMPLE_PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setPlotFormData({ ...plotFormData, imageUrl: preset.url })}
                      className="px-2 py-1 text-[10px] bg-brand-canvas hover:bg-brand-dark hover:text-white border border-brand-divider transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 5: DESCRIPTION */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-brand-dark mb-1">
                  5. Layout Overview & Key Features
                </label>
                <textarea
                  rows={3}
                  value={plotFormData.description}
                  onChange={(e) => setPlotFormData({ ...plotFormData, description: e.target.value })}
                  placeholder="Describe the DTCP layout, road width (33ft tar road), water availability, sweet ground water, and proximity to schools/highways..."
                  className="w-full bg-brand-canvas px-3.5 py-2.5 border border-brand-divider text-sm outline-none focus:border-brand-dark leading-relaxed"
                ></textarea>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-brand-divider flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlotModalOpen(false)}
                  className="px-5 py-3 border border-brand-divider hover:bg-brand-canvas text-xs font-bold uppercase tracking-wider text-brand-dark transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingPlot}
                  className="bg-brand-dark hover:bg-brand-btn text-white px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSavingPlot ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{plotFormData.id ? 'Save Changes' : 'Publish Layout Live'}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-brand-white border border-brand-divider w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <div className="px-5 py-3.5 border-b border-brand-divider flex items-center justify-between bg-brand-white">
              <div className="flex items-center gap-2">
                <Film size={16} className="text-brand-accent" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                  Video Tour Preview: {previewVideoTitle || 'Layout Drone Walkthrough'}
                </span>
              </div>
              <button
                onClick={() => setPreviewVideoUrl('')}
                className="w-8 h-8 flex items-center justify-center hover:bg-brand-dark hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
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
