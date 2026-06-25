import { useState, useRef, useEffect } from 'react';
import { X, Save, Download, Menu, MoreVertical, Share2, Trash2, Edit3, Copy } from 'lucide-react';
import { BASE_URL } from '../../../config';

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
  const [isMobile, setIsMobile] = useState(false);

  const textareaRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const API_BASE = `${BASE_URL}/finder`;
  const CLOUD_API = `${BASE_URL}/cloud`;

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

  // Load file content from Google Drive
  const loadFile = async (file) => {
    try {
      setIsLoading(true);
      setCurrentFileId(file._id);
      setFileName(file.name);

      const driveId = file.googleDriveId;
      setGoogleDriveId(driveId);

      console.log("Loading file:", { fileId: file._id, googleDriveId: driveId });

      if (!driveId) {
        throw new Error("File has no Google Drive ID");
      }

      // Fetch actual file content from Google Drive
      const response = await fetch(`${CLOUD_API}/display/${driveId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const content = await response.text();

      setNoteContent(content);
      setIsSaved(true);

      if (window.notepadData) {
        window.notepadData.content = content;
        window.notepadData.fileName = file.name;
        window.notepadData.isSaved = true;
      }

      setIsLoading(false);
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
        isSaved: true
      };
    }
  }, []);

  useEffect(() => {
    if (window.notepadData) {
      window.notepadData.content = noteContent;
      window.notepadData.fileName = fileName;
      window.notepadData.isSaved = isSaved;
    }
  }, [noteContent, fileName, isSaved]);

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
      alert("You must be logged in to save files.");
      return;
    }

    if (noteContent === 'Start typing your notes here...') {
      alert("Please enter some content before saving");
      return;
    }

    setIsLoading(true);

    try {
      if (currentFileId && googleDriveId) {
        // Update existing file
        const response = await fetch(`${API_BASE}/textfile/${currentFileId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            content: noteContent
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update file');
        }

        const data = await response.json();
        console.log('File updated:', data);

        setIsSaved(true);
        if (window.notepadData) {
          window.notepadData.isSaved = true;
        }
        alert('File saved successfully!');
      } else {
        // Create new file
        const response = await fetch(`${API_BASE}/textfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: fileName,
            content: noteContent,
            owner: userId,
            parentId: null
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create file');
        }

        const data = await response.json();
        console.log('File created:', data);

        setCurrentFileId(data.file._id);
        setGoogleDriveId(data.file.googleDriveId);
        setIsSaved(true);
        if (window.notepadData) {
          window.notepadData.isSaved = true;
        }
        alert('File saved successfully!');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save file: ' + error.message);
    } finally {
      setIsLoading(false);
      setShowMobileMenu(false);
    }
  };

  const handleSaveAs = () => {
    setShowSaveDialog(true);
    setShowMobileMenu(false);
  };

  const handleSaveAsConfirm = async () => {
    setShowSaveDialog(false);

    // Reset file IDs to create a new file
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

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <style>
        {`
          .notepad-scroll::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      {/* Title Bar */}
      <div
        className={`title-bar ${isMobile ? 'h-14' : 'h-12'} bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4 select-none transition-colors duration-200`}
        style={{
          cursor: 'default'
        }}
      >
        <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-2">
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
          onFocus={() => {
            if (noteContent === 'Start typing your notes here...') {
              setNoteContent('');
              if (window.notepadData) {
                window.notepadData.content = '';
              }
            }
          }}
          onBlur={() => {
            if (noteContent.trim() === '') {
              const placeholderText = 'Start typing your notes here...';
              setNoteContent(placeholderText);
              if (window.notepadData) {
                window.notepadData.content = placeholderText;
              }
            }
          }}
          disabled={isLoading}
          className={`flex-1 w-full notepad-scroll ${isMobile ? 'p-4 text-base' : 'p-6 text-base'} text-gray-800 leading-relaxed resize-none outline-none font-system bg-transparent disabled:opacity-50`}
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
    </div>
  );
}