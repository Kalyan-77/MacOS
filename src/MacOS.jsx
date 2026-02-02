import TopBar from "./components/TopBar/TopBar";
import Dock from "./components/Dock/Dock";
import MacWindow from "./components/MacWindow";
import { WindowProvider, useWindows } from "./context/WindowContext";
import wallpaper from "./assets/Wallpaper/img1.jpg";
import folderIcon from "./assets/BasicIcons/folder.png";
import fileIcon from "./assets/BasicIcons/file.png";
import NotePad from "./components/Apps/NotePad";
import { useState, useEffect, useRef } from "react";
import Terminal from "./components/Apps/Terminal";
import FileManager from "./components/Apps/Finder";
import { BASE_URL } from "../config";

// Desktop Item Component
const DesktopItem = ({ item, onDoubleClick, onRightClick, isSelected, onClick, onMenuClick, position, onPositionChange }) => {
  const icon = item.type === "folder" ? folderIcon : fileIcon;
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const menuRef = useRef(null);
  const itemRef = useRef(null);

  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPosX: position?.x || 0,
    startPosY: position?.y || 0,
    currentX: position?.x || 0,
    currentY: position?.y || 0
  });

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (action) => {
    setShowMenu(false);
    onMenuClick(item, action);
  };

  useEffect(() => {
    const itemElement = itemRef.current;
    if (!itemElement) return;

    let animationFrame = null;

    const handleMouseMove = (e) => {
      if (dragState.current.isDragging) {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }

        const deltaX = e.clientX - dragState.current.startX;
        const deltaY = e.clientY - dragState.current.startY;

        dragState.current.currentX = dragState.current.startPosX + deltaX;
        dragState.current.currentY = dragState.current.startPosY + deltaY;

        const minX = 0;
        const minY = 0;
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 200;

        dragState.current.currentX = Math.max(minX, Math.min(maxX, dragState.current.currentX));
        dragState.current.currentY = Math.max(minY, Math.min(maxY, dragState.current.currentY));

        animationFrame = requestAnimationFrame(() => {
          itemElement.style.transform = `translate3d(${dragState.current.currentX}px, ${dragState.current.currentY}px, 0)`;
        });
      }
    };

    const handleMouseDown = (e) => {
      if (e.button === 0 && !e.target.closest('button') && !e.target.closest('.dropdown-menu')) {
        e.preventDefault();
        e.stopPropagation();

        dragState.current.isDragging = true;
        setIsDragging(true);
        onClick(item);

        dragState.current.startX = e.clientX;
        dragState.current.startY = e.clientY;
        dragState.current.startPosX = dragState.current.currentX;
        dragState.current.startPosY = dragState.current.currentY;

        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
      }
    };

    const handleMouseUp = () => {
      if (dragState.current.isDragging) {
        dragState.current.isDragging = false;
        setIsDragging(false);

        document.body.style.userSelect = '';
        document.body.style.cursor = '';

        if (onPositionChange) {
          onPositionChange(item._id, {
            x: dragState.current.currentX,
            y: dragState.current.currentY
          });
        }

        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    itemElement.addEventListener('mousedown', handleMouseDown);

    itemElement.style.transform = `translate3d(${dragState.current.currentX}px, ${dragState.current.currentY}px, 0)`;
    itemElement.style.willChange = 'transform';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      itemElement.removeEventListener('mousedown', handleMouseDown);

      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [item, onClick, onPositionChange]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div
      ref={itemRef}
      className="flex flex-col items-center justify-center group w-20 p-2 rounded absolute"
      onDoubleClick={() => onDoubleClick(item)}
      onContextMenu={(e) => onRightClick(e, item)}
      style={{
        left: 0,
        top: 0,
        transition: isDragging ? 'none' : 'all 0.2s',
        zIndex: isSelected ? 100 : 1
      }}
    >
      <button
        onClick={handleMenuClick}
        className="absolute top-1 right-1 w-6 h-6 bg-gray-800 bg-opacity-70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-700 z-10"
      >
        <span className="text-white text-xs">⋮</span>
      </button>

      {showMenu && (
        <div
          ref={menuRef}
          className="dropdown-menu absolute top-8 right-0 bg-gray-800 bg-opacity-95 backdrop-blur-md rounded-lg shadow-2xl py-1 min-w-40 z-50 border border-gray-600"
        >
          <button
            className="w-full px-3 py-1.5 text-left text-white hover:bg-blue-600 flex items-center space-x-2 text-sm"
            onClick={() => handleMenuAction('open')}
          >
            <span>📂</span>
            <span>Open</span>
          </button>
          <button
            className="w-full px-3 py-1.5 text-left text-white hover:bg-blue-600 flex items-center space-x-2 text-sm"
            onClick={() => handleMenuAction('rename')}
          >
            <span>✏️</span>
            <span>Rename</span>
          </button>
          <div className="border-t border-gray-600 my-1"></div>
          <button
            className="w-full px-3 py-1.5 text-left text-white hover:bg-blue-600 flex items-center space-x-2 text-sm"
            onClick={() => handleMenuAction('copy')}
          >
            <span>📋</span>
            <span>Copy</span>
          </button>
          <button
            className="w-full px-3 py-1.5 text-left text-white hover:bg-blue-600 flex items-center space-x-2 text-sm"
            onClick={() => handleMenuAction('duplicate')}
          >
            <span>📑</span>
            <span>Duplicate</span>
          </button>
          <div className="border-t border-gray-600 my-1"></div>
          <button
            className="w-full px-3 py-1.5 text-left text-white hover:bg-yellow-600 flex items-center space-x-2 text-sm"
            onClick={() => handleMenuAction('trash')}
          >
            <span>🗑️</span>
            <span>Move to Trash</span>
          </button>
          <button
            className="w-full px-3 py-1.5 text-left text-white hover:bg-red-600 flex items-center space-x-2 text-sm"
            onClick={() => handleMenuAction('delete')}
          >
            <span>⚠️</span>
            <span>Delete Forever</span>
          </button>
          <div className="border-t border-gray-600 my-1"></div>
          <button
            className="w-full px-3 py-1.5 text-left text-white hover:bg-blue-600 flex items-center space-x-2 text-sm"
            onClick={() => handleMenuAction('info')}
          >
            <span>ℹ️</span>
            <span>Get Info</span>
          </button>
        </div>
      )}

      <div className="relative">
        <img
          src={icon}
          alt={item.type}
          className="w-16 h-16 group-hover:scale-110 transition-transform pointer-events-none"
          style={{ background: 'transparent' }}
        />
        {item.isTrashed && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            🗑️
          </div>
        )}
      </div>
      <span className="text-white text-xs mt-1 text-center break-words w-full bg-black bg-opacity-50 px-1 py-0.5 rounded pointer-events-none">
        {item.name}
      </span>
    </div>
  );
};

// Context Menu Component
const ContextMenu = ({ x, y, onClose, onAction, selectedItem }) => {
  const menuItems = selectedItem
    ? [
      { label: "Open", icon: "📂", action: "open" },
      { label: "Rename", icon: "✏️", action: "rename" },
      { label: "---", divider: true },
      { label: "Copy", icon: "📋", action: "copy" },
      { label: "Duplicate", icon: "📑", action: "duplicate" },
      { label: "---", divider: true },
      { label: "Move to Trash", icon: "🗑️", action: "trash" },
      { label: "Delete Permanently", icon: "⚠️", action: "deletePermanent", danger: true },
      { label: "---", divider: true },
      { label: "Get Info", icon: "ℹ️", action: "getInfo" }
    ]
    : [
      { label: "New Folder", icon: "📁", action: "newFolder" },
      { label: "New File", icon: "📄", action: "newFile" },
      { label: "---", divider: true },
      { label: "Paste", icon: "📋", action: "paste" },
      { label: "---", divider: true },
      { label: "Refresh", icon: "🔄", action: "refresh" },
      { label: "Sort By Name", icon: "↕️", action: "sort" },
      { label: "---", divider: true },
      { label: "Terminal", icon: "💻", action: "terminal" },
      { label: "---", divider: true },
      { label: "Change Wallpaper", icon: "🖼️", action: "changeWallpaper" },
      { label: "Display Settings", icon: "⚙️", action: "displaySettings" }
    ];

  return (
    <div
      className="fixed bg-gray-800 bg-opacity-95 backdrop-blur-md rounded-lg shadow-2xl py-2 min-w-48 z-50 border border-gray-600"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, index) => {
        if (item.divider) {
          return <div key={index} className="border-t border-gray-600 my-1"></div>;
        }

        return (
          <button
            key={index}
            className={`w-full px-4 py-2 text-left text-white hover:bg-blue-600 flex items-center space-x-3 transition-colors ${item.danger ? 'hover:bg-red-600' : ''
              }`}
            onClick={() => {
              onAction(item.action);
              onClose();
            }}
          >
            <span>{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// Create Item Modal
const CreateItemModal = ({ onClose, onCreate, type = "folder" }) => {
  const [itemName, setItemName] = useState(type === "folder" ? "Untitled Folder" : "Untitled.txt");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (itemName.trim()) {
      onCreate(itemName.trim(), type);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-600">
        <h2 className="text-white text-lg font-semibold mb-4">
          Create New {type === "folder" ? "Folder" : "File"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Rename Modal
const RenameModal = ({ item, onClose, onRename }) => {
  const [newName, setNewName] = useState(item.name);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newName.trim() && newName !== item.name) {
      onRename(item._id, newName.trim());
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-600">
        <h2 className="text-white text-lg font-semibold mb-4">Rename</h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Confirmation Dialog
const ConfirmDialog = ({ message, onConfirm, onCancel, danger = false }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-600">
        <h2 className="text-white text-lg font-semibold mb-4">Confirm Action</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded transition-colors ${danger ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
              }`}
          >
            {danger ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Desktop Component
function Desktop() {
  const { windows, openWindow, closeWindow } = useWindows();
  const [desktopItems, setDesktopItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedItem: null });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("folder");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [itemPositions, setItemPositions] = useState({});
  const contextMenuRef = useRef(null);

  const API_BASE = `${BASE_URL}/finder`;
  const AUTH_API = `${BASE_URL}/auth`;
  const DESKTOP_PARENT_ID = "desktop";

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch(`${AUTH_API}/checkSession`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.loggedIn && data.user) {
        setUserId(data.user._id);
        setUserName(data.user.name);
        setIsAuthenticated(true);
        fetchDesktopItems(data.user._id);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
    }
  };

  const fetchDesktopItems = async (currentUserId = userId) => {
    if (!currentUserId) return;

    try {
      const response = await fetch(`${API_BASE}/user/${currentUserId}/items`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        const desktopData = data.items.filter(item => item.parentId === "desktop");
        setDesktopItems(desktopData || []);
      }
    } catch (error) {
      console.error("Error fetching desktop items:", error);
    }
  };

  const createItem = async (itemName, type) => {
    if (!userId || !isAuthenticated) {
      alert("Please log in to create items");
      return;
    }

    try {
      let endpoint, body;

      if (type === "folder") {
        endpoint = `${API_BASE}/folders`;
        body = {
          name: itemName,
          parentId: DESKTOP_PARENT_ID,
          owner: userId
        };
      } else {
        endpoint = `${API_BASE}/textfile`;
        body = {
          name: itemName.endsWith('.txt') ? itemName : `${itemName}.txt`,
          content: "",
          parentId: DESKTOP_PARENT_ID,
          owner: userId
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (response.ok) {
        fetchDesktopItems();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
    }
  };

  const moveToTrash = async (itemId) => {
    if (!isAuthenticated) return;

    try {
      const item = desktopItems.find(i => i._id === itemId);
      if (!item) return;

      const endpoint = item.type === "folder"
        ? `${API_BASE}/trash/folder/${itemId}`
        : `${API_BASE}/trash/file/${itemId}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        credentials: 'include'
      });

      if (response.ok) {
        fetchDesktopItems();
        setSelectedItem(null);
      }
    } catch (error) {
      console.error("Error moving to trash:", error);
    }
  };

  const deletePermanently = async (itemId) => {
    if (!isAuthenticated) return;

    try {
      const item = desktopItems.find(i => i._id === itemId);
      const endpoint = item.type === "folder"
        ? `${API_BASE}/delete/folder/${itemId}`
        : `${API_BASE}/delete/${itemId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        credentials: 'include'
      });

      if (response.ok) {
        fetchDesktopItems();
        setSelectedItem(null);
        setShowConfirmDialog(false);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const renameItem = async (itemId, newName) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE}/rename/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ newName })
      });

      if (response.ok) {
        fetchDesktopItems();
        setShowRenameModal(false);
        setItemToRename(null);
      }
    } catch (error) {
      console.error("Error renaming item:", error);
    }
  };

  const duplicateItem = async (itemId) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE}/duplicate/${itemId}`, {
        method: "POST",
        credentials: 'include'
      });

      if (response.ok) {
        fetchDesktopItems();
      }
    } catch (error) {
      console.error("Error duplicating item:", error);
    }
  };

  const copyItem = (item) => {
    setClipboard({ ...item, action: 'copy' });
  };

  const pasteItem = async () => {
    if (!clipboard || !isAuthenticated) return;
    await duplicateItem(clipboard._id);
    setClipboard(null);
  };

  const handlePositionChange = (itemId, position) => {
    setItemPositions(prev => ({
      ...prev,
      [itemId]: position
    }));
  };

  const getItemPosition = (itemId, index) => {
    if (itemPositions[itemId]) {
      return itemPositions[itemId];
    }
    const itemsPerColumn = Math.floor((window.innerHeight - 200) / 100);
    const col = Math.floor(index / itemsPerColumn);
    const row = index % itemsPerColumn;
    return {
      x: window.innerWidth - 120 - (col * 100),
      y: 20 + (row * 100)
    };
  };

  const handleItemMenuClick = (item, action) => {
    switch (action) {
      case 'open':
        handleItemDoubleClick(item);
        break;
      case 'rename':
        setItemToRename(item);
        setShowRenameModal(true);
        break;
      case 'copy':
        copyItem(item);
        break;
      case 'duplicate':
        duplicateItem(item._id);
        break;
      case 'trash':
        moveToTrash(item._id);
        break;
      case 'delete':
        setConfirmAction(() => () => deletePermanently(item._id));
        setShowConfirmDialog(true);
        break;
      case 'info':
        alert(`Name: ${item.name}\nType: ${item.type}\nID: ${item._id}\nCreated: ${new Date(item.createdAt).toLocaleString()}\nTrashed: ${item.isTrashed ? 'Yes' : 'No'}`);
        break;
      default:
        break;
    }
  };

  const handleRightClick = (e, item = null) => {
    e.preventDefault();
    e.stopPropagation();

    if (!item && e.target.closest('.app-window')) return;
    if (!item && (e.target.closest('.dropdown-menu') || e.target.closest('button'))) return;

    const menuWidth = 200;
    const menuHeight = 400;
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;

    setContextMenu({ visible: true, x, y, selectedItem: item });
    if (item) setSelectedItem(item);
  };

  const handleContextMenuAction = (action) => {
    const item = contextMenu.selectedItem;

    switch (action) {
      case 'newFolder':
        if (!isAuthenticated) return;
        setCreateType("folder");
        setShowCreateModal(true);
        break;
      case 'newFile':
        if (!isAuthenticated) return;
        setCreateType("file");
        setShowCreateModal(true);
        break;
      case 'open':
        if (item) handleItemDoubleClick(item);
        break;
      case 'rename':
        if (item) {
          setItemToRename(item);
          setShowRenameModal(true);
        }
        break;
      case 'copy':
        if (item) copyItem(item);
        break;
      case 'paste':
        pasteItem();
        break;
      case 'duplicate':
        if (item) duplicateItem(item._id);
        break;
      case 'trash':
        if (item) moveToTrash(item._id);
        break;
      case 'deletePermanent':
        if (item) {
          setConfirmAction(() => () => deletePermanently(item._id));
          setShowConfirmDialog(true);
        }
        break;
      case 'refresh':
        fetchDesktopItems();
        break;
      case 'sort':
        setDesktopItems(prev => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
        break;
      case 'terminal':
        openWindow("terminal", "Terminal", Terminal, {});
        break;
      case 'getInfo':
        if (item) {
          alert(`Name: ${item.name}\nType: ${item.type}\nID: ${item._id}\nCreated: ${new Date(item.createdAt).toLocaleString()}\nTrashed: ${item.isTrashed ? 'Yes' : 'No'}`);
        }
        break;
      default:
        break;
    }
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, selectedItem: null });
  };

  const handleItemDoubleClick = (item) => {
    console.log('Desktop item double-clicked:', item);

    if (item.type === "folder") {
      // Open FileManager with the folder information
      const windowId = "filemanager-" + item._id;

      console.log('Opening FileManager for folder:', {
        windowId,
        itemName: item.name,
        itemId: item._id
      });

      // Close existing FileManager window if it exists
      const existingWindow = windows.find(w => w.id === windowId);
      if (existingWindow) {
        console.log('Closing existing window:', windowId);
        closeWindow(windowId);
        // Wait a bit before opening new window
        setTimeout(() => {
          openWindow(
            windowId,
            "File Manager - " + item.name,
            FileManager,
            {
              userId: userId,
              initialFolder: item._id,
              initialPath: ['Desktop', item.name],
              parentFolder: 'desktop'
            },
            folderIcon // 🔥 Pass the folder icon
          );
        }, 100);
      } else {
        openWindow(
          windowId,
          "File Manager - " + item.name,
          FileManager,
          {
            userId: userId,
            initialFolder: item._id,
            initialPath: ['Desktop', item.name],
            parentFolder: 'desktop'
          },
          folderIcon // 🔥 Pass the folder icon
        );
      }
    } else {
      // Open file in NotePad
      const windowId = "notepad-" + item._id;

      // Close existing NotePad window for this file if it exists
      const existingWindow = windows.find(w => w.id === windowId);
      if (existingWindow) {
        closeWindow(windowId);
        setTimeout(() => {
          openWindow(
            windowId,
            "NotePad - " + item.name,
            NotePad,
            {
              fileToOpen: item,
              userId: userId
            },
            fileIcon // 🔥 Pass the file icon
          );
        }, 100);
      } else {
        openWindow(
          windowId,
          "NotePad - " + item.name,
          NotePad,
          {
            fileToOpen: item,
            userId: userId
          },
          fileIcon // 🔥 Pass the file icon
        );
      }
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleDesktopClick = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedItem(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu.visible && contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        closeContextMenu();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (contextMenu.visible) closeContextMenu();
        if (showCreateModal) setShowCreateModal(false);
        if (showRenameModal) {
          setShowRenameModal(false);
          setItemToRename(null);
        }
        if (showConfirmDialog) setShowConfirmDialog(false);
        if (selectedItem) setSelectedItem(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedItem && !showCreateModal && !showRenameModal && !showConfirmDialog) {
        moveToTrash(selectedItem._id);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedItem) {
        e.preventDefault();
        duplicateItem(selectedItem._id);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && selectedItem) {
        copyItem(selectedItem);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'v' && clipboard) {
        pasteItem();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.visible, showCreateModal, showRenameModal, showConfirmDialog, selectedItem, clipboard]);

  return (
    <div
      className="w-screen h-screen flex flex-col overflow-hidden select-none"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onContextMenu={handleRightClick}
      onClick={handleDesktopClick}
    >
      <TopBar />

      <div className="flex-1 relative">
        <div className="absolute inset-0">
          {desktopItems.map((item, index) => (
            <DesktopItem
              key={item._id}
              item={item}
              onDoubleClick={handleItemDoubleClick}
              onRightClick={handleRightClick}
              isSelected={selectedItem?._id === item._id}
              onClick={handleItemClick}
              onMenuClick={handleItemMenuClick}
              position={getItemPosition(item._id, index)}
              onPositionChange={handlePositionChange}
            />
          ))}
        </div>

        {!isAuthenticated && (
          <div className="absolute top-4 left-4 bg-red-600 bg-opacity-80 text-white px-4 py-2 rounded-lg">
            Not authenticated
          </div>
        )}

        {clipboard && (
          <div className="absolute bottom-20 left-4 bg-blue-600 bg-opacity-80 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <span>📋</span>
            <span>Copied: {clipboard.name}</span>
          </div>
        )}

        {windows.map(window => (
          <MacWindow key={window.id} app={window} userId={userId} />
        ))}
      </div>

      {contextMenu.visible && (
        <div ref={contextMenuRef}>
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            onAction={handleContextMenuAction}
            selectedItem={contextMenu.selectedItem}
          />
        </div>
      )}

      {showCreateModal && (
        <CreateItemModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createItem}
          type={createType}
        />
      )}

      {showRenameModal && itemToRename && (
        <RenameModal
          item={itemToRename}
          onClose={() => {
            setShowRenameModal(false);
            setItemToRename(null);
          }}
          onRename={renameItem}
        />
      )}

      {showConfirmDialog && (
        <ConfirmDialog
          message="Are you sure you want to delete this item permanently? This action cannot be undone."
          onConfirm={() => {
            if (confirmAction) confirmAction();
            setShowConfirmDialog(false);
            setConfirmAction(null);
          }}
          onCancel={() => {
            setShowConfirmDialog(false);
            setConfirmAction(null);
          }}
          danger={true}
        />
      )}

      <Dock userId={userId} />
    </div>
  );
}


export default function MacOS() {
  return (
    <WindowProvider>
      <Desktop />
    </WindowProvider>
  );
}