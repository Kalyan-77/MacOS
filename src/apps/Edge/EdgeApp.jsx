import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Home, Star, MoreHorizontal, Shield, Settings, User, Search, Menu } from 'lucide-react';

// Edge New Tab Component
function EdgeNewTab({ onSearch }) {
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
      <div className="max-w-6xl mx-auto p-6">
        {/* Main Search */}
        <div className="text-center mb-12 mt-16">
          <div className="mb-8">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230078D4'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E" 
                 alt="Edge Logo" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-light text-gray-800 mb-2">Good afternoon</h1>
          </div>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              placeholder="Search the web"
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Access */}
        <div className="mb-12">
          <h2 className="text-lg font-medium text-gray-800 mb-6 flex items-center gap-2">
            <Star size={20} className="text-blue-500" />
            Quick access
          </h2>
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-4">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => handleQuickLink(link.url)}
                className="group flex flex-col items-center p-4 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center text-white text-xl mb-2 group-hover:scale-110 transition-transform`}>
                  {link.icon}
                </div>
                <span className="text-sm text-gray-700 text-center font-medium leading-tight">{link.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EdgeBrowser({ userId }) {
  // Browser state
  const [url, setUrl] = useState('edge://newtab');
  const [inputUrl, setInputUrl] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSecure, setIsSecure] = useState(true);
  
  const iframeRef = useRef(null);

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

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Navigation Bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className={`p-2 rounded-md transition-colors ${
              canGoBack 
                ? 'hover:bg-gray-200 text-gray-700' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className={`p-2 rounded-md transition-colors ${
              canGoForward 
                ? 'hover:bg-gray-200 text-gray-700' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronRight size={20} />
          </button>
          
          <button
            onClick={refresh}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
          >
            <RotateCcw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          
          <button
            onClick={goHome}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
          >
            <Home size={20} />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 mr-2">
            <Shield size={16} className={url.startsWith('https://') ? 'text-green-600' : url.startsWith('edge://') ? 'text-blue-600' : 'text-gray-400'} />
          </div>
          
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={url === 'edge://newtab' ? 'Search the web' : 'Search or enter web address'}
            className="flex-1 outline-none text-sm text-gray-700"
          />
          
          <button
            onClick={() => setInputUrl(url === 'edge://newtab' ? '' : url)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Star size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Edge Actions */}
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-700">
            <User size={18} />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-700">
            <Settings size={18} />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-700">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Loading Bar */}
      {isLoading && (
        <div className="h-1 bg-gray-200">
          <div className="h-full bg-blue-500 animate-pulse" style={{ width: '70%' }}></div>
        </div>
      )}

      {/* Browser Frame */}
      <div className="flex-1 relative bg-gray-50 overflow-hidden">
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
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🚫</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Site may be blocked</h3>
                <p className="text-sm text-gray-600 max-w-md">
                  Some websites prevent embedding in frames for security. 
                  Try opening the link in a new window or use the direct URL.
                </p>
                <button 
                  onClick={() => window.open(url, '_blank')}
                  className="mt-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors pointer-events-auto"
                >
                  Open in new window
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}