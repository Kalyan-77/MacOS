import { useState, useRef, useEffect } from 'react';
import { 
  X, Search, Sparkles, Send, Menu,
  Clock, TrendingUp, Code, BookOpen, Lightbulb,
  Copy, ThumbsUp, ThumbsDown, Share2, Globe, Zap,
  Loader, AlertCircle, Lock, Key
} from 'lucide-react';

import { BASE_URL } from '../../../config';

export default function Perplexity({ onClose, userId, zIndex = 1000, onFocus }) {
  // Window state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 100, y: 100 });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // API Key Modal state
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [hasValidApiKey, setHasValidApiKey] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
  
  // Chat state
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm your AI research assistant powered by Perplexity. Ask me anything and I'll search the web to give you accurate, up-to-date answers.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState('search');
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  const windowRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Dragging variables
  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 100,
    startWindowY: 100,
    currentWindowX: 100,
    currentWindowY: 100
  });

  // Quick prompts
  const quickPrompts = [
    { icon: TrendingUp, text: "What's trending in AI today?", color: "text-blue-500" },
    { icon: Code, text: "Explain quantum computing simply", color: "text-purple-500" },
    { icon: BookOpen, text: "Latest developments in space exploration", color: "text-green-500" },
    { icon: Lightbulb, text: "How does ChatGPT work?", color: "text-yellow-500" }
  ];

  // Search modes
  const modes = [
    { id: 'search', name: 'General', icon: Search, description: 'Web search' },
    { id: 'academic', name: 'Academic', icon: BookOpen, description: 'Research papers' },
    { id: 'code', name: 'Code', icon: Code, description: 'Programming' },
    { id: 'creative', name: 'Creative', icon: Sparkles, description: 'Creative content' }
  ];

  // Check API key on component mount
  useEffect(() => {
    checkApiKey();
  }, [userId]);

  // Fetch user session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/checkSession`, { 
          credentials: 'include' 
        });
        const data = await res.json();
        if (data.loggedIn) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Error fetching user session:", err);
      }
    };
    
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Check if API key exists and is valid
  const checkApiKey = async () => {
    if (!userId) {
      setIsCheckingApiKey(false);
      setHasValidApiKey(false);
      return;
    }

    setIsCheckingApiKey(true);
    
    try {
      const response = await fetch(`${BASE_URL}/config/get/${userId}`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.perplexity_API_exists) {
        setHasValidApiKey(true);
        setApiKey(data.perplexity_API_masked || '');
      } else {
        setHasValidApiKey(false);
        setShowApiKeyModal(true);
      }
    } catch (error) {
      console.error("Error checking API key:", error);
      setHasValidApiKey(false);
      setShowApiKeyModal(true);
    } finally {
      setIsCheckingApiKey(false);
    }
  };

  // Save API key
  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      setApiKeyError('Please enter a valid API key');
      return;
    }

    // Basic validation for Perplexity API key format
    if (!apiKeyInput.startsWith('pplx-')) {
      setApiKeyError('Invalid API key format. Perplexity API keys start with "pplx-"');
      return;
    }

    setSavingApiKey(true);
    setApiKeyError('');

    try {
      const response = await fetch(`${BASE_URL}/config/save/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          perplexity_API: apiKeyInput.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setHasValidApiKey(true);
        setShowApiKeyModal(false);
        setApiKeyInput('');
        setApiKey('***' + apiKeyInput.slice(-4));
        
        // Show success message
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'assistant',
          content: "✅ API key saved successfully! You can now start chatting.",
          timestamp: new Date()
        }]);
      } else {
        setApiKeyError(data.message || 'Failed to save API key');
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      setApiKeyError('Failed to save API key. Please try again.');
    } finally {
      setSavingApiKey(false);
    }
  };

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check if user is authenticated
    if (!userId) {
      setError("Please log in to use Perplexity AI.");
      return;
    }

    // Check if API key is valid
    if (!hasValidApiKey) {
      setShowApiKeyModal(true);
      setError("Please configure your Perplexity API key first.");
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/perplexity/chat/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: currentInput })
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for specific API key errors
        if (response.status === 401 || data.message?.includes('API key')) {
          setHasValidApiKey(false);
          setShowApiKeyModal(true);
          throw new Error('Invalid API key. Please update your API key.');
        }
        
        throw new Error(data.message || 'Failed to generate response');
      }

      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.data,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Perplexity API Error:", error);
      
      let errorMessage = error.message || "Failed to generate response. Please try again.";
      
      setError(errorMessage);
      
      const errorMsg = {
        id: Date.now() + 1,
        type: 'error',
        content: errorMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    if (!hasValidApiKey) {
      setShowApiKeyModal(true);
      return;
    }
    setInput(prompt);
    inputRef.current?.focus();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Window management (keeping existing code)
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
    width: isMaximized ? '100vw' : '1000px',
    height: isMaximized ? 'calc(100vh - 25px)' : '600px',
  };

  return (
    <>
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
        {/* Title Bar */}
        <div
          className={`title-bar ${isMobile ? 'h-14' : 'h-12'} bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-between px-4 select-none`}
          style={{ 
            cursor: isMobile ? 'default' : 'default',
            WebkitAppRegion: isMobile ? 'no-drag' : 'drag'
          }}
        >
          <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
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
            
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/20 rounded transition-colors"
              >
                <Menu size={20} className="text-white" />
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Sparkles size={20} className="text-white animate-pulse" />
                <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-ping"></div>
              </div>
              <span className="text-white font-semibold">Perplexity AI</span>
            </div>
          </div>

          <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
            {/* API Key Status Indicator */}
            {!isMobile && (
              <button
                onClick={() => setShowApiKeyModal(true)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  hasValidApiKey 
                    ? 'bg-green-500/20 text-green-100 hover:bg-green-500/30' 
                    : 'bg-red-500/20 text-red-100 hover:bg-red-500/30 animate-pulse'
                }`}
                title={hasValidApiKey ? 'API Key configured' : 'Configure API Key'}
              >
                {hasValidApiKey ? <Key size={14} /> : <Lock size={14} />}
                <span>{hasValidApiKey ? 'API: ' + apiKey : 'No API Key'}</span>
              </button>
            )}
            
            {user && !isMobile && (
              <div className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded-full">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {(user.name || user.email)?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-white">{user.name || user.email}</span>
              </div>
            )}
            
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

        {/* Main Content */}
        <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 flex" style={{ height: `calc(100% - ${isMobile ? '3.5rem' : '3rem'})` }}>
          {/* Sidebar */}
          <div className={`${
            isMobile 
              ? `fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }` 
              : 'w-64 bg-white/80 backdrop-blur-sm'
          } border-r border-gray-200 flex flex-col`}>
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Search Mode</h3>
              <div className="space-y-1">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg text-sm transition-colors ${
                        selectedMode === mode.id 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 border border-purple-200' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} className={selectedMode === mode.id ? 'text-purple-600' : 'text-gray-400'} />
                      <div className="flex-1">
                        <div className="font-medium">{mode.name}</div>
                        <div className="text-xs text-gray-500">{mode.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Topics</h3>
              <div className="space-y-2">
                {messages.filter(m => m.type === 'user').slice(-5).reverse().map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (hasValidApiKey) {
                        setInput(msg.content);
                      } else {
                        setShowApiKeyModal(true);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Clock size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="flex-1 truncate">{msg.content}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 space-y-2">
              <button 
                onClick={() => setShowApiKeyModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all"
              >
                <Key size={16} />
                <span className="font-medium">API Settings</span>
              </button>
              
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-200">
                <Zap size={16} />
                <span className="font-medium">Upgrade to Pro</span>
              </button>
            </div>
          </div>

          {isMobile && sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Loading Overlay */}
            {isCheckingApiKey && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="text-center">
                  <Loader size={40} className="text-purple-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Checking API configuration...</p>
                </div>
              </div>
            )}
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {messages.length === 1 && (
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
                      <Sparkles size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      Ask anything
                    </h2>
                    <p className="text-gray-600">Get instant, accurate answers with real-time web search</p>
                    
                    {!hasValidApiKey && (
                      <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Lock size={20} className="text-yellow-600" />
                          <span className="font-semibold text-yellow-800">API Key Required</span>
                        </div>
                        <p className="text-sm text-yellow-700 mb-3">
                          Configure your Perplexity API key to start chatting
                        </p>
                        <button
                          onClick={() => setShowApiKeyModal(true)}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium"
                        >
                          Configure API Key
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                    {quickPrompts.map((prompt, index) => {
                      const Icon = prompt.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => handleQuickPrompt(prompt.text)}
                          disabled={!hasValidApiKey}
                          className={`flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left group ${
                            !hasValidApiKey ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${
                            index === 0 ? 'from-blue-100 to-blue-200' :
                            index === 1 ? 'from-purple-100 to-purple-200' :
                            index === 2 ? 'from-green-100 to-green-200' :
                            'from-yellow-100 to-yellow-200'
                          }`}>
                            <Icon size={20} className={prompt.color} />
                          </div>
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">{prompt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="max-w-3xl mx-auto space-y-6">
                {messages.slice(1).map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
                    {message.type === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                        <Sparkles size={16} className="text-white" />
                      </div>
                    )}
                    
                    <div className={`flex-1 ${message.type === 'user' ? 'max-w-lg' : ''}`}>
                      <div className={`p-4 rounded-xl ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white ml-auto shadow-md' 
                          : message.type === 'error'
                          ? 'bg-red-50 border border-red-200 text-red-700'
                          : 'bg-white border border-gray-200 shadow-sm'
                      }`}>
                        {message.type === 'error' && (
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle size={16} className="text-red-500" />
                            <span className="text-sm font-semibold">Error</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                      
                      {message.type === 'assistant' && (
                        <div className="flex items-center gap-2 mt-2">
                          <button 
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors" 
                            title="Copy"
                          >
                            <Copy size={14} className="text-gray-400" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Like">
                            <ThumbsUp size={14} className="text-gray-400" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Dislike">
                            <ThumbsDown size={14} className="text-gray-400" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Share">
                            <Share2 size={14} className="text-gray-400" />
                          </button>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-xs font-bold text-white">
                          {(user?.name || user?.email)?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader size={16} className="text-purple-600 animate-spin" />
                          <span className="text-sm text-gray-600">Searching the web...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
              <div className="max-w-3xl mx-auto">
                {!hasValidApiKey && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-700">
                    <Lock size={16} className="flex-shrink-0" />
                    <span>Configure your API key to start chatting</span>
                    <button
                      onClick={() => setShowApiKeyModal(true)}
                      className="ml-auto px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-xs font-medium"
                    >
                      Setup
                    </button>
                  </div>
                )}
                
                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{error}</span>
                    <button 
                      onClick={() => setError(null)}
                      className="ml-auto p-1 hover:bg-red-100 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                
                <div className="flex items-end gap-2">
                  <div className={`flex-1 bg-white rounded-xl border border-gray-200 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all shadow-sm ${
                    !hasValidApiKey ? 'opacity-50' : ''
                  }`}>
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      onClick={() => {
                        if (!hasValidApiKey) {
                          setShowApiKeyModal(true);
                        }
                      }}
                      placeholder={hasValidApiKey ? "Ask anything..." : "Configure API key to start"}
                      className="w-full px-4 py-3 bg-transparent border-none outline-none resize-none text-sm"
                      rows={1}
                      style={{ maxHeight: '120px' }}
                      disabled={isLoading || !hasValidApiKey}
                    />
                  </div>
                  
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading || !hasValidApiKey}
                    className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg shadow-purple-200"
                    title={!hasValidApiKey ? "Configure API key first" : "Send message"}
                  >
                    {isLoading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Press Enter to send</span>
                    <span className="hidden sm:inline">Shift + Enter for new line</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe size={12} />
                    <span>Real-time web search</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Key size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Perplexity API Key</h2>
                    <p className="text-sm text-white/80">Required to use AI features</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">How to get your API key:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Visit <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="underline font-medium">perplexity.ai/settings/api</a></li>
                      <li>Sign in to your account</li>
                      <li>Generate a new API key</li>
                      <li>Copy and paste it below</li>
                    </ol>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setApiKeyError('');
                  }}
                  placeholder="pplx-xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  disabled={savingApiKey}
                />
                
                {apiKeyError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{apiKeyError}</span>
                  </div>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  Your API key is stored securely and never shared. Keys start with "pplx-"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={savingApiKey}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveApiKey}
                  disabled={!apiKeyInput.trim() || savingApiKey}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingApiKey ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save API Key'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}