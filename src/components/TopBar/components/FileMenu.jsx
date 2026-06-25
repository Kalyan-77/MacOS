import { useWorkspaceStore } from "../../../store/workspaceStore";
import { allAvailableApps } from "../../../registry/appRegistry";

export default function FileMenu({ onClose }) {
  const openWindow = useWorkspaceStore((state) => state.openWindow);
  const closeWindow = useWorkspaceStore((state) => state.closeWindow);
  const windows = useWorkspaceStore((state) => state.windows);

  const handleNewFile = () => {
    const notepadApp = allAvailableApps.find(a => a.id === "notepad");
    if (notepadApp) {
      openWindow(notepadApp.id, notepadApp.name, notepadApp.component, {}, notepadApp.icon);
    }
  };

  const handleNewWindow = () => {
    const finderApp = allAvailableApps.find(a => a.id === "filemanager");
    if (finderApp) {
      openWindow(finderApp.id, finderApp.name, finderApp.component, {}, finderApp.icon);
    }
  };

  const handleCloseWindow = () => {
    const activeWindow = windows.find(w => w.focused);
    if (activeWindow) {
      closeWindow(activeWindow.id);
    }
  };

  const fileMenuItems = [
    { label: "New File", shortcut: "⌘N", action: handleNewFile },
    { label: "New Window", shortcut: "⌘⇧N", action: handleNewWindow },
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
    { label: "Close Window", shortcut: "⌘W", action: handleCloseWindow },
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
