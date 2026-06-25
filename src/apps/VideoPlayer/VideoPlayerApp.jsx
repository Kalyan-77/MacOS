import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, SkipBack, SkipForward } from 'lucide-react';
import { BASE_URL } from '../../../config';

export default function VideoPlayer({ fileToOpen = null, userId }) {
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
  const [isMobile, setIsMobile] = useState(false);
  
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Check if device is mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
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

  const handleVideoClick = () => {
    if (isMobile) {
      setShowControls(!showControls);
    }
  };

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center relative">
      {isLoading ? (
        <div className={`text-white ${isMobile ? 'text-xl' : 'text-lg'}`}>Loading video...</div>
      ) : videoUrl ? (
        <div className="w-full h-full flex flex-col relative">
          <div className="flex-1 flex items-center justify-center" onClick={handleVideoClick}>
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full"
              style={{ objectFit: 'contain' }}
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
  );
}