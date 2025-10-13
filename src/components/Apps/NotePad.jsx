import { useState, useRef, useEffect } from 'react';
import { X, Save, Download } from 'lucide-react';
import { BASE_URL } from '../../../config';

export default function NotePad({ onClose, fileToOpen = null, userId }) {
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
  
  const windowRef = useRef(null);
  const textareaRef = useRef(null);

  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: window.notepadData?.windowPosition?.x || 300,
    startWindowY: window.notepadData?.windowPosition?.y || 150,
    currentWindowX: window.notepadData?.windowPosition?.x || 300,
    currentWindowY: window.notepadData?.windowPosition?.y || 50
  });

  const API_BASE = `${BASE_URL}/finder`;
  const CLOUD_API = `${BASE_URL}/cloud`;

  // Load file when fileToOpen changes
  useEffect(() => {
    if (fileToOpen && fileToOpen._id) {
      loadFile(fileToOpen);
    }
  }, [fileToOpen]);

  // Load file content
  const loadFile = async (file) => {
    try {
      setIsLoading(true);
      setCurrentFileId(file._id);
      setFileName(file.name);
      
      // Use googleDriveId from the file object (not driveFileId)
      const driveId = file.googleDriveId;
      setGoogleDriveId(driveId);

      console.log("Loading file:", { fileId: file._id, googleDriveId: driveId });

      if (driveId) {
        // Load from Google Drive
        const response = await fetch(`${CLOUD_API}/display/${driveId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const text = await response.text();
          console.log("File content loaded from Drive:", text.substring(0, 100));
          setNoteContent(text || 'Start typing your notes here...');
          setIsSaved(true);
          
          if (window.notepadData) {
            window.notepadData.content = text;
            window.notepadData.fileName = file.name;
            window.notepadData.isSaved = true;
          }
        } else {
          console.error("Failed to load from Drive, status:", response.status);
          throw new Error('Failed to load file content from Google Drive');
        }
      } else if (file.content !== undefined) {
        // Fallback: Load from MongoDB content field
        console.log("Loading from MongoDB content field");
        setNoteContent(file.content || 'Start typing your notes here...');
        setIsSaved(true);
        
        if (window.notepadData) {
          window.notepadData.content = file.content || '';
          window.notepadData.fileName = file.name;
          window.notepadData.isSaved = true;
        }
      } else {
        console.warn("No googleDriveId or content field found");
        setNoteContent('Start typing your notes here...');
      }
    } catch (error) {
      console.error("Error loading file:", error);
      alert("Failed to load file content: " + error.message);
      setNoteContent('Start typing your notes here...');
    } finally {
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

  useEffect(() => {
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
  }, [isMaximized]);

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

  // Save functionality - properly handle updates vs new files
  const handleSave = async () => {
    if (!userId) {
      alert("Please log in to save files");
      return;
    }

    // Don't save placeholder text
    if (noteContent === 'Start typing your notes here...') {
      alert("Please enter some content before saving");
      return;
    }

    try {
      setIsLoading(true);

      if (currentFileId && googleDriveId) {
        // UPDATE EXISTING FILE
        console.log("Updating existing file:", { currentFileId, googleDriveId });

        // Update MongoDB
        const mongoResponse = await fetch(`${API_BASE}/textfile/${currentFileId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ content: noteContent })
        });

        if (!mongoResponse.ok) {
          const errorData = await mongoResponse.json();
          throw new Error(errorData.error || 'Failed to update file in database');
        }

        console.log("MongoDB updated successfully");
        
        setIsSaved(true);
        if (window.notepadData) {
          window.notepadData.isSaved = true;
        }
        alert('File updated successfully!');

      } else {
        // CREATE NEW FILE
        console.log("Creating new file");

        const response = await fetch(`${API_BASE}/textfile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({
            name: fileName.endsWith('.txt') ? fileName : `${fileName}.txt`,
            content: noteContent,
            parentId: "desktop",
            owner: userId
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log("New file created:", data);
          
          setCurrentFileId(data.file._id);
          setGoogleDriveId(data.file.googleDriveId);
          setIsSaved(true);
          
          if (window.notepadData) {
            window.notepadData.isSaved = true;
          }
          
          alert('File saved successfully!');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save file');
        }
      }
    } catch (error) {
      console.error("Error saving file:", error);
      alert("Failed to save file: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAs = () => {
    setShowSaveDialog(true);
  };

  const handleSaveAsConfirm = async () => {
    setShowSaveDialog(false);
    
    // Reset IDs to force creating a new file
    setCurrentFileId(null);
    setGoogleDriveId(null);
    
    if (window.notepadData) {
      window.notepadData.fileName = fileName;
    }
    
    await handleSave();
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
  };

  return (
    <>
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
        <div
          className={`title-bar h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4 select-none transition-colors duration-200 ${
            isActive ? 'bg-gray-100' : 'bg-gray-50'
          }`}
          style={{ 
            cursor: 'default',
            WebkitAppRegion: 'drag'
          }}
        >
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

          <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
            <h1 className="text-sm font-medium text-gray-700">
              {fileName}{!isSaved && ' •'}
              {isLoading && ' (Loading...)'}
            </h1>
          </div>

          <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
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
          </div>
        </div>

        <div className="h-full bg-white flex flex-col" style={{ height: 'calc(100% - 3rem)' }}>
          <textarea
            ref={textareaRef}
            value={noteContent}
            onChange={handleContentChange}
            onFocus={handleTextareaFocus}
            onBlur={handleTextareaBlur}
            disabled={isLoading}
            className="flex-1 w-full p-6 text-gray-800 text-base leading-relaxed resize-none outline-none font-system bg-transparent disabled:opacity-50"
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