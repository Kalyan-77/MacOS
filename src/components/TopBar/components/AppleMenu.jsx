import { useState, useEffect } from "react";
import { useWorkspaceStore } from "../../../store/workspaceStore";
import { allAvailableApps } from "../../../registry/appRegistry";

export default function AppleMenu({ onClose }) {
  const openWindow = useWorkspaceStore((state) => state.openWindow);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const menuItems = [
    { 
      label: "About This Mac", 
      action: () => {
        openWindow(
          "about-mac",
          "About This Mac",
          AboutThisMac,
          {},
          "/AppIcons/finder.png"
        );
      } 
    },
    { divider: true },
    { 
      label: "System Preferences...", 
      action: () => {
        const prefApp = allAvailableApps.find(a => a.id === "preferences");
        if (prefApp) {
          openWindow(prefApp.id, prefApp.name, prefApp.component, {}, prefApp.icon);
        }
      } 
    },
    { 
      label: "App Store...", 
      action: () => {
        const appStoreApp = allAvailableApps.find(a => a.id === "appstore");
        if (appStoreApp) {
          openWindow(appStoreApp.id, appStoreApp.name, appStoreApp.component, {}, appStoreApp.icon);
        }
      } 
    },
    { divider: true },
    { label: "Recent Items", submenu: true, action: () => console.log("Recent Items") },
    { divider: true },
    { label: "Force Quit Applications...", shortcut: "⌥⌘⎋", action: () => console.log("Force Quit") },
    { divider: true },
    { 
      label: isFullscreen ? "Exit Full Screen" : "Enter Full Screen", 
      shortcut: "⌃⌘F", 
      action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch((err) => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      } 
    },
    { divider: true },
    { 
      label: "Sleep", 
      action: () => {
        window.dispatchEvent(new CustomEvent("macos:lock"));
      } 
    },
    { 
      label: "Restart...", 
      action: () => {
        window.dispatchEvent(new CustomEvent("macos:restart"));
      } 
    },
    { 
      label: "Shut Down...", 
      action: () => {
        window.dispatchEvent(new CustomEvent("macos:shutdown"));
      } 
    },
    { divider: true },
    { 
      label: "Lock Screen", 
      shortcut: "⌃⌘Q", 
      action: () => {
        window.dispatchEvent(new CustomEvent("macos:lock"));
      } 
    },
    { 
      label: "Log Out User...", 
      shortcut: "⇧⌘Q", 
      action: () => {
        window.dispatchEvent(new CustomEvent("macos:lock"));
      } 
    },
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

// 🍏 About This Mac Modal Component
function AboutThisMac() {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-800 text-white h-full select-none font-sans">
      <div className="text-6xl mb-4 animate-bounce">🍏</div>
      <h2 className="text-2xl font-bold mb-1">MacBook Pro</h2>
      <p className="text-xs text-zinc-400 mb-6">16-inch, 2026</p>
      
      <div className="w-full max-w-xs space-y-2 text-sm text-zinc-300">
        <div className="flex justify-between border-b border-zinc-700 pb-1">
          <span className="font-semibold text-zinc-400">Chip</span>
          <span>Apple M3 Max</span>
        </div>
        <div className="flex justify-between border-b border-zinc-700 pb-1">
          <span className="font-semibold text-zinc-400">Memory</span>
          <span>32 GB Unified RAM</span>
        </div>
        <div className="flex justify-between border-b border-zinc-700 pb-1">
          <span className="font-semibold text-zinc-400">macOS</span>
          <span>macOS Sequoia 15.0</span>
        </div>
        <div className="flex justify-between border-b border-zinc-700 pb-1">
          <span className="font-semibold text-zinc-400">Storage</span>
          <span>1 TB Macintosh HD</span>
        </div>
      </div>
      <p className="text-[10px] text-zinc-500 mt-8 text-center">
        ™ and © 1983-2026 Apple Inc. All Rights Reserved.
      </p>
    </div>
  );
}
