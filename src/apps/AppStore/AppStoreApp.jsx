import { useState, useEffect } from 'react';
import {
  X, Search, Download, Star, Sparkles, RefreshCw,
  Check, Loader, Trash2, AlertCircle, Save, Loader2,
  Compass, Users, Gamepad, CheckSquare, MessageSquare, ShoppingBag, Code, ArrowDownCircle, User
} from 'lucide-react';
import { configService } from '../../api/configService';
import { appStoreService } from '../../api/appStoreService';

export default function AppStore({ userId, userName }) {
  // App state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // macOS App Store Sidebar items mapping
  const sidebarItems = [
    { id: 'All', name: 'Discover', icon: Compass },
    { id: 'Social', name: 'Social', icon: Users },
    { id: 'Entertainment', name: 'Arcade & Play', icon: Gamepad },
    { id: 'Productivity', name: 'Create & Work', icon: CheckSquare },
    { id: 'Communication', name: 'Communication', icon: MessageSquare },
    { id: 'Shopping', name: 'Shopping', icon: ShoppingBag },
    { id: 'Developer Tools', name: 'Develop', icon: Code },
    { id: 'Installed', name: 'Installed & Updates', icon: ArrowDownCircle }
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
      const result = await appStoreService.getAppsWithoutSystem();
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
      const data = await configService.getDockConfig(userId);

      // Load installed apps from backend
      if (data && data.desktopApps && data.desktopApps.length > 0) {
        setApps(prevApps =>
          prevApps.map(app => ({
            ...app,
            installed: data.desktopApps.includes(app.name)
          }))
        );
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('No configuration found, using defaults');
      } else {
        console.error('Error loading configuration:', error);
        showNotification('Failed to load installed apps', 'error');
      }
    }
  };

  const autoSaveConfiguration = async (currentApps) => {
    if (!userId) {
      return;
    }

    const installedAppNames = currentApps
      .filter(app => app.installed)
      .map(app => app.name);

    try {
      const requestBody = {
        desktopApps: installedAppNames
      };

      await configService.saveDockConfig(userId, requestBody);
    } catch (error) {
      console.error('Error auto-saving configuration:', error);
      const errorMessage = error.response?.data?.message || `Network error: ${error.message}`;
      showNotification(`Failed to sync changes: ${errorMessage}`, 'error');
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
    if (!icon) {
      return <span className="text-4xl">📱</span>;
    }

    // If it's a path to an image file
    if (icon.includes('.png') || icon.includes('.jpg') || icon.includes('.jpeg') || icon.includes('.svg') || icon.includes('.webp') || icon.includes('.avif')) {
      let cleanPath = icon.trim();

      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
      }

      let finalPath;
      if (cleanPath.startsWith('AppIcons/')) {
        finalPath = `/${cleanPath}`;
      } else {
        cleanPath = cleanPath.replace(/^AppIcons\//, '');
        finalPath = `/AppIcons/${cleanPath}`;
      }

      return (
        <img
          src={finalPath}
          alt="App Icon"
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            console.error('Failed to load image from:', finalPath);
            e.target.onerror = null;
            e.target.style.display = 'none';
            const parent = e.target.parentElement;
            if (parent) {
              parent.innerHTML = '<span class="text-4xl">📱</span>';
            }
          }}
        />
      );
    }

    // If it's a full URL
    if (icon.startsWith('http://') || icon.startsWith('https://')) {
      return (
        <img
          src={icon}
          alt="App Icon"
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            console.error('Failed to load image from URL:', icon);
            e.target.onerror = null;
            e.target.style.display = 'none';
            const parent = e.target.parentElement;
            if (parent) {
              parent.innerHTML = '<span class="text-4xl">📱</span>';
            }
          }}
        />
      );
    }

    // Otherwise, treat it as an emoji or text
    return <span className="text-4xl">{icon}</span>;
  };

  // Filter apps based on category and search
  const filteredApps = apps.filter(app => {
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Installed'
          ? app.installed
          : app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured apps (top rated)
  const featuredApps = apps.filter(app => app.rating >= 4.5).slice(0, 3);

  // Installation handlers
  const handleInstall = (appId) => {
    if (!userId) {
      showNotification('Please log in to install apps', 'error');
      return;
    }

    setApps(prevApps =>
      prevApps.map(app =>
        app.id === appId
          ? { ...app, installing: true, progress: 0 }
          : app
      )
    );

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;

      if (progress >= 100) {
        clearInterval(interval);
        setApps(prevApps => {
          const updatedApps = prevApps.map(app =>
            app.id === appId
              ? { ...app, installed: true, installing: false, progress: 100 }
              : app
          );
          const targetApp = prevApps.find(app => app.id === appId);
          showNotification(`${targetApp?.name || 'App'} installed successfully!`, 'success');
          autoSaveConfiguration(updatedApps);
          return updatedApps;
        });
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

    setApps(prevApps => {
      const updatedApps = prevApps.map(app =>
        app.id === appId
          ? { ...app, installed: false, progress: 0 }
          : app
      );
      const targetApp = prevApps.find(app => app.id === appId);
      showNotification(`${targetApp?.name || 'App'} uninstalled successfully!`, 'info');
      autoSaveConfiguration(updatedApps);
      return updatedApps;
    });
  };

  const handleUninstallAll = () => {
    if (!userId) {
      showNotification('Please log in to uninstall apps', 'error');
      return;
    }

    setApps(prevApps => {
      const updatedApps = prevApps.map(app => ({
        ...app,
        installed: false,
        installing: false,
        progress: 0
      }));
      showNotification('All apps uninstalled successfully!', 'info');
      autoSaveConfiguration(updatedApps);
      return updatedApps;
    });
  };

  const installedCount = apps.filter(app => app.installed).length;

  return (
    <div className="h-full bg-white flex overflow-hidden font-sans relative">
      {/* Notification banner */}
      {notification && (
        <div className={`absolute top-4 right-4 z-[99999] px-6 py-3 text-white rounded-xl shadow-lg transition-all transform duration-300 animate-in slide-in-from-top-4 ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-[#007AFF]'
        }`}>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{notification.message}</span>
          </div>
        </div>
      )}

      {/* macOS Sidebar Navigation */}
      <div className="w-60 bg-[#F2F2F7]/95 backdrop-blur-md border-r border-gray-200 flex flex-col justify-between flex-shrink-0 select-none">
        <div>
          {/* Sidebar Search Bar */}
          <div className="p-4 relative">
            <Search size={15} className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#E3E3E8] hover:bg-[#D8D8DC] transition-colors rounded-lg text-sm border-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-black placeholder-gray-500"
            />
          </div>

          {/* Sidebar Navigation Items */}
          <div className="px-3 space-y-0.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = selectedCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedCategory(item.id);
                    setSelectedApp(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#D1D1D6]/60 text-black font-semibold shadow-sm"
                      : "text-gray-600 hover:bg-[#D1D1D6]/20 hover:text-black"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-[#007AFF]" : "text-gray-500"} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200/80 space-y-3 bg-[#EAEAEF]/30">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#007AFF] to-[#30A3FF] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {userName ? (userName[0]?.toUpperCase() || 'U') : (userId ? (userId[0]?.toUpperCase() || 'U') : 'G')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {userId ? "Logged In" : "Guest Account"}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                {userName || userId || "Local Sandbox"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main App Window Content */}
      <div className="flex-1 flex flex-col bg-[#F5F5F7] overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {loading && (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <Loader className="animate-spin text-[#007AFF] mx-auto mb-4" size={40} />
                <p className="text-gray-500 font-medium text-sm">Loading App Store...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <div className="text-center max-w-md mx-auto p-6">
                <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Connect</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => {
                    fetchApps();
                    if (userId) loadConfiguration();
                  }}
                  className="px-6 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Category Page Title */}
              <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {selectedCategory === 'All'
                    ? 'Discover'
                    : selectedCategory === 'Installed'
                      ? 'Installed'
                      : sidebarItems.find(i => i.id === selectedCategory)?.name || selectedCategory}
                </h1>
                <div className="flex items-center gap-2">
                  {selectedCategory === 'Installed' && installedCount > 0 && (
                    <button
                      onClick={handleUninstallAll}
                      className="px-3.5 py-1.5 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Trash2 size={13} />
                      Uninstall All
                    </button>
                  )}
                  <button
                    onClick={() => {
                      fetchApps();
                      if (userId) loadConfiguration();
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh Store"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
              </div>

              <div className="flex-1 px-8 pb-12 overflow-y-auto space-y-8">
                {/* Discover Banners (Featured Apps Carousel) */}
                {selectedCategory === 'All' && !searchQuery && featuredApps.length > 0 && (
                  <div className="space-y-4">
                    <div 
                      className="grid gap-6"
                      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
                    >
                      {featuredApps.map((app, index) => (
                        <div
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          className="relative h-44 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-end p-5 bg-gradient-to-tr from-gray-900 via-gray-900/60 to-transparent"
                        >
                          {/* Banner background placeholder colors/gradients */}
                          <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${
                            index === 0 ? 'from-[#FF5E62] to-[#FF9966]' :
                            index === 1 ? 'from-[#3A1C71] via-[#D76D77] to-[#FFAF7B]' :
                            'from-[#11998e] to-[#38ef7d]'
                          } opacity-90 group-hover:scale-105 transition-transform duration-500`}></div>
                          
                          <div className="absolute top-4 right-4 text-4xl overflow-hidden rounded-xl bg-white/20 backdrop-blur-md p-1.5 w-12 h-12 flex items-center justify-center">
                            {getAppIcon(app.icon)}
                          </div>
                          
                          <div>
                            <span className="text-[10px] uppercase font-bold text-white/70 tracking-widest">Featured</span>
                            <h3 className="font-extrabold text-lg text-white mb-1 leading-snug">{app.name}</h3>
                            <p className="text-xs text-white/90 line-clamp-1 max-w-[85%]">{app.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Apps Grid Section */}
                <div>
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    {searchQuery 
                      ? `Results for "${searchQuery}"` 
                      : selectedCategory === 'All' 
                        ? 'Featured Applications' 
                        : selectedCategory === 'Installed' 
                          ? 'Manage your installed apps' 
                          : `Top ${sidebarItems.find(i => i.id === selectedCategory)?.name || selectedCategory} Apps`}
                  </h2>

                  {filteredApps.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-400 font-medium">No Apps Found</p>
                      <p className="text-xs text-gray-400 mt-1">Try refining your query or change tabs</p>
                    </div>
                  ) : (
                    <div 
                      className="grid gap-5"
                      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
                    >
                      {filteredApps.map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center gap-4 p-4 border border-gray-200/50 bg-white rounded-2xl hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5 shadow-sm"
                          onClick={() => setSelectedApp(app)}
                        >
                          <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border border-gray-100 group-hover:scale-105 transition-transform overflow-hidden">
                            {getAppIcon(app.icon)}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">{app.name}</h3>
                            <p className="text-[11px] text-gray-500 font-medium mt-0.5 truncate">{app.category}</p>
                            <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{app.description}</p>
                          </div>
                          
                          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            {app.installing ? (
                              <div className="flex flex-col items-center min-w-[65px]">
                                <Loader className="animate-spin text-[#007AFF] mb-1" size={14} />
                                <span className="text-[9px] font-bold text-blue-600">{Math.round(app.progress)}%</span>
                              </div>
                            ) : app.installed ? (
                              <button
                                onClick={() => handleUninstall(app.id)}
                                className="px-3.5 py-1 bg-green-50 hover:bg-red-50 text-green-600 hover:text-red-600 border border-green-200 hover:border-red-200 rounded-full text-[10px] font-extrabold transition-colors tracking-wide shadow-sm"
                              >
                                INSTALLED
                              </button>
                            ) : (
                              <button
                                onClick={() => handleInstall(app.id)}
                                className="px-4.5 py-1 bg-[#007AFF] hover:bg-blue-600 text-white rounded-full text-[11px] font-extrabold transition-colors tracking-wide shadow-sm shadow-blue-100"
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
          )}
        </div>
      </div>

      {/* App Detail Modal */}
      {selectedApp && (() => {
        const currentApp = apps.find(a => a.id === selectedApp.id) || selectedApp;
        return (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedApp(null)}>
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200/60 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center text-4xl border border-gray-100 overflow-hidden shadow-sm">
                    {getAppIcon(currentApp.icon)}
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{currentApp.name}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{currentApp.developer || 'System Application'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center mb-0.5">
                        <Star size={15} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-lg font-bold text-gray-800">{currentApp.rating || 4.5}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-800">{currentApp.downloads || '1M+'}</p>
                      <p className="text-[10px] text-gray-500 font-medium">Downloads</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-800">{currentApp.size || '10MB'}</p>
                      <p className="text-[10px] text-gray-500 font-medium">Size</p>
                    </div>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    {currentApp.installing ? (
                      <div className="min-w-[120px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-blue-600">Installing...</span>
                          <span className="text-[11px] font-semibold text-blue-600">{Math.round(currentApp.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#007AFF] h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${currentApp.progress}%` }}
                          />
                        </div>
                      </div>
                    ) : currentApp.installed ? (
                      <button
                        onClick={() => handleUninstall(currentApp.id)}
                        className="px-6 py-2 bg-green-50 hover:bg-red-100 text-green-600 hover:text-red-600 border border-green-200 hover:border-red-200 rounded-full font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Check size={14} />
                        Installed
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInstall(currentApp.id)}
                        className="px-8 py-2 bg-[#007AFF] hover:bg-blue-600 text-white rounded-full font-extrabold text-xs transition-colors shadow-md shadow-blue-100"
                      >
                        Install App
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-left">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{currentApp.description || 'No description available for this application.'}</p>
                </div>

                <div className="text-left">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Information</h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between pb-1.5 border-b border-gray-100">
                      <span className="text-gray-500">Developer</span>
                      <span className="font-semibold text-gray-800">{currentApp.developer || 'Apple Inc.'}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-gray-100">
                      <span className="text-gray-500">Category</span>
                      <span className="font-semibold text-gray-800">{currentApp.category}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-gray-100">
                      <span className="text-gray-500">Price</span>
                      <span className="font-semibold text-gray-800">{currentApp.price || 'Free'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}