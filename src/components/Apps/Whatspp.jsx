import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { 
  X, Phone, Video, Search, Paperclip, Smile, Send,
  MoreVertical, Menu, ChevronLeft, Check, CheckCheck, Mic,
  Camera, Trash2, User, ArrowLeft, ChevronDown, LogOut,
  Archive, VolumeX, Ban, ThumbsUp, Reply, Forward, Star, Copy, Info
} from 'lucide-react';
import { BASE_URL } from '../../../config';

// Dropdown Menu Component
const DropdownMenu = ({ options, onClose, x, y, anchorRect, anchorSide = 'right', containerRef }) => {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ left: x || 0, top: y || 0, width: 'auto' });

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const compute = () => {
      const mw = menu.offsetWidth || 200;
      const mh = menu.offsetHeight || 200;
      const padding = 8;

      let left = typeof x === 'number' ? x : null;
      let top = typeof y === 'number' ? y : null;

      const containerRect = containerRef && containerRef.current ? containerRef.current.getBoundingClientRect() : null;

      if (anchorRect) {
        const a = anchorRect;
        const aLeft = containerRect ? a.left - containerRect.left : a.left;
        const aTop = containerRect ? a.top - containerRect.top : a.top;
        const aRight = containerRect ? a.right - containerRect.left : a.right;
        const aBottom = containerRect ? a.bottom - containerRect.top : a.bottom;

        top = aTop;
        if (anchorSide === 'left') {
          left = aLeft - mw - 8;
        } else if (anchorSide === 'right') {
          left = aRight + 8;
        } else if (anchorSide === 'bottom') {
          top = aBottom + 8;
          left = aLeft;
        } else {
          left = aRight + 8;
        }
      }

      if (left === null) left = typeof x === 'number' ? (containerRect ? x - containerRect.left : x) : padding;
      if (top === null) top = typeof y === 'number' ? (containerRect ? y - containerRect.top : y) : padding;

      const viewportWidth = containerRect ? containerRect.width : window.innerWidth;
      const viewportHeight = containerRect ? containerRect.height : window.innerHeight;

      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const width = Math.max((containerRect ? containerRect.width : window.innerWidth) - padding * 2, 200);
        const preferBottom = top > (containerRect ? containerRect.height : window.innerHeight) / 2;
        if (preferBottom) {
          top = Math.max(padding, (containerRect ? containerRect.height : window.innerHeight) - mh - 80);
        } else {
          top = Math.min(Math.max(padding, top), (containerRect ? containerRect.height : window.innerHeight) - mh - padding);
        }
        left = padding;
        setPos({ left, top, width });
        return;
      }

      if (left + mw > viewportWidth - padding) left = viewportWidth - mw - padding;
      if (left < padding) left = padding;
      if (top + mh > viewportHeight - padding) top = viewportHeight - mh - padding;
      if (top < padding) top = padding;

      setPos({ left, top, width: 'auto' });
    };

    const raf = requestAnimationFrame(compute);
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [x, y, anchorRect, anchorSide, containerRef, options]);

  return (
    <div
      ref={menuRef}
      className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-50 min-w-48"
      style={{ top: pos.top, left: pos.left, width: pos.width }}
      onClick={(e) => e.stopPropagation()}
    >
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => {
            option.onClick();
            onClose();
          }}
          className={`w-full px-4 py-2.5 text-left hover:bg-gray-100 flex items-center gap-3 text-sm transition-colors ${
            option.danger ? 'text-red-600' : 'text-gray-700'
          }`}
          disabled={option.disabled}
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
};

// Emoji Picker Component
const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕',
    '💞', '💓', '💗', '💖', '💘', '💝', '🔥', '✨', '💫', '⭐'
  ];

  return (
    <div className="absolute bottom-16 left-0 w-80 h-64 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 overflow-y-auto z-50">
      <div className="grid grid-cols-8 gap-2">
        {emojis.map((emoji, idx) => (
          <button
            key={idx}
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

// Clear Chat Modal
const ClearChatModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Clear chat?</h3>
        <p className="text-gray-600 mb-6">
          Messages will only be removed from this device and your devices on the newer versions of WhatsApp.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-[#008069] hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-[#008069] text-white hover:bg-[#007a5a] rounded-lg transition-colors font-medium"
          >
            Clear chat
          </button>
        </div>
      </div>
    </div>
  );
};

// Profile Panel Component
const ProfilePanel = ({ profile, onClose, onSave, BASE_URL }) => {
  const [name, setName] = useState(profile?.name || '');
  const [about, setAbout] = useState(profile?.about || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    profile?.avatar ? `${BASE_URL}${profile.avatar}` : null
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    onSave({ name, about, avatarFile });
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex">
      <div className="w-96 bg-[#008069] text-white flex flex-col">
        <div className="p-6 flex items-center gap-4">
          <button onClick={onClose} className="hover:bg-white/10 rounded-full p-2">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-medium">Profile</h2>
        </div>
        
        <div className="flex-1 bg-white text-gray-900 p-8 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <User size={80} className="text-gray-500" />
                </div>
              )}
            </div>
            <label className="absolute bottom-2 right-2 bg-[#008069] text-white p-3 rounded-full cursor-pointer hover:bg-[#007a5a] shadow-lg">
              <Camera size={20} />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Click camera icon to change profile photo
          </p>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl">
          <div className="mb-8">
            <label className="block text-sm text-[#008069] mb-2">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#008069] focus:outline-none text-lg"
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm text-[#008069] mb-2">About</label>
            <input
              type="text"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#008069] focus:outline-none text-lg"
              placeholder="Available"
              maxLength={139}
            />
            <p className="text-xs text-gray-500 mt-1">{about.length}/139</p>
          </div>

          <div className="mb-8">
            <label className="block text-sm text-gray-500 mb-2">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-gray-50 border-b-2 border-gray-200 text-gray-600 text-lg cursor-not-allowed"
            />
          </div>

          <button
            onClick={handleSave}
            className="bg-[#008069] text-white px-8 py-3 rounded-lg hover:bg-[#007a5a] transition-colors text-lg font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function WhatsApp({ onClose, zIndex = 1000, onFocus }) {
  // State management
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [dropdown, setDropdown] = useState(null);

  // Real-time states
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  // Window state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 200, y: 100 });

  // Refs
  const windowRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const currentRoomRef = useRef(null);
  const meRef = useRef(null);
  const typingTimeout = useRef(null);

  // Drag state
  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 200,
    startWindowY: 100,
    currentWindowX: 200,
    currentWindowY: 100
  });

  // 🔥 HELPER: Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // 🔥 HELPER: Format message preview
  const formatMessagePreview = (msg) => {
    if (!msg) return '';
    if (msg.deletedForEveryone) return '🚫 This message was deleted';
    if (msg.type === 'text') return msg.text;
    if (msg.type === 'image') return '📷 Photo';
    if (msg.type === 'video') return '🎥 Video';
    if (msg.type === 'audio') return '🎵 Audio';
    return '📎 File';
  };

  // Initialize socket and fetch session
  useEffect(() => {
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        
        socketRef.current = io(BASE_URL, {
          withCredentials: true,
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });

        socketRef.current.on('connect', () => {
          console.log('✅ Socket connected');
          if (currentRoomRef.current) {
            socketRef.current.emit('join-room', currentRoomRef.current);
          }
        });

        socketRef.current.on('receive-message', (msg) => {
          console.log('📩 Message received:', msg);
          
          // Update messages if in the same room
          if (currentRoomRef.current && msg.roomId === currentRoomRef.current) {
            setMessages(prev => {
              const exists = prev.some(m => m._id === msg._id);
              if (exists) return prev;
              return [...prev, msg];
            });

            // Auto mark as seen
            if (msg.sender?._id !== meRef.current?._id) {
              socketRef.current.emit('message-seen', { messageId: msg._id });
            }
          }

          // 🔥 UPDATE USER LIST with last message and time
          const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
          setUsers(prevUsers =>
            prevUsers.map(u => {
              if (u._id === senderId) {
                const isCurrentRoom = currentRoomRef.current === msg.roomId;
                return {
                  ...u,
                  lastMessage: formatMessagePreview(msg),
                  lastMessageTime: msg.createdAt,
                  time: formatTime(msg.createdAt),
                  unread: isCurrentRoom ? u.unread : (u.unread || 0) + 1
                };
              }
              return u;
            })
          );
        });

        socketRef.current.on('message-seen-update', ({ messageId, userId }) => {
          console.log('👁️ Message seen:', messageId, userId);
          setMessages(prev =>
            prev.map(m =>
              m._id === messageId
                ? { ...m, seenBy: [...(m.seenBy || []), userId] }
                : m
            )
          );
        });

        socketRef.current.on('online-users', (ids) => {
          console.log('🟢 Online users:', ids);
          setOnlineUsers(ids);
        });

        socketRef.current.on('user-typing', ({ userId }) => {
          console.log('⌨️ User typing:', userId);
          setTypingUser(userId);
        });

        socketRef.current.on('user-stop-typing', () => {
          console.log('⌨️ User stopped typing');
          setTypingUser(null);
        });

        socketRef.current.on('message-deleted', ({ messageId }) => {
          setMessages(prev =>
            prev.map(m =>
              m._id === messageId ? { ...m, deletedForEveryone: true } : m
            )
          );
        });
      } catch (err) {
        console.error('Socket initialization error:', err);
      }
    };

    initSocket();

    const fetchSession = async () => {
      try {
        const response = await fetch(`${BASE_URL}/auth/checkSession`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.loggedIn) {
          setMe(data.user);
          meRef.current = data.user;
        }
      } catch (err) {
        console.error('Session fetch failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Update room ref
  useEffect(() => {
    currentRoomRef.current = roomId;
    if (socketRef.current && socketRef.current.connected && roomId) {
      socketRef.current.emit('join-room', roomId);
    }
  }, [roomId]);

  // 🔥 Fetch users with last message data
  useEffect(() => {
    if (!me) return;

    const fetchUsersWithLastMessages = async () => {
      try {
        // Get all users
        const usersResponse = await fetch(`${BASE_URL}/chat/users`, { credentials: 'include' });
        const usersData = await usersResponse.json();

        // For each user, fetch their room and last message
        const usersWithMessages = await Promise.all(
          usersData.map(async (user) => {
            try {
              // Get or create room
              const roomResponse = await fetch(`${BASE_URL}/chat/room`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ otherUserId: user._id })
              });
              const room = await roomResponse.json();

              // Get messages for this room
              const messagesResponse = await fetch(`${BASE_URL}/chat/messages/${room._id}`, {
                credentials: 'include'
              });
              const messages = await messagesResponse.json();

              // Get last message
              const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;

              return {
                ...user,
                avatar: user.avatar || '👤',
                lastMessage: lastMsg ? formatMessagePreview(lastMsg) : '',
                lastMessageTime: lastMsg?.createdAt || '',
                time: lastMsg ? formatTime(lastMsg.createdAt) : '',
                unread: 0,
                roomId: room._id
              };
            } catch (err) {
              console.error(`Error fetching data for user ${user._id}:`, err);
              return {
                ...user,
                avatar: user.avatar || '👤',
                lastMessage: '',
                lastMessageTime: '',
                time: '',
                unread: 0
              };
            }
          })
        );

        // Sort by last message time (most recent first)
        usersWithMessages.sort((a, b) => {
          if (!a.lastMessageTime) return 1;
          if (!b.lastMessageTime) return -1;
          return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        });

        setUsers(usersWithMessages);
      } catch (err) {
        console.error('Users fetch error', err);
      }
    };

    fetchUsersWithLastMessages();
  }, [me]);

  // Fetch profile
  useEffect(() => {
    if (!me) return;

    fetch(`${BASE_URL}/profile/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error('Profile fetch error', err));
  }, [me]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = () => setDropdown(null);
    if (dropdown) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [dropdown]);

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

  // Open chat
  const openChat = async (user) => {
    try {
      const response = await fetch(`${BASE_URL}/chat/room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ otherUserId: user._id })
      });
      const room = await response.json();

      setRoomId(room._id);
      setSelectedUser(user);

      const msgsResponse = await fetch(`${BASE_URL}/chat/messages/${room._id}`, {
        credentials: 'include'
      });
      const msgs = await msgsResponse.json();
      setMessages(msgs);

      setUsers(prevUsers =>
        prevUsers.map(u => (u._id === user._id ? { ...u, unread: 0 } : u))
      );
    } catch (err) {
      console.error('Open chat error', err);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!roomId || !text.trim() || !socketRef.current) return;

    socketRef.current.emit('send-message', { roomId, text });

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      roomId,
      text,
      type: 'text',
      sender: me,
      createdAt: new Date().toISOString(),
      read: false,
      seenBy: []
    };

    setMessages(prev => [...prev, tempMessage]);

    // 🔥 Update user list with last message
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u._id === selectedUser._id
          ? {
              ...u,
              lastMessage: text,
              lastMessageTime: tempMessage.createdAt,
              time: formatTime(tempMessage.createdAt)
            }
          : u
      )
    );

    setText('');

    if (socketRef.current) {
      socketRef.current.emit('stop-typing', { roomId });
    }
  };

  // Typing handler
  const handleTyping = (e) => {
    setText(e.target.value);
    if (!roomId || !socketRef.current) return;

    socketRef.current.emit('typing', { roomId });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current.emit('stop-typing', { roomId });
    }, 1200);
  };

  // Send file
  const sendFile = async (file) => {
    if (!file || !roomId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);

    try {
      const response = await fetch(`${BASE_URL}/chat/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const fileMessage = await response.json();
      setMessages(prev => [...prev, fileMessage]);

      // 🔥 Update user list with file message
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u._id === selectedUser._id
            ? {
                ...u,
                lastMessage: formatMessagePreview(fileMessage),
                lastMessageTime: fileMessage.createdAt,
                time: formatTime(fileMessage.createdAt)
              }
            : u
        )
      );
    } catch (err) {
      console.error('File upload error', err);
    }
  };

  // Delete message
  const deleteMessage = async (messageId, type) => {
    try {
      const endpoint =
        type === 'everyone'
          ? `${BASE_URL}/chat/message/everyone/${messageId}`
          : `${BASE_URL}/chat/message/me/${messageId}`;

      await fetch(endpoint, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (type === 'me') {
        setMessages(prev => prev.filter(m => m._id !== messageId));
      }
    } catch (err) {
      console.error('Delete message error', err);
    }
  };

  // Clear chat
  const clearChat = async () => {
    if (!roomId) return;

    try {
      await fetch(`${BASE_URL}/chat/chat/me/${roomId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      setMessages([]);
      setShowClearChatModal(false);

      // 🔥 Update user list
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u._id === selectedUser._id
            ? { ...u, lastMessage: '', lastMessageTime: '', time: '' }
            : u
        )
      );
    } catch (err) {
      console.error('Clear chat error', err);
    }
  };

  // Save profile
  const saveProfile = async ({ name, about, avatarFile }) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('about', about);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      const response = await fetch(`${BASE_URL}/profile/update`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setMe(updatedProfile);
      setShowProfile(false);
    } catch (err) {
      console.error('Profile update error', err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mobileStyles = isMobile
    ? {
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        transform: 'none',
        borderRadius: 0
      }
    : {
        width: isMaximized ? '100vw' : '1100px',
        height: isMaximized ? 'calc(100vh - 25px)' : '700px'
      };

  if (loading) {
    return (
      <div
        ref={windowRef}
        className={`${isMobile ? 'fixed inset-0' : 'fixed'} bg-white ${
          isMobile ? '' : 'rounded-xl shadow-2xl'
        } overflow-hidden`}
        style={{ ...mobileStyles, zIndex }}
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008069] mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading WhatsApp...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div
        ref={windowRef}
        className={`${isMobile ? 'fixed inset-0' : 'fixed'} bg-white ${
          isMobile ? '' : 'rounded-xl shadow-2xl'
        } overflow-hidden`}
        style={{ ...mobileStyles, zIndex }}
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl text-red-600 mb-4">❌ User not logged in</div>
            <p className="text-gray-600">Please log in to use WhatsApp</p>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2 bg-[#008069] text-white rounded-lg hover:bg-[#007a5a] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  return (
    <div
      ref={windowRef}
      className={`${isMobile ? 'fixed inset-0' : 'fixed'} bg-white ${
        isMobile ? '' : 'rounded-xl shadow-2xl'
      } overflow-hidden transition-all duration-200 ${
        isActive ? 'ring-2 ring-[#008069]/20' : ''
      } ${isMinimized ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}
      style={{
        ...mobileStyles,
        zIndex,
        display: isMinimized ? 'none' : 'block',
        willChange: isDragging ? 'transform' : 'auto',
        transition: isDragging ? 'none' : 'all 0.2s'
      }}
      onClick={() => {
        setIsActive(true);
        if (onFocus) onFocus();
      }}
    >
      {showProfile && profile && (
        <ProfilePanel
          profile={profile}
          onClose={() => setShowProfile(false)}
          onSave={saveProfile}
          BASE_URL={BASE_URL}
        />
      )}

      {showClearChatModal && (
        <ClearChatModal
          onConfirm={clearChat}
          onCancel={() => setShowClearChatModal(false)}
        />
      )}

      {!isMobile && (
        <div
          className={`title-bar h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4 select-none transition-colors duration-200 ${
            isActive ? 'bg-gray-100' : 'bg-gray-50'
          }`}
          style={{ cursor: 'default', WebkitAppRegion: 'drag' }}
        >
          <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
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
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
            <div className="text-sm text-gray-700 font-semibold">WhatsApp</div>
          </div>

          <div className="w-20"></div>
        </div>
      )}

      <div
        className="bg-[#f0f2f5] flex"
        style={{ height: isMobile ? '100dvh' : 'calc(100% - 3rem)' }}
      >
        {(!isMobile || !selectedUser) && (
          <div className={`${isMobile ? 'w-full' : 'w-96'} bg-white border-r border-gray-200 flex flex-col`}>
            <div className="bg-[#f0f2f5] p-3 flex items-center justify-between">
              <button
                onClick={() => setShowProfile(true)}
                className="w-10 h-10 rounded-full overflow-hidden hover:opacity-80 transition-opacity"
              >
                {profile?.avatar ? (
                  <img
                    src={`${BASE_URL}${profile.avatar}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xl">
                    👤
                  </div>
                )}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDropdown({
                      type: 'profile',
                      anchorRect: rect,
                      anchorSide: 'right'
                    });
                  }}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <MoreVertical size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-2 bg-white">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search or start new chat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredUsers.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">No users found</div>
              )}
              {filteredUsers.map(user => (
                <div
                  key={user._id}
                  onClick={() => openChat(user)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedUser?._id === user._id ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-2xl overflow-hidden">
                      {user.avatar?.startsWith('/') ? (
                        <img
                          src={`${BASE_URL}${user.avatar}`}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.avatar
                      )}
                    </div>
                    {isUserOnline(user._id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
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
                        <span className="ml-2 bg-[#25d366] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
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

        {(!isMobile || selectedUser) && (
          <div className="flex-1 flex flex-col bg-[#efeae2]">
            {selectedUser ? (
              <>
                <div className="bg-[#f0f2f5] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="p-2 hover:bg-gray-200 rounded-full"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-xl overflow-hidden">
                        {selectedUser.avatar?.startsWith('/') ? (
                          <img
                            src={`${BASE_URL}${selectedUser.avatar}`}
                            alt={selectedUser.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          selectedUser.avatar
                        )}
                      </div>
                      {isUserOnline(selectedUser._id) && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#f0f2f5] rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
                      <p className="text-xs text-gray-500">
                        {typingUser === selectedUser._id
                          ? 'typing...'
                          : isUserOnline(selectedUser._id)
                          ? 'online'
                          : 'offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                      <Video size={20} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                      <Phone size={20} className="text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setDropdown({
                          type: 'chat',
                          anchorRect: rect,
                          anchorSide: 'right'
                        });
                      }}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <MoreVertical size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.map((msg, index) => {
                    const senderId =
                      typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
                    const isMe = senderId === me._id;
                    const senderInfo = isMe ? me : selectedUser;

                    return (
                      <div
                        key={msg._id || `msg-${index}`}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}
                      >
                        {!isMe && (
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                            {senderInfo?.avatar?.startsWith('/') ? (
                              <img
                                src={`${BASE_URL}${senderInfo.avatar}`}
                                alt={senderInfo.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm">
                                {senderInfo?.avatar || '👤'}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="relative group">
                          <div
                            className={`max-w-md px-4 py-2 rounded-lg shadow-sm ${
                              isMe ? 'bg-[#d9fdd3]' : 'bg-white'
                            }`}
                          >
                            {msg.deletedForEveryone ? (
                              <p className="text-sm italic text-gray-500">
                                🚫 This message was deleted
                              </p>
                            ) : (
                              <>
                                {msg.type === 'text' && (
                                  <p className="text-sm whitespace-pre-wrap break-words">
                                    {msg.text}
                                  </p>
                                )}

                                {msg.type === 'image' && msg.file && (
                                  <img
                                    src={`${BASE_URL}${msg.file.url}`}
                                    alt="Shared image"
                                    className="max-w-xs rounded"
                                  />
                                )}

                                {msg.type === 'video' && msg.file && (
                                  <video
                                    controls
                                    className="max-w-xs rounded"
                                    src={`${BASE_URL}${msg.file.url}`}
                                  />
                                )}

                                {msg.type === 'audio' && msg.file && (
                                  <audio controls src={`${BASE_URL}${msg.file.url}`} />
                                )}

                                {msg.type === 'file' && msg.file && (
                                  <a
                                    href={`${BASE_URL}${msg.file.url}`}
                                    download
                                    className="text-blue-600 underline flex items-center gap-2"
                                  >
                                    <Paperclip size={16} />
                                    <span className="text-sm">
                                      {msg.file.name || 'Download file'}
                                    </span>
                                  </a>
                                )}

                                <div className="flex items-center justify-end gap-1 mt-1 text-xs text-gray-500">
                                  <span>
                                    {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  {isMe && (
                                    <>
                                      {msg.seenBy && msg.seenBy.length > 0 ? (
                                        <CheckCheck size={16} className="text-blue-500" />
                                      ) : (
                                        <Check size={16} className="text-gray-500" />
                                      )}
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              const container = e.currentTarget.closest('.relative');
                              const bubble = container && container.querySelector('.max-w-md');

                              if (bubble) {
                                const br = bubble.getBoundingClientRect();
                                setDropdown({
                                  type: 'message',
                                  message: msg,
                                  isMe,
                                  anchorRect: br,
                                  anchorSide: isMe ? 'left' : 'right'
                                });
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setDropdown({
                                  type: 'message',
                                  message: msg,
                                  isMe,
                                  anchorRect: rect,
                                  anchorSide: 'right'
                                });
                              }
                            }}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                          >
                            <ChevronDown size={14} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="bg-[#f0f2f5] px-4 py-3 flex items-center gap-2 relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <Smile size={24} className="text-gray-600" />
                  </button>

                  {showEmojiPicker && (
                    <EmojiPicker
                      onEmojiSelect={(emoji) => setText(text + emoji)}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  )}

                  <label className="p-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer">
                    <Paperclip size={24} className="text-gray-600" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) sendFile(file);
                        e.target.value = '';
                      }}
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="Type a message"
                    value={text}
                    onChange={handleTyping}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-white rounded-lg text-sm focus:outline-none"
                  />

                  {text.trim() ? (
                    <button
                      onClick={sendMessage}
                      className="p-2 bg-[#008069] hover:bg-[#007a5a] rounded-full transition-colors"
                    >
                      <Send size={20} className="text-white" />
                    </button>
                  ) : (
                    <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                      <Mic size={24} className="text-gray-600" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-64 h-64 mx-auto mb-6 opacity-20">
                    <svg viewBox="0 0 303 172" className="w-full h-full text-gray-400">
                      <path
                        fill="currentColor"
                        d="M152.5 86C152.5 51.5 125 23 90.5 23c-34.5 0-62 28.5-62 63s27.5 63 62 63c34.5 0 62-28.5 62-63zm-62-53c29 0 52.5 23.5 52.5 53S119.5 139 90.5 139 38 115.5 38 86s23.5-53 52.5-53zm152.5 0c-34.5 0-62 28.5-62 63s27.5 63 62 63c34.5 0 62-28.5 62-63s-27.5-63-62-63zm0 116c-29 0-52.5-23.5-52.5-53S214 43 243 43s52.5 23.5 52.5 53-23.5 53-52.5 53z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-light text-gray-600 mb-2">WhatsApp Web</h2>
                  <p className="text-gray-500">Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {dropdown && dropdown.type === 'profile' && (
        <DropdownMenu
          anchorRect={dropdown.anchorRect}
          anchorSide={dropdown.anchorSide}
          containerRef={windowRef}
          onClose={() => setDropdown(null)}
          options={[
            {
              label: 'Profile',
              icon: <User size={16} />,
              onClick: () => setShowProfile(true)
            },
            {
              label: 'Settings',
              icon: <MoreVertical size={16} />,
              onClick: () => console.log('Settings')
            },
            {
              label: 'Log out',
              icon: <LogOut size={16} />,
              onClick: () => console.log('Logout'),
              danger: true
            }
          ]}
        />
      )}

      {dropdown && dropdown.type === 'chat' && (
        <DropdownMenu
          anchorRect={dropdown.anchorRect}
          anchorSide={dropdown.anchorSide}
          containerRef={windowRef}
          onClose={() => setDropdown(null)}
          options={[
            {
              label: 'Contact info',
              icon: <Info size={16} />,
              onClick: () => console.log('Contact info')
            },
            {
              label: 'Mute notifications',
              icon: <VolumeX size={16} />,
              onClick: () => console.log('Mute')
            },
            {
              label: 'Clear messages',
              icon: <Trash2 size={16} />,
              onClick: () => setShowClearChatModal(true)
            },
            {
              label: 'Block',
              icon: <Ban size={16} />,
              onClick: () => console.log('Block'),
              danger: true
            }
          ]}
        />
      )}

      {dropdown && dropdown.type === 'message' && (
        <DropdownMenu
          anchorRect={dropdown.anchorRect}
          anchorSide={dropdown.anchorSide}
          containerRef={windowRef}
          onClose={() => setDropdown(null)}
          options={[
            {
              label: 'Reply',
              icon: <Reply size={16} />,
              onClick: () => console.log('Reply')
            },
            {
              label: 'React',
              icon: <ThumbsUp size={16} />,
              onClick: () => console.log('React')
            },
            {
              label: 'Forward',
              icon: <Forward size={16} />,
              onClick: () => console.log('Forward')
            },
            {
              label: 'Star',
              icon: <Star size={16} />,
              onClick: () => console.log('Star')
            },
            {
              label: 'Copy',
              icon: <Copy size={16} />,
              onClick: () => {
                if (dropdown.message.text) {
                  navigator.clipboard.writeText(dropdown.message.text);
                }
              }
            },
            {
              label: 'Delete for me',
              icon: <Trash2 size={16} />,
              onClick: () => deleteMessage(dropdown.message._id, 'me')
            },
            ...(dropdown.isMe ? [{
              label: 'Delete for everyone',
              icon: <Trash2 size={16} />,
              onClick: () => deleteMessage(dropdown.message._id, 'everyone'),
              danger: true
            }] : [])
          ]}
        />
      )}
    </div>
  );
}