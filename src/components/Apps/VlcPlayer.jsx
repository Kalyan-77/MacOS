import { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2, FolderOpen, Settings, MoreHorizontal, Rewind, FastForward, Monitor } from 'lucide-react';

export default function VLCPlayer({onClose, zIndex = 1000, onFocus  }) {
  // Media state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // File input ref
  //const fileInputRef = useRef(null);

  // Window state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const windowRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sample playlist
  const [playlist, setPlaylist] = useState([]);

  // Dragging system
  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 300,
    startWindowY: 50,
    currentWindowX: 300,
    currentWindowY: 50
  });

  // File handling - simplified approach
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create object URL for the file
      const fileUrl = URL.createObjectURL(file);
      
      const newMedia = {
        id: Date.now(),
        title: file.name,
        artist: "Local File",
        duration: "--:--",
        url: fileUrl,
        file: file,
        type: file.type.startsWith('video/') ? 'video' : 'audio'
      };
      
      // Add to playlist
      setPlaylist(prev => [newMedia, ...prev]);
      
      // Play immediately
      playMedia(newMedia);
    }
  };

  const playMedia = (media) => {
    setCurrentMedia(media);
    setCurrentTime(0);
    setDuration(0);
    
    if (videoRef.current) {
      // Reset video element
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      
      // Set new source
      videoRef.current.src = media.url;
      
      // Set up event listeners
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        setDuration(videoRef.current.duration || 0);
      };
      
      videoRef.current.onloadeddata = () => {
        console.log('Video data loaded');
        setIsPlaying(false);
      };
      
      videoRef.current.onerror = (e) => {
        console.error('Video error:', e);
        console.error('Error details:', videoRef.current.error);
        alert('Error loading video: ' + (videoRef.current.error?.message || 'Unknown error'));
      };
      
      videoRef.current.oncanplay = () => {
        console.log('Video can play');
      };
      
      // Load the video
      videoRef.current.load();
    }
  };

  const togglePlay = () => {
    if (videoRef.current && currentMedia) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(error => {
              console.error('Play failed:', error);
              alert('Failed to play video: ' + error.message);
            });
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
    }
  };

  const stopMedia = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch(err => {
          console.error('Error entering fullscreen:', err);
        });
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Initialize dragging system
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
        const isButton = e.target.closest('.traffic-lights') || e.target.closest('button') || e.target.closest('input') || e.target.closest('.controls');
        
        if (titleBar && !isButton) {
          e.preventDefault();
          e.stopPropagation();

            if (onFocus) {
              onFocus();
            }
          
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
        }
      }
    };

    const handleMouseUp = () => {
      if (dragState.current.holdingWindow) {
        dragState.current.holdingWindow = false;
        setIsDragging(false);
        document.body.style.userSelect = '';
      }
    };
    const handleWindowClick = () => {
      setIsActive(true);
      if (onFocus) onFocus(); 
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    windowElement.addEventListener('mousedown', handleMouseDown);

    windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      windowElement.removeEventListener('mousedown', handleMouseDown);
      document.body.style.userSelect = '';
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isMaximized]);

  // Initialize video element events
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', () => setIsPlaying(false));
      video.addEventListener('pause', () => setIsPlaying(false));
      video.addEventListener('play', () => setIsPlaying(true));
      
      // Set initial volume
      video.volume = volume / 100;
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', () => setIsPlaying(false));
        video.removeEventListener('pause', () => setIsPlaying(false));
        video.removeEventListener('play', () => setIsPlaying(true));
      };
    }
  }, [volume]);

  const handleClose = () => {
    onClose();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (!isMaximized) {
      dragState.current.currentWindowX = 0;
      dragState.current.currentWindowY = 0;
      windowRef.current.style.transform = `translate3d(0px, 0px, 0)`;
    } else {
      dragState.current.currentWindowX = 300;
      dragState.current.currentWindowY = 50;
      windowRef.current.style.transform = `translate3d(300px, 50px, 0)`;
    }
  };

  return (
    <div className="min-h-screen  p-4 flex items-center justify-center">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/x-matroska,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        ref={windowRef}
        className={`fixed bg-gray-900 rounded-xl shadow-2xl overflow-hidden transition-all duration-200 ${
          isActive ? 'ring-2 ring-orange-500/20' : ''
        } ${
          isMinimized ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
        }`}
        style={{
          left: 0,
          top: 0,
          width: isMaximized ? '100vw' : '1000px',
          height: isMaximized ? '100vh' : '600px',
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
        <div className="title-bar h-10 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 select-none">
          {/* Traffic Light Buttons */}
          <div className="traffic-lights flex items-center gap-2">
            <button
              className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-150 group flex items-center justify-center"
              onClick={handleClose}
              title="Close"
              style={{cursor: 'pointer'}}
            >
              <X size={8} className="text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors duration-150 group flex items-center justify-center"
              onClick={handleMinimize}
              title="Minimize"
              style={{cursor: 'pointer'}}
            >
              <div className="w-2 h-0.5 bg-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button
              className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-150 group flex items-center justify-center"
              onClick={handleMaximize}
              title={isMaximized ? "Restore" : "Maximize"}
              style={{cursor: 'pointer'}}
            >
              <div className="w-1.5 h-1.5 border border-green-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>

          {/* Window Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-b from-orange-400 to-orange-600 rounded" />
              <h1 className="text-sm font-medium text-white">
                VLC Media Player {currentMedia ? `- ${currentMedia.title}` : ''}
              </h1>
            </div>
          </div>

          {/* Menu Options */}
          <div className="flex items-center gap-2">
            <button 
              onClick={openFilePicker}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors" 
              title="Open File"
            >
              <FolderOpen size={14} className="text-gray-300" />
            </button>
            <button 
              onClick={() => setShowPlaylist(!showPlaylist)}
              className={`p-1.5 hover:bg-gray-700 rounded transition-colors ${showPlaylist ? 'bg-gray-700' : ''}`}
              title="Toggle Playlist"
            >
              <MoreHorizontal size={14} className="text-gray-300" />
            </button>
            <button className="p-1.5 hover:bg-gray-700 rounded transition-colors">
              <Settings size={14} className="text-gray-300" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-full bg-black flex" style={{ height: 'calc(100% - 2.5rem)' }}>
          {/* Video Area */}
          <div className="flex-1 relative bg-black flex flex-col">
            {/* Video Player */}
            <div className="flex-1 relative bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
              {currentMedia ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  onClick={togglePlay}
                  onDoubleClick={toggleFullscreen}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              ) : (
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-b from-orange-400 to-orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <Play size={48} className="text-white ml-2" />
                  </div>
                  <h2 className="text-2xl font-light text-white mb-2">VLC Media Player</h2>
                  <p className="text-gray-400 mb-4">Click "Open File" to select a video</p>
                  <button
                    onClick={openFilePicker}
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                  >
                    <FolderOpen size={16} />
                    Open File
                  </button>
                </div>
              )}
            </div>

            {/* Controls Bar */}
            <div className="controls bg-gray-800 p-3 space-y-2">
              {/* Progress Bar */}
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <span className="w-12 text-right">{formatTime(currentTime)}</span>
                <div 
                  className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer relative"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-orange-500 rounded-full relative"
                    style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                  >
                    <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full"></div>
                  </div>
                </div>
                <span className="w-12">{formatTime(duration)}</span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button onClick={skipBackward} className="p-2 hover:bg-gray-700 rounded transition-colors" title="Skip back 10s">
                    <Rewind size={18} className="text-gray-300" />
                  </button>
                  <button 
                    onClick={togglePlay} 
                    className="p-3 hover:bg-orange-700 rounded-full bg-orange-600 transition-colors"
                    disabled={!currentMedia}
                  >
                    {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-0.5" />}
                  </button>
                  <button onClick={stopMedia} className="p-2 hover:bg-gray-700 rounded transition-colors" title="Stop">
                    <Square size={18} className="text-gray-300" />
                  </button>
                  <button onClick={skipForward} className="p-2 hover:bg-gray-700 rounded transition-colors" title="Skip forward 10s">
                    <FastForward size={18} className="text-gray-300" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="p-2 hover:bg-gray-700 rounded transition-colors">
                    {isMuted || volume === 0 ? <VolumeX size={18} className="text-gray-300" /> : <Volume2 size={18} className="text-gray-300" />}
                  </button>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-20 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-gray-400 w-8">{volume}%</span>
                  </div>
                  <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-700 rounded transition-colors" title="Fullscreen">
                    <Monitor size={18} className="text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Playlist Sidebar */}
          {showPlaylist && (
            <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
              <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-white font-medium">Playlist</h3>
                <button 
                  onClick={openFilePicker}
                  className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                  title="Add File"
                >
                  <FolderOpen size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {playlist.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    <p>No media files loaded</p>
                    <button
                      onClick={openFilePicker}
                      className="mt-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors text-sm"
                    >
                      Add Files
                    </button>
                  </div>
                ) : (
                  playlist.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => playMedia(item)}
                      className={`p-3 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors ${
                        currentMedia?.id === item.id ? 'bg-orange-900/20 border-orange-600/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400 text-sm w-6 text-center">{index + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm truncate ${
                            currentMedia?.id === item.id ? 'text-orange-400' : 'text-white'
                          }`}>
                            {item.title}
                          </div>
                          <div className="text-gray-400 text-xs truncate">{item.artist}</div>
                        </div>
                        <div className="text-gray-400 text-xs">{item.duration}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #ea580c;
            cursor: pointer;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #ea580c;
            cursor: pointer;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
        `}</style>
      </div>
    </div>
  );
}