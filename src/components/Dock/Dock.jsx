import { useState } from "react";
import finder from "../../assets/AppIcons/finder.png";
import launchpad from "../../assets/AppIcons/launchpad.png";
import preferences from "../../assets/AppIcons/preferences.png";
import contacts from "../../assets/AppIcons/contacts.png";
import notes from "../../assets/AppIcons/notes.png";
import AppStore from "../../assets/AppIcons/appstore.png";
import calculator from "../../assets/AppIcons/calculator.png";
import calender from "../../assets/AppIcons/calendar.png";
import terminal from "../../assets/AppIcons/terminal.png";
import vscode from "../../assets/AppIcons/vscode.svg";
import photos from "../../assets/AppIcons/photos.png";
import message from "../../assets/AppIcons/message.png";
import maps from "../../assets/AppIcons/maps.png";
import mail from "../../assets/AppIcons/mail.png";
import bin from "../../assets/AppIcons/bin.png";
import music from "../../assets/AppIcons/music.png";
import remainder from "../../assets/AppIcons/reminders.png";
import edge from "../../assets/AppIcons/edge.png";
import vlc from "../../assets/AppIcons/vlc.png";
import chess from "../../assets/AppIcons/chess.png";
import TV from "../../assets/AppIcons/TV.jpg";
import figma from "../../assets/AppIcons/figma.webp";
import zoom from "../../assets/AppIcons/zoom.webp";
import teams from "../../assets/AppIcons/teams.jpg";

export default function Dock({ toggleApp }) {
  const [hovered, setHovered] = useState(null);
  const [showAllApps, setShowAllApps] = useState(false);

  const apps = [
    { name: "Finder", icon: finder, action: () => toggleApp("filemanager") },
    { name: "Launchpad", icon: launchpad },
    { name: "Preferences", icon: preferences },
    { name: "Contacts", icon: contacts },
    { name: "Notes", icon: notes, action: () => toggleApp("notepad") },
    { name: "App Store", icon: AppStore,action: () => toggleApp("appstore") },
    { name: "Calculator", icon: calculator, action: () => toggleApp("calculator") },
    { name: "Calendar", icon: calender, action: () => toggleApp("calendar") },
    { name: "Terminal", icon: terminal, action: () => toggleApp("terminal") },
    { name: "VS Code", icon: vscode, action: () => toggleApp("vscode") },
    { name: "Photos", icon: photos, action: () => toggleApp("photos")},
    { name: "Messages", icon: message },
    { name: "Maps", icon: maps, action: () => toggleApp("maps") },
    { name: "Mail", icon: mail },
    { name: "Trash", icon: bin, action: () => toggleApp("trash") },
    { name: "Music", icon: music, action: () => toggleApp("musicplayer") },
    { name: "Reminders", icon: remainder },
    { name: "Edge", icon: edge, action: () => toggleApp("edge") },
    { name: "VLC", icon: vlc, action: () => toggleApp("vlcplayer") },
    { name: "Photoshop", icon: photos },
    { name: "Illustrator", icon: photos },
    { name: "Premiere", icon: vlc },
    { name: "After Effects", icon: calculator },
    { name: "Figma", icon: figma },
    { name: "Sketch", icon: photos },
    { name: "Spotify", icon: music },
    { name: "Discord", icon: message },
    { name: "Slack", icon: message },
    { name: "Zoom", icon: zoom },
    { name: "Teams", icon: teams },
    { name: "Chrome", icon: edge },
    { name: "Chess", icon: chess },
    { name: "VideoPlayer", icon: TV, action: () => toggleApp("videoplayer") },
    // { name: "Notion", icon: notes },
    // { name: "Obsidian", icon: notes },
    
  ];

  // Main dock apps (visible on desktop dock)
  const mainDockApps = apps.slice(0, 19); // Show first 12 apps in main dock

  // Essential apps for small screens  
  const essentialApps = [
    apps.find(app => app.name === "Finder"),
    apps.find(app => app.name === "Edge"),
    apps.find(app => app.name === "Terminal"),
    apps.find(app => app.name === "App Store")
  ];

  // All apps for the full screen grid view
  const allApps = apps;

  const getScale = (index) => {
    if (hovered === null) return 1;
    const distance = Math.abs(index - hovered);
    if (distance === 0) return 1.5;
    return 1;
  };

  const getTranslateY = (index) => {
    if (hovered === null) return 0;
    const distance = Math.abs(index - hovered);
    if (distance === 0) return -10;
    return 0;
  };

  const getTranslateX = (index) => {
    if (hovered === null) return 0;
    if (index < hovered) return -15;
    else if (index > hovered) return 10;
    return 0;
  };

  const handleAppClick = (app) => {
    if (app.action) {
      app.action();
    }
    setShowAllApps(false);
  };

  const handleMoreAppsClick = () => {
    setShowAllApps(!showAllApps);
  };

  return (
    <>
      {/* CSS to hide scrollbar */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari, Opera */
        }
      `}</style>
      
      {/* Full Screen App Grid Overlay for Desktop and Small Screens */}
      {showAllApps && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex flex-col">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-6 pt-12 flex-shrink-0">
            <h1 className="text-white text-2xl font-bold">All Apps</h1>
            <button
              onClick={() => setShowAllApps(false)}
              className="text-white hover:text-gray-300 transition-colors p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ cursor: 'pointer' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Apps Grid - Scrollable */}
          <div 
            className="flex-1 overflow-y-auto overflow-x-hidden px-6 hide-scrollbar"
          >
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6 pb-6 min-h-full justify-items-center">
              {allApps.map((app, idx) => (
                <div
                  key={`${app.name}-${idx}`}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => handleAppClick(app)}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                    <img
                      src={app.icon}
                      alt={app.name}
                      className="w-full h-full rounded-2xl shadow-lg"
                    />
                  </div>
                  <span className="text-white text-xs sm:text-sm text-center font-medium leading-tight max-w-[70px] sm:max-w-[80px] break-words">
                    {app.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Close indicator at bottom - Fixed */}
          <div className="flex justify-center pb-6 pt-2 flex-shrink-0">
            <div className="w-12 h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Main Dock */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[90%]">
        {/* Desktop Dock */}
        <div
          className="hidden sm:flex backdrop-blur-md bg-white/5 px-2 py-2 rounded-2xl items-end justify-center gap-4 shadow-sm w-[100%]"
          onMouseLeave={() => setHovered(null)}
        >
          {mainDockApps.map((app, idx) => (
            <div
              key={idx}
              className="cursor-pointer flex items-end relative"
              onMouseEnter={() => setHovered(idx)}
              onClick={() => app.action && app.action()}
              style={{
                transform: `scale(${getScale(idx)}) translateY(${getTranslateY(
                  idx
                )}px) translateX(${getTranslateX(idx)}px)`,
                transition:
                  "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                transformOrigin: "bottom center",
              }}
            >
              {hovered === idx && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/40 text-black text-[10px] font-medium px-2 py-0.5 rounded whitespace-nowrap backdrop-blur-xl shadow-md border border-white/20">
                  {app.name}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/40"></div>
                </div>
              )}

              <img
                src={app.icon}
                alt={app.name}
                className="rounded-xl"
                style={{
                  width: "60px",
                  height: "60px",
                }}
              />
            </div>
          ))}
          
          {/* More Apps Button for Desktop */}
          {apps.length > 12 && (
            <div
              className="cursor-pointer flex items-end relative"
              onMouseEnter={() => setHovered(mainDockApps.length)}
              onClick={handleMoreAppsClick}
              style={{
                transform: `scale(${getScale(mainDockApps.length)}) translateY(${getTranslateY(
                  mainDockApps.length
                )}px) translateX(${getTranslateX(mainDockApps.length)}px)`,
                transition:
                  "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                transformOrigin: "bottom center",
              }}
            >
              {hovered === mainDockApps.length && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/40 text-black text-[10px] font-medium px-2 py-0.5 rounded whitespace-nowrap backdrop-blur-xl shadow-md border border-white/20">
                  More Apps
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/40"></div>
                </div>
              )}

              <div
                className="rounded-xl bg-gray-700/80 flex items-center justify-center"
                style={{
                  width: "60px",
                  height: "60px",
                }}
              >
                <div className="grid grid-cols-3 gap-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Dock */}
        <div className="sm:hidden backdrop-blur-md bg-white/5 px-4 py-3 rounded-2xl flex items-center justify-center gap-6 shadow-sm">
          {essentialApps.map((app, idx) => (
            <div
              key={idx}
              className="cursor-pointer flex flex-col items-center group"
              onClick={() => handleAppClick(app)}
            >
              <div className="w-12 h-12 mb-1 group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                <img
                  src={app.icon}
                  alt={app.name}
                  className="w-full h-full rounded-xl"
                />
              </div>
              <span className="text-white text-xs font-medium">
                {app.name}
              </span>
            </div>
          ))}
          
          {/* More Apps Button */}
          <div
            className="cursor-pointer flex flex-col items-center group"
            onClick={handleMoreAppsClick}
          >
            <div className="w-12 h-12 mb-1 bg-gray-700/80 rounded-xl flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <span className="text-white text-xs font-medium">
              More
            </span>
          </div>
        </div>
      </div>
    </>
  );
}