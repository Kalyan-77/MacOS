// import { useState, useRef, useEffect } from 'react';
// import { 
//   X, ChevronLeft, ChevronRight, Home, Folder, FolderOpen, 
//   File, Image, Music, Video, FileText, Archive, Settings,
//   Grid3X3, List, Search, Share, Trash2, ArrowUp, Download,
//   Plus, Edit3, Copy, Scissors, Eye, MoreHorizontal
// } from 'lucide-react';

// export default function FileManager({ onClose }) {
//   // File system state - using localStorage simulation
//   const [fileSystem, setFileSystem] = useState(() => {
//     // Initialize with some sample data
//     return {
//       'Users': {
//         'john': {
//           'Documents': {
//             'Projects': {
//               'React App': {
//                 'src': { type: 'folder', contents: {} },
//                 'package.json': { type: 'file', size: '1.2 KB', modified: new Date().toISOString(), content: '{\n  "name": "react-app",\n  "version": "1.0.0"\n}' },
//                 'README.md': { type: 'file', size: '3.4 KB', modified: new Date().toISOString(), content: '# React App\n\nA sample React application.' }
//               },
//               'Design Files': {
//                 'logo.png': { type: 'image', size: '245 KB', modified: new Date().toISOString(), url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSI2MCI+TG9nbzwvdGV4dD48L3N2Zz4=' },
//                 'mockup.sketch': { type: 'file', size: '12.3 MB', modified: new Date().toISOString() }
//               }
//             },
//             'Photos': {
//               'vacation.jpg': { type: 'image', size: '2.1 MB', modified: new Date().toISOString(), url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzMzNzNkYyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzYzNjZmMSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI3NreSkiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2ZlZGQ0YyIvPjxwb2x5Z29uIHBvaW50cz0iMCwyMDAgMTAwLDE1MCAyMDAsMTgwIDMwMCwxNDAgNDAwLDE2MCA0MDAsMzAwIDAsMzAwIiBmaWxsPSIjMjJjNTVlIi8+PHRleHQgeD0iMjAwIiB5PSIyNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjI0Ij5WYWNhdGlvbiBQaG90bzwvdGV4dD48L3N2Zz4=' },
//               'family.png': { type: 'image', size: '890 KB', modified: new Date().toISOString(), url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y5ZmFmYiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9IiNmYmJmMjQiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjZmJiZjI0Ii8+PGNpcmNsZSBjeD0iMzAwIiBjeT0iMTAwIiByPSIzMCIgZmlsbD0iI2ZiYmYyNCIvPjx0ZXh0IHg9IjIwMCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzc0MTUxIiBmb250LXNpemU9IjI0Ij5GYW1pbHkgUGhvdG88L3RleHQ+PC9zdmc+' }
//             },
//             'report.pdf': { type: 'file', size: '156 KB', modified: new Date().toISOString(), content: 'PDF document content...' },
//             'notes.txt': { type: 'file', size: '2.3 KB', modified: new Date().toISOString(), content: 'These are my notes...\n\nImportant information:\n- Remember to backup files\n- Update project documentation\n- Schedule team meeting' }
//           },
//           'Downloads': {
//             'installer.dmg': { type: 'file', size: '234 MB', modified: new Date().toISOString() },
//             'document.pdf': { type: 'file', size: '1.8 MB', modified: new Date().toISOString() }
//           },
//           'Desktop': {},
//           'Pictures': {
//             'Screenshots': { type: 'folder', contents: {} }
//           }
//         }
//       }
//     };
//   });

//   const [currentPath, setCurrentPath] = useState(['Users', 'john', 'Documents']);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [view, setView] = useState('grid');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [contextMenu, setContextMenu] = useState(null);
//   const [showNewItemDialog, setShowNewItemDialog] = useState(false);
//   const [newItemType, setNewItemType] = useState('folder');
//   const [newItemName, setNewItemName] = useState('');
//   const [previewItem, setPreviewItem] = useState(null);
//   const [clipboard, setClipboard] = useState(null);

//   // Window state
//   const [isMinimized, setIsMinimized] = useState(false);
//   const [isMaximized, setIsMaximized] = useState(false);
//   const [prevPosition, setPrevPosition] = useState({ x: 200, y: 100 });
//   const [isActive, setIsActive] = useState(true);
//   const [isDragging, setIsDragging] = useState(false);
  
//   const windowRef = useRef(null);

//   // Dragging variables
//   const dragState = useRef({
//     holdingWindow: false,
//     mouseTouchX: 0,
//     mouseTouchY: 0,
//     startWindowX: 200,
//     startWindowY: 100,
//     currentWindowX: 100,
//     currentWindowY: 50
//   });

//   // Sidebar items
//   const sidebarItems = [
//     { icon: Home, name: 'Home', path: ['Users', 'john'] },
//     { icon: Download, name: 'Downloads', path: ['Users', 'john', 'Downloads'] },
//     { icon: FileText, name: 'Documents', path: ['Users', 'john', 'Documents'] },
//     { icon: Image, name: 'Pictures', path: ['Users', 'john', 'Pictures'] },
//     { icon: Trash2, name: 'Trash', path: ['Trash'] }
//   ];

//   // Utility functions
//   const getCurrentDirectory = () => {
//     let current = fileSystem;
//     for (const segment of currentPath) {
//       current = current[segment];
//       if (!current) return {};
//     }
//     return current;
//   };

//   const updateFileSystem = (newFileSystem) => {
//     setFileSystem({ ...newFileSystem });
//   };

//   const getFileIcon = (type, name) => {
//     if (type === 'folder') return FolderOpen;
//     if (type === 'image') return Image;
//     if (type === 'audio') return Music;
//     if (type === 'video') return Video;
//     if (type === 'archive') return Archive;
//     if (name.endsWith('.pdf') || name.endsWith('.txt') || name.endsWith('.md')) return FileText;
//     return File;
//   };

//   const formatFileSize = (size) => {
//     if (typeof size === 'string') return size;
//     if (size < 1024) return `${size} B`;
//     if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
//     if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
//     return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '—';
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) return 'Today';
//     if (diffDays === 1) return 'Yesterday';
//     if (diffDays < 7) return `${diffDays} days ago`;
//     return date.toLocaleDateString();
//   };

//   // File operations
//   const createNewItem = () => {
//     if (!newItemName.trim()) return;
    
//     const currentDir = getCurrentDirectory();
//     const newFileSystem = { ...fileSystem };
    
//     // Navigate to current directory in the new file system
//     let targetDir = newFileSystem;
//     for (const segment of currentPath) {
//       targetDir = targetDir[segment];
//     }
    
//     if (newItemType === 'folder') {
//       targetDir[newItemName] = { type: 'folder', contents: {} };
//     } else {
//       targetDir[newItemName] = {
//         type: 'file',
//         size: '0 B',
//         modified: new Date().toISOString(),
//         content: newItemType === 'text' ? '' : undefined
//       };
//     }
    
//     updateFileSystem(newFileSystem);
//     setShowNewItemDialog(false);
//     setNewItemName('');
//   };

//   const deleteItem = (itemName) => {
//     const newFileSystem = { ...fileSystem };
//     let targetDir = newFileSystem;
    
//     for (const segment of currentPath) {
//       targetDir = targetDir[segment];
//     }
    
//     delete targetDir[itemName];
//     updateFileSystem(newFileSystem);
//     setSelectedItems(selectedItems.filter(item => item !== itemName));
//     setContextMenu(null);
//   };

//   const copyItem = (itemName) => {
//     const currentDir = getCurrentDirectory();
//     setClipboard({
//       type: 'copy',
//       item: itemName,
//       data: currentDir[itemName],
//       sourcePath: [...currentPath]
//     });
//     setContextMenu(null);
//   };

//   const cutItem = (itemName) => {
//     const currentDir = getCurrentDirectory();
//     setClipboard({
//       type: 'cut',
//       item: itemName,
//       data: currentDir[itemName],
//       sourcePath: [...currentPath]
//     });
//     setContextMenu(null);
//   };

//   const pasteItem = () => {
//     if (!clipboard) return;
    
//     const newFileSystem = { ...fileSystem };
//     let targetDir = newFileSystem;
    
//     for (const segment of currentPath) {
//       targetDir = targetDir[segment];
//     }
    
//     // Create a unique name if item already exists
//     let newName = clipboard.item;
//     let counter = 1;
//     while (targetDir[newName]) {
//       const extension = newName.includes('.') ? '.' + newName.split('.').pop() : '';
//       const baseName = newName.includes('.') ? newName.substring(0, newName.lastIndexOf('.')) : newName;
//       newName = `${baseName} copy${counter > 1 ? ` ${counter}` : ''}${extension}`;
//       counter++;
//     }
    
//     targetDir[newName] = { ...clipboard.data };
    
//     // If it was a cut operation, remove from source
//     if (clipboard.type === 'cut') {
//       let sourceDir = newFileSystem;
//       for (const segment of clipboard.sourcePath) {
//         sourceDir = sourceDir[segment];
//       }
//       delete sourceDir[clipboard.item];
//       setClipboard(null);
//     }
    
//     updateFileSystem(newFileSystem);
//     setContextMenu(null);
//   };

//   // Navigation
//   const navigateToPath = (newPath) => {
//     setCurrentPath(newPath);
//     setSelectedItems([]);
//     setPreviewItem(null);
//   };

//   const handleItemClick = (item) => {
//     if (item.type === 'folder') {
//       setCurrentPath([...currentPath, item.name]);
//       setSelectedItems([]);
//       setPreviewItem(null);
//     } else {
//       setSelectedItems([item.name]);
//       if (item.type === 'image') {
//         setPreviewItem(item);
//       }
//     }
//   };

//   const handleItemDoubleClick = (item) => {
//     if (item.type === 'folder') {
//       setCurrentPath([...currentPath, item.name]);
//       setSelectedItems([]);
//       setPreviewItem(null);
//     } else if (item.type === 'image') {
//       setPreviewItem(item);
//     } else if (item.type === 'file' && (item.name.endsWith('.txt') || item.name.endsWith('.md'))) {
//       // Open text files for editing
//       setPreviewItem(item);
//     }
//   };

//   // Context menu
//   const handleContextMenu = (e, item) => {
//     e.preventDefault();
//     setContextMenu({
//       x: e.clientX,
//       y: e.clientY,
//       item: item
//     });
//   };

//   // Get current items
//   const currentDir = getCurrentDirectory();
//   const items = Object.entries(currentDir)
//     .filter(([name]) => name !== 'type' && name !== 'contents')
//     .map(([name, info]) => ({
//       name,
//       type: info.type || 'folder',
//       size: info.size,
//       modified: info.modified,
//       content: info.content,
//       url: info.url
//     }));

//   // Window management (same as before)
//   useEffect(() => {
//     const windowElement = windowRef.current;
//     if (!windowElement) return;

//     let highestZ = 1000;
//     let animationFrame = null;

//     const handleMouseMove = (e) => {
//       if (dragState.current.holdingWindow && !isMaximized) {
//         if (animationFrame) {
//           cancelAnimationFrame(animationFrame);
//         }

//         const deltaX = e.clientX - dragState.current.mouseTouchX;
//         const deltaY = e.clientY - dragState.current.mouseTouchY;
        
//         dragState.current.currentWindowX = dragState.current.startWindowX + deltaX;
//         dragState.current.currentWindowY = dragState.current.startWindowY + deltaY;

//         const minX = -windowElement.offsetWidth + 100;
//         const minY = 0;
//         const maxX = window.innerWidth - 100;
//         const maxY = window.innerHeight - 100;

//         dragState.current.currentWindowX = Math.max(minX, Math.min(maxX, dragState.current.currentWindowX));
//         dragState.current.currentWindowY = Math.max(minY, Math.min(maxY, dragState.current.currentWindowY));

//         animationFrame = requestAnimationFrame(() => {
//           windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
//         });
//       }
//     };

//     const handleMouseDown = (e) => {
//       if (e.button === 0) {
//         const titleBar = e.target.closest('.title-bar');
//         const isButton = e.target.closest('.traffic-lights') || e.target.closest('button');
        
//         if (titleBar && !isButton) {
//           e.preventDefault();
//           e.stopPropagation();
          
//           dragState.current.holdingWindow = true;
//           setIsActive(true);
//           setIsDragging(true);

//           windowElement.style.zIndex = highestZ;
//           highestZ += 1;

//           dragState.current.mouseTouchX = e.clientX;
//           dragState.current.mouseTouchY = e.clientY;
//           dragState.current.startWindowX = dragState.current.currentWindowX;
//           dragState.current.startWindowY = dragState.current.currentWindowY;

//           document.body.style.userSelect = 'none';
//           document.body.style.cursor = 'default';
//           document.body.style.pointerEvents = 'none';
//           windowElement.style.pointerEvents = 'auto';
//         }
//       }
//     };

//     const handleMouseUp = (e) => {
//       if (dragState.current.holdingWindow) {
//         dragState.current.holdingWindow = false;
//         setIsDragging(false);
        
//         document.body.style.userSelect = '';
//         document.body.style.cursor = '';
//         document.body.style.pointerEvents = '';
//         windowElement.style.pointerEvents = '';

//         if (animationFrame) {
//           cancelAnimationFrame(animationFrame);
//           animationFrame = null;
//         }
//       }
//     };

//     const handleContextMenuGlobal = (e) => {
//       if (dragState.current.holdingWindow) {
//         e.preventDefault();
//       }
//     };

//     document.addEventListener('mousemove', handleMouseMove, { passive: false });
//     document.addEventListener('mouseup', handleMouseUp);
//     document.addEventListener('contextmenu', handleContextMenuGlobal);
//     windowElement.addEventListener('mousedown', handleMouseDown);

//     windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
//     windowElement.style.willChange = 'transform';

//     return () => {
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mouseup', handleMouseUp);
//       document.removeEventListener('contextmenu', handleContextMenuGlobal);
//       windowElement.removeEventListener('mousedown', handleMouseDown);
      
//       document.body.style.userSelect = '';
//       document.body.style.cursor = '';
//       document.body.style.pointerEvents = '';
      
//       if (animationFrame) {
//         cancelAnimationFrame(animationFrame);
//       }
//     };
//   }, [isMaximized]);

//   // Close context menu on click outside
//   useEffect(() => {
//     const handleClick = () => setContextMenu(null);
//     document.addEventListener('click', handleClick);
//     return () => document.removeEventListener('click', handleClick);
//   }, []);

//   const handleClose = () => {
//     onClose();
//   };

//   const handleMinimize = () => {
//     setIsMinimized(!isMinimized);
//   };

//   const handleMaximize = () => {
//     if (isMaximized) {
//       setIsMaximized(false);
//       dragState.current.currentWindowX = prevPosition.x;
//       dragState.current.currentWindowY = prevPosition.y;
//       windowRef.current.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
//     } else {
//       setPrevPosition({
//         x: dragState.current.currentWindowX,
//         y: dragState.current.currentWindowY
//       });
//       setIsMaximized(true);
//       dragState.current.currentWindowX = 0;
//       dragState.current.currentWindowY = 25;
//       windowRef.current.style.transform = `translate3d(0px, 25px, 0)`;
//     }
//   };

//   return (
//     <div
//       ref={windowRef}
//       className={`fixed bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-200 ${
//         isActive ? 'ring-2 ring-blue-500/20' : ''
//       } ${
//         isMinimized ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
//       }`}
//       style={{
//         left: 0,
//         top: 0,
//         width: isMaximized ? '100vw' : '1200px',
//         height: isMaximized ? 'calc(100vh - 25px)' : '700px',
//         zIndex: isActive ? 1000 : 999,
//         display: isMinimized ? 'none' : 'block',
//         willChange: isDragging ? 'transform' : 'auto',
//         transition: isDragging ? 'none' : 'all 0.2s'
//       }}
//       onClick={() => setIsActive(true)}
//     >
//       {/* Title Bar */}
//       <div
//         className={`title-bar h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4 select-none transition-colors duration-200 ${
//           isActive ? 'bg-gray-100' : 'bg-gray-50'
//         }`}
//         style={{ 
//           cursor: 'default',
//           WebkitAppRegion: 'drag'
//         }}
//       >
//         {/* Traffic Light Buttons */}
//         <div className="traffic-lights flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
//           <button
//             className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-150 group flex items-center justify-center"
//             onClick={handleClose}
//             title="Close"
//             style={{ cursor: 'pointer' }}
//           >
//             <X size={8} className="text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
//           </button>
//           <button
//             className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors duration-150 group flex items-center justify-center"
//             onClick={handleMinimize}
//             title="Minimize"
//             style={{ cursor: 'pointer' }}
//           >
//             <div className="w-2 h-0.5 bg-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
//           </button>
//           <button
//             className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-150 group flex items-center justify-center"
//             onClick={handleMaximize}
//             title={isMaximized ? "Restore" : "Maximize"}
//             style={{ cursor: 'pointer' }}
//           >
//             <div className="w-1.5 h-1.5 border border-green-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
//           </button>
//         </div>

//         {/* Navigation Controls */}
//         <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
//           <button 
//             onClick={() => currentPath.length > 1 && navigateToPath(currentPath.slice(0, -1))}
//             className="p-1.5 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             disabled={currentPath.length <= 1}
//             style={{ cursor: 'pointer' }}
//           >
//             <ChevronLeft size={16} className="text-gray-600" />
//           </button>
//           <button 
//             className="p-1.5 hover:bg-gray-200 rounded transition-colors opacity-50 cursor-not-allowed"
//             disabled
//           >
//             <ChevronRight size={16} className="text-gray-600" />
//           </button>
//         </div>

//         {/* Window Title / Path */}
//         <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
//           <div className="flex items-center gap-1 text-sm text-gray-700">
//             {currentPath.map((segment, index) => (
//               <span key={index} className="flex items-center gap-1">
//                 {index > 0 && <span className="text-gray-400">/</span>}
//                 <span className={index === currentPath.length - 1 ? 'font-medium' : ''}>
//                   {segment}
//                 </span>
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* View Controls & Search */}
//         <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
//           <button
//             onClick={() => setView('grid')}
//             className={`p-1.5 rounded transition-colors ${
//               view === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
//             }`}
//             style={{ cursor: 'pointer' }}
//           >
//             <Grid3X3 size={16} />
//           </button>
//           <button
//             onClick={() => setView('list')}
//             className={`p-1.5 rounded transition-colors ${
//               view === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
//             }`}
//             style={{ cursor: 'pointer' }}
//           >
//             <List size={16} />
//           </button>
//           <div className="relative ml-2">
//             <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-7 pr-3 py-1 text-sm bg-gray-100 border-none rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-32"
//               style={{ cursor: 'text' }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="h-full bg-white flex" style={{ height: 'calc(100% - 3rem)' }}>
//         {/* Sidebar */}
//         <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
//           {/* Sidebar Header */}
//           <div className="p-3 border-b border-gray-200">
//             <h3 className="text-sm font-medium text-gray-700">Favorites</h3>
//           </div>
          
//           {/* Sidebar Items */}
//           <div className="flex-1 p-2">
//             {sidebarItems.map((item, index) => {
//               const Icon = item.icon;
//               const isActive = JSON.stringify(currentPath) === JSON.stringify(item.path);
              
//               return (
//                 <button
//                   key={index}
//                   onClick={() => navigateToPath(item.path)}
//                   className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-md text-sm transition-colors ${
//                     isActive 
//                       ? 'bg-blue-100 text-blue-700' 
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                   style={{ cursor: 'pointer' }}
//                 >
//                   <Icon size={16} />
//                   {item.name}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Main Content Area */}
//         <div className="flex-1 flex flex-col">
//           {/* Toolbar */}
//           <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => currentPath.length > 1 && navigateToPath(currentPath.slice(0, -1))}
//                 className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={currentPath.length <= 1}
//                 style={{ cursor: 'pointer' }}
//               >
//                 <ArrowUp size={14} />
//                 Up
//               </button>
//               <button 
//                 onClick={() => setShowNewItemDialog(true)}
//                 className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors" 
//                 style={{ cursor: 'pointer' }}
//               >
//                 <Plus size={14} />
//                 New
//               </button>
//               {clipboard && (
//                 <button 
//                   onClick={pasteItem}
//                   className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" 
//                   style={{ cursor: 'pointer' }}
//                 >
//                   Paste
//                 </button>
//               )}
//             </div>
            
//             <div className="text-sm text-gray-600">
//               {items.length} {items.length === 1 ? 'item' : 'items'}
//             </div>
//           </div>

//           {/* File Grid/List */}
//           <div className="flex-1 flex">
//             <div className="flex-1 p-4 overflow-auto">
//               {view === 'grid' ? (
//                 <div className="grid grid-cols-4 gap-4">
//                   {items
//                     .filter(item => 
//                       searchQuery === '' || 
//                       item.name.toLowerCase().includes(searchQuery.toLowerCase())
//                     )
//                     .map((item, index) => {
//                       const Icon = getFileIcon(item.type, item.name);
//                       const isSelected = selectedItems.includes(item.name);
                      
//                       return (
//                         <div
//                           key={index}
//                           className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 ${
//                             isSelected 
//                               ? 'border-blue-500 bg-blue-50' 
//                               : 'border-transparent hover:border-gray-200'
//                           }`}
//                           onClick={() => handleItemClick(item)}
//                           onDoubleClick={() => handleItemDoubleClick(item)}
//                           onContextMenu={(e) => handleContextMenu(e, item)}
//                         >
//                           <div className="flex flex-col items-center gap-2">
//                             <Icon 
//                               size={48} 
//                               className={`${
//                                 item.type === 'folder' ? 'text-blue-500' : 
//                                 item.type === 'image' ? 'text-green-500' :
//                                 'text-gray-600'
//                               }`} 
//                             />
//                             <div className="text-center">
//                               <p className="text-sm font-medium text-gray-900 truncate w-full">
//                                 {item.name}
//                               </p>
//                               {item.size && (
//                                 <p className="text-xs text-gray-500 mt-1">
//                                   {formatFileSize(item.size)}
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                 </div>
//               ) : (
//                 <div className="space-y-1">
//                   <div className="grid grid-cols-12 gap-4 px-2 py-1 text-xs font-medium text-gray-500 border-b border-gray-200">
//                     <div className="col-span-6">Name</div>
//                     <div className="col-span-2">Size</div>
//                     <div className="col-span-3">Modified</div>
//                     <div className="col-span-1"></div>
//                   </div>
//                   {items
//                     .filter(item => 
//                       searchQuery === '' || 
//                       item.name.toLowerCase().includes(searchQuery.toLowerCase())
//                     )
//                     .map((item, index) => {
//                       const Icon = getFileIcon(item.type, item.name);
//                       const isSelected = selectedItems.includes(item.name);
                      
//                       return (
//                         <div
//                           key={index}
//                           className={`grid grid-cols-12 gap-4 items-center p-2 rounded-md cursor-pointer transition-colors ${
//                             isSelected 
//                               ? 'bg-blue-100 text-blue-900' 
//                               : 'hover:bg-gray-50'
//                           }`}
//                           onClick={() => handleItemClick(item)}
//                           onDoubleClick={() => handleItemDoubleClick(item)}
//                           onContextMenu={(e) => handleContextMenu(e, item)}
//                         >
//                           <div className="col-span-6 flex items-center gap-3 min-w-0">
//                             <Icon 
//                               size={20} 
//                               className={`flex-shrink-0 ${
//                                 item.type === 'folder' ? 'text-blue-500' : 
//                                 item.type === 'image' ? 'text-green-500' :
//                                 'text-gray-600'
//                               }`} 
//                             />
//                             <p className="text-sm font-medium text-gray-900 truncate">
//                               {item.name}
//                             </p>
//                           </div>
//                           <div className="col-span-2 text-sm text-gray-500">
//                             {item.size ? formatFileSize(item.size) : '—'}
//                           </div>
//                           <div className="col-span-3 text-sm text-gray-500">
//                             {formatDate(item.modified)}
//                           </div>
//                           <div className="col-span-1 flex justify-end">
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleContextMenu(e, item);
//                               }}
//                               className="p-1 hover:bg-gray-200 rounded transition-colors"
//                             >
//                               <MoreHorizontal size={16} className="text-gray-400" />
//                             </button>
//                           </div>
//                         </div>
//                       );
//                     })}
//                 </div>
//               )}
              
//               {items.length === 0 && (
//                 <div className="flex flex-col items-center justify-center h-64 text-gray-500">
//                   <Folder size={48} className="mb-2" />
//                   <p>This folder is empty</p>
//                 </div>
//               )}
//             </div>

//             {/* Preview Panel */}
//             {previewItem && (
//               <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col">
//                 <div className="p-4 border-b border-gray-200 bg-white">
//                   <div className="flex items-center justify-between">
//                     <h3 className="font-medium text-gray-900 truncate">{previewItem.name}</h3>
//                     <button
//                       onClick={() => setPreviewItem(null)}
//                       className="p-1 hover:bg-gray-200 rounded transition-colors"
//                     >
//                       <X size={16} className="text-gray-400" />
//                     </button>
//                   </div>
//                   <p className="text-sm text-gray-500 mt-1">
//                     {previewItem.size ? formatFileSize(previewItem.size) : '—'} • {formatDate(previewItem.modified)}
//                   </p>
//                 </div>
                
//                 <div className="flex-1 p-4 overflow-auto">
//                   {previewItem.type === 'image' && previewItem.url && (
//                     <div className="space-y-4">
//                       <img 
//                         src={previewItem.url} 
//                         alt={previewItem.name}
//                         className="w-full rounded-lg shadow-sm"
//                       />
//                       <div className="text-sm text-gray-600">
//                         <p>Image preview</p>
//                       </div>
//                     </div>
//                   )}
                  
//                   {previewItem.type === 'file' && previewItem.content && (
//                     <div className="space-y-4">
//                       <div className="bg-white rounded-lg border p-4">
//                         <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
//                           {previewItem.content}
//                         </pre>
//                       </div>
//                     </div>
//                   )}
                  
//                   {!previewItem.url && !previewItem.content && (
//                     <div className="flex flex-col items-center justify-center h-32 text-gray-400">
//                       <Eye size={32} className="mb-2" />
//                       <p className="text-sm">No preview available</p>
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="p-4 border-t border-gray-200 bg-white">
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleItemDoubleClick(previewItem)}
//                       className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
//                     >
//                       Open
//                     </button>
//                     <button
//                       onClick={() => copyItem(previewItem.name)}
//                       className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
//                     >
//                       <Copy size={14} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Context Menu */}
//       {contextMenu && (
//         <div
//           className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
//           style={{
//             left: contextMenu.x,
//             top: contextMenu.y,
//           }}
//         >
//           <button
//             onClick={() => {
//               setPreviewItem(contextMenu.item);
//               setContextMenu(null);
//             }}
//             className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
//           >
//             <Eye size={14} />
//             Open
//           </button>
//           <button
//             onClick={() => copyItem(contextMenu.item.name)}
//             className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
//           >
//             <Copy size={14} />
//             Copy
//           </button>
//           <button
//             onClick={() => cutItem(contextMenu.item.name)}
//             className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
//           >
//             <Scissors size={14} />
//             Cut
//           </button>
//           <div className="border-t border-gray-200 my-1"></div>
//           <button
//             onClick={() => deleteItem(contextMenu.item.name)}
//             className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
//           >
//             <Trash2 size={14} />
//             Delete
//           </button>
//         </div>
//       )}

//       {/* New Item Dialog */}
//       {showNewItemDialog && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
//             <h3 className="text-lg font-semibold mb-4">Create New Item</h3>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setNewItemType('folder')}
//                     className={`px-3 py-2 text-sm rounded-md transition-colors ${
//                       newItemType === 'folder' 
//                         ? 'bg-blue-100 text-blue-700' 
//                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   >
//                     Folder
//                   </button>
//                   <button
//                     onClick={() => setNewItemType('text')}
//                     className={`px-3 py-2 text-sm rounded-md transition-colors ${
//                       newItemType === 'text' 
//                         ? 'bg-blue-100 text-blue-700' 
//                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   >
//                     Text File
//                   </button>
//                   <button
//                     onClick={() => setNewItemType('file')}
//                     className={`px-3 py-2 text-sm rounded-md transition-colors ${
//                       newItemType === 'file' 
//                         ? 'bg-blue-100 text-blue-700' 
//                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   >
//                     File
//                   </button>
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
//                 <input
//                   type="text"
//                   value={newItemName}
//                   onChange={(e) => setNewItemName(e.target.value)}
//                   placeholder={`Enter ${newItemType} name`}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//                   onKeyPress={(e) => e.key === 'Enter' && createNewItem()}
//                 />
//               </div>
//             </div>
            
//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={() => {
//                   setShowNewItemDialog(false);
//                   setNewItemName('');
//                 }}
//                 className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={createNewItem}
//                 disabled={!newItemName.trim()}
//                 className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Create
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


//After Responsive
import { useState, useRef, useEffect } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Home, Folder, FolderOpen, 
  File, Image, Music, Video, FileText, Archive, Settings,
  Grid3X3, List, Search, Share, Trash2, ArrowUp, Download,
  Plus, Edit3, Copy, Scissors, Eye, MoreHorizontal, Menu
} from 'lucide-react';

export default function FileManager({ onClose }) {
  // File system state - using in-memory storage
  const [fileSystem, setFileSystem] = useState(() => {
    // Initialize with some sample data
    return {
      'Users': {
        'john': {
          'Documents': {
            'Projects': {
              'React App': {
                'src': { type: 'folder', contents: {} },
                'package.json': { type: 'file', size: '1.2 KB', modified: new Date().toISOString(), content: '{\n  "name": "react-app",\n  "version": "1.0.0"\n}' },
                'README.md': { type: 'file', size: '3.4 KB', modified: new Date().toISOString(), content: '# React App\n\nA sample React application.' }
              },
              'Design Files': {
                'logo.png': { type: 'image', size: '245 KB', modified: new Date().toISOString(), url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSI2MCI+TG9nbzwvdGV4dD48L3N2Zz4=' },
                'mockup.sketch': { type: 'file', size: '12.3 MB', modified: new Date().toISOString() }
              }
            },
            'Photos': {
              'vacation.jpg': { type: 'image', size: '2.1 MB', modified: new Date().toISOString(), url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzMzNzNkYyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzYzNjZmMSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI3NreSkiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2ZlZGQ0YyIvPjxwb2x5Z29uIHBvaW50cz0iMCwyMDAgMTAwLDE1MCAyMDAsMTgwIDMwMCwxNDAgNDAwLDE2MCA0MDAsMzAwIDAsMzAwIiBmaWxsPSIjMjJjNTVlIi8+PHRleHQgeD0iMjAwIiB5PSIyNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjI0Ij5WYWNhdGlvbiBQaG90bzwvdGV4dD48L3N2Zz4=' },
              'family.png': { type: 'image', size: '890 KB', modified: new Date().toISOString(), url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y5ZmFmYiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9IiNmYmJmMjQiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjZmJiZjI0Ii8+PGNpcmNsZSBjeD0iMzAwIiBjeT0iMTAwIiByPSIzMCIgZmlsbD0iI2ZiYmYyNCIvPjx0ZXh0IHg9IjIwMCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzc0MTUxIiBmb250LXNpemU9IjI0Ij5GYW1pbHkgUGhvdG88L3RleHQ+PC9zdmc+' }
            },
            'report.pdf': { type: 'file', size: '156 KB', modified: new Date().toISOString(), content: 'PDF document content...' },
            'notes.txt': { type: 'file', size: '2.3 KB', modified: new Date().toISOString(), content: 'These are my notes...\n\nImportant information:\n- Remember to backup files\n- Update project documentation\n- Schedule team meeting' }
          },
          'Downloads': {
            'installer.dmg': { type: 'file', size: '234 MB', modified: new Date().toISOString() },
            'document.pdf': { type: 'file', size: '1.8 MB', modified: new Date().toISOString() }
          },
          'Desktop': {},
          'Pictures': {
            'Screenshots': { type: 'folder', contents: {} }
          }
        }
      }
    };
  });

  const [currentPath, setCurrentPath] = useState(['Users', 'john', 'Documents']);
  const [selectedItems, setSelectedItems] = useState([]);
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemType, setNewItemType] = useState('folder');
  const [newItemName, setNewItemName] = useState('');
  const [previewItem, setPreviewItem] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Window state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 50, y: 50 });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const windowRef = useRef(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-close sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
      // Auto-close preview on mobile when item changes
      if (window.innerWidth < 768 && previewItem) {
        setPreviewItem(null);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [previewItem]);

  // Dragging variables
  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 50,
    startWindowY: 50,
    currentWindowX: 50,
    currentWindowY: 50
  });

  // Sidebar items
  const sidebarItems = [
    { icon: Home, name: 'Home', path: ['Users', 'john'] },
    { icon: Download, name: 'Downloads', path: ['Users', 'john', 'Downloads'] },
    { icon: FileText, name: 'Documents', path: ['Users', 'john', 'Documents'] },
    { icon: Image, name: 'Pictures', path: ['Users', 'john', 'Pictures'] },
    { icon: Trash2, name: 'Trash', path: ['Trash'] }
  ];

  // Utility functions
  const getCurrentDirectory = () => {
    let current = fileSystem;
    for (const segment of currentPath) {
      current = current[segment];
      if (!current) return {};
    }
    return current;
  };

  const updateFileSystem = (newFileSystem) => {
    setFileSystem({ ...newFileSystem });
  };

  const getFileIcon = (type, name) => {
    if (type === 'folder') return FolderOpen;
    if (type === 'image') return Image;
    if (type === 'audio') return Music;
    if (type === 'video') return Video;
    if (type === 'archive') return Archive;
    if (name.endsWith('.pdf') || name.endsWith('.txt') || name.endsWith('.md')) return FileText;
    return File;
  };

  const formatFileSize = (size) => {
    if (typeof size === 'string') return size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // File operations
  const createNewItem = () => {
    if (!newItemName.trim()) return;
    
    const currentDir = getCurrentDirectory();
    const newFileSystem = { ...fileSystem };
    
    // Navigate to current directory in the new file system
    let targetDir = newFileSystem;
    for (const segment of currentPath) {
      targetDir = targetDir[segment];
    }
    
    if (newItemType === 'folder') {
      targetDir[newItemName] = { type: 'folder', contents: {} };
    } else {
      targetDir[newItemName] = {
        type: 'file',
        size: '0 B',
        modified: new Date().toISOString(),
        content: newItemType === 'text' ? '' : undefined
      };
    }
    
    updateFileSystem(newFileSystem);
    setShowNewItemDialog(false);
    setNewItemName('');
  };

  const deleteItem = (itemName) => {
    const newFileSystem = { ...fileSystem };
    let targetDir = newFileSystem;
    
    for (const segment of currentPath) {
      targetDir = targetDir[segment];
    }
    
    delete targetDir[itemName];
    updateFileSystem(newFileSystem);
    setSelectedItems(selectedItems.filter(item => item !== itemName));
    setContextMenu(null);
  };

  const copyItem = (itemName) => {
    const currentDir = getCurrentDirectory();
    setClipboard({
      type: 'copy',
      item: itemName,
      data: currentDir[itemName],
      sourcePath: [...currentPath]
    });
    setContextMenu(null);
  };

  const cutItem = (itemName) => {
    const currentDir = getCurrentDirectory();
    setClipboard({
      type: 'cut',
      item: itemName,
      data: currentDir[itemName],
      sourcePath: [...currentPath]
    });
    setContextMenu(null);
  };

  const pasteItem = () => {
    if (!clipboard) return;
    
    const newFileSystem = { ...fileSystem };
    let targetDir = newFileSystem;
    
    for (const segment of currentPath) {
      targetDir = targetDir[segment];
    }
    
    // Create a unique name if item already exists
    let newName = clipboard.item;
    let counter = 1;
    while (targetDir[newName]) {
      const extension = newName.includes('.') ? '.' + newName.split('.').pop() : '';
      const baseName = newName.includes('.') ? newName.substring(0, newName.lastIndexOf('.')) : newName;
      newName = `${baseName} copy${counter > 1 ? ` ${counter}` : ''}${extension}`;
      counter++;
    }
    
    targetDir[newName] = { ...clipboard.data };
    
    // If it was a cut operation, remove from source
    if (clipboard.type === 'cut') {
      let sourceDir = newFileSystem;
      for (const segment of clipboard.sourcePath) {
        sourceDir = sourceDir[segment];
      }
      delete sourceDir[clipboard.item];
      setClipboard(null);
    }
    
    updateFileSystem(newFileSystem);
    setContextMenu(null);
  };

  // Navigation
  const navigateToPath = (newPath) => {
    setCurrentPath(newPath);
    setSelectedItems([]);
    setPreviewItem(null);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const handleItemClick = (item) => {
    if (item.type === 'folder') {
      setCurrentPath([...currentPath, item.name]);
      setSelectedItems([]);
      setPreviewItem(null);
    } else {
      setSelectedItems([item.name]);
      if (item.type === 'image' && !isMobile) {
        setPreviewItem(item);
      }
    }
  };

  const handleItemDoubleClick = (item) => {
    if (item.type === 'folder') {
      setCurrentPath([...currentPath, item.name]);
      setSelectedItems([]);
      setPreviewItem(null);
    } else if (item.type === 'image') {
      setPreviewItem(item);
    } else if (item.type === 'file' && (item.name.endsWith('.txt') || item.name.endsWith('.md'))) {
      // Open text files for editing
      setPreviewItem(item);
    }
  };

  // Context menu
  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item: item
    });
  };

  // Get current items
  const currentDir = getCurrentDirectory();
  const items = Object.entries(currentDir)
    .filter(([name]) => name !== 'type' && name !== 'contents')
    .map(([name, info]) => ({
      name,
      type: info.type || 'folder',
      size: info.size,
      modified: info.modified,
      content: info.content,
      url: info.url
    }));

  // Window management (adapted for mobile)
  useEffect(() => {
    if (isMobile) return; // Skip window management on mobile
    
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
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isMaximized, isMobile]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleClose = () => {
    onClose();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    if (isMobile) return; // Disable maximize on mobile
    
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

  // Mobile-specific styles
  const mobileStyles = isMobile ? {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    transform: 'none',
    borderRadius: 0,
  } : {
    width: isMaximized ? '100vw' : 'min(95vw, 1200px)',
    height: isMaximized ? 'calc(100vh - 25px)' : 'min(90vh, 700px)',
  };

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
        zIndex: isActive ? 1000 : 999,
        display: isMinimized ? 'none' : 'block',
        willChange: isDragging ? 'transform' : 'auto',
        transition: isDragging ? 'none' : 'all 0.2s'
      }}
      onClick={() => setIsActive(true)}
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
        {/* Left section - Traffic lights on desktop, menu on mobile */}
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

        {/* Center section - Navigation on desktop, path on mobile */}
        <div className={`flex items-center gap-2 ${isMobile ? 'flex-1 mx-4' : ''}`}>
          {!isMobile && (
            <>
              <button 
                onClick={() => currentPath.length > 1 && navigateToPath(currentPath.slice(0, -1))}
                className="p-1.5 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPath.length <= 1}
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
          
          {/* Window Title / Path */}
          <div className={`${isMobile ? '' : 'absolute left-1/2 transform -translate-x-1/2'} pointer-events-none`}>
            <div className={`flex items-center gap-1 ${isMobile ? 'text-base' : 'text-sm'} text-gray-700`}>
              {isMobile ? (
                // Show only current folder on mobile
                <span className="font-medium truncate">
                  {currentPath[currentPath.length - 1]}
                </span>
              ) : (
                // Show full path on desktop
                currentPath.map((segment, index) => (
                  <span key={index} className="flex items-center gap-1">
                    {index > 0 && <span className="text-gray-400">/</span>}
                    <span className={index === currentPath.length - 1 ? 'font-medium' : ''}>
                      {segment}
                    </span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right section - View controls & search */}
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
            <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
      <div className="h-full bg-white flex" style={{ height: `calc(100% - ${isMobile ? '3.5rem' : '3rem'})` }}>
        {/* Sidebar - Overlay on mobile */}
        <div className={`${
          isMobile 
            ? `fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }` 
            : 'w-48 bg-gray-50'
        } border-r border-gray-200 flex flex-col`}>
          {/* Sidebar Header */}
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Favorites</h3>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Sidebar Items */}
          <div className="flex-1 p-2">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = JSON.stringify(currentPath) === JSON.stringify(item.path);
              
              return (
                <button
                  key={index}
                  onClick={() => navigateToPath(item.path)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-md text-sm transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <Icon size={16} />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-opacity-50 z-40 backdrop-blur-lg"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className={`flex items-center justify-between px-4 ${isMobile ? 'py-3' : 'py-2'} border-b border-gray-200 bg-gray-50`}>
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => currentPath.length > 1 && navigateToPath(currentPath.slice(0, -1))}
                className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={currentPath.length <= 1}
                style={{ cursor: 'pointer' }}
              >
                <ArrowUp size={14} />
                {!isMobile && 'Up'}
              </button>
              <button 
                onClick={() => setShowNewItemDialog(true)}
                className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors`}
                style={{ cursor: 'pointer' }}
              >
                <Plus size={14} />
                {!isMobile && 'New'}
              </button>
              {clipboard && (
                <button 
                  onClick={pasteItem}
                  className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors`}
                  style={{ cursor: 'pointer' }}
                >
                  {!isMobile && 'Paste'}
                  {isMobile && <Copy size={14} />}
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
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
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>

          {/* File Grid/List */}
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 p-4 overflow-auto">
              {view === 'grid' ? (
                <div className={`grid gap-4 ${
                  isMobile 
                    ? 'grid-cols-2' 
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                }`}>
                  {items
                    .filter(item => 
                      searchQuery === '' || 
                      item.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item, index) => {
                      const Icon = getFileIcon(item.type, item.name);
                      const isSelected = selectedItems.includes(item.name);
                      
                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-transparent hover:border-gray-200'
                          }`}
                          onClick={() => handleItemClick(item)}
                          onDoubleClick={() => handleItemDoubleClick(item)}
                          onContextMenu={(e) => handleContextMenu(e, item)}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Icon 
                              size={isMobile ? 40 : 48} 
                              className={`${
                                item.type === 'folder' ? 'text-blue-500' : 
                                item.type === 'image' ? 'text-green-500' :
                                'text-gray-600'
                              }`} 
                            />
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
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="space-y-1">
                  {!isMobile && (
                    <div className="grid grid-cols-12 gap-4 px-2 py-1 text-xs font-medium text-gray-500 border-b border-gray-200">
                      <div className="col-span-6">Name</div>
                      <div className="col-span-2">Size</div>
                      <div className="col-span-3">Modified</div>
                      <div className="col-span-1"></div>
                    </div>
                  )}
                  {items
                    .filter(item => 
                      searchQuery === '' || 
                      item.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item, index) => {
                      const Icon = getFileIcon(item.type, item.name);
                      const isSelected = selectedItems.includes(item.name);
                      
                      return (
                        <div
                          key={index}
                          className={`${
                            isMobile 
                              ? 'flex items-center gap-3 p-3' 
                              : 'grid grid-cols-12 gap-4 items-center p-2'
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
                              <Icon 
                                size={24} 
                                className={`flex-shrink-0 ${
                                  item.type === 'folder' ? 'text-blue-500' : 
                                  item.type === 'image' ? 'text-green-500' :
                                  'text-gray-600'
                                }`} 
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {item.name}
                                </p>
                                <div className="flex gap-2 text-xs text-gray-500">
                                  {item.size && <span>{formatFileSize(item.size)}</span>}
                                  <span>{formatDate(item.modified)}</span>
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
                              <div className="col-span-6 flex items-center gap-3 min-w-0">
                                <Icon 
                                  size={20} 
                                  className={`flex-shrink-0 ${
                                    item.type === 'folder' ? 'text-blue-500' : 
                                    item.type === 'image' ? 'text-green-500' :
                                    'text-gray-600'
                                  }`} 
                                />
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {item.name}
                                </p>
                              </div>
                              <div className="col-span-2 text-sm text-gray-500">
                                {item.size ? formatFileSize(item.size) : '—'}
                              </div>
                              <div className="col-span-3 text-sm text-gray-500">
                                {formatDate(item.modified)}
                              </div>
                              <div className="col-span-1 flex justify-end">
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
              
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Folder size={48} className="mb-2" />
                  <p>This folder is empty</p>
                </div>
              )}
            </div>

            {/* Preview Panel - Hidden on mobile */}
            {previewItem && !isMobile && (
              <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{previewItem.name}</h3>
                    <button
                      onClick={() => setPreviewItem(null)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {previewItem.size ? formatFileSize(previewItem.size) : '—'} • {formatDate(previewItem.modified)}
                  </p>
                </div>
                
                <div className="flex-1 p-4 overflow-auto">
                  {previewItem.type === 'image' && previewItem.url && (
                    <div className="space-y-4">
                      <img 
                        src={previewItem.url} 
                        alt={previewItem.name}
                        className="w-full rounded-lg shadow-sm"
                      />
                      <div className="text-sm text-gray-600">
                        <p>Image preview</p>
                      </div>
                    </div>
                  )}
                  
                  {previewItem.type === 'file' && previewItem.content && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg border p-4">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                          {previewItem.content}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {!previewItem.url && !previewItem.content && (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                      <Eye size={32} className="mb-2" />
                      <p className="text-sm">No preview available</p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleItemDoubleClick(previewItem)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => copyItem(previewItem.name)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {previewItem && isMobile && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="h-14 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4">
            <h3 className="font-medium text-gray-900 truncate flex-1">{previewItem.name}</h3>
            <button
              onClick={() => setPreviewItem(null)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            {previewItem.type === 'image' && previewItem.url && (
              <div className="space-y-4">
                <img 
                  src={previewItem.url} 
                  alt={previewItem.name}
                  className="w-full rounded-lg shadow-sm"
                />
                <div className="text-sm text-gray-600">
                  <p>Image preview</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {previewItem.size ? formatFileSize(previewItem.size) : '—'} • {formatDate(previewItem.modified)}
                  </p>
                </div>
              </div>
            )}
            
            {previewItem.type === 'file' && previewItem.content && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg border p-4">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {previewItem.content}
                  </pre>
                </div>
                <div className="text-xs text-gray-500">
                  {previewItem.size ? formatFileSize(previewItem.size) : '—'} • {formatDate(previewItem.modified)}
                </div>
              </div>
            )}
            
            {!previewItem.url && !previewItem.content && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Eye size={48} className="mb-2" />
                <p>No preview available</p>
                <p className="text-xs text-gray-500 mt-1">
                  {previewItem.size ? formatFileSize(previewItem.size) : '—'} • {formatDate(previewItem.modified)}
                </p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-3">
              <button
                onClick={() => copyItem(previewItem.name)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Copy size={16} />
                Copy
              </button>
              <button
                onClick={() => setPreviewItem(null)}
                className="flex-1 px-4 py-3 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 150),
            top: Math.min(contextMenu.y, window.innerHeight - 200),
          }}
        >
          <button
            onClick={() => {
              setPreviewItem(contextMenu.item);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Eye size={14} />
            Open
          </button>
          <button
            onClick={() => copyItem(contextMenu.item.name)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Copy size={14} />
            Copy
          </button>
          <button
            onClick={() => cutItem(contextMenu.item.name)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Scissors size={14} />
            Cut
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          <button
            onClick={() => deleteItem(contextMenu.item.name)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}

      {/* New Item Dialog */}
      {showNewItemDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-xl shadow-2xl p-6 w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
            <h3 className="text-lg font-semibold mb-4">Create New Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                  <button
                    onClick={() => setNewItemType('folder')}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${isMobile ? 'w-full' : ''} ${
                      newItemType === 'folder' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Folder
                  </button>
                  <button
                    onClick={() => setNewItemType('text')}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${isMobile ? 'w-full' : ''} ${
                      newItemType === 'text' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Text File
                  </button>
                  <button
                    onClick={() => setNewItemType('file')}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${isMobile ? 'w-full' : ''} ${
                      newItemType === 'file' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    File
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`Enter ${newItemType} name`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && createNewItem()}
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
                onClick={createNewItem}
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