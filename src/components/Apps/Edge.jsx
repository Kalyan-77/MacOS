
import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Home, Star, MoreHorizontal, Shield, Settings, User, Search, Clock, Bookmark, Globe, TrendingUp, Menu } from 'lucide-react';

// Edge New Tab Component
function EdgeNewTab({ onSearch}) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const quickLinks = [
    { name: 'Bing', url: 'https://www.bing.com', icon: '🔍', color: 'bg-blue-500' },
    { name: 'Google', url: 'https://www.google.com', icon: '🌐', color: 'bg-blue-600' },
    { name: 'GitHub', url: 'https://github.com', icon: '⚡', color: 'bg-gray-800' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '📚', color: 'bg-orange-500' },
    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: '📖', color: 'bg-blue-700' },
    { name: 'CodePen', url: 'https://codepen.io', icon: '✏️', color: 'bg-black' },
    { name: 'Wikipedia', url: 'https://wikipedia.org', icon: '📜', color: 'bg-gray-600' },
    { name: 'Reddit', url: 'https://reddit.com', icon: '💬', color: 'bg-orange-600' }
  ];

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleQuickLink = (url) => {
    onSearch(url);
  };

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Main Search */}
        <div className="text-center mb-8 sm:mb-12 mt-8 sm:mt-16">
          <div className="mb-6 sm:mb-8">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230078D4'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E" 
                 alt="Edge Logo" className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" />
            <h1 className="text-xl sm:text-2xl font-light text-gray-800 mb-2">Good afternoon</h1>
          </div>
          
          <div className="relative max-w-2xl mx-auto px-4 sm:px-0">
            <Search className="absolute left-6 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              placeholder="Search the web"
              className="w-full pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Access */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
            <Star size={18} className="text-blue-500 sm:w-5 sm:h-5" />
            Quick access
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => handleQuickLink(link.url)}
                className="group flex flex-col items-center p-3 sm:p-4 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${link.color} rounded-xl flex items-center justify-center text-white text-lg sm:text-xl mb-2 group-hover:scale-110 transition-transform`}>
                  {link.icon}
                </div>
                <span className="text-xs sm:text-sm text-gray-700 text-center font-medium leading-tight">{link.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EdgeBrowser({ onClose,zIndex = 1000, onFocus   }) {
  // Browser state
  const [url, setUrl] = useState('edge://newtab');
  const [inputUrl, setInputUrl] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSecure, setIsSecure] = useState(true);

  // Window state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 200, y: 100 });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const windowRef = useRef(null);
  const iframeRef = useRef(null);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsMaximized(true);
        // Force full screen positioning on mobile
        dragState.current.currentWindowX = 0;
        dragState.current.currentWindowY = 0;
        if (windowRef.current) {
          windowRef.current.style.transform = 'translate3d(0px, 0px, 0)';
        }
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dragging system
  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 200,
    startWindowY: 100,
    currentWindowX: 300,
    currentWindowY: 50
  });

  // Browser functionality
  function loadContent() {
    if (!inputUrl.trim()) return;
    
    setIsLoading(true);
    let targetUrl = inputUrl;
    
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
        targetUrl = 'https://' + targetUrl;
      } else {
        targetUrl = 'https://www.bing.com/search?q=' + encodeURIComponent(targetUrl);
      }
    }
    
    setUrl(targetUrl);
    setIsSecure(targetUrl.startsWith('https://'));
    setInputUrl(targetUrl);
    
    if (iframeRef.current && targetUrl !== 'edge://newtab') {
      iframeRef.current.src = targetUrl;
    }
    
    setTimeout(() => setIsLoading(false), 1500);
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      loadContent();
    }
  };

  const goBack = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.history.back();
    }
  };

  const goForward = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.history.forward();
    }
  };

  const refresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    setTimeout(() => setIsLoading(false), 1000);
  };

  const goHome = () => {
    const homeUrl = 'edge://newtab';
    setUrl(homeUrl);
    setInputUrl('');
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
  };

  // Initialize dragging system
  useEffect(() => {
    if (isMobile) return; // Disable dragging on mobile
    
    const windowElement = windowRef.current;
    if (!windowElement) return;

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
        const isButton = e.target.closest('.traffic-lights') || e.target.closest('button') || e.target.closest('input');
        
        if (titleBar && !isButton) {
          e.preventDefault();
          e.stopPropagation();

            if (onFocus) {
              onFocus();
            }
          
          dragState.current.holdingWindow = true;
          setIsActive(true);
          setIsDragging(true);

          // z-index handled by parent MacOS via `zIndex` prop

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

    const handleMouseUp = (e) => {
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
  }, [isMaximized, isMobile]);

  // Traffic light handlers
  const handleClose = () => {
    onClose();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    if (isMobile) return; // Prevent maximize/restore on mobile
    
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

  // Calculate responsive dimensions
  const getWindowDimensions = () => {
    if (isMobile) {
      return {
        width: '100vw',
        height: '100vh'
      };
    }
    
    if (isMaximized) {
      return {
        width: '100vw',
        height: 'calc(100vh - 25px)'
      };
    }
    
    const viewportWidth = window.innerWidth;
    if (viewportWidth < 1200) {
      return {
        width: 'calc(100vw - 40px)',
        height: 'calc(100vh - 100px)'
      };
    }
    
    return {
      width: '1000px',
      height: '620px'
    };
  };

  const dimensions = getWindowDimensions();

  return (
    <div
      ref={windowRef}
      className={`fixed bg-white shadow-2xl overflow-hidden transition-all duration-200 ${
        isActive ? 'ring-2 ring-blue-500/20' : ''
      } ${
        isMinimized ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      } ${
        isMobile ? 'rounded-none' : 'rounded-xl'
      }`}
      style={{
        left: 0,
        top: 0,
        width: dimensions.width,
        height: dimensions.height,
        zIndex: zIndex,
        display: isMinimized ? 'none' : 'block',
        willChange: isDragging ? 'transform' : 'auto',
        transition: isDragging ? 'none' : 'all 0.2s'
      }}
      onClick={() =>{
        handleWindowClick();
        if(onFocus) onFocus();
      }}
    >
      {/* Title Bar */}
      <div
        className={`title-bar h-10 sm:h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 select-none transition-colors duration-200 ${
          isActive ? 'bg-gray-100' : 'bg-gray-50'
        }`}
        style={{ 
          cursor: isMobile ? 'default' : 'default',
          WebkitAppRegion: isMobile ? 'no-drag' : 'drag'
        }}
      >
        {/* Traffic Light Buttons */}
        <div className="traffic-lights flex items-center gap-1 sm:gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-150 group flex items-center justify-center"
            onClick={handleClose}
            title="Close"
            style={{ cursor: 'pointer' }}
          >
            <X size={6} className="text-red-800 opacity-0 group-hover:opacity-100 transition-opacity sm:w-2 sm:h-2" />
          </button>
          {!isMobile && (
            <>
              <button
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors duration-150 group flex items-center justify-center"
                onClick={handleMinimize}
                title="Minimize"
                style={{ cursor: 'pointer' }}
              >
                <div className="w-1.5 h-0.5 bg-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <button
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-150 group flex items-center justify-center"
                onClick={handleMaximize}
                title={isMaximized ? "Restore" : "Maximize"}
                style={{ cursor: 'pointer' }}
              >
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 border border-green-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </>
          )}
        </div>

        {/* Window Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
          <h1 className="text-xs sm:text-sm font-medium text-gray-700">Microsoft Edge</h1>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-1 sm:gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <button className="p-1 sm:p-1.5 hover:bg-gray-200 rounded transition-colors hidden sm:block" style={{ cursor: 'pointer' }}>
            <User size={14} className="text-gray-600 sm:w-4 sm:h-4" />
          </button>
          <button className="p-1 sm:p-1.5 hover:bg-gray-200 rounded transition-colors" style={{ cursor: 'pointer' }}>
            <Settings size={14} className="text-gray-600 sm:w-4 sm:h-4" />
          </button>
          <button className="p-1 sm:p-1.5 hover:bg-gray-200 rounded transition-colors" style={{ cursor: 'pointer' }}>
            <MoreHorizontal size={14} className="text-gray-600 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Browser Content */}
      <div className="h-full bg-white flex flex-col" style={{ height: 'calc(100% - 2.5rem)' }}>
        {/* Navigation Bar */}
        <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 border-b border-gray-200 bg-gray-50">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={goBack}
              disabled={!canGoBack}
              className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                canGoBack 
                  ? 'hover:bg-gray-200 text-gray-700' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              style={{ cursor: canGoBack ? 'pointer' : 'not-allowed' }}
            >
              <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
            </button>
            
            <button
              onClick={goForward}
              disabled={!canGoForward}
              className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                canGoForward 
                  ? 'hover:bg-gray-200 text-gray-700' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              style={{ cursor: canGoForward ? 'pointer' : 'not-allowed' }}
            >
              <ChevronRight size={16} className="sm:w-5 sm:h-5" />
            </button>
            
            <button
              onClick={refresh}
              className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
              style={{ cursor: 'pointer' }}
            >
              <RotateCcw size={16} className={`sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={goHome}
              className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-700 hidden sm:block"
              style={{ cursor: 'pointer' }}
            >
              <Home size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Address Bar */}
          <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
            <div className="flex items-center gap-1 sm:gap-2 mr-1 sm:mr-2">
              <Shield size={14} className={`sm:w-4 sm:h-4 ${url.startsWith('https://') ? 'text-green-600' : url.startsWith('edge://') ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
            
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={url === 'edge://newtab' ? 'Search the web' : 'Search or enter web address'}
              className="flex-1 outline-none text-sm text-gray-700"
              style={{ cursor: 'text' }}
            />
            
            <button
              onClick={() => setInputUrl(url === 'edge://newtab' ? '' : url)}
              className="p-1 hover:bg-gray-100 rounded transition-colors hidden sm:block"
              style={{ cursor: 'pointer' }}
            >
              <Star size={14} className="text-gray-500 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Edge Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-700 hidden sm:block" style={{ cursor: 'pointer' }}>
              <Star size={16} className="sm:w-5 sm:h-5" />
            </button>
            <button className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-700" style={{ cursor: 'pointer' }}>
              <Menu size={16} className="sm:hidden" />
              <MoreHorizontal size={16} className="hidden sm:block sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Loading Bar */}
        {isLoading && (
          <div className="h-0.5 sm:h-1 bg-gray-200">
            <div className="h-full bg-blue-500 animate-pulse" style={{ width: '70%' }}></div>
          </div>
        )}

        {/* Browser Frame */}
        <div className="flex-1 relative bg-gray-50">
          {url === 'edge://newtab' ? (
            <EdgeNewTab onSearch={(query) => {
              setInputUrl(query);
              setTimeout(() => loadContent(), 100);
            }} />
          ) : (
            <div className="w-full h-full relative">
              <iframe
                ref={iframeRef}
                id="browser-frame"
                src={url}
                className="w-full h-full border-none bg-white"
                title="Browser Content"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  console.log('Iframe load error, some sites block embedding');
                  setIsLoading(false);
                }}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-popups-to-escape-sandbox"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              />
              {/* Fallback message for blocked sites */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                <div className="text-center p-4 sm:p-8">
                  <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">🚫</div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">Site may be blocked</h3>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-md px-4">
                    Some websites prevent embedding in frames for security. 
                    Try opening the link in a new window or use the direct URL.
                  </p>
                  <button 
                    onClick={() => window.open(url, '_blank')}
                    className="mt-3 sm:mt-4 px-3 sm:px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors pointer-events-auto"
                  >
                    Open in new window
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}