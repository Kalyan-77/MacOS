import { useState, useRef, useEffect } from 'react';
import { 
  X, Phone, Video, Search, Paperclip, Smile, Send,
  MoreVertical, Menu, ChevronLeft, Check, CheckCheck, Mic
} from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { BASE_URL } from '../../../config';

// const BACKEND_URL = "http://localhost:5000";

export default function Whatsapp({ onClose, zIndex = 1000, onFocus }) {
  // Real user data from backend
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  // Window state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 50, y: 50 });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const windowRef = useRef(null);
  const messagesEndRef = useRef(null);
  const currentRoomRef = useRef(null);
  const meRef = useRef(null);
  const socketRef = useRef(null);

  // Keep roomId and me in sync with refs
  useEffect(() => {
    currentRoomRef.current = roomId;
  }, [roomId]);
  
  useEffect(() => {
    meRef.current = me;
  }, [me]);

  // Dragging variables
  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 200,
    startWindowY: 100,
    currentWindowX: 200,
    currentWindowY: 100
  });

  // ✅ FIX: Initialize socket properly with cleanup
  useEffect(() => {
    console.log("🔌 Initializing socket connection...");
    
    // Create new socket connection
    socketRef.current = io(BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setSocketConnected(true);
      
      // Re-join room if we were in one
      if (currentRoomRef.current) {
        console.log("🔁 Re-joining room after reconnect:", currentRoomRef.current);
        socket.emit("join-room", currentRoomRef.current);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("🔴 Connection error:", error);
      setSocketConnected(false);
    });

    // Handle incoming messages
    socket.on("receive-message", (msg) => {
      console.log("📩 MESSAGE RECEIVED:", msg);
      console.log("Current room:", currentRoomRef.current);
      console.log("Message roomId:", msg.roomId);
      
      // Get sender ID from message
      const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
      
      // Add message if it's for the current room
      if (currentRoomRef.current && msg.roomId === currentRoomRef.current) {
        setMessages(prev => {
          // Check for duplicates
          const exists = prev.some(m => m._id === msg._id);
          if (exists) return prev;
          return [...prev, msg];
        });
      }
      
      // Always update user list with latest message (for all rooms)
      setUsers(prevUsers => 
        prevUsers.map(u => {
          // Update the user who sent this message
          if (u._id === senderId) {
            return { 
              ...u, 
              lastMessage: msg.text || 'File', 
              time: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              unread: currentRoomRef.current === msg.roomId ? u.unread : (u.unread || 0) + 1
            };
          }
          return u;
        })
      );
    });

    // Fetch user session
    const fetchSession = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/auth/checkSession`,
          { withCredentials: true }
        );

        console.log("SESSION RESPONSE:", res.data);

        if (res.data.loggedIn) {
          setMe(res.data.user);
        }
      } catch (err) {
        console.error("Session fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket connection");
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("connect_error");
        socketRef.current.off("receive-message");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

  // Join room when roomId changes
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && roomId) {
      console.log("🔁 Joining room:", roomId);
      socketRef.current.emit("join-room", roomId);
    }
  }, [roomId, socketConnected]);

  // Fetch users list
  useEffect(() => {
    if (!me) return;

    axios.get(`${BASE_URL}/chat/users`, {
      withCredentials: true
    })
    .then(res => {
      // Add avatar and status to users
      const usersWithMeta = res.data.map(u => ({
        ...u,
        avatar: u.avatar || '👤',
        status: 'online',
        lastMessage: '',
        time: '',
        unread: 0
      }));
      setUsers(usersWithMeta);
    })
    .catch(err => console.error("Users fetch error", err));
  }, [me]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUser]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Window dragging logic
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

  // Open chat with a user
  const openChat = async (user) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/chat/room`,
        { otherUserId: user._id },
        { withCredentials: true }
      );

      const room = res.data._id;
      setRoomId(room);
      setSelectedUser(user);

      console.log("🔔 Opening room:", room);

      // Fetch all messages for this room
      const msgs = await axios.get(
        `${BASE_URL}/chat/messages/${room}`,
        { withCredentials: true }
      );

      console.log("📨 Loaded messages:", msgs.data);
      setMessages(msgs.data);
      
      // Reset unread count for this user
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === user._id ? { ...u, unread: 0 } : u
        )
      );
      
      if (isMobile) {
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error("Open chat error", err);
    }
  };

  const sendMessage = () => {
    if (!roomId || !text.trim() || !socketRef.current) return;

    console.log("📤 Sending message:", { roomId, text });
    socketRef.current.emit("send-message", {
      roomId,
      text
    });

    // Add message to UI immediately for instant feedback
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      roomId,
      text,
      type: 'text',
      sender: me,
      createdAt: new Date().toISOString(),
      read: false
    };
    
    setMessages(prev => [...prev, tempMessage]);

    // Update local user list
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u._id === selectedUser._id
          ? { 
              ...u, 
              lastMessage: text, 
              time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            }
          : u
      )
    );

    setText('');
  };

  const sendFile = async (file) => {
    if (!file || !roomId) return;

    const form = new FormData();
    form.append("file", file);
    form.append("roomId", roomId);

    try {
      const response = await axios.post(
        `${BASE_URL}/chat/upload`,
        form,
        { withCredentials: true }
      );

      // Add file message to UI immediately
      const fileMessage = response.data;
      setMessages(prev => [...prev, fileMessage]);

      console.log("📎 File uploaded:", fileMessage);
    } catch (err) {
      console.error("File upload error", err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      sendFile(file);
    }
    e.target.value = '';
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Show loading state
  if (loading) {
    return (
      <div
        ref={windowRef}
        className={`${isMobile ? 'fixed inset-0' : 'fixed'} bg-white ${isMobile ? '' : 'rounded-xl shadow-2xl'} overflow-hidden`}
        style={{
          left: isMobile ? 0 : undefined,
          top: isMobile ? 0 : undefined,
          ...mobileStyles,
          zIndex: zIndex,
        }}
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-gray-600 mb-2">Loading WhatsApp...</div>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login required state
  if (!me) {
    return (
      <div
        ref={windowRef}
        className={`${isMobile ? 'fixed inset-0' : 'fixed'} bg-white ${isMobile ? '' : 'rounded-xl shadow-2xl'} overflow-hidden`}
        style={{
          left: isMobile ? 0 : undefined,
          top: isMobile ? 0 : undefined,
          ...mobileStyles,
          zIndex: zIndex,
        }}
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl text-red-600 mb-4">❌ User not logged in</div>
            <p className="text-gray-600">Please log in to use WhatsApp</p>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={windowRef}
      className={`${isMobile ? 'fixed inset-0' : 'fixed'} bg-white ${isMobile ? '' : 'rounded-xl shadow-2xl'} overflow-hidden transition-all duration-200 ${
        isActive ? 'ring-2 ring-green-500/20' : ''
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
          
          {isMobile && !selectedUser && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
          )}
          
          {isMobile && selectedUser && (
            <button
              onClick={() => setSelectedUser(null)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
          )}
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-sm'} text-gray-700`}>
            <span className="font-semibold">WhatsApp</span>
            {!socketConnected && (
              <span className="text-xs text-red-500">(Disconnected)</span>
            )}
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
      <div className="h-full bg-[#f0f2f5] flex" style={{ height: `calc(100% - ${isMobile ? '3.5rem' : '3rem'})` }}>
        {/* Chat List Sidebar */}
        {(!isMobile || !selectedUser) && (
          <div className={`${isMobile ? 'w-full' : 'w-96'} bg-white border-r border-gray-200 flex flex-col`}>
            {/* Search Bar */}
            <div className="p-3 bg-white border-b border-gray-200">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search or start new chat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto">
              {users.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No users found
                </div>
              )}
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => openChat(user)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedUser?._id === user._id ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-2xl">
                      {user.avatar}
                    </div>
                    {user.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                      <span className="text-xs text-gray-500">{user.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{user.lastMessage}</p>
                      {user.unread > 0 && (
                        <span className="ml-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {user.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        {(!isMobile || selectedUser) && (
          <div className="flex-1 flex flex-col bg-[#efeae2]">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-xl">
                        {selectedUser.avatar}
                      </div>
                      {selectedUser.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
                      <p className="text-xs text-gray-500">
                        {selectedUser.status === 'online' ? 'online' : 'offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Video size={20} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Phone size={20} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <MoreVertical size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {!roomId && (
                    <div className="text-center text-gray-500 mt-8">
                      Select a user to start chatting
                    </div>
                  )}
                  {messages.map((msg, index) => {
                    // Check if message is from current user - handle both string and object sender
                    const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
                    const isMe = senderId === me._id;
                    
                    return (
                      <div
                        key={msg._id || `msg-${index}`}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2 rounded-lg shadow-sm ${
                            isMe
                              ? 'bg-[#d9fdd3] text-gray-900'
                              : 'bg-white text-gray-900'
                          }`}
                        >
                          {msg.type === "text" && (
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                          )}
                          
                          {msg.type === "image" && msg.file && (
                            <div>
                              <img
                                src={`${BASE_URL}${msg.file.url}`}
                                alt="Shared image"
                                className="max-w-xs rounded"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <div style={{ display: 'none' }} className="text-sm text-red-500">
                                Failed to load image
                              </div>
                            </div>
                          )}

                          {msg.type === "video" && msg.file && (
                            <video
                              controls
                              className="max-w-xs rounded"
                              src={`${BASE_URL}${msg.file.url}`}
                            />
                          )}

                          {msg.type === "audio" && msg.file && (
                            <audio
                              controls
                              src={`${BASE_URL}${msg.file.url}`}
                              className="max-w-xs"
                            />
                          )}

                          {msg.type === "file" && msg.file && (
                            <a
                              href={`${BASE_URL}${msg.file.url}`}
                              download
                              className="text-blue-600 underline flex items-center gap-2 hover:text-blue-800"
                            >
                              <Paperclip size={16} />
                              <span className="text-sm">{msg.file.name || 'Download file'}</span>
                            </a>
                          )}
                          
                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            isMe ? 'text-gray-600' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">
                              {new Date(msg.createdAt).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {isMe && (
                              msg.read ? (
                                <CheckCheck size={14} className="text-blue-500" />
                              ) : (
                                <Check size={14} />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Smile size={24} className="text-gray-600" />
                  </button>
                  <label className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                    <Paperclip size={24} className="text-gray-600" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Type a message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {text.trim() ? (
                    <button
                      onClick={sendMessage}
                      className="p-2 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
                    >
                      <Send size={20} className="text-white" />
                    </button>
                  ) : (
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Mic size={24} className="text-gray-600" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-64 h-64 mx-auto mb-6 opacity-20">
                    <svg viewBox="0 0 303 172" className="w-full h-full">
                      <path fill="currentColor" d="M152.5 86C152.5 51.5 125 23 90.5 23c-34.5 0-62 28.5-62 63s27.5 63 62 63c34.5 0 62-28.5 62-63zm-62-53c29 0 52.5 23.5 52.5 53S119.5 139 90.5 139 38 115.5 38 86s23.5-53 52.5-53zm152.5 0c-34.5 0-62 28.5-62 63s27.5 63 62 63c34.5 0 62-28.5 62-63s-27.5-63-62-63zm0 116c-29 0-52.5-23.5-52.5-53S214 43 243 43s52.5 23.5 52.5 53-23.5 53-52.5 53z"/>
                    </svg>
                  </div>
                  <h2 className="text-3xl font-light text-gray-600 mb-2">WhatsApp Web</h2>
                  <p className="text-gray-500 mb-6">
                    Send and receive messages without keeping your phone online.
                  </p>
                  <p className="text-sm text-gray-400">
                    Select a chat to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}