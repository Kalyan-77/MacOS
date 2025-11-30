import { useState, useRef, useEffect } from 'react';
import { X, Save, Download, Menu, MoreVertical, Share2, Trash2, Edit3, Copy } from 'lucide-react';

export default function NotePad({ onClose, fileToOpen = null, userId, zIndex = 1000, onFocus }) {
  const [noteContent, setNoteContent] = useState(() => {
    const stored = window.notepadData?.content;
    return stored || 'Start typing your notes here...';
  });
  const [fileName, setFileName] = useState(() => {
    const stored = window.notepadData?.fileName;
    return stored || 'Untitled.txt';
  });
  const [isSaved, setIsSaved] = useState(() => {
    const stored = window.notepadData?.isSaved;
    return stored !== undefined ? stored : true;
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [googleDriveId, setGoogleDriveId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(() => {
    const stored = window.notepadData?.isMaximized;
    return stored || false;
  });
  const [prevPosition, setPrevPosition] = useState(() => {
    const stored = window.notepadData?.prevPosition;
    return stored || { x: 300, y: 150 };
  });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const windowRef = useRef(null);
  const textareaRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: window.notepadData?.windowPosition?.x || 300,
    startWindowY: window.notepadData?.windowPosition?.y || 150,
    currentWindowX: window.notepadData?.windowPosition?.x || 300,
    currentWindowY: window.notepadData?.windowPosition?.y || 50
  });

  const API_BASE = `https://api.example.com/finder`;
  const CLOUD_API = `https://api.example.com/cloud`;

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load file when fileToOpen changes
  useEffect(() => {
    if (fileToOpen && fileToOpen._id) {
      loadFile(fileToOpen);
    }
  }, [fileToOpen]);

  // Load file content (mock implementation)
  const loadFile = async (file) => {
    try {
      setIsLoading(true);
      setCurrentFileId(file._id);
      setFileName(file.name);
      
      const driveId = file.googleDriveId;
      setGoogleDriveId(driveId);

      console.log("Loading file:", { fileId: file._id, googleDriveId: driveId });

      // Mock file content
      setTimeout(() => {
        const mockContent = `This is a sample file: ${file.name}\n\nYou can edit this content and save it.`;
        setNoteContent(mockContent);
        setIsSaved(true);
        
        if (window.notepadData) {
          window.notepadData.content = mockContent;
          window.notepadData.fileName = file.name;
          window.notepadData.isSaved = true;
        }
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error loading file:", error);
      alert("Failed to load file content: " + error.message);
      setNoteContent('Start typing your notes here...');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!window.notepadData) {
      window.notepadData = {
        content: 'Start typing your notes here...',
        fileName: 'Untitled.txt',
        isSaved: true,
        windowPosition: { x: 300, y: 150 },
        isMaximized: false,
        prevPosition: { x: 300, y: 150 }
      };
    }
  }, []);

  useEffect(() => {
    if (window.notepadData) {
      window.notepadData.content = noteContent;
      window.notepadData.fileName = fileName;
      window.notepadData.isSaved = isSaved;
      window.notepadData.windowPosition = { 
        x: dragState.current.currentWindowX, 
        y: dragState.current.currentWindowY 
      };
      window.notepadData.isMaximized = isMaximized;
      window.notepadData.prevPosition = prevPosition;
    }
  }, [noteContent, fileName, isSaved, isMaximized, prevPosition]);

  // Window dragging for desktop
  useEffect(() => {
    if (isMobile) return;
    
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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  const handleClose = () => {
    onClose();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    if (isMobile) return;
    
    if (isMaximized) {
      setIsMaximized(false);
      dragState.current.currentWindowX = prevPosition.x;
      dragState.current.currentWindowY = prevPosition.y;
      windowRef.current.style.transform = `translateX(${dragState.current.currentWindowX}px) translateY(${dragState.current.currentWindowY}px)`;
    } else {
      setPrevPosition({
        x: dragState.current.currentWindowX,
        y: dragState.current.currentWindowY
      });
      setIsMaximized(true);
      dragState.current.currentWindowX = 0;
      dragState.current.currentWindowY = 25;
      windowRef.current.style.transform = `translateX(0px) translateY(25px)`;
    }
  };

  const handleTextareaFocus = () => {
    setIsActive(true);
    if (noteContent === 'Start typing your notes here...') {
      setNoteContent('');
      if (window.notepadData) {
        window.notepadData.content = '';
      }
    }
  };

  const handleTextareaBlur = () => {
    if (noteContent.trim() === '') {
      const placeholderText = 'Start typing your notes here...';
      setNoteContent(placeholderText);
      if (window.notepadData) {
        window.notepadData.content = placeholderText;
      }
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setNoteContent(newContent);
    setIsSaved(false);
    
    if (window.notepadData) {
      window.notepadData.content = newContent;
      window.notepadData.isSaved = false;
    }
  };

  const handleSave = async () => {
    if (!userId) {
      alert("Please log in to save files");
      return;
    }

    if (noteContent === 'Start typing your notes here...') {
      alert("Please enter some content before saving");
      return;
    }

    setIsLoading(true);
    
    // Mock save
    setTimeout(() => {
      setIsSaved(true);
      if (window.notepadData) {
        window.notepadData.isSaved = true;
      }
      alert('File saved successfully!');
      setIsLoading(false);
      setShowMobileMenu(false);
    }, 500);
  };

  const handleSaveAs = () => {
    setShowSaveDialog(true);
    setShowMobileMenu(false);
  };

  const handleSaveAsConfirm = async () => {
    setShowSaveDialog(false);
    setCurrentFileId(null);
    setGoogleDriveId(null);
    
    if (window.notepadData) {
      window.notepadData.fileName = fileName;
    }
    
    await handleSave();
  };

  const handleDownload = () => {
    const blob = new Blob([noteContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setShowMobileMenu(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fileName,
          text: noteContent,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('Sharing is not supported on this device');
    }
    setShowMobileMenu(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(noteContent);
      alert('Content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    setShowMobileMenu(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [noteContent, fileName, currentFileId, googleDriveId, userId]);

  const handleWindowClick = () => {
    setIsActive(true);
    if(onFocus) onFocus();
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
        onClick={() =>{
          handleWindowClick();
          if(onFocus) onFocus();
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
                  className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-150 group flex items-center justify-center cursor-pointer"
                  onClick={handleClose}
                  title="Close"
                  style={{ cursor: 'pointer' }}
                >
                  <X size={8} className="text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors duration-150 group flex items-center justify-center cursor-pointer"
                  onClick={handleMinimize}
                  title="Minimize"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="w-2 h-0.5 bg-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                <button
                  className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-150 group flex items-center justify-center cursor-pointer"
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
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <Menu size={20} className="text-gray-600" />
              </button>
            )}
          </div>

          <div className={`${isMobile ? '' : 'absolute left-1/2 transform -translate-x-1/2'} pointer-events-none`}>
            <h1 className={`${isMobile ? 'text-base' : 'text-sm'} font-medium text-gray-700`}>
              {fileName}{!isSaved && ' •'}
              {isLoading && ' (Loading...)'}
            </h1>
          </div>

          <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
            {!isMobile && (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Save (⌘S)"
                  style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  <Save size={12} />
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleSaveAs}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-150 cursor-pointer disabled:opacity-50"
                  title="Save As"
                  style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  <Download size={12} />
                </button>
              </>
            )}
            
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

        {/* Mobile Menu Dropdown */}
        {isMobile && showMobileMenu && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
              onClick={() => setShowMobileMenu(false)}
            />
            <div 
              ref={mobileMenuRef}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 p-4 space-y-2 animate-slide-up"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
              
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                <Save size={20} />
                <span className="font-medium">{isLoading ? 'Saving...' : 'Save'}</span>
              </button>
              
              <button
                onClick={handleSaveAs}
                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <Edit3 size={20} />
                <span>Save As...</span>
              </button>
              
              <button
                onClick={handleDownload}
                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <Download size={20} />
                <span>Download</span>
              </button>
              
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <Copy size={20} />
                <span>Copy Text</span>
              </button>
              
              {navigator.share && (
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  <Share2 size={20} />
                  <span>Share</span>
                </button>
              )}
              
              <div className="border-t border-gray-200 pt-2">
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="w-full px-4 py-3 text-center text-gray-600 hover:text-gray-800 transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}

        {/* Text Editor */}
        <div className="h-full bg-white flex flex-col" style={{ height: `calc(100% - ${isMobile ? '3.5rem' : '3rem'})` }}>
          <textarea
            ref={textareaRef}
            value={noteContent}
            onChange={handleContentChange}
            onFocus={handleTextareaFocus}
            onBlur={handleTextareaBlur}
            disabled={isLoading}
            className={`flex-1 w-full ${isMobile ? 'p-4 text-base' : 'p-6 text-base'} text-gray-800 leading-relaxed resize-none outline-none font-system bg-transparent disabled:opacity-50`}
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
              color: noteContent === 'Start typing your notes here...' ? '#9CA3AF' : '#374151',
              cursor: 'text'
            }}
            spellCheck="true"
            placeholder=""
          />
          
          {/* Word Count - Mobile Bottom Bar */}
          {isMobile && (
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              <span>
                {noteContent === 'Start typing your notes here...' ? 0 : noteContent.split(/\s+/).filter(w => w).length} words
              </span>
              <span>
                {noteContent === 'Start typing your notes here...' ? 0 : noteContent.length} characters
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Save As Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[1001] p-4">
          <div className={`bg-white rounded-xl shadow-2xl p-6 w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Save As</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Name:
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter filename..."
                style={{ cursor: 'text' }}
              />
            </div>
            <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'justify-end'}`}>
              <button
                onClick={() => setShowSaveDialog(false)}
                className={`${isMobile ? 'w-full' : ''} px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer`}
                style={{ cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsConfirm}
                className={`${isMobile ? 'w-full' : ''} px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer`}
                style={{ cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}