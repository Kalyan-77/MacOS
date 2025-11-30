import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {BASE_URL} from '../../../config';
import { 
  X, ChevronLeft, ChevronRight, Home, Folder, FolderOpen, 
  File, Image, Music, Video, FileText, Archive, Settings,
  Grid3X3, List, Search, Share, Trash2, ArrowUp, Download,
  Plus, Edit3, Copy, Scissors, Eye, MoreHorizontal, Menu,
  Upload, PlusCircle, RefreshCw, Edit, RotateCcw, Monitor,
  FileImage, Film, Star, Clock, ChevronDown, FolderPlus, FilePlus
} from 'lucide-react';


export default function FileManager({ onClose, toggleApp, setFileToOpen, userId: propUserId, zIndex = 1000, onFocus   }) {
  // Backend state
  const [items, setItems] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("root");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  
  // UI state
  const [currentPath, setCurrentPath] = useState(['Home']);
  const [selectedItems, setSelectedItems] = useState([]);
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('folder');
  const [previewItem, setPreviewItem] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [folderHistory, setFolderHistory] = useState([]);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);

  // Window state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 50, y: 50 });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const windowRef = useRef(null);
  const createDropdownRef = useRef(null);

  // Media files state
  const [documentFiles, setDocumentFiles] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [musicFiles, setMusicFiles] = useState([]);

  // Dragging variables
  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: window.notepadData?.windowPosition?.x || 300,
    startWindowY: window.notepadData?.windowPosition?.y || 150,
    currentWindowX: window.notepadData?.windowPosition?.x || 300,
    currentWindowY: window.notepadData?.windowPosition?.y || 50
  });

  // Fixed sidebar folders
  const sidebarFolders = [
    { icon: Home, name: 'Home', path: ['Home'], id: 'root', color: 'text-blue-500' },
    { icon: Monitor, name: 'Desktop', path: ['Desktop'], id: 'desktop', color: 'text-purple-500' },
    { icon: FileText, name: 'Documents', path: ['Documents'], id: 'documents', color: 'text-blue-500', special: 'documents' },
    { icon: Download, name: 'Downloads', path: ['Downloads'], id: 'downloads', color: 'text-green-500' },
    { icon: FileImage, name: 'Photos', path: ['Photos'], id: 'photos', color: 'text-pink-500', special: 'photos' },
    { icon: Music, name: 'Music', path: ['Music'], id: 'music', color: 'text-purple-500', special: 'music' },
    { icon: Film, name: 'Videos', path: ['Videos'], id: 'videos', color: 'text-red-500', special: 'videos' },
    { icon: Star, name: 'Favorites', path: ['Favorites'], id: 'favorites', color: 'text-yellow-500' },
    { icon: Trash2, name: 'Trash', path: ['Trash'], id: 'trash', color: 'text-red-500' }
  ];

  // ============ BACKEND API CALLS ============
  
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/checkSession`, { withCredentials: true });
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

  const fetchDocuments = async () => {
    try {
      const types = ["pdf", "docx", "pptx", "txt"];
      let allDocs = [];

      for (let type of types) {
        const res = await axios.get(`${BASE_URL}/cloud/files/type?type=${type}`);
        allDocs = [...allDocs, ...(res.data || [])];
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
          const res = await axios.get(`${BASE_URL}/cloud/files/type?type=${type}`);
          if (res.data && Array.isArray(res.data)) {
            allPhotos = [...allPhotos, ...res.data];
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
          const res = await axios.get(`${BASE_URL}/cloud/files/type?type=${type}`);
          if (res.data && Array.isArray(res.data)) {
            allVideos = [...allVideos, ...res.data];
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
          const res = await axios.get(`${BASE_URL}/cloud/files/type?type=${type}`);
          if (res.data && Array.isArray(res.data)) {
            allMusic = [...allMusic, ...res.data];
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
    fetchUser();
    fetchFolderContents("root");
    fetchDocuments();
    fetchPhotos();
    fetchVideos();
    fetchMusic();
  }, []);

  const fetchFolderContents = async (folderId = "root") => {
    if (!user) return;

    try {
      setLoading(true);
      setIsSearching(false);

      const res = await axios.get(`${BASE_URL}/finder/folders/${folderId}`, {
        params: {
          owner: user._id || user.email || user.name,
          trash: false
        }
      });

      const filteredItems = (res.data.items || []).filter(item => item.owner === (user._id || user.email || user.name));

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
        await axios.post(`${BASE_URL}/finder/folders`, {
          name: newItemName,
          parentId: currentFolder === "root" ? null : currentFolder,
          owner: user._id,
        });
      } else {
        await axios.post(`${BASE_URL}/finder/textfile`, {
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
      await axios.post(`${BASE_URL}/finder/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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
      if (item.type === "file") {
        await axios.put(`${BASE_URL}/finder/trash/file/${item._id}`);
      } else {
        await axios.put(`${BASE_URL}/finder/trash/folder/${item._id}`);
      }
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
      await axios.put(`${BASE_URL}/finder/restore/${item._id}`);
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
      if (item.type === "file") {
        await axios.delete(`${BASE_URL}/finder/delete/${item._id}`);
      } else {
        await axios.delete(`${BASE_URL}/finder/delete/folder/${item._id}`);
      }
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
      await axios.put(`${BASE_URL}/finder/rename/${item._id}`, { newName });
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
      const res = await axios.get(
        `${BASE_URL}/finder/search?name=${searchQuery}&includeTrashed=${showTrash}`
      );
      setItems(res.data.items || []);
      setSearchResults(res.data.items || []);
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

      const localRes = await axios.get(`${BASE_URL}/finder/trash/local`, {
        params: {
          owner: user._id || user.email || user.name,
        },
      });
      const driveRes = await axios.get(`${BASE_URL}/finder/trash/drive`, {
        params: {
          owner: user._id || user.email || user.name,
        },
      });

      const filteredItems = [
        ...(localRes.data.items || []).filter(item => item.owner === (user._id || user.email || user.name)),
        ...(driveRes.data || []).filter(item => item.owner === (user._id || user.email || user.name)),
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
      const response = await axios.get(`${BASE_URL}/finder/download/${item._id}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
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
    alert('Item copied to clipboard');
  };

  const pasteItemAPI = async () => {
    if (!clipboard) return;

    try {
      if (clipboard.type === 'copy') {
        await axios.post(`${BASE_URL}/finder/copy`, {
          sourceId: clipboard.item._id,
          targetId: currentFolder === "root" ? null : currentFolder
        });
      } else if (clipboard.type === 'cut') {
        await axios.post(`${BASE_URL}/finder/paste`, {
          sourceId: clipboard.item._id,
          targetId: currentFolder === "root" ? null : currentFolder
        });
      }

      fetchFolderContents(currentFolder);
      setClipboard(null);
      setContextMenu(null);
      alert('Item pasted successfully');
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
    alert('Item cut to clipboard');
  };

  const pasteItem = () => {
    if (!clipboard) {
      alert("Nothing to paste");
      return;
    }
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

  // Navigation
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
      setPreviewItem(null);
      setSidebarOpen(false);
    } else {
      setCurrentPath(path);
      fetchFolderContents(id);
      setSelectedItems([]);
      setPreviewItem(null);
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
      setPreviewItem(null);
    } else {
      setSelectedItems([item._id]);
      if ((item.type === 'image' || item.type === 'document' || item.type === 'photo') && !isMobile) {
        setPreviewItem(item);
      }
    }
  };

  const handleItemDoubleClick = (item) => {
  if (item.type === 'folder') {
    setFolderHistory([...folderHistory, { id: currentFolder, path: currentPath }]);
    fetchFolderContents(item._id);
    setCurrentPath([...currentPath, item.name]);
    setSelectedItems([]);
    setPreviewItem(null);
  } else if (item.type === 'photo' || item.type === 'image' || item.name?.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)) {
    // Open image files in Photos app
    if (toggleApp && setFileToOpen) {
      setFileToOpen(item);
      toggleApp('photos');
    } else {
      setPreviewItem(item);
    }
  } else if (item.type === 'video' || item.name?.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv)$/i)) {
    // Open video files in VideoPlayer app
    if (toggleApp && setFileToOpen) {
      setFileToOpen(item);
      toggleApp('videoplayer');
    } else if (item.viewLink) {
      window.open(item.viewLink, '_blank');
    } else {
      setPreviewItem(item);
    }
  } else if ((item.type === 'document' || item.type === 'music') && item.viewLink) {
    window.open(item.viewLink, '_blank');
  } else if (item.type === 'file' || item.name?.match(/\.(txt|md)$/i)) {
    if (toggleApp && setFileToOpen) {
      setFileToOpen(item);
      toggleApp('notepad');
    } else {
      setPreviewItem(item);
    }
  } else {
    setPreviewItem(item);
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
      if (window.innerWidth < 768 && previewItem) {
        setPreviewItem(null);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [previewItem]);

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
      if (onFocus) onFocus();  // ADD THIS
    };

    const handleContextMenuGlobal = (e) => {
      if (dragState.current.holdingWindow) {
        e.preventDefault();
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleContextMenuGlobal);
    windowElement.addEventListener('mousedown', handleMouseDown);

    windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
    windowElement.style.willChange = 'transform';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleContextMenuGlobal);
      windowElement.removeEventListener('mousedown', handleMouseDown);
      
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.body.style.pointerEvents = '';
      
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isMaximized, isMobile]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

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

  const isSpecialFolder = ['documents', 'photos', 'videos', 'music'].includes(currentFolder);

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
                style={{ cursor: 'pointer' }}
              >
                <X size={8} className="text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors duration-150 group flex items-center justify-center"
                onClick={handleMinimize}
                title="Minimize"
                style={{ cursor: 'pointer' }}
              >
                <div className="w-2 h-0.5 bg-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <button
                className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-150 group flex items-center justify-center"
                onClick={handleMaximize}
                title={isMaximized ? "Restore" : "Maximize"}
                style={{ cursor: 'pointer' }}
              >
                <div className="w-1.5 h-1.5 border border-green-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          )}
          
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              style={{ cursor: 'pointer' }}
            >
              <Menu size={20} className="text-gray-600" />
            </button>
          )}
        </div>

        <div className={`flex items-center gap-2 ${isMobile ? 'flex-1 mx-4' : ''}`}>
          {!isMobile && (
            <>
              <button 
                onClick={goBack}
                className="p-1.5 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={folderHistory.length === 0}
                style={{ cursor: 'pointer' }}
              >
                <ChevronLeft size={16} className="text-gray-600" />
              </button>
              <button 
                className="p-1.5 hover:bg-gray-200 rounded transition-colors opacity-50 cursor-not-allowed"
                disabled
              >
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </>
          )}
          
          <div className={`${isMobile ? '' : 'absolute left-1/2 transform -translate-x-1/2'} pointer-events-none`}>
            <div className={`flex items-center gap-1 ${isMobile ? 'text-base' : 'text-sm'} text-gray-700`}>
              {isMobile ? (
                <span className="font-medium truncate">
                  {isSearching ? `Search: "${searchQuery}"` : currentPath[currentPath.length - 1]}
                </span>
              ) : (
                isSearching ? (
                  <span className="font-medium">Search: "{searchQuery}"</span>
                ) : (
                  currentPath.map((segment, index) => (
                    <span key={index} className="flex items-center gap-1">
                      {index > 0 && <span className="text-gray-400">/</span>}
                      <span className={index === currentPath.length - 1 ? 'font-medium' : ''}>
                        {segment}
                      </span>
                    </span>
                  ))
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          {!isMobile && (
            <>
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded transition-colors ${
                  view === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded transition-colors ${
                  view === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <List size={16} />
              </button>
            </>
          )}
          
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={`pl-7 pr-3 py-1 text-sm bg-gray-100 border-none rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isMobile ? 'w-24' : 'w-32'
              }`}
              style={{ cursor: 'text' }}
            />
          </div>
          
          {isMobile && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              style={{ cursor: 'pointer' }}
            >
              <X size={20} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="h-full bg-white flex" style={{ height:`calc(100% - ${isMobile ? '3.5rem' : '3rem'})` }}>
        {/* Sidebar */}
        <div className={`${
          isMobile 
            ? `fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }` 
            : 'w-52 bg-gray-50'
        } border-r border-gray-200 flex flex-col`}>
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">File Manager</h3>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
          
          {user && (
            <div className="px-3 py-2 text-xs text-gray-600 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {(user.name || user.email)?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto p-2">
            <div className="mb-1 px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Favorites
            </div>
            {sidebarFolders.map((folder, index) => {
              const Icon = folder.icon;
              const isActive = JSON.stringify(currentPath) === JSON.stringify(folder.path);
              
              return (
                <button
                  key={index}
                  onClick={() => navigateToPath(folder)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md text-sm transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <Icon size={18} className={isActive ? 'text-blue-600' : folder.color} />
                  <span className="flex-1">{folder.name}</span>
                  {folder.name === 'Trash' && showTrash && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                      {items.length}
                    </span>
                  )}
                  {folder.name === 'Documents' && documentFiles.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                      {documentFiles.length}
                    </span>
                  )}
                  {folder.name === 'Photos' && photoFiles.length > 0 && (
                    <span className="text-xs bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded">
                      {photoFiles.length}
                    </span>
                  )}
                  {folder.name === 'Videos' && videoFiles.length > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                      {videoFiles.length}
                    </span>
                  )}
                  {folder.name === 'Music' && musicFiles.length > 0 && (
                    <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                      {musicFiles.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className={`flex items-center justify-between px-4 ${isMobile ? 'py-3' : 'py-2'} border-b border-gray-200 bg-gray-50 flex-wrap gap-2`}>
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              {folderHistory.length > 0 && (
                <button
                  onClick={goBack}
                  className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors`}
                  style={{ cursor: 'pointer' }}
                >
                  <ArrowUp size={14} />
                  {!isMobile && 'Back'}
                </button>
              )}
              
              {clipboard && !isMobile && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-xs">
                  <Copy size={12} />
                  <span className="truncate max-w-[150px]">
                    {clipboard.item.name} ({clipboard.type})
                  </span>
                  <button
                    onClick={() => setClipboard(null)}
                    className="hover:bg-purple-200 rounded p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              {!showTrash && !isSearching && !isSpecialFolder && (
                <>
                  {/* NEW: Create Dropdown Button */}
                  <div className="relative" ref={createDropdownRef}>
                    <button 
                      onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                      className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors`}
                      style={{ cursor: 'pointer' }}
                    >
                      <Plus size={14} />
                      {!isMobile && 'New'}
                      <ChevronDown size={12} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showCreateDropdown && (
                      <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          onClick={() => createNewItem('folder')}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors text-left"
                          style={{ cursor: 'pointer' }}
                        >
                          <FolderPlus size={16} className="text-blue-500" />
                          <span>New Folder</span>
                        </button>
                        <button
                          onClick={() => createNewItem('file')}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors text-left"
                          style={{ cursor: 'pointer' }}
                        >
                          <FilePlus size={16} className="text-green-500" />
                          <span>New Text File</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <label className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-green-500 text-white rounded-md hover:bg-green-600 cursor-pointer transition-colors`}>
                    <Upload size={14} />
                    {!isMobile && 'Upload'}
                    <input type="file" className="hidden" onChange={handleUpload} />
                  </label>
                </>
              )}
              
              {isSearching && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearching(false);
                    fetchFolderContents(currentFolder);
                  }}
                  className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors`}
                  style={{ cursor: 'pointer' }}
                >
                  <X size={14} />
                  Clear Search
                </button>
              )}
            
              {clipboard && (
                <button 
                  onClick={pasteItem}
                  className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors`}
                  style={{ cursor: 'pointer' }}
                  title={`Paste "${clipboard.item.name}"`}
                >
                  {!isMobile && `Paste ${clipboard.type === 'cut' ? '(Move)' : '(Copy)'}`}
                  {isMobile && <Copy size={14} />}
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {isMobile && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded transition-colors ${
                      view === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded transition-colors ${
                      view === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <List size={16} />
                  </button>
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>

          {/* File Grid/List - Continues with existing rendering code... */}
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 p-4 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading...</div>
                </div>
              ) : view === 'grid' ? (
                <div className={`grid gap-4 ${
                  isMobile 
                    ? 'grid-cols-2' 
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                }`}>
                  {filteredItems.map((item, index) => {
                    const Icon = getFileIcon(item.type, item.name);
                    const isSelected = selectedItems.includes(item._id);
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 relative group ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-transparent hover:border-gray-200'
                        }`}
                        onClick={() => handleItemClick(item)}
                        onDoubleClick={() => handleItemDoubleClick(item)}
                        onContextMenu={(e) => handleContextMenu(e, item)}
                      >
                        <div className="flex flex-col items-center gap-2">
                          {item.thumbnailLink && (item.type === 'photo' || item.type === 'video') ? (
                            <img 
                              src={item.thumbnailLink} 
                              alt={item.name}
                              className={`${isMobile ? 'w-20 h-20' : 'w-24 h-24'} object-cover rounded`}
                            />
                          ) : (
                            <Icon 
                              size={isMobile ? 40 : 48} 
                              className={`${
                                item.type === 'folder' ? 'text-blue-500' : 
                                item.type === 'image' || item.type === 'photo' ? 'text-green-500' :
                                item.type === 'video' ? 'text-red-500' :
                                item.type === 'music' ? 'text-purple-500' :
                                item.type === 'document' ? 'text-blue-600' :
                                'text-gray-600'
                              }`} 
                            />
                          )}
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
                /* List view code continues... keeping existing implementation */
                <div className="space-y-1">
                  {!isMobile && (
                    <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200 bg-gray-50">
                      <div className="col-span-5">Name</div>
                      <div className="col-span-3">Modified</div>
                      <div className="col-span-2">Size</div>
                      <div className="col-span-2">Type</div>
                    </div>
                  )}
                  {filteredItems.map((item, index) => {
                    const Icon = getFileIcon(item.type, item.name);
                    const isSelected = selectedItems.includes(item._id);
                    
                    return (
                      <div
                        key={index}
                        className={`${
                          isMobile 
                            ? 'flex items-center gap-3 p-3' 
                            : 'grid grid-cols-12 gap-4 items-center px-3 py-2'
                        } rounded-md cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-blue-100 text-blue-900' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleItemClick(item)}
                        onDoubleClick={() => handleItemDoubleClick(item)}
                        onContextMenu={(e) => handleContextMenu(e, item)}
                      >
                        {isMobile ? (
                          <>
                            {item.thumbnailLink && (item.type === 'photo' || item.type === 'video') ? (
                              <img 
                                src={item.thumbnailLink} 
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded flex-shrink-0"
                              />
                            ) : (
                              <Icon 
                                size={24} 
                                className={`flex-shrink-0 ${
                                  item.type === 'folder' ? 'text-blue-500' : 
                                  item.type === 'image' || item.type === 'photo' ? 'text-green-500' :
                                  item.type === 'video' ? 'text-red-500' :
                                  item.type === 'music' ? 'text-purple-500' :
                                  item.type === 'document' ? 'text-blue-600' :
                                  'text-gray-600'
                                }`} 
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </p>
                              <div className="flex gap-2 text-xs text-gray-500">
                                {item.size && <span>{formatFileSize(item.size)}</span>}
                                <span>{formatDate(item.updatedAt || item.createdAt)}</span>
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
                              {item.thumbnailLink && (item.type === 'photo' || item.type === 'video') ? (
                                <img 
                                  src={item.thumbnailLink} 
                                  alt={item.name}
                                  className="w-8 h-8 object-cover rounded flex-shrink-0"
                                />
                              ) : (
                                <Icon 
                                  size={20} 
                                  className={`flex-shrink-0 ${
                                    item.type === 'folder' ? 'text-blue-500' : 
                                    item.type === 'image' || item.type === 'photo' ? 'text-green-500' :
                                    item.type === 'video' ? 'text-red-500' :
                                    item.type === 'music' ? 'text-purple-500' :
                                    item.type === 'document' ? 'text-blue-600' :
                                    'text-gray-600'
                                  }`} 
                                />
                              )}
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </p>
                            </div>
                            <div className="col-span-3 text-sm text-gray-600">
                              {formatDate(item.updatedAt || item.createdAt)}
                            </div>
                            <div className="col-span-2 text-sm text-gray-600">
                              {item.size ? formatFileSize(item.size) : '—'}
                            </div>
                            <div className="col-span-2 flex items-center justify-between">
                              <span className="text-sm text-gray-600 capitalize">{item.type}</span>
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

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[180px]"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 200),
            top: Math.min(contextMenu.y, window.innerHeight - 300),
          }}
        >
          {!showTrash ? (
            <>
              <button
                onClick={() => {
                  if (['document', 'video', 'music', 'photo'].includes(contextMenu.item.type)) {
                    window.open(contextMenu.item.viewLink, '_blank');
                  } else if (contextMenu.item.type === 'file' || contextMenu.item.name?.match(/\.(txt|md)$/i)) {
                    if (toggleApp && setFileToOpen) {
                      setFileToOpen(contextMenu.item);
                      toggleApp('notepad');
                      setContextMenu(null);
                    } else {
                      setPreviewItem(contextMenu.item);
                      setContextMenu(null);
                    }
                  } else {
                    setPreviewItem(contextMenu.item);
                    setContextMenu(null);
                  }
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Eye size={14} />
                {['document', 'video', 'music', 'photo'].includes(contextMenu.item.type) ? 'Open in Google Drive' : 'Open'}
              </button>
              {contextMenu.item.type === 'file' && (
                <button
                  onClick={() => {
                    downloadFile(contextMenu.item);
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Download size={14} />
                  Download
                </button>
              )}
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={() => renameItem(contextMenu.item)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Edit size={14} />
                Rename
              </button>
              <button
                onClick={() => copyItem(contextMenu.item)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2">
                  <Copy size={14} />
                  Copy
                </span>
                <span className="text-xs text-gray-400">Ctrl+C</span>
              </button>
              <button
                onClick={() => cutItem(contextMenu.item)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2">
                  <Scissors size={14} />
                  Cut
                </span>
                <span className="text-xs text-gray-400">Ctrl+X</span>
              </button>
              <button
                onClick={() => {
                  setSelectedItems([contextMenu.item._id]);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Star size={14} />
                Add to Favorites
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={() => moveToTrash(contextMenu.item)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={14} />
                Move to Trash
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => restoreItem(contextMenu.item)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={14} />
                Restore
              </button>
              <button
                onClick={() => deleteItem(contextMenu.item)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
              >
                <X size={14} />
                Delete Permanently
              </button>
            </>
          )}
        </div>
      )}

      {/* New Item Dialog */}
      {showNewItemDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-xl shadow-2xl p-6 w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
            <h3 className="text-lg font-semibold mb-4">
              Create New {newItemType === 'folder' ? 'Folder' : 'Text File'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {newItemType === 'folder' ? 'Folder' : 'File'} Name
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={newItemType === 'folder' ? 'Enter folder name' : 'Enter file name'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateItem()}
                  autoFocus
                />
              </div>
            </div>
            
            <div className={`flex gap-3 mt-6 ${isMobile ? 'flex-col' : ''}`}>
              <button
                onClick={() => {
                  setShowNewItemDialog(false);
                  setNewItemName('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateItem}
                disabled={!newItemName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}