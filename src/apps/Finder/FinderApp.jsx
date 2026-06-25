import { useState, useRef, useEffect } from 'react';
import {
  Folder, FolderOpen, FileText, Image, Music, Video, Archive, File, Menu
} from 'lucide-react';

import Photos from '../Photos/PhotosApp';
import VideoPlayer from '../VideoPlayer/VideoPlayerApp';
import NotePad from '../NotePad/NotePadApp';
import { useWindows } from "../../context/WindowContext";
import { authService } from "../../api/authService";
import { finderService } from "../../api/finderService";

import FinderSidebar from './components/FinderSidebar';
import FinderToolbar from './components/FinderToolbar';
import FinderGrid from './components/FinderGrid';
import FinderTable from './components/FinderTable';
import FinderContextMenu from './components/FinderContextMenu';
import NewItemDialog from './components/NewItemDialog';

export default function FileManager({ onClose, userId: propUserId, initialFolder, initialPath, parentFolder }) {
  const { openWindow, closeWindow, windows } = useWindows();

  // Backend state
  const [items, setItems] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(initialFolder || "root");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showTrash, setShowTrash] = useState(false);

  // UI state
  const [currentPath, setCurrentPath] = useState(initialPath || ['Home']);
  const [selectedItems, setSelectedItems] = useState([]);
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('folder');
  const [clipboard, setClipboard] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [folderHistory, setFolderHistory] = useState([]);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const createDropdownRef = useRef(null);

  // Media files state
  const [documentFiles, setDocumentFiles] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [musicFiles, setMusicFiles] = useState([]);

  // ============ BACKEND API CALLS ============

  const fetchUser = async () => {
    try {
      const data = await authService.checkSession();
      if (data.loggedIn) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching user session:", err);
      setUser(null);
    }
  };

  const fetchFolderContents = async (folderId = "root") => {
    if (!user) return;

    try {
      setLoading(true);
      setIsSearching(false);

      const owner = user._id || user.email || user.name;
      const data = await finderService.getFolderContents(folderId, owner, false);
      const filteredItems = (data.items || []).filter(item => item.owner === owner);

      setItems(filteredItems);
      setCurrentFolder(folderId);
      setShowTrash(false);
      setSearchQuery('');
    } catch (err) {
      console.error("Error fetching folder contents:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const types = ["pdf", "docx", "pptx", "txt"];
      let allDocs = [];

      for (let type of types) {
        const data = await finderService.getFilesByType(type);
        allDocs = [...allDocs, ...(data || [])];
      }

      setDocumentFiles(allDocs);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const fetchPhotos = async () => {
    try {
      const types = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "image"];
      let allPhotos = [];

      for (let type of types) {
        try {
          const data = await finderService.getFilesByType(type);
          if (data && Array.isArray(data)) {
            allPhotos = [...allPhotos, ...data];
          }
        } catch (typeErr) {
          console.warn(`Failed to fetch photos of type ${type}:`, typeErr);
        }
      }

      setPhotoFiles(allPhotos);
    } catch (err) {
      console.error("Error fetching photos:", err);
    }
  };

  const fetchVideos = async () => {
    try {
      const types = ["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv", "video"];
      let allVideos = [];

      for (let type of types) {
        try {
          const data = await finderService.getFilesByType(type);
          if (data && Array.isArray(data)) {
            allVideos = [...allVideos, ...data];
          }
        } catch (typeErr) {
          console.warn(`Failed to fetch videos of type ${type}:`, typeErr);
        }
      }

      setVideoFiles(allVideos);
    } catch (err) {
      console.error("Error fetching videos:", err);
    }
  };

  const fetchMusic = async () => {
    try {
      const types = ["mp3", "wav", "ogg", "m4a", "flac", "aac", "wma", "audio"];
      let allMusic = [];

      for (let type of types) {
        try {
          const data = await finderService.getFilesByType(type);
          if (data && Array.isArray(data)) {
            allMusic = [...allMusic, ...data];
          }
        } catch (typeErr) {
          console.warn(`Failed to fetch music of type ${type}:`, typeErr);
        }
      }

      setMusicFiles(allMusic);
    } catch (err) {
      console.error("Error fetching music:", err);
    }
  };

  useEffect(() => {
    const initializeFileManager = async () => {
      await fetchUser();
    };
    initializeFileManager();
  }, []);

  useEffect(() => {
    if (user) {
      if (initialFolder && parentFolder === 'desktop') {
        fetchFolderContents(initialFolder);
      } else {
        fetchFolderContents("root");
      }

      // Fetch media files
      fetchDocuments();
      fetchPhotos();
      fetchVideos();
      fetchMusic();
    }
  }, [user]);

  useEffect(() => {
    const handleSystemRefresh = () => {
      if (user) {
        fetchFolderContents(currentFolder);
        fetchDocuments();
        fetchPhotos();
        fetchVideos();
        fetchMusic();
      }
    };
    window.addEventListener("system:refresh", handleSystemRefresh);
    return () => window.removeEventListener("system:refresh", handleSystemRefresh);
  }, [user, currentFolder]);

  const createNewItem = async (type) => {
    if (!user) return alert("You must be logged in to create items.");

    setNewItemType(type);
    setNewItemName(type === 'folder' ? 'Untitled Folder' : 'Untitled.txt');
    setShowNewItemDialog(true);
    setShowCreateDropdown(false);
  };

  const handleCreateItem = async () => {
    if (!newItemName.trim()) return;

    try {
      if (newItemType === 'folder') {
        await finderService.createFolder({
          name: newItemName,
          parentId: currentFolder === "root" ? null : currentFolder,
          owner: user._id,
        });
      } else {
        await finderService.createTextFile({
          name: newItemName.endsWith('.txt') ? newItemName : `${newItemName}.txt`,
          content: "",
          parentId: currentFolder === "root" ? null : currentFolder,
          owner: user._id,
        });
      }

      fetchFolderContents(currentFolder);
      setShowNewItemDialog(false);
      setNewItemName('');
    } catch (err) {
      console.error(`Error creating ${newItemType}:`, err);
      alert(`Failed to create ${newItemType}`);
    }
  };

  const handleUpload = async (e) => {
    if (!user) return alert("You must be logged in to upload files.");
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("parentId", currentFolder === "root" ? "" : currentFolder);
    formData.append("owner", user._id || user.email || user.name);

    try {
      setLoading(true);
      await finderService.uploadFile(formData);
      fetchFolderContents(currentFolder);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const moveToTrash = async (item) => {
    try {
      await finderService.moveToTrash(item._id, item.type);
      if (isSearching) {
        handleSearch();
      } else {
        fetchFolderContents(currentFolder);
      }
      setContextMenu(null);
    } catch (err) {
      console.error("Error moving to trash:", err);
      alert("Failed to move to trash");
    }
  };

  const restoreItem = async (item) => {
    try {
      await finderService.restoreItem(item._id);
      loadTrash();
      setContextMenu(null);
    } catch (err) {
      console.error("Error restoring item:", err);
      alert("Failed to restore item");
    }
  };

  const deleteItem = async (item) => {
    if (!confirm(`Are you sure you want to permanently delete ${item.name}?`)) return;

    try {
      await finderService.deleteItem(item._id, item.type);
      if (showTrash) {
        loadTrash();
      } else if (isSearching) {
        handleSearch();
      } else {
        fetchFolderContents(currentFolder);
      }
      setContextMenu(null);
      setSelectedItems(selectedItems.filter(i => i !== item._id));
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item");
    }
  };

  const renameItem = async (item) => {
    const newName = prompt("Enter new name:", item.name);
    if (!newName || newName === item.name) return;

    try {
      await finderService.renameItem(item._id, newName);
      if (isSearching) {
        handleSearch();
      } else {
        fetchFolderContents(currentFolder);
      }
      setContextMenu(null);
    } catch (err) {
      console.error("Rename error:", err);
      alert("Failed to rename item");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      fetchFolderContents(currentFolder);
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      const data = await finderService.searchItems(searchQuery, showTrash);
      setItems(data.items || []);
      setSearchResults(data.items || []);
    } catch (err) {
      console.error("Search error:", err);
      setItems([]);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTrash = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setIsSearching(false);

      const owner = user._id || user.email || user.name;
      const localData = await finderService.getTrashLocal(owner);
      const driveData = await finderService.getTrashDrive(owner);

      const filteredItems = [
        ...(localData.items || []).filter(item => item.owner === owner),
        ...(driveData || []).filter(item => item.owner === owner),
      ];

      setItems(filteredItems);
      setShowTrash(true);
      setCurrentPath(['Trash']);
      setSearchQuery('');
    } catch (err) {
      console.error("Error loading trash:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (item) => {
    if (item.type === 'folder') return;

    try {
      const data = await finderService.downloadFile(item._id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', item.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file");
    }
  };

  const copyItemAPI = (item) => {
    setClipboard({
      type: 'copy',
      item: item,
      sourcePath: [...currentPath]
    });
    setContextMenu(null);
  };

  const pasteItemAPI = async () => {
    if (!clipboard) return;

    try {
      const targetId = currentFolder === "root" ? null : currentFolder;
      if (clipboard.type === 'copy') {
        await finderService.copyItem(clipboard.item._id, targetId);
      } else if (clipboard.type === 'cut') {
        await finderService.pasteItem(clipboard.item._id, targetId);
      }

      fetchFolderContents(currentFolder);
      setClipboard(null);
      setContextMenu(null);
    } catch (err) {
      console.error("Paste error:", err);
      alert(err.response?.data?.message || "Failed to paste item");
    }
  };

  const copyItem = (item) => {
    copyItemAPI(item);
  };

  const cutItem = (item) => {
    setClipboard({
      type: 'cut',
      item: item,
      sourcePath: [...currentPath]
    });
    setContextMenu(null);
  };

  const pasteItem = () => {
    if (!clipboard) return;
    pasteItemAPI();
  };

  // ============ UI UTILITY FUNCTIONS ============

  const getFileIcon = (type, name) => {
    if (type === 'folder') return FolderOpen;
    if (type === 'document') return FileText;
    if (type === 'image' || type === 'photo' || name?.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i)) return Image;
    if (type === 'music' || name?.match(/\.(mp3|wav|ogg|m4a|flac|aac|wma)$/i)) return Music;
    if (type === 'video' || name?.match(/\.(mp4|avi|mov|mkv|webm|flv|wmv)$/i)) return Video;
    if (name?.match(/\.(zip|rar|7z|tar|gz)$/i)) return Archive;
    if (name?.match(/\.(pdf|txt|md|doc|docx)$/i)) return FileText;
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
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

      return date.toLocaleDateString();
    } catch (err) {
      return '—';
    }
  };

  const navigateToPath = (folderInfo) => {
    const { path, id, special } = folderInfo;

    if (id === 'trash') {
      loadTrash();
    } else if (special === 'documents' || special === 'photos' || special === 'videos' || special === 'music') {
      setCurrentPath(path);
      setCurrentFolder(special);
      setShowTrash(false);
      setIsSearching(false);
      setSearchQuery('');
      setSelectedItems([]);
      setSidebarOpen(false);
    } else {
      setCurrentPath(path);
      fetchFolderContents(id);
      setSelectedItems([]);
      setSidebarOpen(false);
      setSearchQuery('');
      setIsSearching(false);
    }
  };

  const handleItemClick = (item) => {
    if (item.type === 'folder') {
      setFolderHistory([...folderHistory, { id: currentFolder, path: currentPath }]);
      fetchFolderContents(item._id);
      setCurrentPath([...currentPath, item.name]);
      setSelectedItems([]);
    } else {
      setSelectedItems([item._id]);
    }
  };

  const handleItemDoubleClick = (item) => {
    if (item.type === 'folder') {
      setFolderHistory([...folderHistory, { id: currentFolder, path: currentPath }]);
      fetchFolderContents(item._id);
      setCurrentPath([...currentPath, item.name]);
      setSelectedItems([]);
    } else if (item.type === 'photo' || item.type === 'image' || item.name?.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)) {
      const appId = 'photos-' + item._id;
      const existingApp = windows.find(w => w.id === appId);

      if (existingApp) {
        closeWindow(appId);
      }

      setTimeout(() => {
        openWindow(appId, 'Photos - ' + item.name, Photos, {
          fileToOpen: item,
          userId: propUserId
        });
      }, existingApp ? 50 : 0);
    } else if (item.type === 'video' || item.name?.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv)$/i)) {
      const appId = 'videoplayer-' + item._id;
      const existingApp = windows.find(w => w.id === appId);

      if (existingApp) {
        closeWindow(appId);
      }

      setTimeout(() => {
        openWindow(appId, 'Video Player - ' + item.name, VideoPlayer, {
          fileToOpen: item,
          userId: propUserId
        });
      }, existingApp ? 50 : 0);
    } else if ((item.type === 'document' || item.type === 'music') && item.viewLink) {
      window.open(item.viewLink, '_blank');
    } else if (item.type === 'file' || item.name?.match(/\.(txt|md)$/i)) {
      const appId = 'notepad-' + item._id;
      const existingApp = windows.find(w => w.id === appId);

      if (existingApp) {
        closeWindow(appId);
      }

      setTimeout(() => {
        openWindow(appId, 'NotePad - ' + item.name, NotePad, {
          fileToOpen: item,
          userId: propUserId
        });
      }, existingApp ? 50 : 0);
    }
  };

  const goBack = () => {
    if (folderHistory.length > 0) {
      const previous = folderHistory[folderHistory.length - 1];
      setFolderHistory(folderHistory.slice(0, -1));
      setCurrentPath(previous.path);
      fetchFolderContents(previous.id);
    }
  };

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item: item
    });
  };

  const displayItems =
    currentFolder === 'documents'
      ? documentFiles.map(doc => ({
        _id: doc.id,
        name: doc.name,
        type: 'document',
        size: doc.size || '—',
        createdAt: doc.createdTime,
        updatedAt: doc.modifiedTime,
        viewLink: doc.viewLink
      }))
      : currentFolder === 'photos'
        ? photoFiles.map(photo => ({
          _id: photo.id,
          name: photo.name,
          type: 'photo',
          size: photo.size || '—',
          createdAt: photo.createdTime,
          updatedAt: photo.modifiedTime,
          viewLink: photo.viewLink,
          thumbnailLink: photo.thumbnailLink,
          googleDriveId: photo.id
        }))
        : currentFolder === 'videos'
          ? videoFiles.map(video => ({
            _id: video.id,
            name: video.name,
            type: 'video',
            size: video.size || '—',
            createdAt: video.createdTime,
            updatedAt: video.modifiedTime,
            viewLink: video.viewLink,
            thumbnailLink: video.thumbnailLink
          }))
          : currentFolder === 'music'
            ? musicFiles.map(music => ({
              _id: music.id,
              name: music.name,
              type: 'music',
              size: music.size || '—',
              createdAt: music.createdTime,
              updatedAt: music.modifiedTime,
              viewLink: music.viewLink
            }))
            : isSearching ? searchResults : items;

  const filteredItems = displayItems.filter(item => {
    if (isSearching) return true;
    return searchQuery === '' ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

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

  // Close create dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (createDropdownRef.current && !createDropdownRef.current.contains(e.target)) {
        setShowCreateDropdown(false);
      }
    };

    if (showCreateDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreateDropdown]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedItems.length > 0) {
        e.preventDefault();
        const item = items.find(i => i._id === selectedItems[0]);
        if (item) copyItem(item);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'x' && selectedItems.length > 0) {
        e.preventDefault();
        const item = items.find(i => i._id === selectedItems[0]);
        if (item) cutItem(item);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
        e.preventDefault();
        pasteItem();
      }

      if (e.key === 'Delete' && selectedItems.length > 0) {
        e.preventDefault();
        const item = items.find(i => i._id === selectedItems[0]);
        if (item) {
          if (showTrash) {
            deleteItem(item);
          } else {
            moveToTrash(item);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItems, clipboard, showTrash, items]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const isSpecialFolder = ['documents', 'photos', 'videos', 'music'].includes(currentFolder);

  return (
    <div className="w-full h-full bg-white flex flex-col font-sans select-none">
      {/* Header for Mobile Drawer Trigger */}
      {isMobile && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-700"
            style={{ cursor: 'pointer' }}
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-gray-800">Finder</span>
          <div className="w-8"></div>
        </div>
      )}

      <div className="flex-1 flex min-h-0 relative">
        {/* Sidebar Container */}
        {(!isMobile || sidebarOpen) && (
          <div className={`${isMobile ? 'absolute left-0 top-0 bottom-0 z-50 w-48 shadow-2xl animate-slide-in' : ''} flex`}>
            <FinderSidebar
              currentPath={currentPath}
              navigateToPath={navigateToPath}
              showTrash={showTrash}
              itemsCount={items.length}
              documentCount={documentFiles.length}
              photoCount={photoFiles.length}
              videoCount={videoFiles.length}
              musicCount={musicFiles.length}
            />
          </div>
        )}

        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <FinderToolbar
            folderHistory={folderHistory}
            goBack={goBack}
            isMobile={isMobile}
            isSearching={isSearching}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentPath={currentPath}
            clipboard={clipboard}
            setClipboard={setClipboard}
            showTrash={showTrash}
            isSpecialFolder={isSpecialFolder}
            showCreateDropdown={showCreateDropdown}
            setShowCreateDropdown={setShowCreateDropdown}
            createNewItem={createNewItem}
            handleUpload={handleUpload}
            pasteItem={pasteItem}
            handleSearch={handleSearch}
            view={view}
            setView={setView}
            filteredItemsLength={filteredItems.length}
            createDropdownRef={createDropdownRef}
          />

          <div className="flex-1 flex min-h-0 bg-white">
            <div className="flex-1 p-4 overflow-auto finder-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading...</div>
                </div>
              ) : view === 'grid' ? (
                <FinderGrid
                  filteredItems={filteredItems}
                  selectedItems={selectedItems}
                  isMobile={isMobile}
                  handleItemClick={handleItemClick}
                  handleItemDoubleClick={handleItemDoubleClick}
                  handleContextMenu={handleContextMenu}
                  getFileIcon={getFileIcon}
                  formatFileSize={formatFileSize}
                />
              ) : (
                <FinderTable
                  filteredItems={filteredItems}
                  selectedItems={selectedItems}
                  isMobile={isMobile}
                  handleItemClick={handleItemClick}
                  handleItemDoubleClick={handleItemDoubleClick}
                  handleContextMenu={handleContextMenu}
                  getFileIcon={getFileIcon}
                  formatFileSize={formatFileSize}
                  formatDate={formatDate}
                />
              )}

              {filteredItems.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Folder size={48} className="mb-2 text-gray-400" />
                  <p className="text-lg font-medium">
                    {isSearching ? 'No results found' :
                      isSpecialFolder ? `No ${currentFolder} found` : 'This folder is empty'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {isSearching ? `No files match "${searchQuery}"` :
                      isSpecialFolder ? 'Upload files to Google Drive' : 'Add files to get started'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FinderContextMenu
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        showTrash={showTrash}
        handleItemDoubleClick={handleItemDoubleClick}
        downloadFile={downloadFile}
        renameItem={renameItem}
        copyItem={copyItem}
        cutItem={cutItem}
        moveToTrash={moveToTrash}
        restoreItem={restoreItem}
        deleteItem={deleteItem}
      />

      <NewItemDialog
        showNewItemDialog={showNewItemDialog}
        setShowNewItemDialog={setShowNewItemDialog}
        newItemType={newItemType}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        handleCreateItem={handleCreateItem}
        isMobile={isMobile}
      />
    </div>
  );
}
