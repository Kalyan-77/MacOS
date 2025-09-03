import { useState, useRef, useEffect } from 'react';
import { X, Save, Download } from 'lucide-react';

export default function NotePad({ onClose }) {
  // Initialize state from stored values or defaults
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

  // Window state
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
  
  const windowRef = useRef(null);
  const textareaRef = useRef(null);

  // Dragging variables - enhanced for native-like movement
  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: window.notepadData?.windowPosition?.x || 300,
    startWindowY: window.notepadData?.windowPosition?.y || 150,
    currentWindowX: window.notepadData?.windowPosition?.x || 300,
    currentWindowY: window.notepadData?.windowPosition?.y || 50
  });

  // Initialize global storage if it doesn't exist
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

  // Save state to global storage whenever it changes
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

  // Initialize dragging system - native Windows-like movement
  useEffect(() => {
    const windowElement = windowRef.current;
    if (!windowElement) return;

    let highestZ = 1000;
    let animationFrame = null;

    const handleMouseMove = (e) => {
      if (dragState.current.holdingWindow && !isMaximized) {
        // Cancel any existing animation frame to ensure smooth movement
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }

        // Calculate direct position based on mouse offset from initial click
        const deltaX = e.clientX - dragState.current.mouseTouchX;
        const deltaY = e.clientY - dragState.current.mouseTouchY;
        
        dragState.current.currentWindowX = dragState.current.startWindowX + deltaX;
        dragState.current.currentWindowY = dragState.current.startWindowY + deltaY;

        // Allow more freedom - only prevent going completely off screen
        const minX = -windowElement.offsetWidth + 100; // Allow mostly off-screen left
        const minY = 0; // Keep title bar visible
        const maxX = window.innerWidth - 100; // Allow mostly off-screen right  
        const maxY = window.innerHeight - 100; // Allow mostly off-screen bottom

        dragState.current.currentWindowX = Math.max(minX, Math.min(maxX, dragState.current.currentWindowX));
        dragState.current.currentWindowY = Math.max(minY, Math.min(maxY, dragState.current.currentWindowY));

        // Use requestAnimationFrame for ultra-smooth movement
        animationFrame = requestAnimationFrame(() => {
          windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
        });
      }
    };

    const handleMouseDown = (e) => {
      // Only handle left mouse button
      if (e.button === 0) {
        const titleBar = e.target.closest('.title-bar');
        const isButton = e.target.closest('.traffic-lights') || e.target.closest('button');
        
        // Only start dragging if clicking on title bar but not on buttons
        if (titleBar && !isButton) {
          e.preventDefault();
          e.stopPropagation();
          
          dragState.current.holdingWindow = true;
          setIsActive(true);
          setIsDragging(true);

          // Bring window to front
          windowElement.style.zIndex = highestZ;
          highestZ += 1;

          // Store initial positions
          dragState.current.mouseTouchX = e.clientX;
          dragState.current.mouseTouchY = e.clientY;
          dragState.current.startWindowX = dragState.current.currentWindowX;
          dragState.current.startWindowY = dragState.current.currentWindowY;

          // Set cursor and disable text selection globally
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
        
        // Reset all global styles
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.body.style.pointerEvents = '';
        windowElement.style.pointerEvents = '';

        // Cancel any pending animation frame
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      }
    };

    // Prevent context menu during drag
    const handleContextMenu = (e) => {
      if (dragState.current.holdingWindow) {
        e.preventDefault();
      }
    };

    // Handle mouse leave to continue dragging even when cursor leaves window
    const handleMouseLeave = (e) => {
      // Don't stop dragging when mouse leaves the window
      // This allows for native-like behavior
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('mouseleave', handleMouseLeave);
    windowElement.addEventListener('mousedown', handleMouseDown);

    // Set initial position with hardware acceleration
    windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
    windowElement.style.willChange = 'transform';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('mouseleave', handleMouseLeave);
      windowElement.removeEventListener('mousedown', handleMouseDown);
      
      // Reset styles
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.body.style.pointerEvents = '';
      
      // Cancel animation frame
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isMaximized]);

  // Traffic light button handlers
  const handleClose = () => {
    onClose();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
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

  // Handle textarea focus
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

  // Handle content change
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setNoteContent(newContent);
    setIsSaved(false);
    
    // Update global storage immediately
    if (window.notepadData) {
      window.notepadData.content = newContent;
      window.notepadData.isSaved = false;
    }
  };

  // Save functionality
  const handleSave = () => {
    const blob = new Blob([noteContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsSaved(true);
    
    // Update global storage
    if (window.notepadData) {
      window.notepadData.isSaved = true;
    }
  };

  // Save As functionality
  const handleSaveAs = () => {
    setShowSaveDialog(true);
  };

  const handleSaveAsConfirm = () => {
    handleSave();
    setShowSaveDialog(false);
    
    // Update filename in global storage
    if (window.notepadData) {
      window.notepadData.fileName = fileName;
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [noteContent, fileName]);

  // Handle clicking on window to make it active
  const handleWindowClick = () => {
    setIsActive(true);
  };

  return (
    <>
      {/* Notepad Window */}
      <div
        ref={windowRef}
        className={`fixed bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-200 ${
          isActive ? 'ring-2 ring-blue-500/20' : ''
        } ${
          isMinimized ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
        }`}
        style={{
          left: 0,
          top: 0,
          width: isMaximized ? '100vw' : '1000px',
          height: isMaximized ? 'calc(100vh - 25px)' : '600px',
          zIndex: isActive ? 1000 : 999,
          display: isMinimized ? 'none' : 'block',
          willChange: isDragging ? 'transform' : 'auto',
          transition: isDragging ? 'none' : 'all 0.2s'
        }}
        onClick={handleWindowClick}
      >
        {/* Title Bar */}
        <div
          className={`title-bar h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4 select-none transition-colors duration-200 ${
            isActive ? 'bg-gray-100' : 'bg-gray-50'
          }`}
          style={{ 
            cursor: 'default',
            WebkitAppRegion: 'drag'  // Native drag region for Electron-like behavior
          }}
        >
          {/* Traffic Light Buttons */}
          <div className="traffic-lights flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
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

          {/* Window Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
            <h1 className="text-sm font-medium text-gray-700">
              {fileName}{!isSaved && ' •'}
            </h1>
          </div>

          {/* Document Icon & Save Button */}
          <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-150 cursor-pointer"
              title="Save (⌘S)"
              style={{ cursor: 'pointer' }}
            >
              <Save size={12} />
              Save
            </button>
            <button
              onClick={handleSaveAs}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-150 cursor-pointer"
              title="Save As"
              style={{ cursor: 'pointer' }}
            >
              <Download size={12} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="h-full bg-white flex flex-col" style={{ height: 'calc(100% - 3rem)' }}>
          {/* Text Editor */}
          <textarea
            ref={textareaRef}
            value={noteContent}
            onChange={handleContentChange}
            onFocus={handleTextareaFocus}
            onBlur={handleTextareaBlur}
            className="flex-1 w-full p-6 text-gray-800 text-base leading-relaxed resize-none outline-none font-system bg-transparent"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
              color: noteContent === 'Start typing your notes here...' ? '#9CA3AF' : '#374151',
              cursor: 'text'
            }}
            spellCheck="true"
            placeholder=""
          />
        </div>
      </div>

      {/* Save As Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[1001]">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
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
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                style={{ cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsConfirm}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
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