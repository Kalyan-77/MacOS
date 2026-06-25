import { useState, useEffect, useRef } from "react";
import TopBar from "./components/TopBar/TopBar";
import Dock from "./components/Dock/Dock";
import MacWindow from "./components/MacWindow";
import { WindowProvider, useWindows } from "./context/WindowContext";
import wallpaper from "./assets/Wallpaper/img1.jpg";
import NotePad from "./apps/NotePad/NotePadApp";
import Terminal from "./apps/Terminal/TerminalApp";
import FileManager from "./apps/Finder/FinderApp";
import { authService } from "./api/authService";
import { finderService } from "./api/finderService";
import { useSystemStore } from "./store/systemStore";

import DesktopItem from "./components/Desktop/DesktopItem";
import ContextMenu from "./components/Desktop/DesktopContextMenu";
import CreateItemModal from "./components/Desktop/CreateItemModal";
import RenameModal from "./components/Desktop/RenameModal";
import ConfirmDialog from "./components/Desktop/ConfirmDialog";

// Desktop Component
function Desktop({ preloadedData }) {
  const { windows, openWindow, closeWindow } = useWindows();
  const brightness = useSystemStore((state) => state.brightness);
  const wallpaperUrl = useSystemStore((state) => state.wallpaperUrl);
  const [desktopItems, setDesktopItems] = useState(preloadedData?.desktopItems || []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedItem: null });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("folder");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [userId, setUserId] = useState(preloadedData?.authData?.user?._id || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!preloadedData?.authData?.loggedIn);
  const [userName, setUserName] = useState(preloadedData?.authData?.user?.name || "");
  const [itemPositions, setItemPositions] = useState({});
  const contextMenuRef = useRef(null);

  const DESKTOP_PARENT_ID = "desktop";

  useEffect(() => {
    if (!preloadedData) {
      checkAuthentication();
    }
  }, [preloadedData]);

  const checkAuthentication = async () => {
    try {
      const data = await authService.checkSession();

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
      const data = await finderService.getUserItems(currentUserId);
      if (data && data.items) {
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
      if (type === "folder") {
        await finderService.createFolder({
          name: itemName,
          parentId: DESKTOP_PARENT_ID,
          owner: userId
        });
      } else {
        await finderService.createTextFile({
          name: itemName.endsWith('.txt') ? itemName : `${itemName}.txt`,
          content: "",
          parentId: DESKTOP_PARENT_ID,
          owner: userId
        });
      }
      fetchDesktopItems();
      setShowCreateModal(false);
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
    }
  };

  const moveToTrash = async (itemId) => {
    if (!isAuthenticated) return;

    try {
      const item = desktopItems.find(i => i._id === itemId);
      if (!item) return;

      await finderService.moveToTrash(itemId, item.type);
      fetchDesktopItems();
      setSelectedItem(null);
    } catch (error) {
      console.error("Error moving to trash:", error);
    }
  };

  const deletePermanently = async (itemId) => {
    if (!isAuthenticated) return;

    try {
      const item = desktopItems.find(i => i._id === itemId);
      await finderService.deleteItem(itemId, item.type);
      fetchDesktopItems();
      setSelectedItem(null);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const renameItem = async (itemId, newName) => {
    if (!isAuthenticated) return;

    try {
      await finderService.renameItem(itemId, newName);
      fetchDesktopItems();
      setShowRenameModal(false);
      setItemToRename(null);
    } catch (error) {
      console.error("Error renaming item:", error);
    }
  };

  const duplicateItem = async (itemId) => {
    if (!isAuthenticated) return;

    try {
      await finderService.duplicateItem(itemId);
      fetchDesktopItems();
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
        setIsRefreshing(true);
        fetchDesktopItems();
        window.dispatchEvent(new CustomEvent("system:refresh"));
        setTimeout(() => {
          setIsRefreshing(false);
        }, 300);
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
      className="w-screen h-screen flex flex-col overflow-hidden select-none relative"
      style={{
        backgroundImage: `url(${wallpaperUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onContextMenu={handleRightClick}
      onClick={handleDesktopClick}
    >
      {/* Global Brightness Overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-150 ease-out z-[9999]"
        style={{
          opacity: (100 - brightness) / 100 * 0.7
        }}
      />
      <TopBar />

      <div className="flex-1 relative">
        <div className={`absolute inset-0 transition-opacity duration-150 ease-in-out ${isRefreshing ? 'opacity-20' : 'opacity-100'}`}>
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

      <Dock userId={userId} initialDockConfig={preloadedData?.dockConfig} />
    </div>
  );
}


export default function MacOS({ preloadedData }) {
  return (
    <WindowProvider>
      <Desktop preloadedData={preloadedData} />
    </WindowProvider>
  );
}