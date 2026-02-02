import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart, MoreVertical, List, RefreshCw } from 'lucide-react';
import { BASE_URL } from '../../../config';

export default function MusicPlayer({ fileToOpen = null, userId }) {
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
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  // Fetch all music files from Google Drive
  const fetchMusicFiles = async () => {
    try {
      setIsLoadingPlaylist(true);
      const response = await fetch(`${BASE_URL}/cloud/files/category?category=music`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch music files');
      }

      const musicFiles = await response.json();
      
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

      if (fileToOpen && fileToOpen._id) {
        const index = transformedPlaylist.findIndex(track => track._id === fileToOpen._id);
        if (index !== -1) {
          setCurrentTrackIndex(index);
          loadTrack(transformedPlaylist[index]);
        } else {
          setPlaylist(prev => [...prev, fileToOpen]);
          setCurrentTrackIndex(transformedPlaylist.length);
          loadTrack(fileToOpen);
        }
      } else if (transformedPlaylist.length > 0) {
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

  useEffect(() => {
    fetchMusicFiles();
  }, []);

  const loadTrack = async (file) => {
    try {
      setIsLoading(true);

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
    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-gray-900 to-black overflow-hidden flex">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      {/* Player Area */}
      <div className={`flex-1 flex flex-col overflow-hidden ${showPlaylist ? '' : 'w-full'}`}>
        {/* Toolbar */}
        <div className="bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 py-2 flex-shrink-0">
          <div>
            <h1 className="text-sm font-medium text-white">
              Music Player
              {(isLoading || isLoadingPlaylist) && ' (Loading...)'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMusicFiles}
              disabled={isLoadingPlaylist}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white/10 text-white/70 hover:bg-white/20 rounded transition-colors duration-150 disabled:opacity-50"
              title="Refresh Library"
            >
              <RefreshCw size={14} className={isLoadingPlaylist ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors duration-150 ${
                showPlaylist ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              title="Toggle Playlist"
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* Album Art / Visualizer - Scrollable */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <div className="relative flex-shrink-0">
            <div className={`w-64 h-64 lg:w-80 lg:h-80 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 shadow-2xl flex items-center justify-center ${
              isPlaying ? 'animate-pulse' : ''
            }`}>
              <div className="w-60 h-60 lg:w-72 lg:h-72 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className={`text-white ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="lg:w-32 lg:h-32">
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
            <h2 className="text-xl lg:text-2xl font-bold text-white mb-1 truncate">
              {currentTrack?.name || 'No Track Loaded'}
            </h2>
            <p className="text-sm text-white/60 truncate">
              {currentTrack?.size || 'Unknown Size'} • From Google Drive
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full px-2">
            <div
              ref={progressBarRef}
              className="h-2 bg-white/20 rounded-full cursor-pointer group overflow-hidden"
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
            <div className="flex items-center justify-center gap-4 lg:gap-6 mb-2">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 rounded-full transition-all ${
                  isShuffle ? 'text-purple-400' : 'text-white/60 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle size={16} className="sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={handlePrevious}
                disabled={playlist.length === 0}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous"
              >
                <SkipBack size={20} className="sm:w-6 sm:h-6" />
              </button>

              <button
                onClick={togglePlayPause}
                disabled={!currentTrack}
                className="p-4 lg:p-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" /> : <Play size={24} className="ml-0.5 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
              </button>

              <button
                onClick={handleNext}
                disabled={playlist.length === 0}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next"
              >
                <SkipForward size={20} className="sm:w-6 sm:h-6" />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 rounded-full transition-all ${
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
                className={`p-1.5 rounded-full transition-all ${
                  isLiked ? 'text-red-500' : 'text-white/60 hover:text-white'
                }`}
                title="Like"
              >
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white/60 hover:text-white transition-colors"
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
                  className="w-20 lg:w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
              </div>

              <button className="p-1.5 rounded-full text-white/60 hover:text-white transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Sidebar */}
      {showPlaylist && (
        <div className="w-72 lg:w-80 bg-black/30 backdrop-blur-md border-l border-white/10 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-white/10 flex-shrink-0">
            <h3 className="text-white font-semibold text-lg">Music Library</h3>
            <p className="text-white/60 text-sm">
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
                    className={`p-3 rounded-lg mb-1 cursor-pointer transition-all ${
                      index === currentTrackIndex
                        ? 'bg-purple-500/30 border border-purple-500/50'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0 ${
                        index === currentTrackIndex && isPlaying ? 'animate-pulse' : ''
                      }`}>
                        {index === currentTrackIndex && isPlaying ? (
                          <Pause size={14} className="sm:w-4 sm:h-4" />
                        ) : (
                          <Play size={14} className="sm:w-4 sm:h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {track.name}
                        </p>
                        <p className="text-white/60 text-xs truncate">{track.size}</p>
                      </div>
                      {index === currentTrackIndex && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <div className="w-1 h-3 bg-purple-400 rounded animate-pulse"></div>
                          <div className="w-1 h-4 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1 h-3 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
  );
}