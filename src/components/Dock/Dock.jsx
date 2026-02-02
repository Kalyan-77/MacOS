import { useState, useEffect } from "react";
import { useWindows } from "../../context/WindowContext";
import { BASE_URL } from "../../../config";
import NotePad from "../Apps/NotePad";
import Calculator from "../Apps/Calculator";
import Calendar from "../Apps/Calendar";
import Terminal from "../Apps/Terminal";
import FileManager from "../Apps/Finder";
import VSCode from "../Apps/VSCode";
import Edge from "../Apps/Edge";
import Maps from "../Apps/Maps";
import Photos from "../Apps/Photos";
import MusicPlayer from "../Apps/Music";
import VideoPlayer from "../Apps/VideoPlayer";
import VLCPlayer from "../Apps/VlcPlayer";
import Trash from "../Apps/Trash";
import AppStore from "../Apps/AppStore";
import Whatspp from "../Apps/Whatspp";
import Perplexity from "../Apps/Perplexity";

export default function Dock({ userId }) {
  const { windows, openApp, focusApp } = useWindows();
  const [hovered, setHovered] = useState(null);
  const [showAllApps, setShowAllApps] = useState(false);
  const [installedApps, setInstalledApps] = useState([]);
  const [loading, setLoading] = useState(true);

  // All available apps with their complete metadata including components
  const allAvailableApps = [
    { id: "filemanager", name: "Finder", icon: "/AppIcons/finder.png", component: FileManager },
    { id: "launchpad", name: "Launchpad", icon: "/AppIcons/launchpad.png", component: null },
    { id: "preferences", name: "Preferences", icon: "/AppIcons/preferences.png", component: null },
    { id: "contacts", name: "Contacts", icon: "/AppIcons/contacts.png", component: null },
    { id: "notepad", name: "Notes", icon: "/AppIcons/notes.png", component: NotePad },
    { id: "appstore", name: "App Store", icon: "/AppIcons/appstore.png", component: AppStore },
    { id: "calculator", name: "Calculator", icon: "/AppIcons/calculator.png", component: Calculator },
    { id: "calendar", name: "Calendar", icon: "/AppIcons/calendar.png", component: Calendar },
    { id: "terminal", name: "Terminal", icon: "/AppIcons/terminal.png", component: Terminal },
    { id: "vscode", name: "VS Code", icon: "/AppIcons/vscode.svg", component: VSCode },
    { id: "photos", name: "Photos", icon: "/AppIcons/photos.png", component: Photos },
    { id: "messages", name: "Messages", icon: "/AppIcons/message.png", component: null },
    { id: "maps", name: "Maps", icon: "/AppIcons/maps.png", component: Maps },
    { id: "mail", name: "Mail", icon: "/AppIcons/mail.png", component: null },
    { id: "trash", name: "Trash", icon: "/AppIcons/bin.png", component: Trash },
    { id: "musicplayer", name: "Music", icon: "/AppIcons/music.png", component: MusicPlayer },
    { id: "reminders", name: "Reminders", icon: "/AppIcons/reminders.png", component: null },
    { id: "edge", name: "Edge", icon: "/AppIcons/edge.png", component: Edge },
    { id: "vlcplayer", name: "VLC", icon: "/AppIcons/vlc.png", component: VLCPlayer },
    { id: "photoshop", name: "Photoshop", icon: "/AppIcons/photos.png", component: null },
    { id: "illustrator", name: "Illustrator", icon: "/AppIcons/photos.png", component: null },
    { id: "premiere", name: "Premiere", icon: "/AppIcons/vlc.png", component: null },
    { id: "aftereffects", name: "After Effects", icon: "/AppIcons/calculator.png", component: null },
    { id: "figma", name: "Figma", icon: "/AppIcons/figma.webp", component: null },
    { id: "sketch", name: "Sketch", icon: "/AppIcons/photos.png", component: null },
    { id: "spotify", name: "Spotify", icon: "/AppIcons/music.png", component: null },
    { id: "discord", name: "Discord", icon: "/AppIcons/message.png", component: null },
    { id: "slack", name: "Slack", icon: "/AppIcons/message.png", component: null },
    { id: "zoom", name: "Zoom", icon: "/AppIcons/zoom.webp", component: null },
    { id: "teams", name: "Teams", icon: "/AppIcons/teams.jpg", component: null },
    { id: "chrome", name: "Chrome", icon: "/AppIcons/edge.png", component: null },
    { id: "chess", name: "Chess", icon: "/AppIcons/chess.png", component: null },
    { id: "videoplayer", name: "Video Player", icon: "/AppIcons/TV.jpg", component: VideoPlayer },
    { id: "whatsapp", name: "WhatsApp", icon: "/AppIcons/Whatsapp.png", component: Whatspp },
    { id: "instagram", name: "Instagram", icon: "/AppIcons/Instagram.jpg", component: null },
    { id: "perplexity", name: "Perplexity.AI", icon: "/AppIcons/perplexity.avif", component: Perplexity },
  ];

  // Default apps that are always present for all users
  const defaultAppIds = ["filemanager", "appstore", "terminal", "trash"];

  // Fetch installed apps from database
  useEffect(() => {
    const fetchInstalledApps = async () => {
      // Always include default apps
      const defaultAppObjects = allAvailableApps.filter(app =>
        defaultAppIds.includes(app.id)
      );

      if (!userId) {
        console.log('❌ No userId provided, showing only default apps');
        setInstalledApps(defaultAppObjects);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching installed apps for userId:', userId);
        const apiUrl = `${BASE_URL}/config/get/${userId}`;
        console.log('📡 API URL:', apiUrl);

        const response = await fetch(apiUrl, {
          credentials: 'include'
        });

        console.log('📨 Response status:', response.status);

        if (response.ok) {
          const config = await response.json();
          console.log('✅ Config received:', config);
          const dbAppNames = config.desktopApps || [];
          console.log('📱 Desktop apps from DB:', dbAppNames);

          // Create a mapping from app name to app object (case-insensitive)
          const appNameMap = {};
          allAvailableApps.forEach(app => {
            const normalizedName = app.name.toLowerCase().replace(/\s+/g, '');
            appNameMap[normalizedName] = app;
          });

          // Convert DB app names to complete app objects (with component)
          const dbAppObjects = dbAppNames
            .map(name => {
              const normalizedName = name.toLowerCase().replace(/\s+/g, '');
              return appNameMap[normalizedName];
            })
            .filter(Boolean); // Remove undefined entries

          console.log('🔄 Converted app objects:', dbAppObjects.map(a => ({ id: a.id, name: a.name })));

          // Filter additional apps from database (excluding default apps)
          const additionalApps = dbAppObjects.filter(app =>
            !defaultAppIds.includes(app.id)
          );

          console.log('✨ Additional apps from DB:', additionalApps.map(a => a.name));

          // Combine default apps with additional apps from DB
          const combinedApps = [...defaultAppObjects, ...additionalApps];
          setInstalledApps(combinedApps);
          console.log('✅ Total installed apps:', combinedApps.length, 'apps');
        } else if (response.status === 404) {
          console.log('⚠️ No configuration found (404) - showing only default apps');
          setInstalledApps(defaultAppObjects);
        } else {
          console.error('❌ Error fetching config, status:', response.status);
          const errorText = await response.text();
          console.error('❌ Error response:', errorText);
          setInstalledApps(defaultAppObjects);
        }
      } catch (error) {
        console.error('❌ Error fetching installed apps:', error);
        console.error('❌ Error details:', error.message);
        setInstalledApps(defaultAppObjects);
      } finally {
        console.log('🏁 Setting loading to false');
        setLoading(false);
      }
    };

    fetchInstalledApps();
  }, [userId]);

  // Main dock apps (first 15 from installed apps)
  const mainDockApps = installedApps.slice(0, 15);

  // Essential apps for mobile (first 4)
  const essentialApps = installedApps.slice(0, 4);

  const getScale = (index) => {
    if (hovered === null) return 1;
    const distance = Math.abs(index - hovered);
    if (distance === 0) return 1.4;
    if (distance === 1) return 1.1;
    return 1;
  };

  const getTranslateY = (index) => {
    if (hovered === null) return 0;
    const distance = Math.abs(index - hovered);
    if (distance === 0) return -15;
    if (distance === 1) return -5;
    return 0;
  };

  const getTranslateX = (index) => {
    if (hovered === null) return 0;
    if (index < hovered) return -8;
    else if (index > hovered) return 8;
    return 0;
  };

  const handleAppClick = (app) => {
    if (!app.component) {
      if (app.id === 'launchpad' || app.id === 'preferences') {
        // Special handling if these become standalone apps
        // For now, these might be used as the trigger locally.
        return;
      }
      alert(`App "${app.name}" is not fully implemented yet.`);
      return;
    }

    const running = windows.find(w => w.id === app.id);
    if (running) {
      focusApp(app.id);
    } else {
      openApp({
        id: app.id,
        name: app.name,
        icon: app.icon,
        component: app.component
      });
    }
    setShowAllApps(false);
  };

  const handleMoreAppsClick = () => {
    setShowAllApps(!showAllApps);
  };

  // Check if an app is active
  const isAppActive = (appId) => {
    return windows.find(w => w.id === appId) !== undefined;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[90%]">
        <div className="backdrop-blur-md bg-white/5 px-4 py-3 rounded-2xl flex items-center justify-center">
          <div className="text-white text-sm">Loading apps...</div>
        </div>
      </div>
    );
  }

  // Show empty state if no apps installed
  if (installedApps.length === 0) {
    return (
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[90%]">
        <div className="backdrop-blur-md bg-white/5 px-4 py-3 rounded-2xl flex items-center justify-center">
          <div className="text-white text-sm">No apps installed</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* CSS to hide scrollbar */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Full Screen App Grid Overlay */}
      {showAllApps && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex flex-col">
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

          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 hide-scrollbar">
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6 pb-6 min-h-full justify-items-center">
              {installedApps.map((app, idx) => (
                <div
                  key={`${app.id}-${idx}`}
                  className="flex flex-col items-center cursor-pointer group relative"
                  onClick={() => handleAppClick(app)}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 group-hover:scale-110 group-active:scale-95 transition-transform duration-200 relative">
                    <img
                      src={app.icon}
                      alt={app.name}
                      className="w-full h-full rounded-2xl shadow-lg"
                    />
                    {isAppActive(app.id) && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-white text-xs sm:text-sm text-center font-medium leading-tight max-w-[70px] sm:max-w-[80px] break-words">
                    {app.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pb-6 pt-2 flex-shrink-0">
            <div className="w-12 h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Main Dock */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%]">
        {/* Desktop Dock */}
        <div
          className="hidden sm:flex backdrop-blur-2xl bg-white/20 px-2 py-1.5 rounded-2xl items-end justify-center gap-3 shadow-2xl border border-white/30"
          onMouseLeave={() => setHovered(null)}
          style={{
            width: 'fit-content',
            margin: '0 auto'
          }}
        >
          {mainDockApps.map((app, idx) => (
            <div
              key={app.id}
              className="cursor-pointer flex flex-col items-center relative"
              onMouseEnter={() => setHovered(idx)}
              onClick={() => handleAppClick(app)}
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
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800/90 text-white text-xs font-medium px-3 py-1.5 rounded-md whitespace-nowrap backdrop-blur-sm shadow-lg">
                  {app.name}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800/90"></div>
                </div>
              )}

              <img
                src={app.icon}
                alt={app.name}
                className="rounded-xl shadow-lg"
                style={{
                  width: "56px",
                  height: "56px",
                }}
              />

              {isAppActive(app.id) && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-1 bg-white/90 rounded-full shadow-lg"></div>
                </div>
              )}
            </div>
          ))}

          {/* More Apps Button - Show Preferences Icon to open drawer */}
          {installedApps.length > 15 && (
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
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800/90 text-white text-xs font-medium px-3 py-1.5 rounded-md whitespace-nowrap backdrop-blur-sm shadow-lg">
                  More Apps
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800/90"></div>
                </div>
              )}

              <img
                src="/AppIcons/launchpad.png"
                alt="Launchpad"
                className="rounded-xl shadow-lg"
                style={{
                  width: "56px",
                  height: "56px",
                }}
              />
            </div>
          )}
        </div>

        {/* Mobile Dock */}
        <div className="sm:hidden backdrop-blur-md bg-white/5 px-4 py-3 rounded-2xl flex items-center justify-center gap-8 shadow-sm">
          {essentialApps.map((app, idx) => (
            <div
              key={app.id}
              className="cursor-pointer flex flex-col items-center group relative"
              onClick={() => handleAppClick(app)}
            >
              <div className="w-12 h-12 mb-1 group-hover:scale-110 group-active:scale-95 transition-transform duration-200 relative">
                <img
                  src={app.icon}
                  alt={app.name}
                  className="w-full h-full rounded-xl"
                />
                {isAppActive(app.id) && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1.5 h-1.5 bg-white/90 rounded-full shadow-lg"></div>
                  </div>
                )}
              </div>
              <span className="text-white text-xs font-medium">
                {app.name}
              </span>
            </div>
          ))}

          {/* More Apps Button Mobile */}
          {installedApps.length > 4 && (
            <div
              className="cursor-pointer flex flex-col items-center group"
              onClick={handleMoreAppsClick}
            >
              <img
                src="/AppIcons/launchpad.png"
                alt="Launchpad"
                className="w-12 h-12 mb-1 rounded-xl shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform duration-200"
              />
              <span className="text-white text-xs font-medium">
                More
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}