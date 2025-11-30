import { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, SkipBack, SkipForward, Minus, Square } from 'lucide-react';
import { BASE_URL } from '../../../config';

export default function VideoPlayer({ onClose, fileToOpen = null, userId, zIndex = 1000, onFocus }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [fileName, setFileName] = useState('Untitled Video');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 300, y: 150 });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const windowRef = useRef(null);
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 300,
    startWindowY: 150,
    currentWindowX: 300,
    currentWindowY: 50
  });

  // Check if device is mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
      
      // Auto-maximize on mobile
      if (isMobileDevice && !isMaximized) {
        setIsMaximized(true);
        dragState.current.currentWindowX = 0;
        dragState.current.currentWindowY = 0;
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (fileToOpen && fileToOpen._id) {
      loadVideo(fileToOpen);
    }
  }, [fileToOpen]);

  const loadVideo = async (file) => {
    try {
      setIsLoading(true);
      setFileName(file.name);
      
      const driveId = file._id;

      if (driveId) {
        const videoDisplayUrl = `${BASE_URL}/cloud/display/${driveId}`;
        setVideoUrl(videoDisplayUrl);
      } else if (file.url) {
        setVideoUrl(file.url);
      } else {
        throw new Error('No video source available');
      }
      
      setIsPlaying(false);
      setCurrentTime(0);
    } catch (error) {
      console.error("Error loading video:", error);
      alert("Failed to load video: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

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

          // z-index is managed by the parent MacOS component via the `zIndex` prop

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

  // Auto-hide controls on mobile after inactivity
  useEffect(() => {
    if (!isMobile) return;

    const resetControlsTimeout = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    resetControlsTimeout();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, isMobile]);

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (videoRef.current && !isMinimized) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      dragState.current.currentWindowX = prevPosition.x;
      dragState.current.currentWindowY = prevPosition.y;
      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
      }
    } else {
      setPrevPosition({
        x: dragState.current.currentWindowX,
        y: dragState.current.currentWindowY
      });
      setIsMaximized(true);
      dragState.current.currentWindowX = 0;
      dragState.current.currentWindowY = isMobile ? 0 : 25;
      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(0px, ${isMobile ? 0 : 25}px, 0)`;
      }
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleWindowClick = () => {
    setIsActive(true);
    if(onFocus) onFocus();
  };

  const handleVideoClick = () => {
    if (isMobile) {
      setShowControls(!showControls);
    }
  };

  // Get responsive dimensions
  const getWindowDimensions = () => {
    if (isMaximized) {
      return {
        width: '100vw',
        height: isMobile ? '100vh' : 'calc(100vh - 25px)'
      };
    }
    
    if (isMobile) {
      return {
        width: '100vw',
        height: '100vh'
      };
    }
    
    // Desktop windowed mode
    const maxWidth = Math.min(1000, window.innerWidth - 100);
    const maxHeight = Math.min(600, window.innerHeight - 100);
    
    return {
      width: `${maxWidth}px`,
      height: `${maxHeight}px`
    };
  };

  const dimensions = getWindowDimensions();

  return (
    <div
      ref={windowRef}
      className={`fixed bg-white overflow-hidden transition-all duration-200 ${
        isMobile ? 'rounded-none' : 'rounded-xl shadow-2xl'
      } ${
        isActive ? 'ring-2 ring-blue-500/20' : ''
      } ${
        isMinimized ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      }`}
      style={{
        left: 0,
        top: 0,
        width: dimensions.width,
        height: dimensions.height,
        zIndex: zIndex,
        display: isMinimized ? 'none' : 'block',
        willChange: isDragging ? 'transform' : 'auto',
        transition: isDragging ? 'none' : 'all 0.2s'
      }}
      onClick={() => {
        handleWindowClick();
        if (onFocus) onFocus();
      }}
    >
      <div
        className={`title-bar ${isMobile ? 'h-14' : 'h-12'} bg-gray-100 border-b border-gray-200 flex items-center justify-between ${isMobile ? 'px-4' : 'px-4'} select-none transition-colors duration-200 ${
          isActive ? 'bg-gray-100' : 'bg-gray-50'
        }`}
        style={{ 
          cursor: 'default',
          WebkitAppRegion: isMobile ? 'no-drag' : 'drag'
        }}
      >
        <div className="traffic-lights flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-150 group flex items-center justify-center cursor-pointer`}
            onClick={handleClose}
            title="Close"
          >
            <X size={isMobile ? 10 : 8} className="text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          {!isMobile && (
            <>
              <button
                className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors duration-150 group flex items-center justify-center cursor-pointer"
                onClick={handleMinimize}
                title="Minimize"
              >
                <Minus size={8} className="text-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-150 group flex items-center justify-center cursor-pointer"
                onClick={handleMaximize}
                title={isMaximized ? "Restore" : "Maximize"}
              >
                <Square size={6} className="text-green-800 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </>
          )}
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
          <h1 className={`${isMobile ? 'text-base' : 'text-sm'} font-medium text-gray-700`}>
            {isMobile && fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName}
            {!isMobile && fileName}
            {isLoading && ' (Loading...)'}
          </h1>
        </div>
      </div>

      <div 
        className="bg-black flex flex-col items-center justify-center relative" 
        style={{ height: isMobile ? 'calc(100% - 3.5rem)' : 'calc(100% - 3rem)' }}
      >
        {isLoading ? (
          <div className={`text-white ${isMobile ? 'text-xl' : 'text-lg'}`}>Loading video...</div>
        ) : videoUrl ? (
          <div className="w-full h-full flex flex-col relative">
            <div className="flex-1 flex items-center justify-center" onClick={handleVideoClick}>
              <video
                ref={videoRef}
                src={videoUrl}
                className="max-w-full max-h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                playsInline
              />
            </div>
            
            {/* Video Controls */}
            <div 
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent ${isMobile ? 'p-3' : 'p-4'} space-y-3 transition-opacity duration-300 ${
                isMobile && !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              {/* Progress Bar */}
              <div 
                ref={progressBarRef}
                className={`w-full ${isMobile ? 'h-1.5' : 'h-2'} bg-gray-700 rounded-full cursor-pointer relative group`}
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
                {!isMobile && (
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
                  ></div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className={`flex items-center ${isMobile ? 'gap-3' : 'gap-4'}`}>
                  <button
                    onClick={skipBackward}
                    className={`text-white hover:text-blue-400 transition-colors ${isMobile ? 'p-2' : ''}`}
                    title="Skip back 10s"
                  >
                    <SkipBack size={isMobile ? 22 : 20} />
                  </button>
                  
                  <button
                    onClick={togglePlayPause}
                    className={`text-white hover:text-blue-400 transition-colors ${isMobile ? 'p-2' : ''}`}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={isMobile ? 28 : 24} /> : <Play size={isMobile ? 28 : 24} />}
                  </button>
                  
                  <button
                    onClick={skipForward}
                    className={`text-white hover:text-blue-400 transition-colors ${isMobile ? 'p-2' : ''}`}
                    title="Skip forward 10s"
                  >
                    <SkipForward size={isMobile ? 22 : 20} />
                  </button>

                  {!isMobile && (
                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  )}
                </div>

                <div className={`flex items-center ${isMobile ? 'gap-3' : 'gap-4'}`}>
                  {isMobile && (
                    <span className="text-white text-xs">
                      {formatTime(currentTime)}
                    </span>
                  )}
                  
                  {!isMobile && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-blue-400 transition-colors"
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 cursor-pointer"
                      />
                    </div>
                  )}

                  {isMobile ? (
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-blue-400 transition-colors p-2"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
                    </button>
                  ) : null}

                  <button
                    onClick={toggleFullscreen}
                    className={`text-white hover:text-blue-400 transition-colors ${isMobile ? 'p-2' : ''}`}
                    title="Fullscreen"
                  >
                    <Maximize2 size={isMobile ? 22 : 20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`text-white ${isMobile ? 'text-xl' : 'text-lg'}`}>No video to display</div>
        )}
      </div>
    </div>
  );
}