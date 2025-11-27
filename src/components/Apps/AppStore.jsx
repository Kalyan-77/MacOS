import { useState, useRef, useEffect } from 'react';
import { X, Search, Star, Download, ChevronRight } from 'lucide-react';

// ✅ Import all app icons properly
import photos from '../../assets/AppIcons/photos.png';
import vscode from '../../assets/AppIcons/vscode.svg';
import music from '../../assets/AppIcons/music.png';
import vlc from '../../assets/AppIcons/vlc.png';
import chess from '../../assets/AppIcons/chess.png';
import tv from '../../assets/AppIcons/TV.jpg';
import calculator from '../../assets/AppIcons/calculator.png';
import calendar from '../../assets/AppIcons/calendar.png';
import contacts from '../../assets/AppIcons/contacts.png';
import mail from '../../assets/AppIcons/mail.png';
import notes from '../../assets/AppIcons/notes.png';
import reminders from '../../assets/AppIcons/reminders.png';

export default function AppStore({ onClose, zIndex = 1000, onFocus   }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 200, y: 100 });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');

  const windowRef = useRef(null);
  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 300,
    startWindowY: 150,
    currentWindowX: 300,
    currentWindowY: 50,
  });

  // ✅ App data
  const featuredApps = [
    {
      id: 1,
      name: 'Gallery',
      developer: 'Apple Inc.',
      icon: photos,
      rating: 4.8,
      price: 'Free',
      category: 'Photos & Video',
      description: 'Organize and edit your photo collection',
    },
    {
      id: 2,
      name: 'Visual Studio Code',
      developer: 'Microsoft Corporation',
      icon: vscode,
      rating: 4.9,
      price: 'Free',
      category: 'Developer Tools',
      description: 'Powerful code editor for modern development',
    },
    {
      id: 3,
      name: 'Spotify',
      developer: 'Spotify AB',
      icon: music,
      rating: 4.7,
      price: 'Free',
      category: 'Music',
      description: 'Listen to millions of songs and podcasts',
    },
    {
      id: 4,
      name: 'VLC Media Player',
      developer: 'VideoLAN',
      icon: vlc,
      rating: 4.8,
      price: 'Free',
      category: 'Entertainment',
      description: 'Play all your media files with ease',
    },
    {
      id: 5,
      name: 'Chess',
      developer: 'Apple Inc.',
      icon: chess,
      rating: 4.6,
      price: 'Free',
      category: 'Games',
      description: 'Classic chess game with AI opponents',
    },
    {
      id: 6,
      name: 'Apple TV',
      developer: 'Apple Inc.',
      icon: tv,
      rating: 4.7,
      price: 'Free',
      category: 'Entertainment',
      description: 'Stream movies, shows, and live TV',
    },
    {
      id: 7,
      name: 'Calculator',
      developer: 'Apple Inc.',
      icon: calculator,
      rating: 4.5,
      price: 'Free',
      category: 'Utilities',
      description: 'Powerful scientific calculator',
    },
    {
      id: 8,
      name: 'Calendar',
      developer: 'Apple Inc.',
      icon: calendar,
      rating: 4.6,
      price: 'Free',
      category: 'Productivity',
      description: 'Keep track of your events and meetings',
    },
    {
      id: 9,
      name: 'Contacts',
      developer: 'Apple Inc.',
      icon: contacts,
      rating: 4.5,
      price: 'Free',
      category: 'Productivity',
      description: 'Manage all your contacts in one place',
    },
    {
      id: 10,
      name: 'Mail',
      developer: 'Apple Inc.',
      icon: mail,
      rating: 4.6,
      price: 'Free',
      category: 'Productivity',
      description: 'Send and receive emails effortlessly',
    },
    {
      id: 11,
      name: 'Notes',
      developer: 'Apple Inc.',
      icon: notes,
      rating: 4.7,
      price: 'Free',
      category: 'Productivity',
      description: 'Capture your thoughts and ideas',
    },
    {
      id: 12,
      name: 'Reminders',
      developer: 'Apple Inc.',
      icon: reminders,
      rating: 4.5,
      price: 'Free',
      category: 'Productivity',
      description: 'Never forget important tasks',
    },
  ];

  const categories = [
    { id: 'productivity', name: 'Productivity', icon: '⚡' },
    { id: 'development', name: 'Development', icon: '💻' },
    { id: 'design', name: 'Design', icon: '🎨' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'games', name: 'Games', icon: '🎮' },
    { id: 'utilities', name: 'Utilities', icon: '🔧' },
  ];

  // ✅ Dragging and resizing logic
  useEffect(() => {
    const windowElement = windowRef.current;
    if (!windowElement) return;

    let highestZ = 1000;
    let animationFrame = null;

    const handleMouseMove = (e) => {
      if (dragState.current.holdingWindow && !isMaximized) {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }

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

          windowElement.style.zIndex = highestZ;
          highestZ += 1;

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

    const handleContextMenu = (e) => {
      if (dragState.current.holdingWindow) {
        e.preventDefault();
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleContextMenu);
    windowElement.addEventListener('mousedown', handleMouseDown);

    windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
    windowElement.style.willChange = 'transform';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleContextMenu);
      windowElement.removeEventListener('mousedown', handleMouseDown);
      
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.body.style.pointerEvents = '';
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isMaximized]);

  const handleClose = () => {
    onClose();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
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

  const handleWindowClick = () => {
    setIsActive(true);
    if (onFocus) onFocus();
  };

  // Filter apps based on search query
  const filteredApps = featuredApps.filter((app) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.name.toLowerCase().includes(query) ||
      app.developer.toLowerCase().includes(query) ||
      app.category.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query)
    );
  });

  return (
    <div
      ref={windowRef}
      className={`fixed bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-200 ${
        isActive ? 'ring-2 ring-blue-500/20' : ''
      } ${
        isMinimized ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      }`}
      style={{
        left: 0,
        top: 0,
        width: isMaximized ? '100vw' : '1000px',
        height: isMaximized ? 'calc(100vh - 25px)' : '600px',
        zIndex: zIndex,
        display: isMinimized ? 'none' : 'block',
        willChange: isDragging ? 'transform' : 'auto',
        transition: isDragging ? 'none' : 'all 0.2s'
      }}
      onClick={() => {
        handleWindowClick();
        if (onFocus) onFocus();
      }}
    >
      {/* Title Bar */}
      <div className="title-bar h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4">
        <div className="traffic-lights flex items-center gap-2">
          <button
            className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition"
            onClick={handleClose}
          ></button>
          <button
            className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition"
            onClick={handleMinimize}
          ></button>
          <button
            className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition"
            onClick={handleMaximize}
          ></button>
        </div>
        <h1 className="text-sm font-medium text-gray-700">App Store</h1>
        <div className="w-8"></div>
      </div>

      {/* Main Content */}
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-56 bg-gray-50 border-r border-gray-200 p-4">
          <button
            onClick={() => setActiveTab('discover')}
            className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition ${
              activeTab === 'discover'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200 text-gray-700'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition ${
              activeTab === 'categories'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200 text-gray-700'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`w-full text-left px-3 py-2 rounded-lg transition ${
              activeTab === 'updates'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200 text-gray-700'
            }`}
          >
            Updates
          </button>
        </div>

        {/* Main Section */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search Bar */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {activeTab === 'discover' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Featured Apps
              </h2>
              <div className="grid grid-cols-2 gap-6 mb-8">
                {filteredApps.slice(0, 2).map((app) => (
                  <div
                    key={app.id}
                    className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white"
                  >
                    <img
                      src={app.icon}
                      alt={app.name}
                      className="w-16 h-16 mb-4 rounded-lg"
                    />
                    <h3 className="text-xl font-bold mb-1">{app.name}</h3>
                    <p className="text-sm opacity-90 mb-4">{app.description}</p>
                    <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition">
                      Get
                    </button>
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Popular Apps
              </h2>
              {filteredApps.length > 0 ? (
                <div className="space-y-4">
                  {filteredApps.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition"
                    >
                      <img
                        src={app.icon}
                        alt={app.name}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {app.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {app.developer}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star
                            size={14}
                            className="fill-yellow-400 text-yellow-400"
                          />
                          <span className="text-sm text-gray-600">
                            {app.rating}
                          </span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-600">
                            {app.category}
                          </span>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 flex items-center gap-2 transition">
                        <Download size={16} /> Get
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  No apps found matching "{searchQuery}"
                </div>
              )}
            </>
          )}

          {activeTab === 'categories' && (
            <div className="grid grid-cols-3 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md text-center transition"
                >
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="text-center text-gray-500 py-12">
              All apps are up to date ✅
            </div>
          )}
        </div>
      </div>
    </div>
  );
}