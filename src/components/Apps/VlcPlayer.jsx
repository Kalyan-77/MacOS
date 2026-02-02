import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, FolderOpen, Settings, MoreHorizontal, Rewind, FastForward, Monitor } from 'lucide-react';

export default function VLCPlayer() {

  // Media state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sample playlist
  const [playlist, setPlaylist] = useState([]);

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

      // Set up event listeners is done in useEffect, but src change triggers load

      // Load the video
      videoRef.current.load();

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(e => console.error("Auto-play failed:", e));
      }
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

  // Initialize video element events
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Simple event binding - React onTimeUpdate is also an option but manual binding works
      video.ontimeupdate = handleTimeUpdate;
      video.onended = () => setIsPlaying(false);
      video.onpause = () => setIsPlaying(false);
      video.onplay = () => setIsPlaying(true);
      video.onloadedmetadata = () => {
        setDuration(video.duration || 0);
      };

      // Set initial volume
      video.volume = volume / 100;

      return () => {
        video.ontimeupdate = null;
        video.onended = null;
        video.onpause = null;
        video.onplay = null;
        video.onloadedmetadata = null;
      };
    }
  }, [volume]); // Re-bind if video ref changes (unlikely) or volume (to set initial)

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/x-matroska,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Menu Options - Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-800 border-b border-gray-700 shrink-0">
        <button
          onClick={openFilePicker}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          title="Open File"
        >
          <FolderOpen size={16} className="text-gray-300" />
        </button>
        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          className={`p-1.5 hover:bg-gray-700 rounded transition-colors ${showPlaylist ? 'bg-gray-700' : ''}`}
          title="Toggle Playlist"
        >
          <MoreHorizontal size={16} className="text-gray-300" />
        </button>
        <button className="p-1.5 hover:bg-gray-700 rounded transition-colors">
          <Settings size={16} className="text-gray-300" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">

        {/* Video Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-black">
          {/* Video Player Container */}
          <div className="flex-1 relative bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center overflow-hidden">
            {currentMedia ? (
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
              />
            ) : (
              <div className="text-center p-4">
                <div className="w-24 h-24 bg-gradient-to-b from-orange-400 to-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer" onClick={openFilePicker}>
                  <Play size={40} className="text-white ml-2" />
                </div>
                <h2 className="text-xl font-light text-white mb-2">VLC Media Player</h2>
                <p className="text-gray-400 mb-4 text-sm">Click icon or "Open File" to start</p>
                <button
                  onClick={openFilePicker}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto text-sm"
                >
                  <FolderOpen size={14} />
                  Open File
                </button>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="controls bg-gray-800 p-3 space-y-2 shrink-0 border-t border-gray-700">
            {/* Progress Bar */}
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <span className="w-10 text-right font-mono">{formatTime(currentTime)}</span>
              <div
                className="flex-1 h-1.5 bg-gray-600 rounded-full cursor-pointer relative group"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-orange-500 rounded-full relative"
                  style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                >
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"></div>
                </div>
              </div>
              <span className="w-10 font-mono">{formatTime(duration)}</span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={stopMedia} className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-300 hover:text-white" title="Stop">
                  <Square size={14} fill="currentColor" />
                </button>

                <div className="flex items-center gap-1">
                  <button onClick={skipBackward} className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-300 hover:text-white" title="Skip back 10s">
                    <Rewind size={18} />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="p-2 mx-1 hover:scale-110 rounded-full bg-white text-orange-600 transition-all shadow-md"
                    disabled={!currentMedia}
                  >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
                  </button>

                  <button onClick={skipForward} className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-300 hover:text-white" title="Skip forward 10s">
                    <FastForward size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-2 group">
                  <button onClick={toggleMute} className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300">
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider"
                  />
                </div>
                <button onClick={toggleFullscreen} className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white" title="Fullscreen">
                  <Monitor size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist Sidebar */}
        {showPlaylist && (
          <div className="w-72 bg-gray-900 border-l border-gray-700 flex flex-col shrink-0">
            <div className="p-3 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
              <h3 className="text-gray-200 font-medium text-sm">Playlist</h3>
              <button
                onClick={openFilePicker}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                title="Add File"
              >
                <FolderOpen size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {playlist.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-xs mb-2">Playlist empty</p>
                  <button
                    onClick={openFilePicker}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs rounded border border-gray-700 transition-colors"
                  >
                    Add Media
                  </button>
                </div>
              ) : (
                <ul>
                  {playlist.map((item, index) => (
                    <li
                      key={item.id}
                      onClick={() => playMedia(item)}
                      className={`p-3 border-b border-gray-800 cursor-pointer transition-colors group ${currentMedia?.id === item.id ? 'bg-orange-900/20 border-orange-500/30' : 'hover:bg-gray-800'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`text-xs mt-0.5 w-5 text-center ${currentMedia?.id === item.id ? 'text-orange-500' : 'text-gray-500'}`}>
                          {currentMedia?.id === item.id && isPlaying ? <div className="animate-pulse">▶</div> : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm truncate ${currentMedia?.id === item.id ? 'text-orange-400' : 'text-gray-300 group-hover:text-white'
                            }`}>
                            {item.title}
                          </div>
                          <div className="text-gray-500 text-xs truncate">{item.artist}</div>
                        </div>
                        <div className="text-gray-600 text-xs mt-0.5">{item.duration}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #ea580c;
            cursor: pointer;
            border: 2px solid #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          }
          .slider::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #ea580c;
            cursor: pointer;
            border: 2px solid #fff;
          }
        `}</style>
    </div>
  );
}