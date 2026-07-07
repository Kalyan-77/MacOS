import { useEffect, useRef, useState } from "react";

export default function DesktopContextMenu({ x, y, onClose, onAction, selectedItem }) {
  const menuRef = useRef(null);
  const [coords, setCoords] = useState({ left: x, top: y });

  const isFolder = selectedItem?.type === "folder";
  const itemName = selectedItem?.name || "";

  const menuItems = selectedItem
    ? [
      { label: isFolder ? "Open Folder" : "Open File", shortcut: "⏎", action: "open" },
      { label: "Open in New Window", shortcut: "", action: "open" },
      { divider: true },
      { label: "Get Info", shortcut: "⌘I", action: "getInfo" },
      { label: "Rename...", shortcut: "⏎", action: "rename" },
      { divider: true },
      { label: `Compress "${itemName}"`, shortcut: "", action: "compress" },
      { label: "Duplicate", shortcut: "⌘D", action: "duplicate" },
      { divider: true },
      { label: `Copy "${itemName}"`, shortcut: "⌘C", action: "copy" },
      { divider: true },
      { label: "Move to Trash", shortcut: "⌘⌫", action: "trash" },
      { label: "Delete Permanently", shortcut: "⌥⌘⌫", action: "deletePermanent", danger: true }
    ]
    : [
      { label: "New Folder", shortcut: "⇧⌘N", action: "newFolder" },
      { label: "New File", shortcut: "⌘N", action: "newFile" },
      { divider: true },
      { label: "Upload File", shortcut: "", action: "uploadFile" },
      { label: "Upload Folder", shortcut: "", action: "uploadFolder" },
      { divider: true },
      { label: "Paste", shortcut: "⌘V", action: "paste" },
      { divider: true },
      { label: "Refresh", shortcut: "⌘R", action: "refresh" },
      { label: "Sort By Name", shortcut: "", action: "sort" },
      { divider: true },
      { label: "Terminal", shortcut: "⌃⌥T", action: "terminal" },
      { divider: true },
      { label: "Change Wallpaper...", shortcut: "", action: "changeWallpaper" },
      { label: "Display Settings", shortcut: "", action: "displaySettings" }
    ];

  // Prevent menu rendering off-screen (collision detection)
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      let left = x;
      let top = y;

      if (x + rect.width > screenWidth) {
        left = screenWidth - rect.width - 6;
      }
      if (y + rect.height > screenHeight) {
        top = screenHeight - rect.height - 6;
      }

      // Ensure it doesn't cross top/left edges
      left = Math.max(6, left);
      top = Math.max(6, top);

      setCoords({ left, top });
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-[#1e1e1f]/85 backdrop-blur-2xl rounded-lg shadow-2xl p-1 w-56 z-50 border border-white/10 select-none font-sans text-white text-[13px] leading-normal"
      style={{ left: coords.left, top: coords.top, zIndex: 99999 }}
    >
      {menuItems.map((item, index) => {
        if (item.divider) {
          return <div key={index} className="h-px bg-white/10 my-1 mx-2"></div>;
        }

        return (
          <button
            key={index}
            className={`w-full text-left flex items-center justify-between px-3 py-1 rounded-[5px] cursor-default transition-colors outline-none
              ${item.danger 
                ? 'hover:bg-red-500/90 hover:text-white text-red-400' 
                : 'hover:bg-blue-600/90 text-[#f5f5f7]'
              }`}
            onClick={(e) => {
              e.stopPropagation();
              onAction(item.action);
              onClose();
            }}
          >
            <span className="truncate">{item.label}</span>
            {item.shortcut && (
              <span className="text-[10px] text-zinc-400 font-normal ml-2 flex-shrink-0 tracking-wider">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
