import { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart, MoreVertical, List, RefreshCw } from 'lucide-react';
import { BASE_URL } from '../../../config';

export default function MusicPlayer({ onClose, fileToOpen = null, userId,zIndex = 1000, onFocus  }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);

  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 200, y: 100 });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const windowRef = useRef(null);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 200,
    startWindowY: 100,
    currentWindowX: 200,
    currentWindowY: 100
  });

  // Fetch all music files from Google Drive
  const fetchMusicFiles = async () => {
    try {
      setIsLoadingPlaylist(true);
      const response = await fetch(`${BASE_URL}/cloud/files/category?category=music`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch music files');
      }

      const musicFiles = await response.json();
      
      // Transform the response to match our playlist format
      const transformedPlaylist = musicFiles.map(file => ({
        _id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        viewLink: file.viewLink,
        downloadLink: file.downloadLink
      }));

      setPlaylist(transformedPlaylist);

      // If a file was passed to open, find it in the playlist and play it
      if (fileToOpen && fileToOpen._id) {
        const index = transformedPlaylist.findIndex(track => track._id === fileToOpen._id);
        if (index !== -1) {
          setCurrentTrackIndex(index);
          loadTrack(transformedPlaylist[index]);
        } else {
          // If file not in playlist, add it and play
          setPlaylist(prev => [...prev, fileToOpen]);
          setCurrentTrackIndex(transformedPlaylist.length);
          loadTrack(fileToOpen);
        }
      } else if (transformedPlaylist.length > 0) {
        // Load first track if no specific file to open
        setCurrentTrackIndex(0);
        loadTrack(transformedPlaylist[0]);
      }
    } catch (error) {
      console.error("Error fetching music files:", error);
      alert("Failed to load music library: " + error.message);
    } finally {
      setIsLoadingPlaylist(false);
    }
  };

  // Load music files on mount
  useEffect(() => {
    fetchMusicFiles();
  }, []);

  const loadTrack = async (file) => {
    try {
      setIsLoading(true);

      // Set audio source - using Google Drive display endpoint
      if (audioRef.current) {
        const audioUrl = `${BASE_URL}/cloud/display/${file._id}`;
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      }
    } catch (error) {
      console.error("Error loading track:", error);
      alert("Failed to load track: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    const handleCanPlay = () => {
      if (isPlaying) {
        audio.play().catch(err => console.error("Play error:", err));
      }
    };

    const handleError = (e) => {
      console.error("Audio error:", e);
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [isPlaying, isRepeat]);

  // Window dragging
  useEffect(() => {
    const windowElement = windowRef.current;
    if (!windowElement) return;

    let highestZ = 1000;
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

          windowElement.style.zIndex = highestZ++;
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

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    windowElement.addEventListener('mousedown', handleMouseDown);

    windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
    windowElement.style.willChange = 'transform';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      windowElement.removeEventListener('mousedown', handleMouseDown);
      
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.body.style.pointerEvents = '';
      
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isMaximized]);

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  };
  const handleWindowClick = () => {
  setIsActive(true);
  if (onFocus) onFocus();  // ADD THIS
};

  const handleMinimize = () => setIsMinimized(!isMinimized);

  const handleMaximize = () => {
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

  const togglePlayPause = () => {
    if (!audioRef.current || playlist.length === 0) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error("Play error:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;

    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % playlist.length;
    }

    setCurrentTrackIndex(nextIndex);
    loadTrack(playlist[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (playlist.length === 0) return;

    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
      setCurrentTrackIndex(prevIndex);
      loadTrack(playlist[prevIndex]);
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTrack = playlist[currentTrackIndex];

  return (
    <div
      ref={windowRef}
      className={`fixed bg-gradient-to-br from-purple-900 via-gray-900 to-black rounded-xl shadow-2xl overflow-hidden transition-all duration-200 ${
        isActive ? 'ring-2 ring-purple-500/20' : ''
      } ${isMinimized ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}
      style={{
        left: 0,
        top: 0,
        width: isMaximized ? '100vw' : '1000px',
        height: isMaximized ? 'calc(100vh - 25px)' : '650px',
        minWidth: '700px',
        minHeight: '550px',
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
      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      {/* Title Bar */}
      <div
        className={`title-bar h-12 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 select-none transition-colors duration-200 flex-shrink-0`}
        style={{ cursor: 'default' }}
      >
        <div className="traffic-lights flex items-center gap-2">
          <button
            className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-150 group flex items-center justify-center cursor-pointer"
            onClick={handleClose}
            title="Close"
          >
            <X size={8} className="text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors duration-150 group flex items-center justify-center cursor-pointer"
            onClick={handleMinimize}
            title="Minimize"
          >
            <div className="w-2 h-0.5 bg-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
          <button
            className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-150 group flex items-center justify-center cursor-pointer"
            onClick={handleMaximize}
            title={isMaximized ? "Restore" : "Maximize"}
          >
            <div className="w-1.5 h-1.5 border border-green-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
          <h1 className="text-sm font-medium text-white">
            Music Player
            {(isLoading || isLoadingPlaylist) && ' (Loading...)'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMusicFiles}
            disabled={isLoadingPlaylist}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white/10 text-white/70 hover:bg-white/20 rounded transition-colors duration-150 cursor-pointer disabled:opacity-50"
            title="Refresh Library"
          >
            <RefreshCw size={14} className={isLoadingPlaylist ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors duration-150 cursor-pointer ${
              showPlaylist ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            title="Toggle Playlist"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full" style={{ height: 'calc(100% - 3rem)' }}>
        {/* Player Area */}
        <div className={`flex-1 flex flex-col overflow-hidden ${showPlaylist ? '' : 'w-full'}`}>
          {/* Album Art / Visualizer - Scrollable */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <div className="relative flex-shrink-0">
              <div className={`w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 shadow-2xl flex items-center justify-center ${
                isPlaying ? 'animate-pulse' : ''
              }`}>
                <div className="w-44 h-44 sm:w-60 sm:h-60 lg:w-72 lg:h-72 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <div className={`text-white ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="sm:w-24 sm:h-24 lg:w-32 lg:h-32">
                      <circle cx="12" cy="12" r="10" strokeWidth="0.5" opacity="0.3" />
                      <circle cx="12" cy="12" r="7" strokeWidth="0.5" opacity="0.5" />
                      <circle cx="12" cy="12" r="3" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              </div>
              {isPlaying && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 opacity-50 blur-3xl -z-10"></div>
              )}
            </div>
          </div>

          {/* Track Info & Controls - Fixed at bottom */}
          <div className="flex-shrink-0 p-4 space-y-3 bg-gradient-to-t from-black/50 to-transparent">
            {/* Track Info */}
            <div className="w-full text-center px-2">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 truncate">
                {currentTrack?.name || 'No Track Loaded'}
              </h2>
              <p className="text-xs sm:text-sm text-white/60 truncate">
                {currentTrack?.size || 'Unknown Size'} • From Google Drive
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full px-2">
              <div
                ref={progressBarRef}
                className="h-1.5 sm:h-2 bg-white/20 rounded-full cursor-pointer group overflow-hidden"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all group-hover:bg-purple-400"
                  style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="w-full">
              <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 mb-2">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-1.5 sm:p-2 rounded-full transition-all cursor-pointer ${
                    isShuffle ? 'text-purple-400' : 'text-white/60 hover:text-white'
                  }`}
                  title="Shuffle"
                >
                  <Shuffle size={16} className="sm:w-5 sm:h-5" />
                </button>

                <button
                  onClick={handlePrevious}
                  disabled={playlist.length === 0}
                  className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous"
                >
                  <SkipBack size={20} className="sm:w-6 sm:h-6" />
                </button>

                <button
                  onClick={togglePlayPause}
                  disabled={!currentTrack}
                  className="p-3 sm:p-4 lg:p-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transition-all transform hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" /> : <Play size={24} className="ml-0.5 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
                </button>

                <button
                  onClick={handleNext}
                  disabled={playlist.length === 0}
                  className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next"
                >
                  <SkipForward size={20} className="sm:w-6 sm:h-6" />
                </button>

                <button
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`p-1.5 sm:p-2 rounded-full transition-all cursor-pointer ${
                    isRepeat ? 'text-purple-400' : 'text-white/60 hover:text-white'
                  }`}
                  title="Repeat"
                >
                  <Repeat size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    isLiked ? 'text-red-500' : 'text-white/60 hover:text-white'
                  }`}
                  title="Like"
                >
                  <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 lg:w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                </div>

                <button className="p-1.5 rounded-full text-white/60 hover:text-white transition-colors cursor-pointer">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist Sidebar */}
        {showPlaylist && (
          <div className="w-64 sm:w-72 lg:w-80 bg-black/30 backdrop-blur-md border-l border-white/10 flex flex-col flex-shrink-0">
            <div className="p-3 sm:p-4 border-b border-white/10 flex-shrink-0">
              <h3 className="text-white font-semibold text-base sm:text-lg">Music Library</h3>
              <p className="text-white/60 text-xs sm:text-sm">
                {isLoadingPlaylist ? 'Loading...' : `${playlist.length} tracks from Google Drive`}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingPlaylist ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40 p-6">
                  <RefreshCw size={40} className="mb-3 animate-spin" />
                  <p className="text-center text-sm">Loading music library...</p>
                </div>
              ) : playlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40 p-6">
                  <List size={40} className="mb-3" />
                  <p className="text-center text-sm">No music files found</p>
                  <p className="text-xs text-center mt-2">Upload music to Google Drive</p>
                </div>
              ) : (
                <div className="p-2">
                  {playlist.map((track, index) => (
                    <div
                      key={track._id}
                      onClick={() => {
                        setCurrentTrackIndex(index);
                        loadTrack(track);
                        setIsPlaying(true);
                      }}
                      className={`p-2 sm:p-3 rounded-lg mb-1 cursor-pointer transition-all ${
                        index === currentTrackIndex
                          ? 'bg-purple-500/30 border border-purple-500/50'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0 ${
                          index === currentTrackIndex && isPlaying ? 'animate-pulse' : ''
                        }`}>
                          {index === currentTrackIndex && isPlaying ? (
                            <Pause size={14} className="sm:w-4 sm:h-4" />
                          ) : (
                            <Play size={14} className="sm:w-4 sm:h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs sm:text-sm font-medium truncate">
                            {track.name}
                          </p>
                          <p className="text-white/60 text-xs truncate">{track.size}</p>
                        </div>
                        {index === currentTrackIndex && (
                          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                            <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-purple-400 rounded animate-pulse"></div>
                            <div className="w-0.5 sm:w-1 h-3 sm:h-4 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
    </div>
  );
}