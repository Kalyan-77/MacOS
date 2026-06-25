import { useSystemStore } from "../../store/systemStore";
import defaultWallpaper from "../../assets/Wallpaper/img1.jpg";

export default function SettingsApp() {
  const {
    wifiEnabled,
    toggleWifi,
    bluetoothEnabled,
    toggleBluetooth,
    doNotDisturb,
    toggleDoNotDisturb,
    brightness,
    setBrightness,
    volume,
    setVolume,
    wallpaperUrl,
    setWallpaperUrl
  } = useSystemStore();

  const wallpapers = [
    { name: "macOS Default", url: defaultWallpaper, preview: defaultWallpaper },
    { name: "Aurora Wave", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80", preview: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80" },
    { name: "Big Sur Abstract", url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80", preview: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=150&q=80" },
    { name: "Yosemite Valley", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", preview: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=150&q=80" },
    { name: "Sleek Dark Mode", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80", preview: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=150&q=80" }
  ];

  return (
    <div className="p-6 bg-zinc-800 text-white h-full font-sans select-none overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 pb-2 border-b border-zinc-700">⚙️ System Preferences</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connectivity */}
        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-700/50 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-zinc-400 mb-3 text-sm">Internet & Connections</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Wi-Fi Connection</div>
                  <div className="text-xs text-zinc-500">{wifiEnabled ? "Connected to Home Network" : "Disconnected"}</div>
                </div>
                <button 
                  onClick={toggleWifi}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${wifiEnabled ? 'bg-blue-500 flex justify-end' : 'bg-zinc-650 flex justify-start'}`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Bluetooth</div>
                  <div className="text-xs text-zinc-500">{bluetoothEnabled ? "Discoverable" : "Off"}</div>
                </div>
                <button 
                  onClick={toggleBluetooth}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${bluetoothEnabled ? 'bg-blue-500 flex justify-end' : 'bg-zinc-650 flex justify-start'}`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Do Not Disturb</div>
                  <div className="text-xs text-zinc-500">{doNotDisturb ? "Silence all alerts" : "Receiving notifications"}</div>
                </div>
                <button 
                  onClick={toggleDoNotDisturb}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${doNotDisturb ? 'bg-purple-500 flex justify-end' : 'bg-zinc-650 flex justify-start'}`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-700/50 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-zinc-400 mb-3 text-sm">Hardware Settings</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Display Brightness ({brightness}%)</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={brightness}
                  onChange={(e) => setBrightness(e.target.value)}
                  className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Sound Volume ({volume}%)</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wallpapers */}
        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-700/50">
          <h3 className="font-semibold text-zinc-400 mb-3 text-sm">Desktop Wallpapers</h3>
          <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
            {wallpapers.map((wp, idx) => (
              <div 
                key={idx}
                onClick={() => setWallpaperUrl(wp.url)}
                className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${wallpaperUrl === wp.url ? 'border-blue-500 scale-95 shadow-md' : 'border-transparent hover:border-zinc-500'}`}
              >
                <img 
                  src={wp.preview} 
                  alt={wp.name}
                  className="w-full h-16 object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-center py-0.5 truncate px-1">
                  {wp.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-zinc-500">
        Hari OS Simulator v1.2.0 • Running React & TailwindCSS
      </div>
    </div>
  );
}
