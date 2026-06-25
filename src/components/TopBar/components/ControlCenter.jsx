import { useState } from "react";
import { 
  Wifi, 
  Bluetooth, 
  Radio, 
  Moon, 
  Tv, 
  Sun, 
  Volume2, 
  Volume1, 
  VolumeX,
  Play, 
  Pause, 
  SkipForward, 
  SkipBack 
} from "lucide-react";
import { useSystemStore } from "../../../store/systemStore";

const PLAYLIST = [
  { title: "Resonance", artist: "HOME", color: "from-indigo-500 to-purple-600" },
  { title: "Starlight", artist: "Muse", color: "from-blue-600 to-cyan-500" },
  { title: "Midnight City", artist: "M83", color: "from-pink-500 to-rose-500" },
  { title: "Get Lucky", artist: "Daft Punk", color: "from-amber-500 to-orange-600" },
  { title: "Blinding Lights", artist: "The Weeknd", color: "from-red-600 to-pink-600" }
];

export default function ControlCenter({ onClose }) {
  const {
    wifiEnabled,
    toggleWifi,
    bluetoothEnabled,
    toggleBluetooth,
    airDropEnabled,
    toggleAirDrop,
    doNotDisturb,
    toggleDoNotDisturb,
    brightness,
    setBrightness,
    volume,
    setVolume
  } = useSystemStore();

  const [screenMirroring, setScreenMirroring] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);

  const activeTrack = PLAYLIST[trackIndex];

  const handlePlayPause = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={14} className="text-white/90" />;
    if (volume < 50) return <Volume1 size={14} className="text-white/90" />;
    return <Volume2 size={14} className="text-white/90" />;
  };

  return (
    <div className="absolute top-10 right-2 w-[320px] sm:w-[330px] bg-neutral-900/75 backdrop-blur-2xl rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-white/10 p-3.5 flex flex-col gap-3 select-none z-50 animate-control-center">
      
      {/* Top Grid: Connectivity & Toggles */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Left Side: Connectivity Block */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col justify-between h-[138px]">
          {/* Wi-Fi */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={toggleWifi}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              wifiEnabled 
                ? "bg-blue-500 text-white shadow-sm shadow-blue-500/25" 
                : "bg-white/10 text-white/70 group-hover:bg-white/15"
            }`}>
              <Wifi size={13} className="flex-shrink-0" />
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-white font-medium text-[11.5px] leading-tight">Wi-Fi</span>
              <span className="text-white/45 text-[9.5px] leading-tight truncate">
                {wifiEnabled ? "Home Network" : "Off"}
              </span>
            </div>
          </div>

          {/* Bluetooth */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={toggleBluetooth}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              bluetoothEnabled 
                ? "bg-blue-500 text-white shadow-sm shadow-blue-500/25" 
                : "bg-white/10 text-white/70 group-hover:bg-white/15"
            }`}>
              <Bluetooth size={13} className="flex-shrink-0" />
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-white font-medium text-[11.5px] leading-tight">Bluetooth</span>
              <span className="text-white/45 text-[9.5px] leading-tight truncate">
                {bluetoothEnabled ? "On" : "Off"}
              </span>
            </div>
          </div>

          {/* AirDrop */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={toggleAirDrop}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              airDropEnabled 
                ? "bg-blue-500 text-white shadow-sm shadow-blue-500/25" 
                : "bg-white/10 text-white/70 group-hover:bg-white/15"
            }`}>
              <Radio size={13} className="flex-shrink-0" />
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-white font-medium text-[11.5px] leading-tight">AirDrop</span>
              <span className="text-white/45 text-[9.5px] leading-tight truncate">
                {airDropEnabled ? "Contacts Only" : "Off"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Do Not Disturb & Screen Mirroring */}
        <div className="flex flex-col gap-3 h-[138px]">
          {/* Focus / DND */}
          <div 
            className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-2.5 cursor-pointer transition-all duration-200 hover:bg-white/10"
            onClick={toggleDoNotDisturb}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              doNotDisturb 
                ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/25" 
                : "bg-white/10 text-white/70"
            }`}>
              <Moon size={13} fill={doNotDisturb ? "white" : "none"} className="flex-shrink-0" />
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-white font-medium text-[11.5px] leading-tight">Focus</span>
              <span className="text-white/45 text-[9.5px] leading-tight">
                {doNotDisturb ? "On" : "Off"}
              </span>
            </div>
          </div>

          {/* Screen Mirroring */}
          <div 
            className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-2.5 cursor-pointer transition-all duration-200 hover:bg-white/10"
            onClick={() => setScreenMirroring(!screenMirroring)}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              screenMirroring 
                ? "bg-blue-500 text-white shadow-sm shadow-blue-500/25" 
                : "bg-white/10 text-white/70"
            }`}>
              <Tv size={13} className="flex-shrink-0" />
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-white font-medium text-[11.5px] leading-tight">Screen Mirroring</span>
              <span className="text-white/45 text-[9.5px] leading-tight">
                {screenMirroring ? "On" : "Off"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Display Slider Card */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1.5">
        <span className="text-white/95 font-medium text-[11.5px] px-0.5 leading-none">Display</span>
        <div className="group relative flex items-center w-full h-[26px] bg-white/10 hover:bg-white/15 rounded-full overflow-hidden border border-white/5 transition-colors">
          {/* Fill representation */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-white/20 group-hover:bg-white/25 pointer-events-none transition-all duration-75"
            style={{ width: `${brightness}%` }}
          />
          {/* Icon overlay */}
          <Sun size={13} className="text-white/90 absolute left-2.5 z-10 pointer-events-none" />
          
          {/* Invisible interactive input */}
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
          />
        </div>
      </div>

      {/* Sound Slider Card */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1.5">
        <span className="text-white/95 font-medium text-[11.5px] px-0.5 leading-none">Sound</span>
        <div className="group relative flex items-center w-full h-[26px] bg-white/10 hover:bg-white/15 rounded-full overflow-hidden border border-white/5 transition-colors">
          {/* Fill representation */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-white/20 group-hover:bg-white/25 pointer-events-none transition-all duration-75"
            style={{ width: `${volume}%` }}
          />
          {/* Icon overlay */}
          <div className="absolute left-2.5 z-10 pointer-events-none">
            {getVolumeIcon()}
          </div>
          
          {/* Invisible interactive input */}
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
          />
        </div>
      </div>

      {/* Media / Music Card */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-3">
        {/* Album Art (spinning vinyl style) */}
        <div className={`relative w-11 h-11 rounded-lg bg-gradient-to-tr ${activeTrack.color} shadow-lg flex items-center justify-center flex-shrink-0 select-none overflow-hidden`}>
          
          {/* Vinyl circle */}
          <div className={`w-9 h-9 rounded-full bg-neutral-950 border border-neutral-800/80 flex items-center justify-center absolute transition-transform duration-300 ${
            isPlaying ? "animate-spin-slow" : ""
          }`}>
            {/* Inner track label */}
            <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${activeTrack.color} flex items-center justify-center`}>
              <div className="w-1 h-1 rounded-full bg-black" />
            </div>
          </div>

          {/* Micro-animation: Live Audio Visualizer Overlay */}
          <div className={`absolute bottom-1 right-1 flex items-end gap-[1.5px] h-3 px-1 rounded bg-black/60 backdrop-blur-[2px] py-[2.5px] z-10 transition-opacity duration-300 ${
            isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}>
            <span className="w-[1.5px] h-full bg-white rounded-[0.5px] animate-bounce-bar-1 origin-bottom" />
            <span className="w-[1.5px] h-full bg-white rounded-[0.5px] animate-bounce-bar-2 origin-bottom" />
            <span className="w-[1.5px] h-full bg-white rounded-[0.5px] animate-bounce-bar-3 origin-bottom" />
            <span className="w-[1.5px] h-full bg-white rounded-[0.5px] animate-bounce-bar-4 origin-bottom" />
          </div>
        </div>

        {/* Track Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <span className="text-white font-medium text-[12.5px] leading-tight truncate tracking-wide">
            {activeTrack.title}
          </span>
          <span className="text-white/45 text-[10px] leading-tight truncate mt-0.5">
            {activeTrack.artist}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          <button 
            onClick={handlePrev}
            className="text-white/60 hover:text-white transition-colors cursor-pointer active:scale-90"
            title="Previous"
          >
            <SkipBack size={14} fill="currentColor" />
          </button>
          
          <button 
            onClick={handlePlayPause}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={12} fill="currentColor" className="text-black" />
            ) : (
              <Play size={12} fill="currentColor" className="text-black ml-0.5" />
            )}
          </button>

          <button 
            onClick={handleNext}
            className="text-white/60 hover:text-white transition-colors cursor-pointer active:scale-90"
            title="Next"
          >
            <SkipForward size={14} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
