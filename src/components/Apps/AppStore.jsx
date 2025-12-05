import { useState, useRef, useEffect } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Search, Download, Star,
  TrendingUp, Sparkles, Grid3X3, List, Filter, RefreshCw,
  Check, Loader, Trash2, AlertCircle, Save, Loader2
} from 'lucide-react';
import {BASE_URL} from '../../../config.js';

export default function AppStore({ onClose, onFocus, zIndex = 1000, userId }) {
  // Window state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 50, y: 50 });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
    
  // App state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('grid');
  const [selectedApp, setSelectedApp] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const windowRef = useRef(null);
  
  // Dragging variables
  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 300,
    startWindowY: 50,
    currentWindowX: 300,
    currentWindowY: 50
  });

  // App categories
  const categories = [
    'All', 'Social', 'Entertainment', 'Productivity', 'Communication', 'Shopping', 'Developer Tools'
  ];

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch apps and load configuration from backend
  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    if (userId && apps.length > 0) {
      loadConfiguration();
    }
  }, [userId, apps.length]);

  const fetchApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/apps/all`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch apps');
      }
      
      const result = await response.json();
      
      if (result.success) {
        const transformedApps = result.data.map(app => ({
          id: app._id,
          name: app.name,
          category: app.category,
          description: app.description,
          icon: app.icon,
          size: app.size,
          rating: 4.5,
          downloads: '1M+',
          price: 'Free',
          developer: 'Unknown',
          screenshots: [],
          color: getRandomColor(),
          installed: false,
          installing: false,
          progress: 0
        }));
        
        setApps(transformedApps);
      } else {
        throw new Error(result.message || 'Failed to load apps');
      }
    } catch (err) {
      console.error('Error fetching apps:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadConfiguration = async () => {
    if (!userId) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/config/get/${userId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        // Load installed apps from backend
        if (data.desktopApps && data.desktopApps.length > 0) {
          setApps(prevApps =>
            prevApps.map(app => ({
              ...app,
              installed: data.desktopApps.includes(app.name)
            }))
          );
        }
        setHasUnsavedChanges(false);
      } else if (response.status === 404) {
        console.log('No configuration found, using defaults');
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      showNotification('Failed to load installed apps', 'error');
    }
  };

  const saveConfiguration = async () => {
    if (!userId) {
      showNotification('Please log in to save your configuration', 'error');
      return;
    }

    const installedAppNames = apps
      .filter(app => app.installed)
      .map(app => app.name);

    if (!installedAppNames || installedAppNames.length === 0) {
      showNotification('No apps to save. Please install at least one app.', 'info');
      return;
    }

    try {
      setIsSaving(true);
      
      const requestBody = {
        desktopApps: installedAppNames
      };

      const response = await fetch(`${BASE_URL}/config/save/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Desktop apps configuration saved successfully!', 'success');
        setHasUnsavedChanges(false);
      } else {
        const errorMessage = data.message || 'Failed to save configuration';
        showNotification(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      showNotification(`Network error: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to get random color for app cards
  const getRandomColor = () => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Helper function to get icon (either emoji or image URL)
  const getAppIcon = (icon) => {
    if (icon.startsWith('/AppIcons/') || icon.startsWith('/')) {
      const imagePath = `/src/assets/AppIcons${icon}`;
      return (
        <img 
          src={imagePath}
          alt="App Icon" 
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '📱';
          }}
        />
      );
    }
    
    if (icon.startsWith('http')) {
      return (
        <img 
          src={icon} 
          alt="App Icon" 
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '📱';
          }}
        />
      );
    }
    
    return icon;
  };

  // Filter apps based on category and search
  const filteredApps = apps.filter(app => {
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured apps (top rated)
  const featuredApps = apps.filter(app => app.rating >= 4.7).slice(0, 3);

  // Installation handlers - LOCAL ONLY (No API calls)
  const handleInstall = (appId) => {
    if (!userId) {
      showNotification('Please log in to install apps', 'error');
      return;
    }

    // Update UI immediately
    setApps(prevApps =>
      prevApps.map(app =>
        app.id === appId
          ? { ...app, installing: true, progress: 0 }
          : app
      )
    );

    // Simulate installation progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      
      if (progress >= 100) {
        clearInterval(interval);
        setApps(prevApps =>
          prevApps.map(app =>
            app.id === appId
              ? { ...app, installed: true, installing: false, progress: 100 }
              : app
          )
        );
        setHasUnsavedChanges(true);
      } else {
        setApps(prevApps =>
          prevApps.map(app =>
            app.id === appId
              ? { ...app, progress: Math.min(progress, 100) }
              : app
          )
        );
      }
    }, 500);
  };

  const handleUninstall = (appId) => {
    if (!userId) {
      showNotification('Please log in to uninstall apps', 'error');
      return;
    }

    setApps(prevApps =>
      prevApps.map(app =>
        app.id === appId
          ? { ...app, installed: false, progress: 0 }
          : app
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleInstallAll = () => {
    if (!userId) {
      showNotification('Please log in to install apps', 'error');
      return;
    }

    apps.forEach(app => {
      if (!app.installed && !app.installing) {
        handleInstall(app.id);
      }
    });
  };

  const handleUninstallAll = () => {
    if (!userId) {
      showNotification('Please log in to uninstall apps', 'error');
      return;
    }

    setApps(prevApps =>
      prevApps.map(app => ({ 
        ...app, 
        installed: false, 
        installing: false, 
        progress: 0 
      }))
    );
    setHasUnsavedChanges(true);
    showNotification('All apps uninstalled', 'info');
  };

  const installedCount = apps.filter(app => app.installed).length;
  const installingCount = apps.filter(app => app.installing).length;

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Window management
  useEffect(() => {
    if (isMobile) return;
    
    const windowElement = windowRef.current;
    if (!windowElement) return;

    let animationFrame = null;

    const handleMouseMove = (e) => {
      if (dragState.current.holdingWindow && !isMaximized) {
        if (animationFrame) cancelAnimationFrame(animationFrame);

        const deltaX = e.clientX - dragState.current.mouseTouchX;
        const deltaY = e.clientY - dragState.current.mouseTouchY;
        
        dragState.current.currentWindowX = dragState.current.startWindowX + deltaX;
        dragState.current.currentWindowY = dragState.current.startWindowY + deltaY;

        const minX = -windowElement.offsetWidth + 100;
        const minY = 0;
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 100;

        dragState.current.currentWindowX = Math.max(minX, Math.min(maxX, dragState.current.currentWindowX));
        dragState.current.currentWindowY = Math.max(minY, Math.min(maxY, dragState.current.currentWindowY));

        animationFrame = requestAnimationFrame(() => {
          windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
        });
      }
    };

    const handleMouseDown = (e) => {
      if (e.button === 0) {
        const titleBar = e.target.closest('.title-bar');
        const isButton = e.target.closest('.traffic-lights') || e.target.closest('button');
        
        if (titleBar && !isButton) {
          e.preventDefault();
          e.stopPropagation();

          if (onFocus) onFocus();
          
          dragState.current.holdingWindow = true;
          setIsActive(true);
          setIsDragging(true);

          dragState.current.mouseTouchX = e.clientX;
          dragState.current.mouseTouchY = e.clientY;
          dragState.current.startWindowX = dragState.current.currentWindowX;
          dragState.current.startWindowY = dragState.current.currentWindowY;

          document.body.style.userSelect = 'none';
          document.body.style.cursor = 'default';
          document.body.style.pointerEvents = 'none';
          windowElement.style.pointerEvents = 'auto';
        }
      }
    };

    const handleMouseUp = () => {
      if (dragState.current.holdingWindow) {
        dragState.current.holdingWindow = false;
        setIsDragging(false);
        
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.body.style.pointerEvents = '';
        windowElement.style.pointerEvents = '';

        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    windowElement.addEventListener('mousedown', handleMouseDown);

    windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
    windowElement.style.willChange = 'transform';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      windowElement.removeEventListener('mousedown', handleMouseDown);
      
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.body.style.pointerEvents = '';
      
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isMaximized, isMobile, onFocus]);

  const handleClose = () => onClose();
  const handleMinimize = () => setIsMinimized(!isMinimized);
  
  const handleMaximize = () => {
    if (isMobile) return;
    
    if (isMaximized) {
      setIsMaximized(false);
      dragState.current.currentWindowX = prevPosition.x;
      dragState.current.currentWindowY = prevPosition.y;
      windowRef.current.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
    } else {
      setPrevPosition({
        x: dragState.current.currentWindowX,
        y: dragState.current.currentWindowY
      });
      setIsMaximized(true);
      dragState.current.currentWindowX = 0;
      dragState.current.currentWindowY = 25;
      windowRef.current.style.transform = `translate3d(0px, 25px, 0)`;
    }
  };

  const mobileStyles = isMobile ? {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    transform: 'none',
    borderRadius: 0,
  } : {
    width: isMaximized ? '100vw' : '1100px',
    height: isMaximized ? 'calc(100vh - 25px)' : '700px',
  };

  return (
    <div
      ref={windowRef}
      className={`${isMobile ? 'fixed inset-0' : 'fixed'} bg-white ${isMobile ? '' : 'rounded-xl shadow-2xl'} overflow-hidden transition-all duration-200 ${
        isActive ? 'ring-2 ring-blue-500/20' : ''
      } ${
        isMinimized ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      }`}
      style={{
        left: isMobile ? 0 : undefined,
        top: isMobile ? 0 : undefined,
        ...mobileStyles,
        zIndex: zIndex,
        display: isMinimized ? 'none' : 'block',
        willChange: isDragging ? 'transform' : 'auto',
        transition: isDragging ? 'none' : 'all 0.2s'
      }}
      onClick={() => {
        setIsActive(true);
        if (onFocus) onFocus();
      }}
    >
      {/* Notification */}
      {notification && (
        <div className="absolute top-16 right-4 z-50 animate-in slide-in-from-top">
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <Check className="w-5 h-5" />
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Title Bar */}
      <div
        className={`title-bar ${isMobile ? 'h-14' : 'h-12'} bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-between px-4 select-none`}
        style={{ 
          cursor: isMobile ? 'default' : 'default',
          WebkitAppRegion: isMobile ? 'no-drag' : 'drag'
        }}
      >
        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          {!isMobile && (
            <div className="traffic-lights flex items-center gap-2">
              <button
                className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-150 group flex items-center justify-center"
                onClick={handleClose}
                title="Close"
              >
                <X size={8} className="text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors duration-150 group flex items-center justify-center"
                onClick={handleMinimize}
                title="Minimize"
              >
                <div className="w-2 h-0.5 bg-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <button
                className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-150 group flex items-center justify-center"
                onClick={handleMaximize}
                title={isMaximized ? "Restore" : "Maximize"}
              >
                <div className="w-1.5 h-1.5 border border-green-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-white font-semibold text-lg">
          <Sparkles size={20} />
          App Store
        </div>

        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            onClick={() => {
              fetchApps();
              if (userId) loadConfiguration();
            }}
            className="p-2 hover:bg-white/20 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className="text-white" />
          </button>
          {isMobile && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-yellow-800">You have unsaved changes</span>
            </div>
            <button
              onClick={saveConfiguration}
              disabled={isSaving}
              className="px-4 py-1.5 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition font-medium text-sm flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Now
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="h-full bg-gray-50 flex flex-col" style={{ height: `calc(100% - ${isMobile ? '3.5rem' : '3rem'}${hasUnsavedChanges ? ' - 2.5rem' : ''})` }}>
        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
              <p className="text-gray-600 font-medium">Loading apps...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
              <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Apps</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  fetchApps();
                  if (userId) loadConfiguration();
                }}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Apps Content */}
        {!loading && !error && (
          <>
            {/* Search Bar */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="max-w-2xl mx-auto relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-1">Total Apps</p>
                    <p className="text-2xl font-bold text-blue-600">{apps.length}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-1">Installed</p>
                    <p className="text-2xl font-bold text-green-600">{installedCount}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-1">Installing</p>
                    <p className="text-2xl font-bold text-purple-600">{installingCount}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-1">Available</p>
                    <p className="text-2xl font-bold text-gray-600">{apps.length - installedCount - installingCount}</p>
                  </div>
                </div>

                {/* Bulk Actions */}
                {apps.length > 0 && userId && (
                  <div className="flex gap-3 items-center flex-wrap">
                    <button
                      onClick={handleInstallAll}
                      disabled={apps.every(app => app.installed || app.installing)}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Download size={16} />
                      Install All Apps
                    </button>
                    <button
                      onClick={handleUninstallAll}
                      disabled={installedCount === 0}
                      className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition font-semibold text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Uninstall All
                    </button>
                    {installingCount > 0 && (
                      <div className="ml-auto flex items-center gap-2 text-sm text-purple-600">
                        <Loader className="animate-spin" size={16} />
                        <span className="font-medium">Installing {installingCount} app{installingCount > 1 ? 's' : ''}...</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Featured Section */}
                {!searchQuery && selectedCategory === 'All' && featuredApps.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="text-blue-500" />
                        Featured Apps
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {featuredApps.map((app) => (
                        <div
                          key={app.id}
                          className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
                          onClick={() => setSelectedApp(app)}
                        >
                          <div className="bg-gray-50 h-32 flex items-center justify-center text-6xl">
                            {getAppIcon(app.icon)}
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">{app.name}</h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{app.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-medium">{app.rating}</span>
                              </div>
                              <span className="text-xs text-gray-500">{app.downloads}</span>
                            </div>
                            
                            {/* Install Button */}
                            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                              {app.installing ? (
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-blue-600">Installing...</span>
                                    <span className="text-xs font-medium text-blue-600">{Math.round(app.progress)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${app.progress}%` }}
                                    />
                                  </div>
                                </div>
                              ) : app.installed ? (
                                <button
                                  onClick={() => handleUninstall(app.id)}
                                  className="w-full py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Trash2 size={16} />
                                  Uninstall
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleInstall(app.id)}
                                  className="w-full py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Download size={16} />
                                  Install
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Apps Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {searchQuery ? `Results for "${searchQuery}"` : selectedCategory === 'All' ? 'All Apps' : selectedCategory}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setView('grid')}
                        className={`p-2 rounded-lg transition-colors ${
                          view === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Grid3X3 size={18} />
                      </button>
                      <button
                        onClick={() => setView('list')}
                        className={`p-2 rounded-lg transition-colors ${
                          view === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <List size={18} />
                      </button>
                    </div>
                  </div>

                  {filteredApps.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">No apps found</p>
                    </div>
                  ) : view === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredApps.map((app) => (
                        <div
                          key={app.id}
                          className="bg-white rounded-xl p-4 shadow hover:shadow-xl transition-all cursor-pointer group"
                          onClick={() => setSelectedApp(app)}
                        >
                          <div className="bg-gray-50 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-3 group-hover:scale-110 transition-transform overflow-hidden">
                            {getAppIcon(app.icon)}
                          </div>
                          <h3 className="font-bold text-base mb-1">{app.name}</h3>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{app.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <Star size={12} className="text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-medium">{app.rating}</span>
                            </div>
                            <span className="text-xs font-semibold text-blue-600">{app.price}</span>
                          </div>
                          
                          {/* Install Button */}
                          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                            {app.installing ? (
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-blue-600">Installing...</span>
                                  <span className="text-xs font-medium text-blue-600">{Math.round(app.progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${app.progress}%` }}
                                  />
                                </div>
                              </div>
                            ) : app.installed ? (
                              <button
                                onClick={() => handleUninstall(app.id)}
                                className="w-full py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                              >
                                <Trash2 size={12} />
                                Uninstall
                              </button>
                            ) : (
                              <button
                                onClick={() => handleInstall(app.id)}
                                className="w-full py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors"
                              >
                                GET
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredApps.map((app) => (
                        <div
                          key={app.id}
                          className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition-all cursor-pointer flex items-center gap-4"
                          onClick={() => setSelectedApp(app)}
                        >
                          <div className="bg-gray-50 w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                            {getAppIcon(app.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base mb-1">{app.name}</h3>
                            <p className="text-sm text-gray-600 mb-1 line-clamp-1">{app.description}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                <span>{app.rating}</span>
                              </div>
                              <span>{app.downloads}</span>
                              <span>{app.size}</span>
                            </div>
                            
                            {/* Progress Bar in List View */}
                            {app.installing && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-blue-600">Installing...</span>
                                  <span className="text-xs font-medium text-blue-600">{Math.round(app.progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${app.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            {app.installing ? (
                              <button
                                disabled
                                className="px-6 py-2 bg-gray-100 text-gray-400 rounded-full font-semibold cursor-not-allowed flex items-center gap-2"
                              >
                                <Loader size={16} className="animate-spin" />
                                Installing
                              </button>
                            ) : app.installed ? (
                              <button
                                onClick={() => handleUninstall(app.id)}
                                className="px-6 py-2 bg-red-50 text-red-600 rounded-full font-semibold hover:bg-red-100 transition-colors flex items-center gap-2"
                              >
                                <Trash2 size={16} />
                                Uninstall
                              </button>
                            ) : (
                              <button
                                onClick={() => handleInstall(app.id)}
                                className="px-6 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors"
                              >
                                GET
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* App Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedApp(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl">
                  {getAppIcon(selectedApp.icon)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedApp.name}</h2>
                  <p className="text-gray-600">{selectedApp.developer}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold">{selectedApp.rating}</span>
                    </div>
                    <p className="text-xs text-gray-600">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedApp.downloads}</p>
                    <p className="text-xs text-gray-600">Downloads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedApp.size}</p>
                    <p className="text-xs text-gray-600">Size</p>
                  </div>
                </div>
                
                {/* Install Button in Modal */}
                <div onClick={(e) => e.stopPropagation()}>
                  {selectedApp.installing ? (
                    <div className="min-w-[140px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-600">Installing...</span>
                        <span className="text-xs font-medium text-blue-600">{Math.round(selectedApp.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedApp.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : selectedApp.installed ? (
                    <button
                      onClick={() => handleUninstall(selectedApp.id)}
                      className="px-8 py-3 bg-red-50 text-red-600 rounded-full font-semibold hover:bg-red-100 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={20} />
                      Uninstall
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInstall(selectedApp.id)}
                      className="px-8 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <Download size={20} />
                      Install
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">About</h3>
                <p className="text-gray-700">{selectedApp.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Developer</span>
                    <span className="font-medium">{selectedApp.developer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">{selectedApp.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price</span>
                    <span className="font-medium">{selectedApp.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}