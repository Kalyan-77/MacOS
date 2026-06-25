import { useState, useEffect } from "react";
import { Wifi, Search } from "lucide-react";
import { useWindows } from "../../context/WindowContext";
import { useSystemStore } from "../../store/systemStore";
import white from "../../assets/BasicIcons/white.png";

// Import modular sub-components
import AppleMenu from "./components/AppleMenu";
import FileMenu from "./components/FileMenu";
import ControlCenter from "./components/ControlCenter";
import BatteryStatus from "./components/BatteryStatus";
import DateTime from "./components/DateTime";

export default function TopBar() {
  const { windows, focusApp } = useWindows();
  const wifiEnabled = useSystemStore((state) => state.wifiEnabled);
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
    <div className="fixed top-0 w-full h-8 backdrop-blur-xl bg-black/20 text-white flex items-center justify-between px-2 sm:px-4 py-5 select-none shadow-lg z-[9998]">

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
        )}
        <div className="h-6 w-px bg-white/30 flex-shrink-0 hidden md:block"></div>
        
        {/* Battery Status - Hidden on small screens */}
        <div className="hidden md:block">
          <BatteryStatus />
        </div>

        {/* WiFi Icon - Hidden on small screens */}
        <div className="hidden md:block">
          <Wifi 
            size={20} 
            className={`sm:w-6 sm:h-6 hover:bg-white/20 rounded p-1 cursor-pointer transition-all duration-200 ${
              wifiEnabled ? "opacity-100" : "opacity-40"
            }`} 
          />
        </div>

        {/* Search Icon - Hidden on small screens */}
        <div className="hidden md:block">
          <Search size={20} className="sm:w-6 sm:h-6 hover:bg-white/20 rounded p-1 cursor-pointer" />
        </div>

        {/* Control Center Trigger */}
        <div className="hidden md:block relative menu-container">
          <div
            className={`h-5 w-5 sm:h-6 sm:w-6 cursor-pointer rounded p-1 flex items-center justify-center transition-colors
              ${showControlCenter ? "bg-white/20" : "hover:bg-white/20"}`}
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

      <style jsx="true">{`
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