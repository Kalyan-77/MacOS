// import TopBar from "./components/TopBar/TopBar";
// import Dock from "./components/Dock/Dock";
// import wallpaper from "./assets/Wallpaper/img1.jpg"; 
// import NotePad from "./components/Apps/NotePad";
// import Calculator from "./components/Apps/Calculator";
// import Calendar from "./components/Apps/Calendar";
// import { useState } from "react";
// import calendar from "./components/Apps/Calendar";

// export default function MacOS() {
//   const [openApps, setOpenApps] = useState({
//     notepad: false,
//     calculator: false,
//     Calendar: false
//   });

//   const toggleApp = (appName) => {
//     setOpenApps((prev) => ({
//       ...prev,
//       [appName]: !prev[appName],
//     }));
//   };

//   return (
//     <div
//       className="w-screen h-screen flex flex-col overflow-hidden"
//       style={{
//         backgroundImage: `url(${wallpaper})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//       }}
//     >
//       {/* Top Bar */}
//       <TopBar />

//       {/* Main Body */}
//       <div className="flex-1 relative">
//         {openApps.notepad && <NotePad onClose={() => toggleApp("notepad")} />}
//         {openApps.calculator && <Calculator onClose={() => toggleApp("calculator")} />}
//         {openApps.calendar && <Calendar onClose={()=> toggleApp("calendar")}/>}
//       </div>

//       {/* Dock */}
//       <Dock toggleApp={toggleApp} />
//     </div>
//   );
// }
//Without Content menu(right click functions)



import TopBar from "./components/TopBar/TopBar";
import Dock from "./components/Dock/Dock";
import wallpaper from "./assets/Wallpaper/img1.jpg"; 
import NotePad from "./components/Apps/NotePad";
import Calculator from "./components/Apps/Calculator";
import Calendar from "./components/Apps/Calendar";
import { useState, useEffect, useRef } from "react";
import VSCode from "./components/Apps/VSCode";
import Maps from "./components/Apps/Maps";
import Edge from "./components/Apps/Edge";
import VLCPlayer from "./components/Apps/VlcPlayer";
import Terminal from "./components/Apps/Terminal";
import TerminalTab from "./components/Apps/Terminal";
import FileManager from "./components/Apps/Finder";

// Context Menu Component
const ContextMenu = ({ x, y, onClose, onAction }) => {
  const menuItems = [
    { label: "New Folder", icon: "📁", action: "newFolder" },
    { label: "New File", icon: "📄", action: "newFile" },
    { label: "Get Info", icon: "ℹ️", action: "getInfo" },
    { label: "---", divider: true },
    { label: "Refresh", icon: "🔄", action: "refresh" },
    { label: "Terminal", icon: "💻", action: "terminal" },
    { label: "---", divider: true },
    { label: "Change Desktop Background", icon: "🖼️", action: "changeWallpaper" },
    { label: "Display Settings", icon: "⚙️", action: "displaySettings" }
  ];

  return (
    <div 
      className="fixed bg-gray-800 bg-opacity-95 backdrop-blur-md rounded-lg shadow-2xl py-2 min-w-48 z-50 border border-gray-600"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, index) => {
        if (item.divider) {
          return <div key={index} className="border-t border-gray-600 my-1"></div>;
        }
        
        return (
          <button
            key={index}
            className="w-full px-4 py-2 text-left text-white hover:bg-blue-600 flex items-center space-x-3 transition-colors"
            onClick={() => {
              onAction(item.action);
              onClose();
            }}
          >
            <span>{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default function MacOS() {
  const [openApps, setOpenApps] = useState({
    notepad: false,
    calculator: false,
    Calendar: false
  });

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const contextMenuRef = useRef(null);

  const toggleApp = (appName) => {
    setOpenApps((prev) => ({
      ...prev,
      [appName]: !prev[appName],
    }));
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    
    // Don't show context menu if right-clicking on an app window
    if (e.target.closest('.app-window')) {
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX;
    let y = e.clientY;
    
    // Adjust position to keep menu within viewport
    const menuWidth = 200;
    const menuHeight = 300;
    
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }
    
    setContextMenu({ visible: true, x, y });
  };

  const handleContextMenuAction = (action) => {
    console.log(`Context menu action: ${action}`);
    
    switch (action) {
      case 'newFolder':
        alert('New Folder created!');
        break;
      case 'newFile':
        alert('New File created!');
        break;
      case 'refresh':
        window.location.reload();
        break;
      case 'terminal':
        alert('Terminal functionality not implemented');
        break;
      case 'getInfo':
        alert('Desktop Info');
        break;
      case 'changeWallpaper':
        alert('Wallpaper settings opened!');
        break;
      case 'displaySettings':
        alert('Display settings opened!');
        break;
      default:
        break;
    }
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu.visible && contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        closeContextMenu();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape' && contextMenu.visible) {
        closeContextMenu();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [contextMenu.visible]);

  return (
    <div
      className="w-screen h-screen flex flex-col overflow-hidden select-none"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onContextMenu={handleRightClick}
    >
      {/* Top Bar */}
      <TopBar />

      {/* Main Body */}
      <div className="flex-1 relative">
        {openApps.notepad && <NotePad onClose={() => toggleApp("notepad")} />}
        {openApps.calculator && <Calculator onClose={() => toggleApp("calculator")} />}
        {openApps.calendar && <Calendar onClose={()=> toggleApp("calendar")}/>}
        {openApps.vscode && <VSCode onClose={()=> toggleApp("vscode")}/>}
        {openApps.maps && <Maps onClose={()=> toggleApp("maps")}/>}
        {openApps.edge && <Edge onClose={()=> toggleApp("edge")}/>}
        {openApps.vlcplayer && <VLCPlayer onClose={()=> toggleApp("vlcplayer")}/>}
        {openApps.terminal && <TerminalTab onClose={()=> toggleApp("terminal")}/>}
        {openApps.filemanager && <FileManager onClose={()=> toggleApp("filemanager")}/>}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div ref={contextMenuRef}>
          <ContextMenu 
            x={contextMenu.x} 
            y={contextMenu.y} 
            onClose={closeContextMenu}
            onAction={handleContextMenuAction}
          />
        </div>
      )}

      {/* Dock */}
      <Dock toggleApp={toggleApp} />
    </div>
  );
}



