import { useState, useEffect } from "react";
import { Wifi, Search } from "lucide-react";
import { useWindows } from "../../context/WindowContext";
import white from "../../assets/BasicIcons/white.png";

export default function TopBar() {
  const { windows, focusApp } = useWindows();
  const [showAppleMenu, setShowAppleMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showControlCenter, setShowControlCenter] = useState(false);

  // Close all menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.menu-container')) {
        setShowAppleMenu(false);
        setShowFileMenu(false);
        setShowControlCenter(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleAppleClick = () => {
    setShowAppleMenu(!showAppleMenu);
    setShowFileMenu(false);
    setShowControlCenter(false);
  };

  const handleFileClick = () => {
    setShowFileMenu(!showFileMenu);
    setShowAppleMenu(false);
    setShowControlCenter(false);
  };

  const handleControlCenterClick = () => {
    setShowControlCenter(!showControlCenter);
    setShowAppleMenu(false);
    setShowFileMenu(false);
  };

  return (
    <div className="fixed top-0 w-full h-8 backdrop-blur-xl bg-black/20 text-white flex items-center justify-between px-2 sm:px-4 py-5 select-none shadow-lg z-50">

      {/* Left Side */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {/* Apple Menu */}
        <div className="relative menu-container flex-shrink-0">
          <div
            className="h-4 cursor-pointer flex items-center justify-center text-white font-bold text-sm hover:bg-white/20 rounded px-1"
            onClick={handleAppleClick}
          >
            <img
              src={white}
              alt="Apple Logo"
              className="h-4 cursor-pointer"
            />
          </div>

          {showAppleMenu && (
            <AppleMenu onClose={() => setShowAppleMenu(false)} />
          )}
        </div>

        {/* File Menu */}
        <div className="relative menu-container flex-shrink-0">
          <span
            className="px-2 py-0.5 rounded hover:bg-white/20 cursor-pointer text-sm"
            onClick={handleFileClick}
          >
            File
          </span>

          {showFileMenu && (
            <FileMenu onClose={() => setShowFileMenu(false)} />
          )}
        </div>

        {/* Other Menu Items - Hidden on smaller screens */}
        <div className="hidden lg:flex items-center gap-2 lg:gap-4 flex-shrink-0">
          {["Edit", "View", "Go", "Tools", "Help"].map((item) => (
            <span
              key={item}
              className="px-2 py-0.5 rounded hover:bg-white/20 cursor-pointer text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-4 text-sm flex-shrink-0">
        {windows.length > 0 && (
          <>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide max-w-[240px] ml-1 flex-shrink-0">
              {windows.map((app) => (
                <button
                  key={app.id}
                  onClick={() => focusApp(app.id)}
                  className={`flex items-center gap-2 flex-shrink-0 rounded transition-colors px-1 py-0.5
                    ${app.focused ? "bg-white/20" : "hover:bg-white/10"}`}
                  title={app.name}
                >
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="w-5 h-5"
                  />
                </button>
              ))}
            </div>
          </>
        )}
        <div className="h-6 w-px bg-white/30 flex-shrink-0 hidden md:block"></div>
        {/* Battery Status - Hidden on small screens */}
        <div className="hidden md:block">
          <BatteryStatus />
        </div>

        {/* WiFi Icon - Hidden on small screens */}
        <div className="hidden md:block">
          <Wifi size={20} className="sm:w-6 sm:h-6 hover:bg-white/20 rounded p-1 cursor-pointer" />
        </div>

        {/* Search Icon - Hidden on small screens */}
        <div className="hidden md:block">
          <Search size={20} className="sm:w-6 sm:h-6 hover:bg-white/20 rounded p-1 cursor-pointer" />
        </div>

        {/* Control Center */}
        <div className="hidden md:block relative menu-container">
          <div
            className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer hover:bg-white/20 rounded p-1 flex items-center justify-center"
            onClick={handleControlCenterClick}
          >
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
            </div>
          </div>

          {showControlCenter && (
            <ControlCenter onClose={() => setShowControlCenter(false)} />
          )}
        </div>

        <DateTime />
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

/* 🍎 Apple Menu Component */
function AppleMenu({ onClose }) {
  const menuItems = [
    { label: "About This Mac", action: () => console.log("About This Mac") },
    { divider: true },
    { label: "System Preferences...", action: () => console.log("System Preferences") },
    { label: "App Store...", action: () => console.log("App Store") },
    { divider: true },
    { label: "Recent Items", submenu: true, action: () => console.log("Recent Items") },
    { divider: true },
    { label: "Force Quit Applications...", shortcut: "⌥⌘⎋", action: () => console.log("Force Quit") },
    { divider: true },
    { label: "Sleep", action: () => console.log("Sleep") },
    { label: "Restart...", action: () => console.log("Restart") },
    { label: "Shut Down...", action: () => console.log("Shut Down") },
    { divider: true },
    { label: "Lock Screen", shortcut: "⌃⌘Q", action: () => console.log("Lock Screen") },
    { label: "Log Out User...", shortcut: "⇧⌘Q", action: () => console.log("Log Out") },
  ];

  return (
    <div className="absolute top-8 left-0 w-56 sm:w-64 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-600/50 py-2 z-50 max-w-[calc(100vw-2rem)]">
      {menuItems.map((item, index) => {
        if (item.divider) {
          return <div key={index} className="h-px bg-gray-600 my-1 mx-4"></div>;
        }

        return (
          <div
            key={index}
            className="px-4 py-2 text-sm text-white hover:bg-blue-500/80 cursor-pointer flex items-center justify-between group transition-all duration-200 ease-in-out hover:shadow-sm"
            onClick={() => {
              item.action();
              onClose();
            }}
          >
            <span className="flex items-center gap-2 truncate">
              {item.label}
              {item.submenu && <span className="text-gray-400 flex-shrink-0">▶</span>}
            </span>
            {item.shortcut && (
              <span className="text-gray-400 text-xs font-mono ml-2 flex-shrink-0 hidden sm:inline">{item.shortcut}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* 📁 File Menu Component */
function FileMenu({ onClose }) {
  const fileMenuItems = [
    { label: "New File", shortcut: "⌘N", action: () => console.log("New File") },
    { label: "New Window", shortcut: "⌘⇧N", action: () => console.log("New Window") },
    { divider: true },
    { label: "Open File", shortcut: "⌘O", action: () => console.log("Open File") },
    { label: "Open Recent File", submenu: true, action: () => console.log("Open Recent") },
    { divider: true },
    { label: "Save", shortcut: "⌘S", action: () => console.log("Save") },
    { label: "Save As...", shortcut: "⌘⇧S", action: () => console.log("Save As") },
    { divider: true },
    { label: "Print", shortcut: "⌘P", action: () => console.log("Print") },
    { divider: true },
    { label: "Properties", shortcut: "⌘I", action: () => console.log("Properties") },
    { divider: true },
    { label: "Close Window", shortcut: "⌘W", action: () => console.log("Close Window") },
  ];

  return (
    <div className="absolute top-8 left-0 w-48 sm:w-56 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-600/50 py-2 z-50 max-w-[calc(100vw-2rem)]">
      {fileMenuItems.map((item, index) => {
        if (item.divider) {
          return <div key={index} className="h-px bg-gray-600 my-1 mx-4"></div>;
        }

        return (
          <div
            key={index}
            className="px-4 py-2 text-sm text-white hover:bg-blue-500/80 cursor-pointer flex items-center justify-between group transition-all duration-200 ease-in-out hover:shadow-sm"
            onClick={() => {
              item.action();
              onClose();
            }}
          >
            <span className="flex items-center gap-2 truncate">
              {item.label}
              {item.submenu && <span className="text-gray-400 flex-shrink-0">▶</span>}
            </span>
            {item.shortcut && (
              <span className="text-gray-400 text-xs font-mono ml-2 flex-shrink-0 hidden sm:inline">{item.shortcut}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* 🎛️ Control Center Component */
function ControlCenter({ onClose }) {
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [airDropEnabled, setAirDropEnabled] = useState(false);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [brightness, setBrightness] = useState(75);
  const [volume, setVolume] = useState(60);

  return (
    <div className="absolute top-8 right-0 w-72 sm:w-80 bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-600/50 p-3 sm:p-4 z-50 max-w-[calc(100vw-1rem)] max-h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Connectivity Controls */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
        {/* WiFi */}
        <div
          className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 ${wifiEnabled
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-gray-700 hover:bg-gray-600'
            }`}
          onClick={() => setWifiEnabled(!wifiEnabled)}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Wifi size={16} className="sm:w-5 sm:h-5 text-white flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-white font-medium text-xs sm:text-sm truncate">Wi-Fi</div>
              <div className="text-gray-200 text-xs truncate">
                {wifiEnabled ? 'Home Network' : 'Off'}
              </div>
            </div>
          </div>
        </div>

        {/* Bluetooth */}
        <div
          className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 ${bluetoothEnabled
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-gray-700 hover:bg-gray-600'
            }`}
          onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-white text-base sm:text-lg flex-shrink-0">📶</div>
            <div className="min-w-0">
              <div className="text-white font-medium text-xs sm:text-sm truncate">Bluetooth</div>
              <div className="text-gray-200 text-xs truncate">
                {bluetoothEnabled ? 'On' : 'Off'}
              </div>
            </div>
          </div>
        </div>

        {/* AirDrop */}
        <div
          className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 ${airDropEnabled
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-gray-700 hover:bg-gray-600'
            }`}
          onClick={() => setAirDropEnabled(!airDropEnabled)}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-white text-base sm:text-lg flex-shrink-0">📡</div>
            <div className="min-w-0">
              <div className="text-white font-medium text-xs sm:text-sm truncate">AirDrop</div>
              <div className="text-gray-200 text-xs truncate">
                {airDropEnabled ? 'Contacts Only' : 'Off'}
              </div>
            </div>
          </div>
        </div>

        {/* Do Not Disturb */}
        <div
          className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 ${doNotDisturb
            ? 'bg-purple-500 hover:bg-purple-600'
            : 'bg-gray-700 hover:bg-gray-600'
            }`}
          onClick={() => setDoNotDisturb(!doNotDisturb)}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-white text-base sm:text-lg flex-shrink-0">🌙</div>
            <div className="min-w-0">
              <div className="text-white font-medium text-xs sm:text-sm truncate">Do Not Disturb</div>
              <div className="text-gray-200 text-xs truncate">
                {doNotDisturb ? 'On' : 'Off'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brightness Control */}
      <div className="bg-gray-800/80 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="text-white text-xs sm:text-sm">☀️</div>
          <div className="text-white text-xs sm:text-sm font-medium">Display</div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-white text-xs opacity-60 flex-shrink-0">🔅</div>
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(e.target.value)}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${brightness}%, #4B5563 ${brightness}%, #4B5563 100%)`
              }}
            />
            <style jsx>{`
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 16px;
                height: 16px;
                background: white;
                border-radius: 50%;
                cursor: pointer;
              }
              input[type="range"]::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background: white;
                border-radius: 50%;
                border: none;
                cursor: pointer;
              }
            `}</style>
          </div>
          <div className="text-white text-xs opacity-60 flex-shrink-0">🔆</div>
        </div>
      </div>

      {/* Volume Control */}
      <div className="bg-gray-800/80 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="text-white text-xs sm:text-sm">🔊</div>
          <div className="text-white text-xs sm:text-sm font-medium">Sound</div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-white text-xs opacity-60 flex-shrink-0">🔈</div>
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${volume}%, #4B5563 ${volume}%, #4B5563 100%)`
              }}
            />
          </div>
          <div className="text-white text-xs opacity-60 flex-shrink-0">🔊</div>
        </div>
      </div>

      {/* Music Control */}
      <div className="bg-gray-800/80 rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="text-white text-sm sm:text-lg">🎵</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs sm:text-sm font-medium truncate">Music</div>
            <div className="text-gray-400 text-xs truncate">Not Playing</div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <button
            className="text-white hover:text-gray-300 transition-colors"
            onClick={() => console.log('Previous track')}
          >
            <div className="text-lg sm:text-xl">⏮️</div>
          </button>
          <button
            className="text-white hover:text-gray-300 transition-colors"
            onClick={() => console.log('Play/Pause')}
          >
            <div className="text-xl sm:text-2xl">▶️</div>
          </button>
          <button
            className="text-white hover:text-gray-300 transition-colors"
            onClick={() => console.log('Next track')}
          >
            <div className="text-lg sm:text-xl">⏭️</div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* 🔋 Battery Status Component */
function BatteryStatus() {
  const [battery, setBattery] = useState({ level: 0.85, charging: false });
  const [showBatteryTooltip, setShowBatteryTooltip] = useState(false);

  useEffect(() => {
    const updateBattery = () => {
      if ("getBattery" in navigator) {
        navigator.getBattery().then((batt) => {
          setBattery({ level: batt.level, charging: batt.charging });

          const updateHandler = () =>
            setBattery({ level: batt.level, charging: batt.charging });

          batt.addEventListener("levelchange", updateHandler);
          batt.addEventListener("chargingchange", updateHandler);

          return () => {
            batt.removeEventListener("levelchange", updateHandler);
            batt.removeEventListener("chargingchange", updateHandler);
          };
        });
      }
    };

    updateBattery();
  }, []);

  const percent = Math.round(battery.level * 100);

  return (
    <div
      className="relative flex items-center gap-1 sm:gap-2 hover:bg-white/20 rounded px-1 sm:px-2 py-1 cursor-pointer"
      onMouseEnter={() => setShowBatteryTooltip(true)}
      onMouseLeave={() => setShowBatteryTooltip(false)}
    >
      {/* Battery Icon */}
      <div className="relative w-5 h-2.5 sm:w-6 sm:h-3 border border-white rounded-sm overflow-hidden">
        {/* Fill bar */}
        <div
          className={`h-full transition-all duration-300 ${percent > 20
            ? battery.charging
              ? "bg-green-400"
              : "bg-white"
            : "bg-red-500"
            }`}
          style={{ width: `${Math.max(percent, 3)}%` }}
        ></div>

        {/* Battery tip */}
        <div className="absolute -right-0.5 top-0.5 h-1 sm:h-1.5 w-0.5 bg-white rounded-sm"></div>

        {/* Charging bolt */}
        {battery.charging && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs">⚡</span>
          </div>
        )}
      </div>

      {/* Percentage */}
      <span className="text-xs">{percent}%</span>

      {/* Battery Tooltip */}
      {showBatteryTooltip && (
        <div className="absolute top-8 right-0 bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap z-50">
          <div className="font-semibold">Battery</div>
          <div className="text-gray-300">
            {battery.charging ? `Charging: ${percent}%` : `${percent}% remaining`}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {battery.charging ? "Power adapter connected" : "Not charging"}
          </div>
        </div>
      )}
    </div>
  );
}

/* 🕒 Live Updating Clock + Date */
function DateTime() {
  const [time, setTime] = useState(new Date());
  const [showTimeTooltip, setShowTimeTooltip] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFullDate = (date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      className="hidden md:block relative flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 hover:bg-white/20 rounded px-1 sm:px-2 py-1 cursor-pointer text-xs sm:text-sm"
      onMouseEnter={() => setShowTimeTooltip(true)}
      onMouseLeave={() => setShowTimeTooltip(false)}
    >
      <span className="hidden sm:inline">{formatDate(time)}, </span>
      <span>{formatTime(time)}</span>
      <span className="sm:hidden text-xs opacity-75">{formatDate(time).split(' ')[0]}</span>

      {/* Date/Time Tooltip */}
      {showTimeTooltip && (
        <div className="absolute top-8 right-0 bg-gray-800 text-white text-sm px-3 py-2 rounded shadow-lg whitespace-nowrap z-50">
          <div className="font-semibold">{formatFullDate(time)}</div>
          <div className="text-gray-300">{time.toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  );
}