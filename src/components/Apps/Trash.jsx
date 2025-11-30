import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  X, Trash2, RotateCcw, AlertTriangle, File, Folder,
  Image, Music, Video, FileText, Archive, Grid3X3, List,
  MoreHorizontal, Clock, HardDrive, Calendar, Info,
  ChevronDown, Search, RefreshCw, Menu
} from 'lucide-react';
import { BASE_URL } from '../../../config';


export default function Trash({ onClose , zIndex = 1000, onFocus  }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [sortBy, setSortBy] = useState('deletedDate');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [user, setUser] = useState(null);
  
  // Window state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 50, y: 50 });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const windowRef = useRef(null);
  const sortMenuRef = useRef(null);

  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 50,
    startWindowY: 50,
    currentWindowX: 50,
    currentWindowY: 50
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadTrash();
    }
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setShowSortMenu(false);
      }
      setContextMenu(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/checkSession`, { withCredentials: true });
      console.log("User session check:", res.data);
      
      if (res.data.loggedIn) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching user session:", err);
      setUser(null);
    }
  };

  const loadTrash = async () => {
    if (!user) {
      console.log("No user found, cannot load trash");
      return;
    }

    console.log("Loading trash for user:", user._id || user.email || user.name);

    try {
      setLoading(true);
      
      // Fetch local trash items
      let localItems = [];
      try {
        const localRes = await axios.get(`${BASE_URL}/finder/trash/local`, {
          params: { owner: user._id || user.email || user.name }
        });
        console.log("Local trash response:", localRes.data);
        localItems = (localRes.data.items || []).map(item => ({ 
          ...item, 
          source: 'local',
          id: item._id || item.id
        }));
      } catch (localErr) {
        console.error("Error loading local trash:", localErr);
      }

      // Fetch Google Drive trash items
      let driveItems = [];
      try {
        const driveRes = await axios.get(`${BASE_URL}/cloud/bin`, {
          params: { owner: user._id || user.email || user.name }
        });
        console.log("Drive trash response:", driveRes.data);
        driveItems = (driveRes.data.files || driveRes.data || []).map(item => ({ 
          ...item,
          source: 'drive',
          id: item.id,
          name: item.name,
          size: item.size,
          type: item.mimeType?.includes('folder') ? 'folder' : 'file',
          mimeType: item.mimeType,
          createdAt: item.createdTime,
          updatedAt: item.modifiedTime,
          owner: item.owner || user._id || user.email || user.name
        }));
      } catch (driveErr) {
        console.error("Error loading drive trash:", driveErr);
      }

      // Combine items
      const allItems = [...localItems, ...driveItems];
      console.log("All items before filter:", allItems);

      // Filter by owner
      const filteredItems = allItems.filter(item => 
        item.owner === (user._id || user.email || user.name)
      );
      
      console.log("Filtered items:", filteredItems);
      setItems(filteredItems);
    } catch (err) {
      console.error("Error loading trash:", err);
      console.error("Error details:", err.response?.data);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const restoreItem = async (item) => {
    try {
      if (item.source === 'drive') {
        // Restore from Google Drive trash
        await axios.put(`${BASE_URL}/cloud/restore/${item.id}`);
      } else {
        // Restore from local MongoDB trash
        await axios.put(`${BASE_URL}/finder/restore/${item.id}`);
      }
      
      console.log('Item restored:', item.name);
      loadTrash();
      setSelectedItems(selectedItems.filter(id => id !== item.id));
      setDetailsItem(null);
      setContextMenu(null);
    } catch (err) {
      console.error("Error restoring item:", err);
      alert("Failed to restore item: " + (err.response?.data?.error || err.message));
    }
  };

  const deleteItemPermanently = async (item) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.name}"? This cannot be undone.`)) return;
    
    try {
      if (item.source === 'drive') {
        // Delete from Google Drive permanently
        await axios.delete(`${BASE_URL}/cloud/deletefiles/${item.id}`);
      } else if (item.type === "folder") {
        // Delete folder from MongoDB
        await axios.delete(`${BASE_URL}/finder/delete/folder/${item.id}`);
      } else {
        // Delete file from MongoDB
        await axios.delete(`${BASE_URL}/finder/delete/${item.id}`);
      }
      
      console.log('Item permanently deleted:', item.name);
      loadTrash();
      setSelectedItems(selectedItems.filter(id => id !== item.id));
      setDetailsItem(null);
      setContextMenu(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item permanently: " + (err.response?.data?.error || err.message));
    }
  };

  const restoreAll = async () => {
    if (items.length === 0) return;
    if (!confirm(`Restore all ${items.length} items from trash?`)) return;

    try {
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const item of items) {
        try {
          if (item.source === 'drive') {
            await axios.put(`${BASE_URL}/cloud/restore/${item.id}`);
          } else {
            await axios.put(`${BASE_URL}/finder/restore/${item.id}`);
          }
          successCount++;
          console.log('Restored:', item.name);
        } catch (err) {
          console.error('Error restoring:', item.name, err);
          errorCount++;
        }
      }

      loadTrash();
      setSelectedItems([]);
      
      if (errorCount > 0) {
        alert(`Restored ${successCount} items. Failed to restore ${errorCount} items.`);
      } else {
        alert(`Successfully restored all ${successCount} items.`);
      }
    } catch (err) {
      console.error("Error restoring all items:", err);
      alert("Failed to restore all items");
    } finally {
      setLoading(false);
    }
  };

  const emptyTrash = async () => {
    if (items.length === 0) return;
    if (!confirm(`Permanently delete all ${items.length} items? This cannot be undone.`)) return;

    try {
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const item of items) {
        try {
          if (item.source === 'drive') {
            await axios.delete(`${BASE_URL}/cloud/deletefiles/${item.id}`);
          } else if (item.type === "folder") {
            await axios.delete(`${BASE_URL}/finder/delete/folder/${item.id}`);
          } else {
            await axios.delete(`${BASE_URL}/finder/delete/${item.id}`);
          }
          successCount++;
          console.log('Deleted:', item.name);
        } catch (err) {
          console.error('Error deleting:', item.name, err);
          errorCount++;
        }
      }

      loadTrash();
      setSelectedItems([]);
      setDetailsItem(null);
      
      if (errorCount > 0) {
        alert(`Deleted ${successCount} items. Failed to delete ${errorCount} items.`);
      } else {
        alert(`Successfully emptied trash (${successCount} items).`);
      }
    } catch (err) {
      console.error("Error emptying trash:", err);
      alert("Failed to empty trash");
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type, name, mimeType) => {
    if (type === 'folder') return Folder;
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return FileText;
    if (mimeType?.includes('image') || type === 'image' || type === 'photo' || name?.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i)) return Image;
    if (mimeType?.includes('audio') || type === 'music' || name?.match(/\.(mp3|wav|ogg|m4a|flac|aac|wma)$/i)) return Music;
    if (mimeType?.includes('video') || type === 'video' || name?.match(/\.(mp4|avi|mov|mkv|webm|flv|wmv)$/i)) return Video;
    if (name?.match(/\.(zip|rar|7z|tar|gz)$/i)) return Archive;
    if (mimeType?.includes('pdf') || type === 'document' || name?.match(/\.(pdf|txt|md|doc|docx)$/i)) return FileText;
    return File;
  };

  const formatFileSize = (size) => {
    if (typeof size === 'string') return size;
    if (!size) return '—';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `Today ${hours}:${minutes}`;
      }
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString();
    } catch (err) {
      return '—';
    }
  };

  const handleItemClick = (item, e) => {
    if (e?.shiftKey && selectedItems.length > 0) {
      const lastIndex = items.findIndex(i => i.id === selectedItems[selectedItems.length - 1]);
      const currentIndex = items.findIndex(i => i.id === item.id);
      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);
      const newSelection = items.slice(start, end + 1).map(i => i.id);
      setSelectedItems([...new Set([...selectedItems, ...newSelection])]);
    } else if (e?.ctrlKey || e?.metaKey) {
      setSelectedItems(prev => 
        prev.includes(item.id) 
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else {
      setSelectedItems([item.id]);
    }
  };

  const handleItemDoubleClick = (item) => {
    setDetailsItem(item);
  };

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    if (!selectedItems.includes(item.id)) {
      setSelectedItems([item.id]);
    }
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'size': {
        const aSize = typeof a.size === 'string' ? 0 : (a.size || 0);
        const bSize = typeof b.size === 'string' ? 0 : (b.size || 0);
        return bSize - aSize;
      }
      case 'type':
        return (a.mimeType || a.type || '').localeCompare(b.mimeType || b.type || '');
      case 'deletedDate':
      default:
        return new Date(b.updatedAt || b.modifiedTime || b.createdAt || b.createdTime) - 
               new Date(a.updatedAt || a.modifiedTime || a.createdAt || a.createdTime);
    }
  });

  const filteredItems = sortedItems.filter(item =>
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSize = items.reduce((sum, item) => {
    if (typeof item.size === 'string') {
      const match = item.size.match(/(\d+\.?\d*)\s*(B|KB|MB|GB)/);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2];
        const multipliers = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
        return sum + (value * multipliers[unit]);
      }
    }
    return sum + (typeof item.size === 'number' ? item.size : 0);
  }, 0);

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

            if (onFocus) {
              onFocus();
            }
          
          dragState.current.holdingWindow = true;
          setIsActive(true);
          setIsDragging(true);

          // z-index is handled by parent MacOS via the `zIndex` prop
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

    const handleWindowClick = () => {
      setIsActive(true);
      if (onFocus) onFocus();
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
  }, [isMaximized, isMobile]);

  const handleClose = () => onClose?.();
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
    width: isMaximized ? '100vw' : 'min(95vw, 1200px)',
    height: isMaximized ? 'calc(100vh - 25px)' : 'min(90vh, 700px)',
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
        handleWindowClick();
        if (onFocus) onFocus();
      }}
    >
      {/* Title Bar */}
      <div
        className={`title-bar ${isMobile ? 'h-14' : 'h-12'} bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4 select-none transition-colors duration-200 ${
          isActive ? 'bg-gray-100' : 'bg-gray-50'
        }`}
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

        <div className={`flex items-center gap-2 ${isMobile ? 'flex-1 mx-4' : ''}`}>
          <div className={`${isMobile ? '' : 'absolute left-1/2 transform -translate-x-1/2'} pointer-events-none`}>
            <div className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-sm'} text-gray-700`}>
              <Trash2 size={isMobile ? 20 : 18} className="text-red-500" />
              <span className="font-medium">Trash</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          {isMobile && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="h-full bg-white flex flex-col" style={{ height: `calc(100% - ${isMobile ? '3.5rem' : '3rem'})` }}>
        {/* Toolbar */}
        <div className={`flex items-center justify-between px-4 ${isMobile ? 'py-3' : 'py-2'} border-b border-gray-200 bg-gray-50 flex-wrap gap-2`}>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={restoreAll}
              disabled={items.length === 0 || loading}
              className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <RotateCcw size={14} />
              {!isMobile && 'Restore All'}
            </button>
            
            <button
              onClick={emptyTrash}
              disabled={items.length === 0 || loading}
              className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <AlertTriangle size={14} />
              {!isMobile && 'Empty Trash'}
            </button>

            <button
              onClick={loadTrash}
              disabled={loading}
              className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50`}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {!isMobile && 'Refresh'}
            </button>

            {selectedItems.length > 0 && (
              <div className={`flex items-center gap-2 px-3 ${isMobile ? 'py-2' : 'py-1.5'} bg-blue-100 text-blue-700 rounded-md text-sm`}>
                {selectedItems.length} selected
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isMobile && (
              <div className="relative" ref={sortMenuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSortMenu(!showSortMenu);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Sort: {sortBy === 'deletedDate' ? 'Date' : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                  <ChevronDown size={14} />
                </button>

                {showSortMenu && (
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    {['deletedDate', 'name', 'size', 'type'].map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setShowSortMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                          sortBy === option ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {option === 'deletedDate' ? 'Date Deleted' : option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isMobile && (
              <>
                <button
                  onClick={() => setView('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    view === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <Grid3X3 size={16} />
                </button>
                
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 rounded transition-colors ${
                    view === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <List size={16} />
                </button>
              </>
            )}

            {isMobile && (
              <div className="flex gap-1">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded transition-colors ${
                    view === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded transition-colors ${
                    view === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            )}

            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-7 pr-3 py-1 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isMobile ? 'w-24' : 'w-32'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className={`px-4 ${isMobile ? 'py-2' : 'py-2'} bg-yellow-50 border-b border-yellow-200 flex items-center justify-between ${isMobile ? 'text-xs' : 'text-sm'} flex-wrap gap-2`}>
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle size={isMobile ? 14 : 16} />
            <span>{isMobile ? 'Auto-delete in 30 days' : 'Items in trash will be automatically deleted after 30 days'}</span>
          </div>
          <div className="text-gray-600">
            {items.length} items • {formatFileSize(totalSize)}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Trash2 size={48} className="mb-2 text-gray-400" />
              <p className="text-lg font-medium">Trash is empty</p>
              <p className="text-sm text-gray-400 mt-1">Deleted items will appear here</p>
            </div>
          ) : view === 'grid' ? (
            <div className={`grid gap-4 ${
              isMobile 
                ? 'grid-cols-2' 
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
            }`}>
              {filteredItems.map((item) => {
                const Icon = getFileIcon(item.type, item.name, item.mimeType);
                const isSelected = selectedItems.includes(item.id);
                
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 relative group ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-200'
                    }`}
                    onClick={(e) => handleItemClick(item, e)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon size={isMobile ? 40 : 48} className="text-gray-400 opacity-60" />
                      <div className="text-center w-full">
                        <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-900 truncate w-full`}>
                          {item.name}
                        </p>
                        {item.size && !isMobile && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(item.size)}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, item);
                      }}
                      className="absolute top-2 right-2 p-1 hover:bg-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal size={14} className="text-gray-600" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              {!isMobile && (
                <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200 bg-gray-50">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-3">Deleted</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Type</div>
                </div>
              )}
              {filteredItems.map((item) => {
                const Icon = getFileIcon(item.type, item.name, item.mimeType);
                const isSelected = selectedItems.includes(item.id);
                
                return (
                  <div
                    key={item.id}
                    className={`${
                      isMobile 
                        ? 'flex items-center gap-3 p-3' 
                        : 'grid grid-cols-12 gap-4 items-center px-3 py-2'
                    } rounded-md cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-50'
                    }`}
                    onClick={(e) => handleItemClick(item, e)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                  >
                    {isMobile ? (
                      <>
                        <Icon size={24} className="flex-shrink-0 text-gray-400 opacity-60" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <div className="flex gap-2 text-xs text-gray-500">
                            {item.size && <span>{formatFileSize(item.size)}</span>}
                            <span>{formatDate(item.updatedAt || item.modifiedTime || item.createdAt)}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContextMenu(e, item);
                          }}
                          className="p-2 hover:bg-gray-200 rounded transition-colors"
                        >
                          <MoreHorizontal size={16} className="text-gray-400" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="col-span-5 flex items-center gap-3 min-w-0">
                          <Icon size={20} className="flex-shrink-0 text-gray-400 opacity-60" />
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                        </div>
                        <div className="col-span-3 text-sm text-gray-600">
                          {formatDate(item.updatedAt || item.modifiedTime || item.createdAt)}
                        </div>
                        <div className="col-span-2 text-sm text-gray-600">
                          {formatFileSize(item.size)}
                        </div>
                        <div className="col-span-2 flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">
                            {item.mimeType?.split('/')[0] || item.type || 'file'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContextMenu(e, item);
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <MoreHorizontal size={16} className="text-gray-400" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[200px]"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 220),
            top: Math.min(contextMenu.y, window.innerHeight - 200),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              restoreItem(contextMenu.item);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} className="text-blue-600" />
            Restore
          </button>
          <button
            onClick={() => {
              setDetailsItem(contextMenu.item);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Info size={14} className="text-gray-600" />
            Details
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          <button
            onClick={() => {
              deleteItemPermanently(contextMenu.item);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
          >
            <X size={14} />
            Delete Permanently
          </button>
        </div>
      )}

      {/* Details Modal */}
      {detailsItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-xl shadow-2xl p-6 w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Item Details</h3>
              <button
                onClick={() => setDetailsItem(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                {(() => {
                  const Icon = getFileIcon(detailsItem.type, detailsItem.name, detailsItem.mimeType);
                  return <Icon size={48} className="text-gray-400" />;
                })()}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{detailsItem.name}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {detailsItem.mimeType?.split('/')[0] || detailsItem.type || 'file'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <HardDrive size={16} className="text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Size</p>
                    <p className="text-sm font-medium">{formatFileSize(detailsItem.size)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Deleted</p>
                    <p className="text-sm font-medium">
                      {formatDate(detailsItem.updatedAt || detailsItem.modifiedTime || detailsItem.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-medium">{formatDate(detailsItem.createdAt || detailsItem.createdTime)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Info size={16} className="text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Source</p>
                    <p className="text-sm font-medium capitalize">{detailsItem.source || 'local'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`flex gap-3 mt-6 ${isMobile ? 'flex-col' : ''}`}>
              <button
                onClick={() => {
                  restoreItem(detailsItem);
                  setDetailsItem(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <RotateCcw size={16} />
                Restore
              </button>
              <button
                onClick={() => {
                  deleteItemPermanently(detailsItem);
                  setDetailsItem(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}