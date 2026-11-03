import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, Search, RefreshCw, Download, Phone, 
  MessageSquare, Trash2, ArrowLeft, AlertCircle, 
  Clock, MapPin, Filter, LogOut, Plus, Edit3, 
  Play, Film, X, Check, Eye, EyeOff,
  Copy, Sparkles, CheckCircle2,
  ChevronRight, Building2, Users, Compass,
  Lightbulb, Info, KeyRound, Upload, Image as ImageIcon,
  Video, FileVideo, CheckCircle
} from 'lucide-react';
import { saveProject, deleteProject } from '../services/api';

const DEFAULT_LOCATIONS = [
  'Coimbatore',
  'Karamadai',
  'Annur',
  'Kovilpalayam',
  'Pollachi',
  'Avinashi'
];

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

// Client-side image compressor using HTML5 canvas
function compressImage(file, maxWidth = 1280, maxHeight = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl,
          width,
          height,
          originalSize: file.size,
          compressedSize: Math.round((dataUrl.length * 3) / 4)
        });
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
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

  // Micro-Market Location Custom Creation
  const [customLocations, setCustomLocations] = useState(() => {
    try {
      const saved = localStorage.getItem('gv_custom_locations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [newLocationInput, setNewLocationInput] = useState('');

  // Media Upload & Input Mode States
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' | 'url'
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [uploadedImageInfo, setUploadedImageInfo] = useState(null);

  const [videoInputMode, setVideoInputMode] = useState('youtube'); // 'youtube' | 'upload'
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [uploadedVideoInfo, setUploadedVideoInfo] = useState(null);

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

  // Dynamic list of all available locations (Default + Plots + Custom Created)
  const allAvailableLocations = useMemo(() => {
    const fromPlots = plots.map(p => p.location).filter(Boolean);
    const combined = [...DEFAULT_LOCATIONS, ...fromPlots, ...customLocations];
    return Array.from(new Set(combined));
  }, [plots, customLocations]);

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
  // Location Custom Creation
  // -------------------------------------------------------------
  const handleCreateNewLocation = (e) => {
    if (e) e.preventDefault();
    const trimmed = newLocationInput.trim();
    if (!trimmed) return;

    if (!allAvailableLocations.some(l => l.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...customLocations, trimmed];
      setCustomLocations(updated);
      try {
        localStorage.setItem('gv_custom_locations', JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
    }
    setPlotFormData(prev => ({ ...prev, location: trimmed }));
    setNewLocationInput('');
    setIsCreatingLocation(false);
    triggerToast(`New location "${trimmed}" created & selected!`);
  };

  // -------------------------------------------------------------
  // Image File Upload & Canvas Optimization
  // -------------------------------------------------------------
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setIsProcessingImage(true);
    try {
      const result = await compressImage(file, 1280, 1280, 0.82);
      setPlotFormData(prev => ({ ...prev, imageUrl: result.dataUrl }));
      setUploadedImageInfo({
        name: file.name,
        width: result.width,
        height: result.height,
        sizeKB: Math.round(result.compressedSize / 1024)
      });
      triggerToast(`Image optimized & attached (${Math.round(result.compressedSize / 1024)} KB)`);
    } catch (err) {
      alert('Error optimizing image: ' + err.message);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // -------------------------------------------------------------
  // Video File Upload & Validation
  // -------------------------------------------------------------
  const handleVideoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = file.size / (1024 * 1024);
    setIsProcessingVideo(true);

    if (sizeMB > 4.5) {
      // Over serverless limit: create blob URL for local preview and give friendly guidance
      const localUrl = URL.createObjectURL(file);
      setPlotFormData(prev => ({
        ...prev,
        videoUrl: localUrl,
        videoTitle: prev.videoTitle || `${file.name.replace(/\.[^/.]+$/, "")} Drone Tour`
      }));
      setUploadedVideoInfo({
        name: file.name,
        sizeMB: sizeMB.toFixed(1),
        isTooLargeForServerless: true
      });
      setIsProcessingVideo(false);
      triggerToast(`Local video loaded (${sizeMB.toFixed(1)} MB). Note: YouTube recommended for large files.`);
      return;
    }

    // Under 4.5MB: Encode as Data URL so it saves directly in Neon database
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setPlotFormData(prev => ({
        ...prev,
        videoUrl: dataUrl,
        videoTitle: prev.videoTitle || `${file.name.replace(/\.[^/.]+$/, "")} Drone Tour`
      }));
      setUploadedVideoInfo({
        name: file.name,
        sizeMB: sizeMB.toFixed(1),
        isTooLargeForServerless: false
      });
      setIsProcessingVideo(false);
      triggerToast(`Video file attached successfully (${sizeMB.toFixed(1)} MB)`);
    };
    reader.onerror = () => {
      setIsProcessingVideo(false);
      alert('Could not read video file.');
    };
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------
  // Plots & Video CMS Actions
  // -------------------------------------------------------------
  const handleOpenNewPlotModal = () => {
    setPlotFormData(INITIAL_PLOT_FORM);
    setUploadedImageInfo(null);
    setUploadedVideoInfo(null);
    setIsCreatingLocation(false);
    setImageInputMode('upload');
    setVideoInputMode('youtube');
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
    setUploadedImageInfo(null);
    setUploadedVideoInfo(null);
    setIsCreatingLocation(false);
    setImageInputMode(plot.imageUrl?.startsWith('data:') ? 'upload' : 'url');
    setVideoInputMode(plot.videoUrl?.includes('youtube') || plot.videoUrl?.includes('youtu.be') ? 'youtube' : 'upload');
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
      <div className="fixed bottom-6 right-6 z-50 bg-brand-dark text-white px-5 py-3 rounded-none shadow-2xl border-l-4 border-brand-accent flex items-center gap-3 text-xs font-medium">
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
              Sign in to manage incoming customer leads, create custom locations, upload photos, and attach video tours.
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
            <span className="font-mono text-[10px] text-brand-light-muted">v3.6 • DTCP & RERA</span>
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
                  Admin Quick Guide — Key Capabilities
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              {/* Card 1 */}
              <div className="p-4 bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center font-mono text-[11px] font-bold">1</span>
                  <span>Respond via WhatsApp / Call</span>
                </div>
                <p className="text-white/70 leading-relaxed text-[11px]">
                  Click <strong>"WhatsApp"</strong> to open a pre-written message with the buyer's name and enquiry code, or <strong>"Call"</strong> to dial directly.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-4 bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center font-mono text-[11px] font-bold">2</span>
                  <span>Upload Photos Directly</span>
                </div>
                <p className="text-white/70 leading-relaxed text-[11px]">
                  Choose any photo file from your phone camera or computer. It automatically compresses to a crisp web format for instant website display.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-4 bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center font-mono text-[11px] font-bold">3</span>
                  <span>Video Tours & YouTube</span>
                </div>
                <p className="text-white/70 leading-relaxed text-[11px]">
                  Paste YouTube links for instant player streaming, or upload a video file (.mp4). You can test-play the video right inside the modal!
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-4 bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center font-mono text-[11px] font-bold">4</span>
                  <span>Create Custom Locations</span>
                </div>
                <p className="text-white/70 leading-relaxed text-[11px]">
                  Click <strong>"+ New Location"</strong> in the layout form to add any micro-market (e.g. Sulur, Saravanampatti). It appears on the website instantly!
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

                {/* Location Filter Dropdown (Includes newly created locations) */}
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
                                  className="text-brand-muted hover:text-brand-dark p-0.5 cursor-pointer"
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
                  Add new project layouts, create custom micro-markets, upload photo files, or attach YouTube video tours. All changes reflect live on the website.
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
                        title="Click to preview video player"
                      >
                        <Play size={12} className="fill-white" />
                        <span>▶ Watch Attached Video</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditPlotClick(plot)}
                        className="absolute bottom-3 left-3 bg-black/60 hover:bg-black/85 text-white/90 text-[10px] px-2.5 py-1 font-sans flex items-center gap-1 transition-colors cursor-pointer"
                        title="Click to attach a video tour"
                      >
                        <Plus size={10} />
                        <span>Attach Video Tour</span>
                      </button>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-brand-accent font-bold uppercase tracking-wider mb-1">
                        <MapPin size={12} />
                        <span className="font-bold">{plot.location}</span>
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
      {/* MODAL: ADD / EDIT PLOT, UPLOADS & CUSTOM LOCATION         */}
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

              {/* SECTION 1: BASIC INFORMATION & DYNAMIC LOCATION CREATION */}
              <div className="space-y-3 pb-4 border-b border-brand-divider">
                <div className="flex items-center gap-2 text-brand-dark font-bold text-xs uppercase tracking-wider">
                  <Building2 size={14} className="text-brand-accent" />
                  <span>1. Layout Name & Micro-Market Location</span>
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold uppercase tracking-wider text-brand-dark">
                        Micro-Market Location <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCreatingLocation(!isCreatingLocation)}
                        className="text-[11px] text-brand-accent hover:text-brand-dark font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>+ New Location</span>
                      </button>
                    </div>

                    <select
                      value={plotFormData.location}
                      onChange={(e) => {
                        if (e.target.value === '__NEW_LOCATION__') {
                          setIsCreatingLocation(true);
                        } else {
                          setPlotFormData({ ...plotFormData, location: e.target.value });
                        }
                      }}
                      className="w-full bg-brand-canvas px-3.5 py-2.5 border border-brand-divider text-sm outline-none font-medium cursor-pointer"
                    >
                      {allAvailableLocations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                      <option disabled>──────────</option>
                      <option value="__NEW_LOCATION__">➕ + Add New Custom Location...</option>
                    </select>

                    {/* Inline Create New Location Box */}
                    {isCreatingLocation && (
                      <div className="mt-2.5 p-3 bg-brand-canvas border border-brand-dark/25 space-y-2">
                        <label className="block text-[11px] font-bold text-brand-dark uppercase">
                          Create New Micro-Market Location
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            autoFocus
                            value={newLocationInput}
                            onChange={(e) => setNewLocationInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateNewLocation();
                              }
                            }}
                            placeholder="e.g. Sulur, Saravanampatti..."
                            className="flex-1 bg-white px-3 py-1.5 border border-brand-divider text-xs outline-none focus:border-brand-dark font-medium"
                          />
                          <button
                            type="button"
                            onClick={handleCreateNewLocation}
                            className="px-3 py-1.5 bg-brand-dark text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-btn cursor-pointer"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingLocation(false);
                              setNewLocationInput('');
                            }}
                            className="px-3 py-1.5 border border-brand-divider text-xs hover:bg-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                        <span className="text-[10px] text-brand-muted block">
                          Tip: Newly created locations will automatically appear on the website filters!
                        </span>
                      </div>
                    )}
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

              {/* SECTION 3: VIDEO TOUR (YOUTUBE LINK OR VIDEO FILE UPLOAD) */}
              <div className="p-4 bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-300 rounded-none space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film size={16} className="text-amber-800" />
                    <span className="font-bold uppercase tracking-wider text-amber-950 text-xs">
                      3. Video Tour Walkthrough
                    </span>
                  </div>
                  
                  {/* Video Input Mode Toggle */}
                  <div className="flex items-center border border-amber-300 bg-white">
                    <button
                      type="button"
                      onClick={() => setVideoInputMode('youtube')}
                      className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        videoInputMode === 'youtube'
                          ? 'bg-amber-900 text-white'
                          : 'text-amber-900 hover:bg-amber-50'
                      }`}
                    >
                      YouTube Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoInputMode('upload')}
                      className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        videoInputMode === 'upload'
                          ? 'bg-amber-900 text-white'
                          : 'text-amber-900 hover:bg-amber-50'
                      }`}
                    >
                      Upload Video File
                    </button>
                  </div>
                </div>

                {/* MODE A: YOUTUBE LINK */}
                {videoInputMode === 'youtube' && (
                  <div className="space-y-2">
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
                    <span className="text-[11px] text-amber-900 block">
                      Copy and paste any YouTube link from your videographer or smartphone.
                    </span>

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
                    ) : null}
                  </div>
                )}

                {/* MODE B: UPLOAD VIDEO FILE */}
                {videoInputMode === 'upload' && (
                  <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-amber-300 bg-white hover:bg-amber-50/50 transition-colors cursor-pointer text-center">
                      <FileVideo size={28} className="text-amber-800 mb-2" />
                      <span className="text-xs font-bold text-amber-950">
                        {isProcessingVideo ? 'Reading video file...' : 'Click to select MP4 / WebM video file'}
                      </span>
                      <span className="text-[11px] text-amber-800 mt-1">
                        Select video file from your phone gallery or drone folder
                      </span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        onChange={handleVideoFileUpload}
                        disabled={isProcessingVideo}
                      />
                    </label>

                    {/* Uploaded Video File Preview & Details */}
                    {plotFormData.videoUrl && !getEmbedUrl(plotFormData.videoUrl) && (
                      <div className="p-3 bg-white border border-amber-300 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                            <Video size={14} className="text-amber-800" />
                            <span>{uploadedVideoInfo?.name || 'Attached Video File'}</span>
                            {uploadedVideoInfo?.sizeMB && (
                              <span className="text-[10px] text-amber-800 font-mono">({uploadedVideoInfo.sizeMB} MB)</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPlotFormData(prev => ({ ...prev, videoUrl: '' }));
                              setUploadedVideoInfo(null);
                            }}
                            className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>

                        {/* HTML5 Live Video Player */}
                        <div className="relative aspect-[16/9] w-full bg-black overflow-hidden shadow-inner">
                          <video
                            src={plotFormData.videoUrl}
                            controls
                            className="w-full h-full object-cover"
                          >
                            Your browser does not support HTML5 video preview.
                          </video>
                        </div>

                        {uploadedVideoInfo?.isTooLargeForServerless && (
                          <div className="p-2 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                            💡 <strong>Tip for Large Files:</strong> This video ({uploadedVideoInfo.sizeMB} MB) can be previewed locally. For live website hosting with zero buffering, uploading to YouTube and pasting the link in the "YouTube Link" tab is strongly recommended.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

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

              {/* SECTION 4: COVER IMAGE (DIRECT FILE UPLOAD OR URL) */}
              <div className="space-y-3 pb-4 border-b border-brand-divider">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-brand-dark font-bold text-xs uppercase tracking-wider">
                    <ImageIcon size={14} className="text-brand-accent" />
                    <span>4. Layout Cover Photo</span>
                  </div>

                  {/* Image Input Mode Toggle */}
                  <div className="flex items-center border border-brand-divider bg-brand-canvas">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        imageInputMode === 'upload'
                          ? 'bg-brand-dark text-white'
                          : 'text-brand-dark hover:bg-brand-white'
                      }`}
                    >
                      📁 Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        imageInputMode === 'url'
                          ? 'bg-brand-dark text-white'
                          : 'text-brand-dark hover:bg-brand-white'
                      }`}
                    >
                      🌐 URL / Presets
                    </button>
                  </div>
                </div>

                {/* MODE A: UPLOAD IMAGE FILE */}
                {imageInputMode === 'upload' && (
                  <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-brand-divider hover:border-brand-dark bg-brand-canvas/60 hover:bg-brand-canvas transition-colors cursor-pointer text-center">
                      <Upload size={28} className="text-brand-accent mb-2" />
                      <span className="text-xs font-bold text-brand-dark">
                        {isProcessingImage ? 'Optimizing image...' : 'Click to select or drag & drop photo'}
                      </span>
                      <span className="text-[11px] text-brand-muted mt-1">
                        Select JPG, PNG, or WEBP from your phone camera or computer. Automatically optimized for web.
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileUpload}
                        disabled={isProcessingImage}
                      />
                    </label>

                    {/* Uploaded Image Preview Box */}
                    {plotFormData.imageUrl && (
                      <div className="p-3 bg-brand-canvas border border-brand-divider flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={plotFormData.imageUrl}
                            alt="Preview"
                            className="w-16 h-12 object-cover border border-brand-divider bg-zinc-100"
                          />
                          <div>
                            <span className="font-bold text-brand-dark block text-xs">
                              {uploadedImageInfo?.name || 'Cover Photo Ready'}
                            </span>
                            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                              <CheckCircle size={12} />
                              <span>Ready for website {uploadedImageInfo?.sizeKB ? `(${uploadedImageInfo.sizeKB} KB)` : ''}</span>
                            </span>
                          </div>
                        </div>

                        <label className="text-xs text-brand-dark hover:text-brand-accent font-bold underline cursor-pointer">
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageFileUpload}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* MODE B: URL OR PRESETS */}
                {imageInputMode === 'url' && (
                  <div className="space-y-3">
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
                          onClick={() => {
                            setPlotFormData({ ...plotFormData, imageUrl: preset.url });
                            triggerToast(`Preset selected: ${preset.label}`);
                          }}
                          className="px-2 py-1 text-[10px] bg-brand-canvas hover:bg-brand-dark hover:text-white border border-brand-divider transition-colors cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                  disabled={isSavingPlot || isProcessingImage || isProcessingVideo}
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
                  Video Tour Preview: {previewVideoTitle || 'Layout Walkthrough'}
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
